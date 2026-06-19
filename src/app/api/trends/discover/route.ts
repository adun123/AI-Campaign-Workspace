import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const { platform, niches } = await request.json();

    const supabase = await createClient();
    
    // Build query
    let query = supabase
      .from("trends")
      .select("*")
      .eq("is_active", true)
      .order("estimated_reach", { ascending: false })
      .limit(50);

    // Filter by platform
    if (platform) {
      query = query.eq("platform", platform);
    }

    // Filter by niches
    if (niches && niches.length > 0) {
      query = query.in("niche", niches);
    }

    const { data: trends, error } = await query;

    if (error) {
      console.error("[Trends API] Query error:", error);
      return NextResponse.json(
        { error: "Failed to fetch trends" },
        { status: 500 }
      );
    }

    // Map database fields to client format
    const mappedTrends = (trends || []).map((t) => ({
      id: t.id,
      title: t.title,
      platform: t.platform,
      niche: t.niche,
      hashtags: t.hashtags || [],
      level: t.level,
    }));

    return NextResponse.json({ trends: mappedTrends });
  } catch (err) {
    console.error("[Trends API] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
