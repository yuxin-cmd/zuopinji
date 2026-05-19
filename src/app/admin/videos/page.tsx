"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Video, VideoCategory } from "@/lib/types";
import { VIDEO_CATEGORIES } from "@/lib/types";

export default function VideoManagerPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  // form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<VideoCategory>("brand");
  const [bilibiliUrl, setBilibiliUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadVideos();
  }, []);

  async function loadVideos() {
    const supabase = createClient();
    const { data } = await supabase
      .from("videos")
      .select("*")
      .order("category")
      .order("sort_order");
    setVideos((data as Video[]) || []);
    setLoading(false);
  }

  function openAddForm() {
    setEditingId(null);
    setTitle("");
    setCategory("brand");
    setBilibiliUrl("");
    setError("");
    setShowForm(true);
  }

  function openEditForm(v: Video) {
    setEditingId(v.id);
    setTitle(v.title);
    setCategory(v.category);
    setBilibiliUrl(v.bilibili_url);
    setError("");
    setShowForm(true);
  }

  async function handleSave() {
    if (!title.trim() || !bilibiliUrl.trim()) {
      setError("请填写标题和B站链接");
      return;
    }
    setSaving(true);
    setError("");

    const supabase = createClient();

    if (editingId) {
      await supabase
        .from("videos")
        .update({ title: title.trim(), category, bilibili_url: bilibiliUrl.trim() })
        .eq("id", editingId);
    } else {
      const { data: existing } = await supabase
        .from("videos")
        .select("sort_order")
        .eq("category", category)
        .order("sort_order", { ascending: false })
        .limit(1);

      const nextOrder = ((existing?.[0] as { sort_order: number } | undefined)?.sort_order ?? -1) + 1;

      await supabase.from("videos").insert({
        title: title.trim(),
        category,
        bilibili_url: bilibiliUrl.trim(),
        sort_order: nextOrder,
      });
    }

    setShowForm(false);
    setSaving(false);
    loadVideos();
  }

  async function handleDelete(id: string) {
    if (!confirm("确定要删除这个视频吗？")) return;
    const supabase = createClient();
    await supabase.from("videos").delete().eq("id", id);
    loadVideos();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800">视频管理</h2>
        <button
          onClick={openAddForm}
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
        >
          添加视频
        </button>
      </div>

      {showForm && (
        <div className="mb-6 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h3 className="font-semibold text-slate-800 mb-4">
            {editingId ? "编辑视频" : "添加视频"}
          </h3>
          {error && <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">标题</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400"
                placeholder="视频名称"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">分类</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as VideoCategory)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400"
              >
                {Object.entries(VIDEO_CATEGORIES).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                B站视频链接
              </label>
              <input
                type="text"
                value={bilibiliUrl}
                onChange={(e) => setBilibiliUrl(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400"
                placeholder="https://www.bilibili.com/video/BVxxxxxx 或直接粘贴BV号"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {saving ? "保存中..." : "保存"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-slate-400">加载中...</p>
      ) : videos.length === 0 ? (
        <p className="text-sm text-slate-400">暂无视频，点击上方按钮添加。</p>
      ) : (
        <div className="space-y-2">
          {videos.map((v) => (
            <div
              key={v.id}
              className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-800 truncate">{v.title}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {VIDEO_CATEGORIES[v.category]?.label} · {v.bilibili_url}
                </p>
              </div>
              <div className="ml-4 flex gap-2 shrink-0">
                <button
                  onClick={() => openEditForm(v)}
                  className="rounded-lg px-3 py-1 text-xs font-medium text-primary-600 hover:bg-primary-50"
                >
                  编辑
                </button>
                <button
                  onClick={() => handleDelete(v.id)}
                  className="rounded-lg px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
