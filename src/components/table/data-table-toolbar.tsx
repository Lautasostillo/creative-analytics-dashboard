"use client"

import type { Table } from "@tanstack/react-table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ColumnToggle } from "./column-toggle"
import { Search, Download, X } from "lucide-react"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  searchKey?: keyof TData
  searchPlaceholder?: string
  enableSearch?: boolean
  enableColumnToggle?: boolean
  enableExport?: boolean
  exportFilename?: string
  data: TData[]
}

export function DataTableToolbar<TData>({
  table,
  searchKey,
  searchPlaceholder = "Search...",
  enableSearch = true,
  enableColumnToggle = true,
  enableExport = true,
  exportFilename = "data-export",
  data,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  const exportToCSV = () => {
    if (!data.length) return

    // Get visible columns
    const visibleColumns = table.getVisibleLeafColumns()
    const headers = visibleColumns.map((column) => column.id)

    // Create CSV content
    const csvContent = [
      // Headers
      headers.join(","),
      // Data rows
      ...table.getFilteredRowModel().rows.map((row) =>
        headers
          .map((header) => {
            const cellValue = row.getValue(header)
            // Handle values that might contain commas or quotes
            if (typeof cellValue === "string" && (cellValue.includes(",") || cellValue.includes('"'))) {
              return `"${cellValue.replace(/"/g, '""')}"`
            }
            return cellValue
          })
          .join(","),
      ),
    ].join("\n")

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `${exportFilename}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {enableSearch && searchKey && (
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={(table.getColumn(searchKey as string)?.getFilterValue() as string) ?? ""}
              onChange={(event) => table.getColumn(searchKey as string)?.setFilterValue(event.target.value)}
              className="h-8 w-[150px] lg:w-[250px] pl-8"
            />
          </div>
        )}

        {isFiltered && (
          <Button variant="ghost" onClick={() => table.resetColumnFilters()} className="h-8 px-2 lg:px-3">
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex items-center space-x-2">
        {enableExport && (
          <Button variant="outline" size="sm" onClick={exportToCSV} className="h-8 gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        )}

        {enableColumnToggle && <ColumnToggle table={table} />}
      </div>
    </div>
  )
}
