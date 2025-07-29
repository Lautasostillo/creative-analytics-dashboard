"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { BarChart3, Search, ImageIcon, GitCompare, Layers, MessageSquare, Grid3X3 } from "lucide-react"

const navigation = [
  { name: "Overview", href: "/overview", icon: BarChart3 },
  { name: "Explorer", href: "/explorer", icon: Search },
  { name: "Gallery", href: "/gallery", icon: ImageIcon },
  { name: "Compare", href: "/compare", icon: GitCompare },
  { name: "Clusters", href: "/clusters", icon: Layers },
  { name: "Creative Genome", href: "/creative-genome", icon: Grid3X3 },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col">
      <div className="p-6">
        <h1 className="text-xl font-bold tech-font">Creative Analytics</h1>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 transition-all duration-200",
                  isActive && "bg-secondary text-secondary-foreground",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Button>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <Button
          variant="outline"
          className="w-full justify-start gap-3 bg-transparent"
          onClick={() => {
            /* Toggle chat */
          }}
        >
          <MessageSquare className="h-4 w-4" />
          AI Assistant
        </Button>
      </div>
    </div>
  )
}
