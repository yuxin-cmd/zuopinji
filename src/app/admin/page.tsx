"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({ videos: 0, images: 0 });
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/admin/login");
        return;
      }
      setUserEmail(user.email || "");

      const { data: videos } = await supabase.from("videos").select("id", { count: "exact" });
      const { data: images } = await supabase.from("about_images").select("id", { count: "exact" });

      setStats({
        videos: (videos as unknown[])?.length || 0,
        images: (images as unknown[])?.length || 0,
      });
    }
    load();
  }, [router]);

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">概览</h2>
      <p className="text-sm text-slate-500 mb-8">当前登录：{userEmail}</p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">视频总数</p>
          <p className="mt-1 text-3xl font-bold text-primary-600">{stats.videos}</p>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">关于我图片</p>
          <p className="mt-1 text-3xl font-bold text-primary-600">{stats.images}</p>
        </div>
      </div>
    </div>
  );
}
