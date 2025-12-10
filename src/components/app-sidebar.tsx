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
      title: "Overview",
      url: "/admin",
      icon: LayoutDashboard,
      isActive: true, // Default open or matching path
    },
    {
      title: "Management",
      url: "#",
      icon: Users,
      isActive: true,
      items: [
        {
          title: "VIP Applications",
          url: "/admin/vip",
          icon: Crown,
        },
        {
          title: "Analytics",
          url: "/admin/analytics",
          icon: LineChart,
        }
      ],
    },
    {
      title: "Content & Events",
      url: "#",
      icon: FileText,
      isActive: true,
      items: [
        {
          title: "Content CMS",
          url: "/admin/content",
        },
        {
          title: "Activities",
          url: "/admin/activities",
        },
      ],
    },
    {
      title: "System",
      url: "#",
      icon: Settings,
      items: [
        {
          title: "Settings",
          url: "/admin/settings",
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
                  <span className="truncate text-xs text-neutral-400">Admin Console</span>
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
