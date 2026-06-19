import { createClient } from "@/lib/supabase/server";
import { getWorkspaceId } from "@/lib/get-workspace-id";
import { persistRemoteImage } from "@/lib/supabase/storage";
import googleAI from "@/lib/google-ai";
import fal from "@/lib/fal-ai";
import { NextResponse } from "next/server";
import type { AIModel, ImageResolution, ImageQuality } from "@/stores/chat-store";

// Extend API route timeout for long-running AI generation
export const maxDuration = 300; // 5 minutes for Vercel/serverless

// Model endpoint mapping
const MODEL_ENDPOINTS: Record<AIModel, string> = {
  "nano-banana-2": "fal-ai/nano-banana-2",
  "nano-banana-2-edit": "fal-ai/nano-banana-2/edit",
  "nano-banana-pro-edit": "fal-ai/nano-banana-pro/edit",
  "gpt-image-2-edit": "openai/gpt-image-2/edit",
  "seedream-v5-lite": "fal-ai/bytedance/seedream/v5/lite/edit",
  "flux-schnell": "fal-ai/flux/schnell",
};

// Resolution to pixel mapping for Nano Banana models
const RESOLUTION_MAP: Record<ImageResolution, { width: number; height: number }> = {
  "0.5k": { width: 512, height: 512 },
  "1k": { width: 1024, height: 1024 },
  "2k": { width: 2048, height: 2048 },
  "4k": { width: 4096, height: 4096 },
};

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
          "You are a prompt engineer for AI image generation.",
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

// Generate image with specific model
async function generateWithModel(
  model: AIModel,
  prompt: string,
  options: {
    images?: string[];
    aspectRatio?: string;
    resolution?: ImageResolution;
    quality?: ImageQuality;
    numImages?: number;
    channel?: string;
  }
): Promise<{ url: string }[]> {
  const { images, aspectRatio, resolution, quality, numImages = 1, channel } = options;
  const endpoint = MODEL_ENDPOINTS[model];

  console.log(`[Generate] Using model: ${model}, endpoint: ${endpoint}`);

  // Text-to-image models (no image input)
  if (model === "nano-banana-2" || model === "flux-schnell") {
    const res = RESOLUTION_MAP[resolution || "1k"];
    
    if (model === "flux-schnell") {
      // Flux Schnell - simple text-to-image
      const result = await fal.subscribe(endpoint, {
        input: {
          prompt,
          image_size: "square_hd",
          num_images: numImages,
          num_inference_steps: 4,
        },
      });
      return (result.data as { images: { url: string }[] }).images || [];
    } else {
      // Nano Banana 2 - high quality text-to-image
      const result = await fal.subscribe(endpoint, {
        input: {
          prompt,
          width: res.width,
          height: res.height,
          num_images: numImages,
        },
      });
      return (result.data as { images: { url: string }[] }).images || [];
    }
  }

  // Image editing models (require image input)
  if (!images || images.length === 0) {
    throw new Error(`${model} requires image input`);
  }

  // Upload images to fal storage first
  const uploadedUrls: string[] = [];
  for (const img of images) {
    if (img.startsWith("data:image/")) {
      const mimeMatch = img.match(/^data:(image\/\w+);base64,/);
      const mime = mimeMatch?.[1] ?? "image/png";
      const ext = mime.split("/")[1] ?? "png";
      const base64Data = img.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");
      const blob = new Blob([buffer], { type: mime });
      const file = new File([blob], `upload_${Date.now()}.${ext}`, { type: mime });
      const url = await fal.storage.upload(file);
      uploadedUrls.push(url);
    } else {
      uploadedUrls.push(img);
    }
  }

  // Nano Banana 2 Edit
  if (model === "nano-banana-2-edit") {
    const res = RESOLUTION_MAP[resolution || "1k"];
    const result = await fal.subscribe(endpoint, {
      input: {
        prompt,
        image_url: uploadedUrls[0],
        width: res.width,
        height: res.height,
        num_images: numImages,
      },
    });
    return (result.data as { images: { url: string }[] }).images || [];
  }

  // Nano Banana Pro Edit
  if (model === "nano-banana-pro-edit") {
    const res = RESOLUTION_MAP[resolution || "1k"];
    const result = await fal.subscribe(endpoint, {
      input: {
        prompt,
        image_url: uploadedUrls[0],
        width: res.width,
        height: res.height,
        num_images: numImages,
      },
    });
    return (result.data as { images: { url: string }[] }).images || [];
  }

  // GPT Image 2 Edit
  if (model === "gpt-image-2-edit") {
    // GPT uses different parameter names
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await fal.subscribe(endpoint, {
      input: {
        prompt,
        image: uploadedUrls[0],
        quality: quality || "auto",
        n: numImages,
      } as any,
    });
    // GPT returns data in different format
    const responseImages = (result.data as { data?: { url: string }[] })?.data || [];
    return responseImages.map((img) => ({ url: img.url }));
  }

  // Seedream v5 Lite
  if (model === "seedream-v5-lite") {
    const result = await fal.subscribe(endpoint, {
      input: {
        prompt,
        image_url: uploadedUrls[0],
        num_images: numImages,
      },
    });
    return (result.data as { images: { url: string }[] }).images || [];
  }

  throw new Error(`Unsupported model: ${model}`);
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

  const { 
    campaign_id, 
    mode, 
    prompt, 
    channel, 
    images, 
    aspect_ratio, 
    num_images = 1, 
    style_preset = "none",
    model = "nano-banana-2",
    resolution = "1k",
    quality = "auto"
  } = await request.json();
  if (!campaign_id || !mode || !prompt) {
    return NextResponse.json({ error: "campaign_id, mode, dan prompt wajib diisi." }, { status: 400 });
  }

  // Validate num_images (1, 2, or 4)
  const validBatchCounts = [1, 2, 4];
  const batchSize = validBatchCounts.includes(num_images) ? num_images : 1;

  // Style preset modifiers
  const styleModifiers: Record<string, string> = {
    photorealistic: "photorealistic, natural lighting, high detail, realistic textures, professional photography",
    minimalist: "minimalist design, clean composition, simple elements, white space, modern aesthetic",
    bold: "bold colors, high contrast, vibrant, eye-catching, impactful design, strong visual impact",
    creative: "creative, artistic, unique perspective, unconventional composition, imaginative, artistic flair",
  };
  const styleModifier = styleModifiers[style_preset] || "";

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

      // Apply style preset
      const stylePart = styleModifier ? `, ${styleModifier}` : "";
      const fullPrompt = `${enhancedPrompt}${stylePart}. ${brandContext} High quality, ${channel ?? "social media"} format, marketing visual.`;

      console.log(`[Generate] Batch size: ${batchSize}, Style: ${style_preset}, Model: ${model}`);

      // Call model with new routing system
      const generatedImages = await generateWithModel(model, fullPrompt, {
        aspectRatio: aspect_ratio,
        resolution,
        quality,
        numImages: batchSize,
        channel,
      });

      console.log(`[Generate] Received ${generatedImages.length} image(s) from model`);

      // Persist all images and build outputAssets
      for (let i = 0; i < generatedImages.length; i++) {
        const tempImageUrl = generatedImages[i].url;
        const imageUrl = await persistGeneratedImage(tempImageUrl, campaign_id, `${generation.id}_${i}`);
        const title = generatedImages.length > 1 ? `Generated Image ${i + 1}` : "Generated Image";
        outputAssets.push({ title, kind: "image", preview: imageUrl, prompt: enhancedPrompt });
      }

      console.log(`[Generate] Persisted ${outputAssets.length} image(s)`);

    } else if (mode === "image-to-image") {
      if (!images || images.length === 0) {
        return NextResponse.json({ error: "Images must be provided for image-to-image mode." }, { status: 400 });
      }

      // Get max images for selected model
      const maxImages = model === "seedream-v5-lite" ? 5 : 10;
      
      if (images.length > maxImages) {
        return NextResponse.json({ error: `Maximum ${maxImages} images allowed for ${model}.` }, { status: 400 });
      }

      // Validate all images
      const validImages = images.filter((img: string) => 
        typeof img === "string" && (img.startsWith("data:image/") || img.startsWith("http"))
      );
      if (validImages.length === 0) {
        return NextResponse.json({ error: "No valid images provided. Use data URI or URL format." }, { status: 400 });
      }

      console.log(`[Image-to-Image] Processing ${validImages.length} image(s) with model: ${model}`);

      // Apply style modifier to prompt if needed
      const stylePart = styleModifier ? `, ${styleModifier}` : "";
      const fullPrompt = `${prompt}${stylePart}. High quality, ${channel ?? "social media"} format.`;

      // Call model with new routing system
      const generatedImages = await generateWithModel(model, fullPrompt, {
        images: validImages,
        aspectRatio: aspect_ratio,
        resolution,
        quality,
        numImages: batchSize,
        channel,
      });

      if (!generatedImages || generatedImages.length === 0) {
        console.error("[Image-to-Image] No image returned from model");
        await supabase.from("ai_generations").update({ status: "error", error_message: "AI did not return an image" }).eq("id", generation.id);
        return NextResponse.json({ error: "AI did not return an image" }, { status: 500 });
      }

      console.log(`[Image-to-Image] Got ${generatedImages.length} image(s), persisting to storage...`);

      // Persist all images and build outputAssets
      for (let i = 0; i < generatedImages.length; i++) {
        const tempImageUrl = generatedImages[i].url;
        const imageUrl = await persistGeneratedImage(tempImageUrl, campaign_id, `${generation.id}_${i}`);
        const title = generatedImages.length > 1 ? `Edited Image ${i + 1}` : "Edited Image";
        outputAssets.push({ title, kind: "image", preview: imageUrl, prompt });
      }

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
