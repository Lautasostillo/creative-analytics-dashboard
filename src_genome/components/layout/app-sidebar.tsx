"use client"

import type * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { BarChart3, Search, ImageIcon, GitCompare, Layers, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

const navigationItems = [
  {
    title: "Overview",
    url: "/overview",
    icon: BarChart3,
    description: "Dashboard principal con KPIs",
  },
  {
    title: "Explorer",
    url: "/explorer",
    icon: Search,
    description: "Explorar todos los creatives",
  },
  {
    title: "Gallery",
    url: "/gallery",
    icon: ImageIcon,
    description: "Vista visual de creatives",
  },
  {
    title: "Compare",
    url: "/compare",
    icon: GitCompare,
    description: "Comparar performance",
  },
  {
    title: "Clusters",
    url: "/clusters",
    icon: Layers,
    description: "Análisis de patrones",
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon" className="border-r-0" {...props}>
      <SidebarHeader className="border-b border-border/50 pb-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="hover:bg-transparent">
              <Link href="/overview">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Sparkles className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-bold text-foreground">Creative Analytics</span>
                  <span className="truncate text-xs text-muted-foreground">Dashboard</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <div className="px-3 py-2">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tools</h2>
          </div>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => {
                const isActive = pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.description}
                      className={cn(
                        "h-10 rounded-lg transition-all duration-200 hover:bg-secondary/80",
                        isActive && "sidebar-item-active hover:bg-primary",
                      )}
                    >
                      <Link href={item.url} className="flex items-center gap-3">
                        <item.icon className="size-4 shrink-0" />
                        <span className="font-medium">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/50 pt-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs text-muted-foreground">Sistema activo</span>
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
