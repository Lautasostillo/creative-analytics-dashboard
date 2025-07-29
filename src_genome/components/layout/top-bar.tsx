"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Bell, Settings, HelpCircle } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { usePathname } from "next/navigation"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function TopBar() {
  const pathname = usePathname()

  const getPageTitle = () => {
    switch (pathname) {
      case "/overview":
        return "Overview"
      case "/explorer":
        return "Explorer"
      case "/gallery":
        return "Gallery"
      case "/compare":
        return "Compare"
      case "/clusters":
        return "Clusters"
      default:
        return "Dashboard"
    }
  }

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border/50 bg-background px-6">
      <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />
      <Separator orientation="vertical" className="mr-2 h-4 bg-border/50" />

      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbLink href="/overview" className="text-muted-foreground hover:text-foreground">
              Creative Analytics
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block text-border" />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-medium text-foreground">{getPageTitle()}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search */}
      <div className="relative hidden md:block">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar creatives..."
          className="w-64 pl-10 bg-input border-border/50 focus:border-primary/50 focus:ring-primary/20"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-secondary/80"
        >
          <HelpCircle className="h-4 w-4" />
          <span className="sr-only">Ayuda</span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-secondary/80"
        >
          <Bell className="h-4 w-4" />
          <span className="sr-only">Notificaciones</span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-secondary/80"
        >
          <Settings className="h-4 w-4" />
          <span className="sr-only">Configuración</span>
        </Button>

        <Separator orientation="vertical" className="mx-2 h-4 bg-border/50" />

        {/* User Avatar */}
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8 border border-border/50">
            <AvatarFallback className="bg-secondary text-foreground text-xs font-medium">LS</AvatarFallback>
          </Avatar>
          <div className="hidden lg:block">
            <p className="text-sm font-medium text-foreground">Member</p>
            <p className="text-xs text-muted-foreground">lautaro.sostillo@readyset.co</p>
          </div>
        </div>
      </div>
    </header>
  )
}
