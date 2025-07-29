"use client"

import { useEffect, useRef, useState } from "react"
import ReactECharts from "echarts-for-react"
import type { EChartsOption } from "echarts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useTheme } from "next-themes"

interface ChartWrapperProps {
  option: EChartsOption
  height?: number
  title?: string
  description?: string
  loading?: boolean
  className?: string
}

export function ChartWrapper({
  option,
  height = 400,
  title,
  description,
  loading = false,
  className,
}: ChartWrapperProps) {
  const { theme } = useTheme()
  const chartRef = useRef<ReactECharts>(null)
  const [isClient, setIsClient] = useState(false)

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (chartRef.current) {
        const chartInstance = chartRef.current.getEchartsInstance()
        chartInstance.resize()
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Dark theme configuration
  const getThemeConfig = () => {
    const isDark = theme === "dark"

    return {
      backgroundColor: "transparent",
      textStyle: {
        color: isDark ? "#e5e7eb" : "#374151",
        fontFamily: "Inter, system-ui, sans-serif",
      },
      tooltip: {
        backgroundColor: isDark ? "#1f2937" : "#ffffff",
        borderColor: isDark ? "#374151" : "#e5e7eb",
        textStyle: {
          color: isDark ? "#e5e7eb" : "#374151",
        },
        extraCssText: `
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          border-radius: 8px;
          padding: 12px;
        `,
      },
      grid: {
        borderColor: isDark ? "#374151" : "#e5e7eb",
      },
      xAxis: {
        axisLine: {
          lineStyle: {
            color: isDark ? "#4b5563" : "#d1d5db",
          },
        },
        axisLabel: {
          color: isDark ? "#9ca3af" : "#6b7280",
        },
        splitLine: {
          lineStyle: {
            color: isDark ? "#374151" : "#f3f4f6",
          },
        },
      },
      yAxis: {
        axisLine: {
          lineStyle: {
            color: isDark ? "#4b5563" : "#d1d5db",
          },
        },
        axisLabel: {
          color: isDark ? "#9ca3af" : "#6b7280",
        },
        splitLine: {
          lineStyle: {
            color: isDark ? "#374151" : "#f3f4f6",
          },
        },
      },
      legend: {
        textStyle: {
          color: isDark ? "#e5e7eb" : "#374151",
        },
      },
      title: {
        textStyle: {
          color: isDark ? "#f9fafb" : "#111827",
        },
        subtextStyle: {
          color: isDark ? "#9ca3af" : "#6b7280",
        },
      },
    }
  }

  // Merge theme config with user option
  const mergedOption = {
    ...getThemeConfig(),
    ...option,
    // Deep merge for nested objects
    textStyle: {
      ...getThemeConfig().textStyle,
      ...option.textStyle,
    },
    tooltip: {
      ...getThemeConfig().tooltip,
      ...option.tooltip,
    },
  }

  // Loading skeleton
  if (loading || !isClient) {
    return (
      <Card className={className}>
        {title && (
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </CardHeader>
        )}
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className={`w-full`} style={{ height: `${height - 100}px` }} />
            <div className="flex space-x-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Check if there's data in the option
  const hasData = () => {
    if (!option.series) return false
    if (Array.isArray(option.series)) {
      return option.series.some((series: any) => series.data && series.data.length > 0)
    }
    return option.series.data && option.series.data.length > 0
  }

  // Empty state
  if (!hasData()) {
    return (
      <Card className={className}>
        {title && (
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </CardHeader>
        )}
        <CardContent>
          <div
            className="flex flex-col items-center justify-center text-muted-foreground"
            style={{ height: `${height}px` }}
          >
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
            <p className="text-sm text-center">There's no data to display in this chart.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </CardHeader>
      )}
      <CardContent>
        <ReactECharts
          ref={chartRef}
          option={mergedOption}
          style={{ height: `${height}px`, width: "100%" }}
          opts={{
            renderer: "canvas",
            useDirtyRect: false,
          }}
          onEvents={{
            click: (params) => {
              console.log("Chart clicked:", params)
            },
          }}
        />
      </CardContent>
    </Card>
  )
}
