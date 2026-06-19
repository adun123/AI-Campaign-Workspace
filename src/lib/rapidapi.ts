/**
 * RapidAPI Client for Trending Hashtags
 * Docs: https://rapidapi.com/xfurkansekerci/api/trending-hashtags
 */

export type TrendingHashtag = {
  hashtag: string;
  publish_count: number;
  video_views: number;
  rank_diff: number;
  country_code: string;
  country_name: string;
  industry: string;
  trend_type: 'up' | 'down' | 'flat';
  trend: Array<{ time: number; value: number }>;
};

export type TrendingResponse = {
  trends: TrendingHashtag[];
};

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'trending-hashtags.p.rapidapi.com';

if (!RAPIDAPI_KEY) {
  console.warn('[RapidAPI] RAPIDAPI_KEY not set in environment variables');
}

/**
 * Fetch trending hashtags from RapidAPI
 * @param countryCode - Two-letter country code (e.g., 'US', 'ID', 'GB')
 * @param period - Time period: 7, 30, or 120 days
 */
export async function fetchTrendingHashtags(
  countryCode: string = 'US',
  period: 7 | 30 | 120 = 7
): Promise<TrendingHashtag[]> {
  if (!RAPIDAPI_KEY) {
    throw new Error('RAPIDAPI_KEY environment variable is not set');
  }

  const url = `https://${RAPIDAPI_HOST}/trends?countryCode=${countryCode}&period=${period}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': RAPIDAPI_HOST,
      },
    });

    if (!response.ok) {
      throw new Error(`RapidAPI error: ${response.status} ${response.statusText}`);
    }

    const data: TrendingResponse = await response.json();
    return data.trends || [];
  } catch (error) {
    console.error('[RapidAPI] Failed to fetch trending hashtags:', error);
    throw error;
  }
}

/**
 * Map RapidAPI trend data to our internal Trend format
 */
export function mapRapidApiToTrend(
  hashtag: TrendingHashtag
): {
  id: string;
  title: string;
  platform: string;
  niche: string;
  hashtags: string[];
  level: 'high' | 'rising' | 'emerging';
} {
  // Determine trend level based on rank_diff and publish_count
  let level: 'high' | 'rising' | 'emerging' = 'emerging';
  
  if (hashtag.rank_diff > 5 || hashtag.publish_count > 1000000) {
    level = 'high';
  } else if (hashtag.rank_diff > 2 || hashtag.publish_count > 100000) {
    level = 'rising';
  }

  return {
    id: `rapidapi_${hashtag.hashtag}_${hashtag.country_code}`,
    title: `#${hashtag.hashtag}`,
    platform: 'TikTok', // This API focuses on TikTok
    niche: hashtag.industry || 'General',
    hashtags: [`#${hashtag.hashtag}`],
    level,
  };
}
