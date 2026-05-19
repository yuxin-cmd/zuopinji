import { createServerSupabase } from "@/lib/supabase/server";
import type { Video, AboutImage } from "@/lib/types";
import HeroSection from "@/components/HeroSection";
import VideoPreviewSection from "@/components/VideoPreviewSection";
import AboutSection from "@/components/AboutSection";
import ContactSection from "@/components/ContactSection";

async function getSiteContents() {
  try {
    const supabase = await createServerSupabase();
    const { data } = await supabase.from("site_content").select("*");
    const map: Record<string, string> = {};
    if (data) {
      for (const row of data) {
        map[row.section_key] = row.content;
      }
    }
    return map;
  } catch {
    return {};
  }
}

async function getVideosByCategory() {
  try {
    const supabase = await createServerSupabase();
    const { data } = await supabase
      .from("videos")
      .select("*")
      .order("sort_order", { ascending: true });

    const map: Record<string, Video[]> = {
      brand: [],
      operation: [],
      event: [],
    };

    if (data) {
      for (const video of data) {
        if (map[video.category]) {
          map[video.category].push(video);
        }
      }
    }
    return map;
  } catch {
    return { brand: [], operation: [], event: [] };
  }
}

async function getAboutImages() {
  try {
    const supabase = await createServerSupabase();
    const { data } = await supabase
      .from("about_images")
      .select("*")
      .order("sort_order", { ascending: true });

    return (data as AboutImage[]) || [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [contents, videosByCategory, aboutImages] = await Promise.all([
    getSiteContents(),
    getVideosByCategory(),
    getAboutImages(),
  ]);

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
