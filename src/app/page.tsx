"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Video, AboutImage } from "@/lib/types";
import HeroSection from "@/components/HeroSection";
import VideoPreviewSection from "@/components/VideoPreviewSection";
import AboutSection from "@/components/AboutSection";
import ContactSection from "@/components/ContactSection";

export default function HomePage() {
  const [contents, setContents] = useState<Record<string, string>>({});
  const [videosByCategory, setVideosByCategory] = useState<Record<string, Video[]>>({ brand: [], operation: [], event: [] });
  const [aboutImages, setAboutImages] = useState<AboutImage[]>([]);

  useEffect(() => {
    const supabase = createClient();

    supabase
      .from("site_content")
      .select("*")
      .then(({ data }) => {
        const map: Record<string, string> = {};
        if (data) {
          for (const row of data) {
            map[row.section_key] = row.content;
          }
        }
        setContents(map);
      }, () => {});

    supabase
      .from("videos")
      .select("*")
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        const map: Record<string, Video[]> = { brand: [], operation: [], event: [] };
        if (data) {
          for (const video of data) {
            if (map[video.category]) {
              map[video.category].push(video);
            }
          }
        }
        setVideosByCategory(map);
      }, () => {});

    supabase
      .from("about_images")
      .select("*")
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        setAboutImages((data as AboutImage[]) || []);
      }, () => {});
  }, []);

  return (
    <>
      <main className="flex-1">
        <HeroSection
          name={contents.intro_name || ""}
          title={contents.intro_title || ""}
          bio={contents.intro_bio || ""}
        />

        <VideoPreviewSection
          category="brand"
          videos={videosByCategory.brand || []}
        />
        <VideoPreviewSection
          category="operation"
          videos={videosByCategory.operation || []}
        />
        <VideoPreviewSection
          category="event"
          videos={videosByCategory.event || []}
        />

        <AboutSection
          text={contents.about_text || ""}
          images={aboutImages}
        />
      </main>

      <ContactSection
        wechat={contents.contact_wechat || ""}
        email={contents.contact_email || ""}
      />
    </>
  );
}
