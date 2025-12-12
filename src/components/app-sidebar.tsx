"use client"

import * as React from "react"
import {
  LayoutDashboard,
  Crown,
  FileText,
  Activity,
  Settings,
  Users,
  LineChart,
  Command,
  Send,
  CreditCard,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "Admin",
    email: "admin@cryptotw.io",
    avatar: "",
  },
  navMain: [
    {
      title: "總覽",
      url: "/admin",
      icon: LayoutDashboard,
      isActive: true, // Default open or matching path
    },
    {
      title: "管理中心",
      url: "#",
      icon: Users,
      isActive: true, // Expand by default
      items: [
        {
          title: "交易所綁定",
          url: "/admin/bindings",
          icon: CreditCard,
        },
        {
          title: "用戶管理",
          url: "/admin/users",
          icon: Users,
        },
        {
          title: "大客戶計畫",
          url: "/admin/vip",
          icon: Crown,
        },
        {
          title: "數據分析",
          url: "/admin/analytics",
          icon: LineChart,
        },
        {
          title: "推播訊息",
          url: "/admin/push",
          icon: Send,
        }
      ],
    },
    {
      title: "內容與活動",
      url: "#",
      icon: FileText,
      isActive: true, // Expand by default
      items: [
        {
          title: "快訊管理",
          url: "/admin/news",
        },
        {
          title: "文章管理",
          url: "/admin/articles",
        },
        {
          title: "全球精選",
          url: "/admin/global",
        },
        {
          title: "活動管理",
          url: "/admin/activities",
        },
      ],
    },
    {
      title: "系統設定",
      url: "#",
      icon: Settings,
      items: [
        {
          title: "全站設定",
          url: "/admin/settings",
        },
        {
          title: "Bot 關鍵字",
          url: "/admin/bot",
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/admin">
                <div className="bg-white text-black flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight text-white">
                  <span className="truncate font-bold">CryptoTW Pro</span>
                  <span className="truncate text-xs text-neutral-400">管理後台</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
