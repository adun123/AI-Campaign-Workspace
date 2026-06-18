import { createClient } from "@/lib/supabase/server";
import { getWorkspaceId } from "@/lib/get-workspace-id";
import googleAI from "@/lib/google-ai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const workspaceId = await getWorkspaceId();
  if (!workspaceId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { campaign_id, source_image, instruction } = await request.json();
  if (!source_image || !instruction || !campaign_id) {
    return NextResponse.json({ error: "campaign_id, source_image, and instruction are required." }, { status: 400 });
  }

  try {
    const base64Match = source_image.match(/^data:(image\/\w+);base64,(.+)$/);
    if (!base64Match) {
      return NextResponse.json({ error: "Invalid source image format" }, { status: 400 });
    }
    const mimeType = base64Match[1];
    const imageData = base64Match[2];

    const supabase = await createClient();

    // Create generation record
    const { data: generation, error: genError } = await supabase
      .from("ai_generations")
      .insert({ campaign_id, mode: "image-to-image", prompt: `✏️ Edit: ${instruction}`, status: "processing" })
      .select()
      .single();

    if (genError) return NextResponse.json({ error: genError.message }, { status: 500 });

    const response = await googleAI.models.generateContent({
      model: "gemini-3.1-flash-image",
      contents: [
        {
          role: "user",
          parts: [
            { inlineData: { mimeType, data: imageData } },
            { text: `Edit this image: ${instruction}` },
          ],
        },
      ],
      config: { responseModalities: ["TEXT", "IMAGE"] },
    });

    const parts = response.candidates?.[0]?.content?.parts ?? [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const imagePart = parts.find((p: any) =>
      !p.thought && p.inlineData?.mimeType?.startsWith("image/")
    ) as { inlineData?: { mimeType?: string; data?: string } } | undefined;

    if (!imagePart?.inlineData?.data) {
      await supabase.from("ai_generations").update({ status: "error", error_message: "AI did not return an edited image" }).eq("id", generation.id);
      return NextResponse.json({ error: "AI did not return an edited image" }, { status: 500 });
    }

    const editedUrl = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;

    // Create new asset
    const { data: asset, error } = await supabase
      .from("assets")
      .insert({ campaign_id, title: "Edited Image", kind: "image", preview: editedUrl, prompt: instruction, channel: "Instagram", status: "draft" })
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
