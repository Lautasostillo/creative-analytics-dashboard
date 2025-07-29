"use client"

import { useEffect, useRef } from "react"
import * as echarts from "echarts/core"
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  ToolboxComponent,
  DataZoomComponent,
} from "echarts/components"
import { LineChart, BarChart, ScatterChart, HeatmapChart } from "echarts/charts"
import { CanvasRenderer } from "echarts/renderers"
import { Card } from "@/components/ui/card"

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  ToolboxComponent,
  DataZoomComponent,
  LineChart,
  BarChart,
  ScatterChart,
  HeatmapChart,
  CanvasRenderer,
])

interface ChartWrapperProps {
  option: echarts.EChartsOption
  height?: number
  className?: string
}

export function ChartWrapper({ option, height = 400, className }: ChartWrapperProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts>()

  useEffect(() => {
    if (!chartRef.current) return

    // Initialize chart
    chartInstance.current = echarts.init(chartRef.current, "dark")

    // Set option
    chartInstance.current.setOption(option)

    // Handle resize
    const handleResize = () => {
      chartInstance.current?.resize()
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      chartInstance.current?.dispose()
    }
  }, [])

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.setOption(option, true)
    }
  }, [option])

  return (
    <Card className={className}>
      <div ref={chartRef} style={{ height: `${height}px` }} className="w-full" />
    </Card>
  )
}
