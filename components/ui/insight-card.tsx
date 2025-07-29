import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, AlertTriangle, Lightbulb, Bell } from "lucide-react"
import type { InsightData } from "@/lib/types"

interface InsightCardProps {
  insight: InsightData
}

export function InsightCard({ insight }: InsightCardProps) {
  const getIcon = () => {
    switch (insight.type) {
      case "trend":
        return <TrendingUp className="h-4 w-4" />
      case "anomaly":
        return <AlertTriangle className="h-4 w-4" />
      case "recommendation":
        return <Lightbulb className="h-4 w-4" />
      case "alert":
        return <Bell className="h-4 w-4" />
    }
  }

  const getTypeColor = () => {
    switch (insight.type) {
      case "trend":
        return "bg-blue-500/10 text-blue-500"
      case "anomaly":
        return "bg-yellow-500/10 text-yellow-500"
      case "recommendation":
        return "bg-green-500/10 text-green-500"
      case "alert":
        return "bg-red-500/10 text-red-500"
    }
  }

  const getImpactColor = () => {
    switch (insight.impact) {
      case "high":
        return "bg-red-500/10 text-red-500"
      case "medium":
        return "bg-yellow-500/10 text-yellow-500"
      case "low":
        return "bg-green-500/10 text-green-500"
    }
  }

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-1 rounded ${getTypeColor()}`}>{getIcon()}</div>
            <CardTitle className="text-sm font-medium">{insight.title}</CardTitle>
          </div>
          <Badge variant="outline" className={getImpactColor()}>
            {insight.impact}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Confidence: {Math.round(insight.confidence * 100)}%</span>
          <span>{new Date(insight.generated_at).toLocaleDateString()}</span>
        </div>
      </CardContent>
    </Card>
  )
}
