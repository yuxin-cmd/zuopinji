"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { AboutImage } from "@/lib/types";

export default function ImageManagerPage() {
  const [images, setImages] = useState<AboutImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState("");
  const [message, setMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadImages();
  }, []);

  async function loadImages() {
    const supabase = createClient();
    const { data } = await supabase
      .from("about_images")
      .select("*")
      .order("sort_order");
    setImages((data as AboutImage[]) || []);
    setLoading(false);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage("");

    const supabase = createClient();
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("about-images")
      .upload(fileName, file);

    if (uploadError) {
      setMessage("上传失败：" + uploadError.message);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("about-images")
      .getPublicUrl(fileName);

    const nextOrder = images.length > 0
      ? Math.max(...images.map((i) => i.sort_order)) + 1
      : 0;

    const { error: dbError } = await supabase.from("about_images").insert({
      image_url: urlData.publicUrl,
      caption: caption,
      sort_order: nextOrder,
    });

    if (dbError) {
      setMessage("保存失败：" + dbError.message);
    } else {
      setMessage("上传成功！");
      setCaption("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      loadImages();
    }
    setUploading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("确定要删除这张图片吗？")) return;

    const supabase = createClient();

    const img = images.find((i) => i.id === id);
    if (img) {
      const urlParts = img.image_url.split("/");
      const fileName = urlParts[urlParts.length - 1];
      await supabase.storage.from("about-images").remove([fileName]);
    }

    await supabase.from("about_images").delete().eq("id", id);
    loadImages();
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">图片管理（关于我）</h2>

      {message && (
        <div className={`mb-4 rounded-lg px-3 py-2 text-sm ${
          message.includes("失败") ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
        }`}>
          {message}
        </div>
      )}

      <div className="mb-6 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h3 className="font-semibold text-slate-800 mb-4">上传新图片</h3>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">图片说明（可选）</label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400"
              placeholder="图片说明文字"
            />
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleUpload}
              disabled={uploading}
              className="text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-primary-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-primary-700 disabled:opacity-50"
            />
          </div>
          {uploading && <p className="text-sm text-slate-400">上传中...</p>}
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">加载中...</p>
      ) : images.length === 0 ? (
        <p className="text-sm text-slate-400">暂无图片</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((img) => (
            <div
              key={img.id}
              className="rounded-xl bg-white overflow-hidden shadow-sm ring-1 ring-slate-200"
            >
              <img
                src={img.image_url}
                alt={img.caption || ""}
                className="h-40 w-full object-cover"
              />
              <div className="p-3 flex items-center justify-between">
                <p className="text-xs text-slate-500 truncate flex-1">
                  {img.caption || "无说明"}
                </p>
                <button
                  onClick={() => handleDelete(img.id)}
                  className="ml-2 rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
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
