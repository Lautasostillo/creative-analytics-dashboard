"use client"

import { useState } from "react"
import { ChartWrapper } from "./chart-wrapper"
import { Button } from "@/components/ui/button"
import { RefreshCw, BarChart3, TrendingUp, Zap } from "lucide-react"
import type { EChartsOption } from "echarts"

// Generate dummy data
const generateScatterData = (count = 50) => {
  return Array.from({ length: count }, () => [
    Math.random() * 100, // x: CTR
    Math.random() * 10 + 1, // y: ROAS
    Math.random() * 1000 + 100, // size: Spend
  ])
}

const generateLineData = () => {
  const dates = Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - 29 + i)
    return date.toISOString().split("T")[0]
  })

  return {
    dates,
    impressions: dates.map(() => Math.floor(Math.random() * 50000) + 10000),
    clicks: dates.map(() => Math.floor(Math.random() * 2000) + 200),
    conversions: dates.map(() => Math.floor(Math.random() * 100) + 10),
  }
}

export function ChartExamples() {
  const [loading, setLoading] = useState(false)
  const [scatterData, setScatterData] = useState(generateScatterData())
  const [lineData, setLineData] = useState(generateLineData())

  const refreshData = () => {
    setLoading(true)
    setTimeout(() => {
      setScatterData(generateScatterData())
      setLineData(generateLineData())
      setLoading(false)
    }, 1500)
  }

  // Scatter Plot Option
  const scatterOption: EChartsOption = {
    title: {
      text: "Performance Analysis",
      subtext: "CTR vs ROAS by Spend",
      left: "center",
    },
    xAxis: {
      type: "value",
      name: "Click-Through Rate (%)",
      nameLocation: "middle",
      nameGap: 30,
      min: 0,
      max: 100,
    },
    yAxis: {
      type: "value",
      name: "Return on Ad Spend",
      nameLocation: "middle",
      nameGap: 40,
      min: 0,
      max: 12,
    },
    tooltip: {
      trigger: "item",
      formatter: (params: any) => {
        const [ctr, roas, spend] = params.data
        return `
          <div style="padding: 8px;">
            <strong>Creative Performance</strong><br/>
            CTR: ${ctr.toFixed(2)}%<br/>
            ROAS: ${roas.toFixed(2)}x<br/>
            Spend: $${spend.toLocaleString()}
          </div>
        `
      },
    },
    series: [
      {
        type: "scatter",
        data: scatterData,
        symbolSize: (data: number[]) => Math.sqrt(data[2]) / 5,
        itemStyle: {
          color: "#3b82f6",
          opacity: 0.7,
        },
        emphasis: {
          itemStyle: {
            color: "#1d4ed8",
            opacity: 1,
          },
        },
      },
    ],
  }

  // Line Chart Option
  const lineOption: EChartsOption = {
    title: {
      text: "Campaign Performance Trend",
      subtext: "Last 30 Days",
      left: "center",
    },
    legend: {
      data: ["Impressions", "Clicks", "Conversions"],
      bottom: 10,
    },
    xAxis: {
      type: "category",
      data: lineData.dates,
      axisLabel: {
        formatter: (value: string) => {
          const date = new Date(value)
          return `${date.getMonth() + 1}/${date.getDate()}`
        },
      },
    },
    yAxis: [
      {
        type: "value",
        name: "Impressions",
        position: "left",
        axisLabel: {
          formatter: "{value}",
        },
      },
      {
        type: "value",
        name: "Clicks / Conversions",
        position: "right",
        axisLabel: {
          formatter: "{value}",
        },
      },
    ],
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross",
      },
    },
    series: [
      {
        name: "Impressions",
        type: "line",
        yAxisIndex: 0,
        data: lineData.impressions,
        smooth: true,
        itemStyle: {
          color: "#3b82f6",
        },
        areaStyle: {
          opacity: 0.1,
        },
      },
      {
        name: "Clicks",
        type: "line",
        yAxisIndex: 1,
        data: lineData.clicks,
        smooth: true,
        itemStyle: {
          color: "#10b981",
        },
      },
      {
        name: "Conversions",
        type: "line",
        yAxisIndex: 1,
        data: lineData.conversions,
        smooth: true,
        itemStyle: {
          color: "#f59e0b",
        },
      },
    ],
  }

  // Bar Chart Option
  const barOption: EChartsOption = {
    title: {
      text: "Platform Performance",
      subtext: "Revenue by Platform",
      left: "center",
    },
    xAxis: {
      type: "category",
      data: ["Facebook", "Instagram", "TikTok", "YouTube", "Twitter"],
    },
    yAxis: {
      type: "value",
      name: "Revenue ($)",
    },
    tooltip: {
      trigger: "axis",
      formatter: (params: any) => {
        const data = params[0]
        return `
          <div style="padding: 8px;">
            <strong>${data.name}</strong><br/>
            Revenue: $${data.value.toLocaleString()}
          </div>
        `
      },
    },
    series: [
      {
        type: "bar",
        data: [
          { value: 45000, itemStyle: { color: "#1877f2" } },
          { value: 38000, itemStyle: { color: "#e4405f" } },
          { value: 28000, itemStyle: { color: "#000000" } },
          { value: 32000, itemStyle: { color: "#ff0000" } },
          { value: 15000, itemStyle: { color: "#1da1f2" } },
        ],
        barWidth: "60%",
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: "rgba(0, 0, 0, 0.3)",
          },
        },
      },
    ],
  }

  // Empty data example
  const emptyOption: EChartsOption = {
    title: {
      text: "Empty Chart Example",
      left: "center",
    },
    series: [
      {
        type: "line",
        data: [],
      },
    ],
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tech-font">Chart Examples</h1>
          <p className="text-muted-foreground">Examples of ChartWrapper component with different chart types</p>
        </div>
        <Button onClick={refreshData} disabled={loading} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh Data
        </Button>
      </div>

      {/* Scatter Plot */}
      <ChartWrapper
        option={scatterOption}
        height={400}
        title="Performance Scatter Plot"
        description="Analyze the relationship between CTR, ROAS, and spend across all creatives"
        loading={loading}
      />

      {/* Line Chart */}
      <ChartWrapper
        option={lineOption}
        height={350}
        title="Trend Analysis"
        description="Track performance metrics over time"
        loading={loading}
      />

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartWrapper
          option={barOption}
          height={300}
          title="Platform Revenue"
          description="Compare revenue across different platforms"
          loading={loading}
        />

        <ChartWrapper
          option={emptyOption}
          height={300}
          title="Empty State Example"
          description="This chart shows the empty state when no data is available"
        />
      </div>

      {/* Feature Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
          <BarChart3 className="h-8 w-8 text-blue-500" />
          <div>
            <h3 className="font-semibold">Auto Resize</h3>
            <p className="text-sm text-muted-foreground">Charts automatically resize with window</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
          <TrendingUp className="h-8 w-8 text-green-500" />
          <div>
            <h3 className="font-semibold">Dark Theme</h3>
            <p className="text-sm text-muted-foreground">Automatic theme switching support</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
          <Zap className="h-8 w-8 text-orange-500" />
          <div>
            <h3 className="font-semibold">Loading States</h3>
            <p className="text-sm text-muted-foreground">Skeleton loading and empty states</p>
          </div>
        </div>
      </div>
    </div>
  )
}
