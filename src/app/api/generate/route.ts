import { createClient } from "@/lib/supabase/server";
import { getWorkspaceId } from "@/lib/get-workspace-id";
import { persistRemoteImage } from "@/lib/supabase/storage";
import googleAI from "@/lib/google-ai";
import fal from "@/lib/fal-ai";
import { NextResponse } from "next/server";

// Extend API route timeout for long-running AI generation
export const maxDuration = 300; // 5 minutes for Vercel/serverless

// Persist a generated image URL to Supabase Storage and return the permanent URL
async function persistGeneratedImage(tempUrl: string, campaignId: string, generationId: string): Promise<string> {
  if (!tempUrl) return tempUrl;
  try {
    const storagePath = `${campaignId}/${generationId}_${Date.now()}.png`;
    const permanentUrl = await persistRemoteImage(tempUrl, storagePath);
    console.log(`[Storage] Persisted image: ${storagePath}`);
    return permanentUrl;
  } catch (err) {
    console.error("[Storage] Failed to persist image:", err);
    return tempUrl; // fallback to temp URL
  }
}

function localEnhance(prompt: string, channel: string): string {
  const baseEnhancements = [
    "professional photography",
    "soft natural lighting",
    "clean composition",
    "vibrant colors",
    "high detail",
    "sharp focus",
  ];

  const channelBoost: Record<string, string[]> = {
    Instagram: ["vertical composition", "aesthetic mood", "warm tones", "Instagram-ready"],
    LinkedIn: ["professional setting", "clean modern style", "corporate feel"],
    TikTok: ["dynamic composition", "bold visuals", "eye-catching", "trendy"],
    Email: ["clear focal point", "inviting mood", "clean background"],
  };

  const extra = channelBoost[channel] ?? channelBoost.Instagram;
  return `${prompt}, ${[...baseEnhancements, ...extra].join(", ")}`;
}

async function enhancePrompt(prompt: string, brandContext: string, channel: string): Promise<string> {
  try {
    const response = await googleAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Short prompt: "${prompt}"`,
      config: {
        systemInstruction: [
          "You are a prompt engineer for AI image generation (Flux model).",
          "Convert short or vague descriptions into detailed, visually rich prompts.",
          "Include: lighting, composition, style, color palette, mood, camera angle, and quality keywords.",
          brandContext ? `Brand context: ${brandContext}` : "",
          channel ? `Optimize for ${channel} visual format.` : "",
          "Output ONLY the enhanced prompt, nothing else. Keep it under 200 words.",
          "Use English only for the output prompt.",
        ].filter(Boolean).join(" "),
      },
    });
    return response.text?.trim() || prompt;
  } catch (err) {
    console.error("AI prompt enhancement failed, using local template:", err);
    return localEnhance(prompt, channel);
  }
}

export async function GET(request: Request) {
  const workspaceId = await getWorkspaceId();
  if (!workspaceId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const campaignId = searchParams.get("campaign_id");
  if (!campaignId) return NextResponse.json({ error: "campaign_id wajib diisi." }, { status: 400 });

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ai_generations")
    .select("*, generation_outputs(asset_id, assets(*))")
    .eq("campaign_id", campaignId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const workspaceId = await getWorkspaceId();
  if (!workspaceId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { campaign_id, mode, prompt, channel, images, aspect_ratio } = await request.json();
  if (!campaign_id || !mode || !prompt) {
    return NextResponse.json({ error: "campaign_id, mode, dan prompt wajib diisi." }, { status: 400 });
  }

  const supabase = await createClient();

  // Ambil brand kit
  const { data: brandKit } = await supabase
    .from("brand_kits")
    .select("voice, colors, guardrails")
    .eq("workspace_id", workspaceId)
    .single();

  // Insert generation record
  const { data: generation, error: genError } = await supabase
    .from("ai_generations")
    .insert({ campaign_id, mode, prompt, status: "processing" })
    .select()
    .single();

  if (genError) return NextResponse.json({ error: genError.message }, { status: 500 });

  try {
    let outputAssets: { title: string; kind: string; preview: string; prompt: string }[] = [];

    if (mode === "text-to-image") {
      const brandContext = brandKit
        ? `Style: ${brandKit.voice ?? "professional"}. Colors: ${brandKit.colors?.join(", ") ?? "brand colors"}. ${brandKit.guardrails?.length ? `Avoid: ${brandKit.guardrails.join(", ")}.` : ""}`
        : "";

      // Enhance prompt dengan Gemini (gratis) untuk hasil image generation yang lebih baik
      console.log("[Enhance] Original prompt:", prompt);
      const enhancedPrompt = await enhancePrompt(prompt, brandContext, channel ?? "social media");
      console.log("[Enhance] Enhanced prompt:", enhancedPrompt);

      const fullPrompt = `${enhancedPrompt}. ${brandContext} High quality, ${channel ?? "social media"} format, marketing visual.`;

      // Map aspect_ratio to fal.ai image_size
      const sizeMap = {
        "1:1": "square_hd",
        "16:9": "landscape_16_9",
        "9:16": "portrait_16_9",
        "4:3": "landscape_4_3",
        "3:4": "portrait_4_3",
      } as const;
      const imageSize = sizeMap[aspect_ratio as keyof typeof sizeMap] ?? "square_hd";

      const result = await fal.subscribe("fal-ai/flux/schnell", {
        input: {
          prompt: fullPrompt,
          image_size: imageSize,
          num_images: 1,
          num_inference_steps: 4,
        },
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tempImageUrl = (result.data as any).images?.[0]?.url ?? "";

      // Persist generated image to Supabase Storage
      const imageUrl = await persistGeneratedImage(tempImageUrl, campaign_id, generation.id);

      outputAssets = [{ title: "Generated Image", kind: "image", preview: imageUrl, prompt: enhancedPrompt }];

    } else if (mode === "image-to-image") {
      if (!images || images.length === 0) {
        return NextResponse.json({ error: "Images must be provided for image-to-image mode." }, { status: 400 });
      }

      if (images.length > 5) {
        return NextResponse.json({ error: "Maximum 5 images allowed for image-to-image generation." }, { status: 400 });
      }

      // Validate all images
      const validImages = images.filter((img: string) => 
        typeof img === "string" && (img.startsWith("data:image/") || img.startsWith("http"))
      );
      if (validImages.length === 0) {
        return NextResponse.json({ error: "No valid images provided. Use data URI or URL format." }, { status: 400 });
      }

      console.log(`[Image-to-Image] Processing ${validImages.length} image(s)`);

      // Map aspect_ratio to fal.ai supported values for kontext endpoints
      // Supported: 21:9, 16:9, 4:3, 3:2, 1:1, 2:3, 3:4, 9:16, 9:21
      type KontextAspect = "1:1" | "16:9" | "9:16" | "4:3" | "3:4" | "2:3" | "3:2" | "21:9" | "9:21";
      const kontextAspectMap: Record<string, KontextAspect> = {
        "1:1": "1:1",
        "4:5": "3:4",   // 4:5 not supported, closest is 3:4
        "9:16": "9:16",
        "16:9": "16:9",
        "4:3": "4:3",
        "3:2": "3:2",
      };
      const mappedAspect: KontextAspect | undefined = aspect_ratio ? (kontextAspectMap[aspect_ratio] ?? "1:1") : undefined;

      // Upload base64 images to fal.ai storage to avoid oversized payloads
      const uploadedUrls: string[] = [];
      for (let i = 0; i < validImages.length; i++) {
        const img = validImages[i];
        try {
          if (img.startsWith("data:image/")) {
            const mimeMatch = img.match(/^data:(image\/\w+);base64,/);
            const mime = mimeMatch?.[1] ?? "image/png";
            const ext = mime.split("/")[1] ?? "png";
            const base64Data = img.replace(/^data:image\/\w+;base64,/, "");
            const buffer = Buffer.from(base64Data, "base64");
            const blob = new Blob([buffer], { type: mime });
            const file = new File([blob], `upload_${i}.${ext}`, { type: mime });
            const url = await fal.storage.upload(file);
            uploadedUrls.push(url);
            console.log(`[Image-to-Image] Uploaded image ${i + 1}/${validImages.length} to fal storage`);
          } else {
            uploadedUrls.push(img);
            console.log(`[Image-to-Image] Using existing URL for image ${i + 1}/${validImages.length}`);
          }
        } catch (uploadErr) {
          console.error(`[Image-to-Image] Failed to upload image ${i + 1}:`, uploadErr);
          throw new Error(`Failed to upload image ${i + 1}: ${uploadErr instanceof Error ? uploadErr.message : "Unknown error"}`);
        }
      }

      console.log(`[Image-to-Image] Uploaded ${uploadedUrls.length} image(s) to fal storage`);

      let tempImageUrl = "";

      try {
        console.log(`[Image-to-Image] Calling fal.ai with ${uploadedUrls.length > 1 ? "kontext/multi" : "kontext"}...`);
        
        if (uploadedUrls.length === 1) {
          // Single image: use standard kontext endpoint
          const result = await fal.subscribe("fal-ai/flux-pro/kontext", {
            input: {
              prompt: `${prompt}. Preserve the original image structure and composition. High quality, ${channel ?? "social media"} format.`,
              image_url: uploadedUrls[0],
              aspect_ratio: mappedAspect,
              num_images: 1,
            },
          });
          console.log("[Image-to-Image] Single image result:", result);
          tempImageUrl = (result.data as { images?: { url: string }[] })?.images?.[0]?.url ?? "";
        } else {
          // Multiple images: use multi-image kontext endpoint
          const result = await fal.subscribe("fal-ai/flux-pro/kontext/multi", {
            input: {
              prompt: `${prompt}. Combine and blend these images into a single cohesive composition. High quality, ${channel ?? "social media"} format.`,
              image_urls: uploadedUrls,
              aspect_ratio: mappedAspect,
              num_images: 1,
            },
          });
          console.log("[Image-to-Image] Multi image result:", result);
          tempImageUrl = (result.data as { images?: { url: string }[] })?.images?.[0]?.url ?? "";
        }
      } catch (falErr) {
        console.error("[Image-to-Image] fal.ai API error:", falErr);
        const errMsg = falErr instanceof Error ? falErr.message : "fal.ai API error";
        await supabase.from("ai_generations").update({ status: "error", error_message: errMsg }).eq("id", generation.id);
        return NextResponse.json({ error: `Image generation failed: ${errMsg}` }, { status: 500 });
      }

      if (!tempImageUrl) {
        console.error("[Image-to-Image] No image URL returned from fal.ai");
        await supabase.from("ai_generations").update({ status: "error", error_message: "AI did not return an image" }).eq("id", generation.id);
        return NextResponse.json({ error: "AI did not return an image" }, { status: 500 });
      }

      console.log(`[Image-to-Image] Got temp image URL, persisting to storage...`);

      // Persist generated image to Supabase Storage
      const imageUrl = await persistGeneratedImage(tempImageUrl, campaign_id, generation.id);

      outputAssets = [{ title: uploadedUrls.length > 1 ? "Combined Image" : "Transformed Image", kind: "image", preview: imageUrl, prompt }];

    } else if (mode === "caption") {
      const systemPrompt = [
        "Kamu adalah AI copywriter spesialis content marketing.",
        brandKit?.voice ? `Tone of voice: ${brandKit.voice}.` : "",
        channel ? `Platform target: ${channel}. Sesuaikan panjang dan format konten untuk ${channel}.` : "",
        brandKit?.guardrails?.length ? `Hindari: ${brandKit.guardrails.join(", ")}.` : "",
        "Buat caption yang engaging, include call-to-action, dan relevan untuk audiens marketing.",
      ].filter(Boolean).join(" ");

      const response = await googleAI.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
        config: { systemInstruction: systemPrompt },
      });

      const caption = response.text ?? "";
      outputAssets = [{ title: "Generated Caption", kind: "caption", preview: caption, prompt }];
    }

    // Simpan output assets ke DB
    const insertedAssets = await Promise.all(
      outputAssets.map((asset) =>
        supabase
          .from("assets")
          .insert({ campaign_id, title: asset.title, kind: asset.kind, preview: asset.preview, prompt: asset.prompt, channel: channel ?? "Instagram", status: "draft" })
          .select()
          .single()
      )
    );

    const assets = insertedAssets.map((r) => r.data).filter(Boolean);

    // Link assets ke generation
    if (generation?.id && assets.length > 0) {
      await supabase.from("generation_outputs").insert(
        assets.map((a) => ({ generation_id: generation.id, asset_id: a!.id }))
      );
    }

    // Update status
    await supabase
      .from("ai_generations")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("id", generation.id);

    // Return enhanced prompt di response agar user tahu prompt yang dipakai AI
    const responsePrompt = outputAssets[0]?.prompt || prompt;
    return NextResponse.json({ 
      generation: { 
        ...generation, 
        status: "completed", 
        outputAssets: assets,
        enhancedPrompt: mode === "text-to-image" ? responsePrompt : undefined 
      } 
    }, { status: 201 });

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error("Generate error:", errorMessage);

    await supabase
      .from("ai_generations")
      .update({ status: "error", error_message: errorMessage })
      .eq("id", generation.id);

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
