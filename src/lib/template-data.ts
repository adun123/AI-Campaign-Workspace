export type TemplateCategory = "Social Post" | "Carousel" | "Story/Reels" | "Email" | "Ad Creative" | "Video Script";

export type Template = {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  preview: string;
  fields: TemplateField[];
};

export type TemplateField = {
  key: string;
  label: string;
  placeholder: string;
  type: "text" | "textarea" | "select";
  options?: string[];
};

export const templateCategories: TemplateCategory[] = ["Social Post", "Carousel", "Story/Reels", "Email", "Ad Creative", "Video Script"];

export const templates: Template[] = [
  {
    id: "tpl_01",
    name: "Instagram Carousel 5 Slides",
    category: "Carousel",
    description: "Educational carousel with hook slide, 3 value slides, and CTA.",
    preview: "bg-[radial-gradient(circle_at_30%_20%,rgba(124,58,237,0.4),transparent_40%),linear-gradient(135deg,#111214,#0a0a0b)]",
    fields: [
      { key: "topic", label: "Topic", placeholder: "e.g. 5 AI tools for marketers", type: "text" },
      { key: "tone", label: "Tone", placeholder: "e.g. casual, educational", type: "text" },
      { key: "cta", label: "CTA", placeholder: "e.g. Follow for more tips", type: "text" },
    ],
  },
  {
    id: "tpl_02",
    name: "LinkedIn Hook Post",
    category: "Social Post",
    description: "Attention-grabbing opening line + story + insight + CTA.",
    preview: "bg-[radial-gradient(circle_at_70%_30%,rgba(96,165,250,0.35),transparent_40%),linear-gradient(135deg,#111214,#0a0a0b)]",
    fields: [
      { key: "hook", label: "Hook idea", placeholder: "e.g. I failed 3 launches before this worked", type: "text" },
      { key: "insight", label: "Key insight", placeholder: "e.g. Consistency beats perfection", type: "textarea" },
    ],
  },
  {
    id: "tpl_03",
    name: "TikTok Script 30s",
    category: "Video Script",
    description: "Hook (3s) + Problem (5s) + Solution (15s) + CTA (7s).",
    preview: "bg-[radial-gradient(circle_at_50%_80%,rgba(251,191,36,0.3),transparent_40%),linear-gradient(135deg,#111214,#0a0a0b)]",
    fields: [
      { key: "product", label: "Product/Topic", placeholder: "e.g. AI scheduling app", type: "text" },
      { key: "audience", label: "Target audience", placeholder: "e.g. busy founders", type: "text" },
      { key: "style", label: "Style", placeholder: "", type: "select", options: ["Talking head", "Screen recording", "B-roll montage", "POV"] },
    ],
  },
  {
    id: "tpl_04",
    name: "Email Header Visual",
    category: "Email",
    description: "Hero image for email campaign with product context.",
    preview: "bg-[linear-gradient(135deg,#111214,#1a1d2e_50%,#0a0a0b)]",
    fields: [
      { key: "headline", label: "Headline", placeholder: "e.g. Your workspace, reimagined", type: "text" },
      { key: "mood", label: "Visual mood", placeholder: "e.g. dark, premium, minimal", type: "text" },
    ],
  },
  {
    id: "tpl_05",
    name: "Instagram Story Promo",
    category: "Story/Reels",
    description: "Vertical story with bold text overlay and swipe-up CTA.",
    preview: "bg-[radial-gradient(circle_at_50%_20%,rgba(124,58,237,0.5),transparent_35%),linear-gradient(180deg,#111214,#0a0a0b)]",
    fields: [
      { key: "offer", label: "Offer/Message", placeholder: "e.g. 50% off this week only", type: "text" },
      { key: "brand", label: "Brand name", placeholder: "e.g. Kaiva", type: "text" },
    ],
  },
  {
    id: "tpl_06",
    name: "Facebook Ad Creative",
    category: "Ad Creative",
    description: "Single image ad with headline, description, and CTA button.",
    preview: "bg-[radial-gradient(circle_at_80%_60%,rgba(96,165,250,0.3),transparent_35%),linear-gradient(135deg,#0a0a0b,#111214)]",
    fields: [
      { key: "headline", label: "Ad headline", placeholder: "e.g. Launch faster with AI", type: "text" },
      { key: "description", label: "Description", placeholder: "e.g. Generate campaign assets in minutes", type: "textarea" },
      { key: "cta_button", label: "CTA Button", placeholder: "", type: "select", options: ["Learn More", "Sign Up", "Shop Now", "Get Started"] },
    ],
  },
  {
    id: "tpl_07",
    name: "Twitter/X Thread Opener",
    category: "Social Post",
    description: "Thread hook tweet + 4 follow-up points structure.",
    preview: "bg-[linear-gradient(135deg,#0a0a0b,#151820_60%,#111214)]",
    fields: [
      { key: "topic", label: "Thread topic", placeholder: "e.g. How I grew from 0 to 10k followers", type: "text" },
      { key: "points", label: "Key points (comma separated)", placeholder: "e.g. consistency, niche, hooks, engagement", type: "textarea" },
    ],
  },
  {
    id: "tpl_08",
    name: "Product Launch Carousel",
    category: "Carousel",
    description: "Before/after + feature highlights + social proof + CTA.",
    preview: "bg-[radial-gradient(circle_at_20%_70%,rgba(52,211,153,0.3),transparent_35%),linear-gradient(135deg,#111214,#0a0a0b)]",
    fields: [
      { key: "product", label: "Product name", placeholder: "e.g. AI Campaign Workspace", type: "text" },
      { key: "benefit", label: "Main benefit", placeholder: "e.g. 10x faster campaign creation", type: "text" },
      { key: "proof", label: "Social proof", placeholder: "e.g. Used by 500+ teams", type: "text" },
    ],
  },
  {
    id: "tpl_09",
    name: "YouTube Shorts Script",
    category: "Video Script",
    description: "60s vertical video: hook + demo + result + subscribe CTA.",
    preview: "bg-[radial-gradient(circle_at_60%_40%,rgba(251,113,133,0.3),transparent_40%),linear-gradient(135deg,#111214,#0a0a0b)]",
    fields: [
      { key: "topic", label: "What to show", placeholder: "e.g. AI generating a full campaign in 30s", type: "text" },
      { key: "hook", label: "Opening hook", placeholder: "e.g. Watch me create a full campaign in under a minute", type: "text" },
    ],
  },
  {
    id: "tpl_10",
    name: "Newsletter Section Block",
    category: "Email",
    description: "Content block with image + short copy for weekly newsletter.",
    preview: "bg-[linear-gradient(135deg,#111214,#181b24_55%,#0a0a0b)]",
    fields: [
      { key: "topic", label: "Section topic", placeholder: "e.g. Tool of the week", type: "text" },
      { key: "copy", label: "Short copy", placeholder: "e.g. This AI tool saved us 5 hours per week", type: "textarea" },
    ],
  },
];
