"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  Radio,
  Newspaper,
  Settings,
  Command,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Admin v2 Menu Structure
const menuSections = [
  {
    label: "平台管理",
    items: [
      { title: "儀表板 (Dashboard)", url: "/admin", icon: LayoutDashboard },
      { title: "用戶中心 (Users)", url: "/admin/users", icon: Users },
      { title: "市場訊號 (Signals)", url: "/admin/signals", icon: Radio },
      { title: "內容管理 (Content)", url: "/admin/content", icon: Newspaper },
      { title: "系統設定 (System)", url: "/admin/system", icon: Settings },
    ]
  },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-56 bg-neutral-950 border-r border-white/5 flex flex-col">
      {/* Logo Header */}
      <div className="flex items-center gap-3 px-4 py-6 border-b border-white/5">
        <div className="bg-white text-black flex items-center justify-center w-8 h-8 rounded-lg shadow-[0_0_15px_rgba(255,255,255,0.3)]">
          <Command className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-white tracking-wide">加密台灣 Pro</span>
          <span className="text-[10px] text-neutral-400 font-mono">ADMIN v2.0</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-3">
        {menuSections.map((section) => (
          <div key={section.label} className="mb-6">
            <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest px-3 mb-3">
              {section.label}
            </p>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.url || pathname.startsWith(item.url + '/')
                const Icon = item.icon
                return (
                  <li key={item.url}>
                    <Link
                      href={item.url}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-white text-black shadow-lg shadow-white/10"
                          : "text-neutral-400 hover:bg-white/5 hover:text-white"
                      )}
                    >
                      <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-black" : "text-neutral-500 group-hover:text-white")} />
                      <span>{item.title.split(' ')[0]}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-6 border-t border-white/5 bg-neutral-950">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neutral-800 to-black border border-white/10 flex items-center justify-center text-xs text-white font-bold shadow-inner">
            A
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-white font-medium">Administrator</span>
            <span className="text-[10px] text-neutral-500">Full Access</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
