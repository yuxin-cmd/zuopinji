export type VideoCategory = "brand" | "operation" | "event";

export interface Video {
  id: string;
  title: string;
  category: VideoCategory;
  bilibili_url: string;
  sort_order: number;
  created_at: string;
}

export interface AboutImage {
  id: string;
  image_url: string;
  caption: string;
  sort_order: number;
  created_at: string;
}

export interface SiteContent {
  id: string;
  section_key: string;
  content: string;
  updated_at: string;
}

export const VIDEO_CATEGORIES: Record<VideoCategory, { label: string; slug: string }> = {
  brand: { label: "品牌视频作品", slug: "brand" },
  operation: { label: "业务拍摄与后期", slug: "operation" },
  event: { label: "活动记录与现场支持", slug: "event" },
};

export const SECTION_KEYS = [
  "intro_name",
  "intro_title",
  "intro_bio",
  "about_text",
  "contact_wechat",
  "contact_email",
] as const;
