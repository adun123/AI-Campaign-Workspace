import { createClient } from "@/lib/supabase/server";
import { getWorkspaceId } from "@/lib/get-workspace-id";
import googleAI from "@/lib/google-ai";
import { NextResponse } from "next/server";

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

      const arText = aspect_ratio ? `Aspect ratio: ${aspect_ratio}.` : "";
      const fullPrompt = `${prompt}. ${brandContext} ${arText} High quality, ${channel ?? "social media"} format, marketing visual.`;

      const response = await googleAI.models.generateContent({
        model: "gemini-3.1-flash-image",
        contents: fullPrompt,
        config: { responseModalities: ["TEXT", "IMAGE"] },
      });

      let imageUrl = "";
      const parts = response.candidates?.[0]?.content?.parts ?? [];
      // Skip thought parts, find actual output image
      const imagePart = parts.find((p: Record<string, unknown>) => 
        !p.thought && (p as { inlineData?: { mimeType?: string } }).inlineData?.mimeType?.startsWith("image/")
      ) as { inlineData?: { mimeType?: string; data?: string } } | undefined;

      if (imagePart?.inlineData?.data) {
        imageUrl = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
      } else {
        // Fallback: check text response
        const textPart = parts.find((p: Record<string, unknown>) => !p.thought && (p as { text?: string }).text);
        console.log("No image in response. Parts count:", parts.length, "Text:", (textPart as { text?: string })?.text?.slice(0, 100));
      }

      outputAssets = [{ title: "Generated Image", kind: "image", preview: imageUrl, prompt }];

    } else if (mode === "image-to-image") {
      if (!images || images.length === 0) {
        return NextResponse.json({ error: "images wajib disertakan untuk mode image-to-image." }, { status: 400 });
      }

      // Use first image as source
      const base64Match = images[0].match(/^data:(image\/\w+);base64,(.+)$/);
      if (!base64Match) {
        return NextResponse.json({ error: "Invalid image format" }, { status: 400 });
      }

      const response = await googleAI.models.generateContent({
        model: "gemini-3.1-flash-image",
        contents: [
          {
            role: "user",
            parts: [
              { inlineData: { mimeType: base64Match[1], data: base64Match[2] } },
              { text: `${prompt}. ${aspect_ratio ? `Aspect ratio: ${aspect_ratio}.` : ""} High quality, ${channel ?? "social media"} format, marketing visual.` },
            ],
          },
        ],
        config: { responseModalities: ["TEXT", "IMAGE"] },
      });

      let imageUrl = "";
      const parts = response.candidates?.[0]?.content?.parts ?? [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const imagePart = parts.find((p: any) => !p.thought && p.inlineData?.mimeType?.startsWith("image/")) as { inlineData?: { mimeType?: string; data?: string } } | undefined;
      if (imagePart?.inlineData?.data) {
        imageUrl = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
      }

      outputAssets = [{ title: "Transformed Image", kind: "image", preview: imageUrl, prompt }];

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

    return NextResponse.json({ generation: { ...generation, status: "completed", outputAssets: assets } }, { status: 201 });

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
