'use client';
import ReactECharts from 'echarts-for-react';

export default function ChartWrapper({ option, height = 380 }: { option:any|null, height?:number }) {
  if (!option) {
    return <div style={{height}} className="flex items-center justify-center text-xs text-neutral-500">loading…</div>;
  }
  return <ReactECharts option={option} style={{height}} />;
}
