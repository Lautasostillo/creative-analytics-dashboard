"use client"

import { DataTable } from "./data-table"
import { SortableHeader } from "./sortable-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { ColumnDef } from "@tanstack/react-table"

// Dummy data type
export type Creative = {
  id: string
  title: string
  platform: "facebook" | "instagram" | "tiktok" | "youtube"
  format: "video" | "image" | "carousel" | "story"
  status: "active" | "paused" | "draft"
  impressions: number
  clicks: number
  ctr: number
  spend: number
  roas: number
  createdAt: string
}

// Generate dummy data
const generateDummyData = (): Creative[] => {
  const platforms: Creative["platform"][] = ["facebook", "instagram", "tiktok", "youtube"]
  const formats: Creative["format"][] = ["video", "image", "carousel", "story"]
  const statuses: Creative["status"][] = ["active", "paused", "draft"]

  return Array.from({ length: 50 }, (_, i) => ({
    id: `creative-${i + 1}`,
    title: `Creative Campaign ${i + 1}`,
    platform: platforms[Math.floor(Math.random() * platforms.length)],
    format: formats[Math.floor(Math.random() * formats.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    impressions: Math.floor(Math.random() * 100000) + 1000,
    clicks: Math.floor(Math.random() * 5000) + 50,
    ctr: Math.random() * 5 + 0.5,
    spend: Math.floor(Math.random() * 10000) + 100,
    roas: Math.random() * 8 + 1,
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
  }))
}

const dummyData = generateDummyData()

// Column definitions
export const columns: ColumnDef<Creative>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => <SortableHeader column={column} title="Title" />,
    cell: ({ row }) => (
      <div className="font-medium max-w-[200px] truncate" title={row.getValue("title")}>
        {row.getValue("title")}
      </div>
    ),
  },
  {
    accessorKey: "platform",
    header: ({ column }) => <SortableHeader column={column} title="Platform" />,
    cell: ({ row }) => {
      const platform = row.getValue("platform") as string
      const platformColors = {
        facebook: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        instagram: "bg-pink-500/10 text-pink-500 border-pink-500/20",
        tiktok: "bg-gray-500/10 text-gray-500 border-gray-500/20",
        youtube: "bg-red-500/10 text-red-500 border-red-500/20",
      }

      return (
        <Badge variant="outline" className={`capitalize ${platformColors[platform as keyof typeof platformColors]}`}>
          {platform}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "format",
    header: ({ column }) => <SortableHeader column={column} title="Format" />,
    cell: ({ row }) => (
      <Badge variant="secondary" className="capitalize">
        {row.getValue("format")}
      </Badge>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => <SortableHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      const statusColors = {
        active: "bg-green-500/10 text-green-500 border-green-500/20",
        paused: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
        draft: "bg-gray-500/10 text-gray-500 border-gray-500/20",
      }

      return (
        <Badge variant="outline" className={`capitalize ${statusColors[status as keyof typeof statusColors]}`}>
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: "impressions",
    header: ({ column }) => <SortableHeader column={column} title="Impressions" />,
    cell: ({ row }) => (
      <div className="text-right font-mono">{(row.getValue("impressions") as number).toLocaleString()}</div>
    ),
  },
  {
    accessorKey: "clicks",
    header: ({ column }) => <SortableHeader column={column} title="Clicks" />,
    cell: ({ row }) => (
      <div className="text-right font-mono">{(row.getValue("clicks") as number).toLocaleString()}</div>
    ),
  },
  {
    accessorKey: "ctr",
    header: ({ column }) => <SortableHeader column={column} title="CTR" />,
    cell: ({ row }) => <div className="text-right font-mono">{(row.getValue("ctr") as number).toFixed(2)}%</div>,
  },
  {
    accessorKey: "spend",
    header: ({ column }) => <SortableHeader column={column} title="Spend" />,
    cell: ({ row }) => (
      <div className="text-right font-mono">${(row.getValue("spend") as number).toLocaleString()}</div>
    ),
  },
  {
    accessorKey: "roas",
    header: ({ column }) => <SortableHeader column={column} title="ROAS" />,
    cell: ({ row }) => <div className="text-right font-mono">{(row.getValue("roas") as number).toFixed(2)}x</div>,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => <SortableHeader column={column} title="Created" />,
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">{new Date(row.getValue("createdAt")).toLocaleDateString()}</div>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const creative = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(creative.id)}>
              Copy creative ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2">
              <Eye className="h-4 w-4" />
              View details
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2">
              <Edit className="h-4 w-4" />
              Edit creative
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 text-red-600">
              <Trash2 className="h-4 w-4" />
              Delete creative
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

export function DataTableExample() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Creative Campaigns</h2>
        <p className="text-muted-foreground">Manage and analyze your creative campaigns performance.</p>
      </div>

      <DataTable
        columns={columns}
        data={dummyData}
        searchKey="title"
        searchPlaceholder="Search creatives..."
        exportFilename="creative-campaigns"
      />
    </div>
  )
}
