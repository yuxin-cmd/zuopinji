"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { SECTION_KEYS } from "@/lib/types";

const sectionLabels: Record<string, string> = {
  intro_name: "姓名",
  intro_title: "头衔",
  intro_bio: "个人简介",
  about_text: "关于我（详细介绍）",
  contact_wechat: "微信号",
  contact_email: "邮箱",
};

export default function ContentEditorPage() {
  const [contents, setContents] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase.from("site_content").select("*");
      const map: Record<string, string> = {};
      if (data) {
        for (const row of data) {
          map[row.section_key] = row.content;
        }
      }
      for (const key of SECTION_KEYS) {
        if (!(key in map)) map[key] = "";
      }
      setContents(map);
    }
    load();
  }, []);

  async function handleSave(key: string, value: string) {
    setSaving(true);
    setMessage("");
    const supabase = createClient();

    const { error } = await supabase
      .from("site_content")
      .upsert({ section_key: key, content: value, updated_at: new Date().toISOString() });

    if (error) {
      setMessage("保存失败：" + error.message);
    } else {
      setMessage("保存成功！");
      setTimeout(() => setMessage(""), 2000);
    }
    setSaving(false);
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">内容编辑</h2>

      {message && (
        <div className={`mb-4 rounded-lg px-3 py-2 text-sm ${
          message.includes("失败") ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
        }`}>
          {message}
        </div>
      )}

      <div className="space-y-6">
        {SECTION_KEYS.map((key) => (
          <div key={key} className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              {sectionLabels[key] || key}
            </label>
            {key === "about_text" || key === "intro_bio" ? (
              <textarea
                value={contents[key] || ""}
                onChange={(e) => setContents({ ...contents, [key]: e.target.value })}
                rows={4}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400"
              />
            ) : (
              <input
                type="text"
                value={contents[key] || ""}
                onChange={(e) => setContents({ ...contents, [key]: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400"
              />
            )}
            <button
              onClick={() => handleSave(key, contents[key] || "")}
              disabled={saving}
              className="mt-3 rounded-lg bg-primary-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              保存
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
