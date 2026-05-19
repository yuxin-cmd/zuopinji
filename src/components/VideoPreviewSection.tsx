import Link from "next/link";
import type { Video, VideoCategory } from "@/lib/types";
import { VIDEO_CATEGORIES } from "@/lib/types";
import VideoCard from "./VideoCard";

interface VideoPreviewSectionProps {
  category: VideoCategory;
  videos: Video[];
}

export default function VideoPreviewSection({ category, videos }: VideoPreviewSectionProps) {
  const { label, slug } = VIDEO_CATEGORIES[category];
  const previewVideos = videos.slice(0, 3);

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="text-2xl font-bold text-slate-800 sm:text-3xl">
            {label}
          </h2>
          <Link
            href={`/videos/${slug}`}
            className="flex items-center gap-1 text-sm font-medium text-primary-500 hover:text-primary-600 transition-colors"
          >
            查看更多
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {previewVideos.length === 0 ? (
          <p className="text-slate-400 text-sm">暂无视频</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {previewVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
