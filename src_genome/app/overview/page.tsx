"use client"

import { KpiCard } from "@/components/cards/kpi-card"
import { InsightCard } from "@/components/cards/insight-card"
import { ChartWrapper } from "@/components/charts/chart-wrapper"
import { Button } from "@/components/ui/button"
import { TrendingUp, Target, RefreshCw } from "lucide-react"
import type { EChartsOption } from "echarts"

export default function OverviewPage() {
  const performanceOption: EChartsOption = {
    title: {
      text: "Performance Trend",
      textStyle: { color: "#ffffff", fontSize: 16, fontWeight: 600 },
      left: "center",
    },
    tooltip: {
      trigger: "axis",
      backgroundColor: "#2a2d3a",
      borderColor: "#404553",
      textStyle: { color: "#ffffff" },
    },
    legend: {
      data: ["Impressions", "Clicks", "Conversions"],
      bottom: 10,
      textStyle: { color: "#9ca3af" },
    },
    xAxis: {
      type: "category",
      data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      axisLabel: { color: "#9ca3af" },
      axisLine: { lineStyle: { color: "#404553" } },
    },
    yAxis: {
      type: "value",
      axisLabel: { color: "#9ca3af" },
      axisLine: { lineStyle: { color: "#404553" } },
      splitLine: { lineStyle: { color: "#404553" } },
    },
    series: [
      {
        name: "Impressions",
        type: "line",
        data: [12000, 13200, 10100, 13400, 9000, 23000, 21000],
        smooth: true,
        itemStyle: { color: "#e91e63" },
        areaStyle: { opacity: 0.1 },
      },
      {
        name: "Clicks",
        type: "line",
        data: [220, 282, 201, 234, 290, 330, 310],
        smooth: true,
        itemStyle: { color: "#9c27b0" },
      },
      {
        name: "Conversions",
        type: "line",
        data: [15, 23, 18, 28, 32, 42, 38],
        smooth: true,
        itemStyle: { color: "#673ab7" },
      },
    ],
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tech-font text-foreground">Overview</h1>
          <p className="text-muted-foreground mt-1">Get insights into your creative performance across all campaigns</p>
        </div>
        <Button className="gradient-button gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh Data
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard title="Total Revenue" value="$124,500" delta={12.5} />
        <KpiCard title="Active Users" value="8,432" delta={-3.2} />
        <KpiCard title="Conversion Rate" value="3.24%" delta={8.1} />
        <KpiCard title="Average ROAS" value="4.2x" delta={15.3} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartWrapper
          option={performanceOption}
          height={350}
          title="Campaign Performance"
          description="Track your key metrics over time"
        />

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">AI Insights</h2>
          <div className="space-y-4">
            <InsightCard
              title="Performance Trending Up"
              insight="Video creatives are showing 23% better performance this week compared to last week."
              type="trend"
              confidence={87}
              impact="high"
              detailedInsight="Análisis detallado muestra que los videos de 15-30 segundos están generando mayor engagement, especialmente en Instagram y TikTok."
              actionItems={[
                "Incrementar presupuesto en creativos de video",
                "Crear más contenido de video corto",
                "Testear diferentes duraciones de video",
              ]}
              icon={<TrendingUp className="h-5 w-5" />}
            />

            <InsightCard
              title="Growth Opportunity"
              insight="Untapped potential in 25-34 age group showing high engagement but low spend allocation."
              type="opportunity"
              confidence={68}
              impact="medium"
              icon={<Target className="h-5 w-5" />}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
