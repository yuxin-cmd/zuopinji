"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/admin", label: "概览", icon: "📊" },
  { href: "/admin/content-editor", label: "内容编辑", icon: "📝" },
  { href: "/admin/videos", label: "视频管理", icon: "🎬" },
  { href: "/admin/images", label: "图片管理", icon: "🖼️" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  }

  return (
    <aside className="w-56 shrink-0 bg-white border-r border-slate-200 flex flex-col">
      <div className="p-4 border-b border-slate-200">
        <h1 className="text-lg font-bold text-primary-700">管理后台</h1>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary-50 text-primary-700"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-slate-200">
        <button
          onClick={handleLogout}
          className="w-full rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors text-left"
        >
          退出登录
        </button>
      </div>
    </aside>
  );
}
