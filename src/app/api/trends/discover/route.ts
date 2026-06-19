import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { fetchTrendingHashtags } from "@/lib/rapidapi";
import type { TrendingHashtag } from "@/lib/rapidapi";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const { platform, niches, country = "ID", period = 7 } = await request.json();

    // Fetch real-time trends from RapidAPI
    const realtimeTrends: {
      id: string;
      title: string;
      platform: string;
      niche: string;
      hashtags: string[];
      level: "high" | "rising" | "emerging";
      source: string;
    }[] = [];

    try {
      if (process.env.RAPIDAPI_KEY) {
        const rapidData = await fetchTrendingHashtags(country, period as 7 | 30 | 120);
        
        // Limit to top 10 from RapidAPI
        rapidData.slice(0, 10).forEach((trend: TrendingHashtag) => {
          let level: "high" | "rising" | "emerging" = "emerging";
          
          if (trend.rank_diff > 5 || trend.publish_count > 1000000) {
            level = "high";
          } else if (trend.rank_diff > 2 || trend.publish_count > 100000) {
            level = "rising";
          }

          realtimeTrends.push({
            id: `rapidapi_${trend.hashtag}_${trend.country_code}`,
            title: `Trending: #${trend.hashtag}`,
            platform: "TikTok",
            niche: trend.industry || "General",
            hashtags: [trend.hashtag],
            level,
            source: "realtime",
          });
        });
        
        console.log(`[Trends API] Fetched ${realtimeTrends.length} real-time trends from RapidAPI`);
      } else {
        console.warn("[Trends API] RAPIDAPI_KEY not set, using database only");
      }
    } catch (rapidError) {
      console.error("[Trends API] RapidAPI fetch failed:", rapidError);
      // Continue with database fallback
    }

    // Fallback: Get cached trends from database
    const supabase = await createClient();
    
    // Build query
    let query = supabase
      .from("trends")
      .select("*")
      .eq("is_active", true)
      .order("estimated_reach", { ascending: false })
      .limit(20); // More fallback data

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
    const dbTrends = (trends || []).map((t) => ({
      id: t.id,
      title: t.title,
      platform: t.platform,
      niche: t.niche,
      hashtags: t.hashtags || [],
      level: t.level,
      source: "database",
    }));

    // Merge real-time + database trends (real-time first)
    const allTrends = [...realtimeTrends, ...dbTrends];

    // Remove duplicates based on title
    const uniqueTrends = allTrends.filter(
      (trend, index, self) => 
        index === self.findIndex(t => t.title.toLowerCase() === trend.title.toLowerCase())
    );

    return NextResponse.json({ trends: uniqueTrends });
  } catch (err) {
    console.error("[Trends API] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
