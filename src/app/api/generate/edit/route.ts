import { createClient } from "@/lib/supabase/server";
import { getWorkspaceId } from "@/lib/get-workspace-id";
import fal from "@/lib/fal-ai";
import { NextResponse } from "next/server";

function dataURLtoFile(dataurl: string, filename: string): File {
  const arr = dataurl.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1] ?? "image/png";
  const base64Data = arr[1];
  const buffer = Buffer.from(base64Data, "base64");
  return new File([buffer], filename, { type: mime });
}

export async function POST(request: Request) {
  const workspaceId = await getWorkspaceId();
  if (!workspaceId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  console.log("[Edit API] Received:", {
    campaign_id: body.campaign_id,
    asset_id: body.asset_id,
    instruction: body.instruction,
    source_image_type: typeof body.source_image,
    source_image_length: body.source_image?.length ?? 0,
    source_image_prefix: body.source_image?.slice(0, 50),
    has_mask: !!body.mask,
  });

  const { source_image, instruction } = body;
  const hasMask = body.mask && typeof body.mask === "string" && body.mask.startsWith("data:image/");
  
  // Need either instruction or mask (or both)
  if (!source_image || (!instruction && !hasMask)) {
    return NextResponse.json({ 
      error: "Missing required fields: need source_image and at least one of (instruction or mask)",
      details: { 
        has_source_image: !!source_image, 
        has_instruction: !!instruction,
        has_mask: hasMask,
      }
    }, { status: 400 });
  }

  try {
    if (typeof source_image !== "string" || (!source_image.startsWith("data:image/") && !source_image.startsWith("http"))) {
      return NextResponse.json({ error: `Invalid source image format. Got: "${source_image.slice(0, 50)}..."`, status: 400 });
    }

    const supabase = await createClient();

    // Resolve campaign_id: prefer body.campaign_id, fallback to looking up via asset_id
    let campaignId = body.campaign_id;
    if (!campaignId && body.asset_id) {
      const { data: asset } = await supabase
        .from("assets")
        .select("campaign_id")
        .eq("id", body.asset_id)
        .single();
      if (asset) campaignId = asset.campaign_id;
    }
    if (!campaignId) {
      return NextResponse.json({ error: "Could not determine campaign_id" }, { status: 400 });
    }

    // Create generation record
    const editPrompt = instruction || "Regenerate the masked area";
    const { data: generation, error: genError } = await supabase
      .from("ai_generations")
      .insert({ campaign_id: campaignId, mode: "image-to-image", prompt: `✏️ Edit: ${editPrompt}`, status: "processing" })
      .select()
      .single();

    if (genError) return NextResponse.json({ error: genError.message }, { status: 500 });

    // Upload source image to fal storage
    let imageUrl: string;
    if (source_image.startsWith("data:image/")) {
      const imageFile = dataURLtoFile(source_image, "source.png");
      imageUrl = await fal.storage.upload(imageFile);
    } else {
      imageUrl = source_image;
    }

    // Determine edit mode: masked inpainting vs instruction-only
    let editedUrl: string;

    if (hasMask) {
      // Masked inpainting mode: upload mask and use flux-general/inpainting
      console.log("[Edit] Using masked inpainting with flux-general/inpainting");
      const maskFile = dataURLtoFile(body.mask, "mask.png");
      const maskUrl = await fal.storage.upload(maskFile);

      const result = await fal.subscribe("fal-ai/flux-general/inpainting", {
        input: {
          prompt: editPrompt,
          image_url: imageUrl,
          mask_url: maskUrl,
          strength: 0.85,
          num_images: 1,
          num_inference_steps: 30,
        },
      });

      editedUrl = (result.data as { images?: { url: string }[] })?.images?.[0]?.url ?? "";
    } else {
      // Instruction-only mode: use nano-banana-2/edit
      console.log("[Edit] Using instruction-only editing with nano-banana-2/edit");
      const result = await fal.subscribe("fal-ai/nano-banana-2/edit", {
        input: {
          prompt: editPrompt,
          image_urls: [imageUrl],
          resolution: "1K",
          num_images: 1,
        },
      });

      editedUrl = (result.data as { images?: { url: string }[] })?.images?.[0]?.url ?? "";
    }

    if (!editedUrl) {
      await supabase.from("ai_generations").update({ status: "error", error_message: "AI did not return an edited image" }).eq("id", generation.id);
      return NextResponse.json({ error: "AI did not return an edited image" }, { status: 500 });
    }

    // Create new asset
    const { data: asset, error } = await supabase
      .from("assets")
      .insert({ campaign_id: campaignId, title: "Edited Image", kind: "image", preview: editedUrl, prompt: editPrompt, channel: "Instagram", status: "draft" })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Link to generation
    await supabase.from("generation_outputs").insert({ generation_id: generation.id, asset_id: asset.id });
    await supabase.from("ai_generations").update({ status: "completed", completed_at: new Date().toISOString() }).eq("id", generation.id);

    return NextResponse.json({
      success: true,
      asset: {
        id: asset.id,
        campaignId: asset.campaign_id,
        title: asset.title,
        kind: asset.kind,
        preview: asset.preview,
        prompt: asset.prompt,
        channel: asset.channel,
        status: asset.status,
        createdAt: asset.created_at,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Edit error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
