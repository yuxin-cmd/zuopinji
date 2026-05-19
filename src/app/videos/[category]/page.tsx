import { notFound } from "next/navigation";
import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import { VIDEO_CATEGORIES, type Video, type VideoCategory } from "@/lib/types";
import VideoCard from "@/components/VideoCard";

interface Props {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { category } = await params;
  const info = VIDEO_CATEGORIES[category as VideoCategory];
  if (!info) return { title: "未找到" };
  return { title: `${info.label} - 个人作品集` };
}

export default async function VideoCategoryPage({ params }: Props) {
  const { category } = await params;
  const info = VIDEO_CATEGORIES[category as VideoCategory];

  if (!info) {
    notFound();
  }

  let videos: Video[] | null = null;
  try {
    const supabase = await createServerSupabase();
    const { data } = await supabase
      .from("videos")
      .select("*")
      .eq("category", category)
      .order("sort_order", { ascending: true });
    videos = data as Video[] | null;
  } catch {
    videos = [];
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1 text-sm font-medium text-primary-500 hover:text-primary-600 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          返回首页
        </Link>

        <h1 className="mt-4 text-3xl font-bold text-slate-800 sm:text-4xl">
          {info.label}
        </h1>

        {!videos || videos.length === 0 ? (
          <p className="mt-12 text-center text-slate-400">暂无视频</p>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(videos as Video[]).map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
