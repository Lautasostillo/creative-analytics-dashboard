export interface Creative {
  [key: string]: any // Allow any property for now
  "Ad Name": string
  "SPEND": number
  "IMPRESSIONS": number
  "CLICKS": number
  "CTR": number
  "CPC": number
  "CPM": number
  "CTR_pct": number
  "cluster_id": number
}

export interface KPIData {
  label: string
  value: string | number
  change?: number
  trend?: "up" | "down" | "neutral"
  format?: "currency" | "percentage" | "number"
}

export interface ChartData {
  name: string
  value: number
  [key: string]: any
}

export interface FilterState {
  dateRange?: [Date, Date]
  platforms?: string[]
  formats?: string[]
  campaigns?: string[]
  performanceRange?: [number, number]
}

export interface InsightData {
  id: string
  type: "trend" | "anomaly" | "recommendation" | "alert"
  title: string
  description: string
  confidence?: number
  impact?: "high" | "medium" | "low"
  category?: string
  generated_at?: string
}
