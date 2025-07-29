import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface KpiCardProps {
  title: string
  value: string
  delta?: number
  className?: string
}

export function KpiCard({ title, value, delta, className }: KpiCardProps) {
  const getDeltaIcon = () => {
    if (delta === undefined) return null

    if (delta > 0) {
      return <TrendingUp className="h-4 w-4 text-green-400" />
    } else if (delta < 0) {
      return <TrendingDown className="h-4 w-4 text-red-400" />
    } else {
      return <Minus className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getDeltaColor = () => {
    if (delta === undefined) return ""

    if (delta > 0) {
      return "text-green-400"
    } else if (delta < 0) {
      return "text-red-400"
    } else {
      return "text-muted-foreground"
    }
  }

  const formatDelta = (value: number) => {
    const sign = value > 0 ? "+" : ""
    return `${sign}${value.toFixed(1)}%`
  }

  return (
    <Card className={cn("card-hover bg-card border-border/50", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {delta !== undefined && <div className={cn("flex items-center gap-1", getDeltaColor())}>{getDeltaIcon()}</div>}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-3xl font-bold tech-font text-foreground">{value}</div>
          {delta !== undefined && (
            <div className={cn("text-sm font-medium", getDeltaColor())}>{formatDelta(delta)}</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
