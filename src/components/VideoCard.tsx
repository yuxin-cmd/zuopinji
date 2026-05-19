"use client";

import { useState } from "react";
import type { Video } from "@/lib/types";
import VideoModal from "./VideoModal";

function extractBvid(url: string): string | null {
  const patterns = [
    /BV[a-zA-Z0-9]+/,
    /bvid=([a-zA-Z0-9]+)/,
    /video\/([a-zA-Z0-9]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1] || match[0];
    }
  }
  return null;
}

function getEmbedUrl(bvid: string): string {
  return `https://player.bilibili.com/player.html?bvid=${bvid}&page=1&autoplay=1`;
}

export default function VideoCard({ video }: { video: Video }) {
  const [showModal, setShowModal] = useState(false);
  const bvid = extractBvid(video.bilibili_url);

  return (
    <>
      <div
        onClick={() => bvid && setShowModal(true)}
        className="group cursor-pointer overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200 transition-all hover:shadow-md hover:ring-primary-300"
      >
        <div className="aspect-video bg-slate-100 relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-500/80 text-white transition-transform group-hover:scale-110">
              <svg className="ml-1 h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-sm font-medium text-slate-800 line-clamp-1">
            {video.title}
          </h3>
        </div>
      </div>

      {showModal && bvid && (
        <VideoModal
          embedUrl={getEmbedUrl(bvid)}
          title={video.title}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
