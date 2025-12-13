"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Crown,
  FileText,
  Settings,
  Users,
  LineChart,
  Command,
  Send,
  CreditCard,
  Globe,
  Newspaper,
  CalendarDays,
  Bot,
  Cog,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Menu structure matching OpenAI style with grouped sections
const menuSections = [
  {
    label: "總覽",
    items: [
      { title: "儀表板", url: "/admin", icon: LayoutDashboard },
      { title: "營運中心", url: "/admin/operations", icon: Send },
    ]
  },
  {
    label: "管理",
    items: [
      { title: "用戶管理", url: "/admin/users", icon: Users },
      { title: "交易所綁定", url: "/admin/bindings", icon: CreditCard },
      { title: "大客戶計畫", url: "/admin/vip", icon: Crown },
      { title: "數據分析", url: "/admin/analytics", icon: LineChart },
    ]
  },
  {
    label: "內容",
    items: [
      { title: "快訊管理", url: "/admin/news", icon: Newspaper },
      { title: "活動管理", url: "/admin/activities", icon: CalendarDays },
      { title: "全球精選", url: "/admin/global", icon: Globe },
    ]
  },
  {
    label: "設定",
    items: [
      { title: "Bot 關鍵字", url: "/admin/bot", icon: Bot },
      { title: "全站設定", url: "/admin/settings", icon: Cog },
    ]
  },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-56 bg-neutral-950 border-r border-white/5 flex flex-col">
      {/* Logo Header */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/5">
        <div className="bg-white text-black flex items-center justify-center w-8 h-8 rounded-lg">
          <Command className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-white">加密台灣 Pro</span>
          <span className="text-[10px] text-neutral-500">管理後台</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {menuSections.map((section) => (
          <div key={section.label} className="mb-5">
            {/* Section Label */}
            <p className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider px-2 mb-2">
              {section.label}
            </p>
            {/* Menu Items */}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.url
                const Icon = item.icon
                return (
                  <li key={item.url}>
                    <Link
                      href={item.url}
                      className={cn(
                        "flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors",
                        isActive
                          ? "bg-white/10 text-white"
                          : "text-neutral-400 hover:bg-white/5 hover:text-neutral-200"
                      )}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.title}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/5">
        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-neutral-500 text-xs">
          <div className="w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center text-[10px] text-white font-medium">
            A
          </div>
          <span>Admin</span>
        </div>
      </div>
    </aside>
  )
}
