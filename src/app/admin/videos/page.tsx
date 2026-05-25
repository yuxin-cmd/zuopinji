"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Video, VideoCategory } from "@/lib/types";
import { VIDEO_CATEGORIES } from "@/lib/types";

export default function VideoManagerPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<VideoCategory>("brand");
  const [bilibiliUrl, setBilibiliUrl] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setVideoFile(null);
    setError("");
    setShowForm(true);
  }

  function openEditForm(v: Video) {
    setEditingId(v.id);
    setTitle(v.title);
    setCategory(v.category);
    setBilibiliUrl(v.bilibili_url || "");
    setVideoFile(null);
    setError("");
    setShowForm(true);
  }

  async function handleSave() {
    if (!title.trim()) {
      setError("请填写标题");
      return;
    }
    if (!bilibiliUrl.trim() && !videoFile && !editingId) {
      setError("请填写视频链接或上传视频文件");
      return;
    }
    setSaving(true);
    setError("");

    const supabase = createClient();
    let videoUrl: string | undefined;

    // 如果上传了新文件，先上传到 Supabase Storage
    if (videoFile) {
      setUploading(true);
      const ext = videoFile.name.split(".").pop() || "mp4";
      const fileName = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("videos")
        .upload(fileName, videoFile);

      if (uploadError) {
        setError("视频上传失败：" + uploadError.message);
        setSaving(false);
        setUploading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("videos")
        .getPublicUrl(uploadData.path);

      videoUrl = urlData.publicUrl;
      setUploading(false);
    }

    // 保存到数据库
    const payload = {
      title: title.trim(),
      category,
      bilibili_url: bilibiliUrl.trim(),
      ...(videoUrl ? { video_url: videoUrl } : {}),
    };

    if (editingId) {
      await supabase.from("videos").update(payload).eq("id", editingId);
    } else {
      const { data: existing } = await supabase
        .from("videos")
        .select("sort_order")
        .eq("category", category)
        .order("sort_order", { ascending: false })
        .limit(1);

      const nextOrder = ((existing?.[0] as { sort_order: number } | undefined)?.sort_order ?? -1) + 1;

      await supabase.from("videos").insert({
        ...payload,
        sort_order: nextOrder,
      });
    }

    setShowForm(false);
    setSaving(false);
    loadVideos();
  }

  async function handleDelete(v: Video) {
    if (!confirm("确定要删除这个视频吗？")) return;
    const supabase = createClient();
    // 删除时也删除存储桶中的文件
    if (v.video_url) {
      const urlPath = v.video_url.split("/").pop();
      if (urlPath) {
        await supabase.storage.from("videos").remove([urlPath]);
      }
    }
    await supabase.from("videos").delete().eq("id", v.id);
    loadVideos();
  }

  function getVideoType(v: Video): string {
    if (v.video_url) return "本地上传";
    if (v.bilibili_url) {
      if (/v\.qq\.com/i.test(v.bilibili_url)) return "腾讯视频";
      return "B站";
    }
    return "无链接";
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
                视频来源
              </label>
              <div className="rounded-lg border border-slate-200 p-4 space-y-3">
                {/* 视频链接 */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">B站 / 腾讯视频链接（可选）</label>
                  <input
                    type="text"
                    value={bilibiliUrl}
                    onChange={(e) => setBilibiliUrl(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400"
                    placeholder="B站: https://www.bilibili.com/video/BVxxxxxx 或 腾讯: https://v.qq.com/x/page/xxxxx.html"
                  />
                </div>

                {/* 分隔线 */}
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-slate-200" />
                  <span className="text-xs text-slate-400">或</span>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>

                {/* 本地上传 */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">
                    上传视频文件
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/ogg"
                    onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                    className="w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-primary-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary-600 hover:file:bg-primary-100"
                  />
                  {videoFile && (
                    <p className="mt-1 text-xs text-green-600">
                      已选择：{videoFile.name}（{(videoFile.size / 1024 / 1024).toFixed(1)} MB）
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {uploading ? "上传视频中..." : saving ? "保存中..." : "保存"}
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
                  {VIDEO_CATEGORIES[v.category]?.label}
                  {" · "}
                  {getVideoType(v)}{v.bilibili_url ? ` · ${v.bilibili_url}` : ""}
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
                  onClick={() => handleDelete(v)}
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
