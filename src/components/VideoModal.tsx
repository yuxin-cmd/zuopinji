"use client";

import { useEffect, useRef } from "react";

interface VideoModalProps {
  embedUrl: string;
  title: string;
  onClose: () => void;
}

export default function VideoModal({ embedUrl, title, onClose }: VideoModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="relative w-full max-w-4xl rounded-xl bg-black shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 text-white">
          <h3 className="text-sm font-medium truncate mr-8">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="aspect-video w-full">
          <iframe
            src={embedUrl}
            title={title}
            className="h-full w-full"
            allow="autoplay; fullscreen"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}
