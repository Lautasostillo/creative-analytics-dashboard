"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Expand, Lightbulb, TrendingUp, AlertTriangle, Target } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface InsightCardProps {
  title: string
  insight: string
  icon?: ReactNode
  type?: "recommendation" | "trend" | "alert" | "opportunity"
  confidence?: number
  impact?: "high" | "medium" | "low"
  detailedInsight?: string
  actionItems?: string[]
  className?: string
}

export function InsightCard({
  title,
  insight,
  icon,
  type = "recommendation",
  confidence,
  impact,
  detailedInsight,
  actionItems = [],
  className,
}: InsightCardProps) {
  const [isOpen, setIsOpen] = useState(false)

  const getDefaultIcon = () => {
    switch (type) {
      case "recommendation":
        return <Lightbulb className="h-5 w-5" />
      case "trend":
        return <TrendingUp className="h-5 w-5" />
      case "alert":
        return <AlertTriangle className="h-5 w-5" />
      case "opportunity":
        return <Target className="h-5 w-5" />
      default:
        return <Lightbulb className="h-5 w-5" />
    }
  }

  const getTypeColor = () => {
    switch (type) {
      case "recommendation":
        return "text-blue-400 bg-blue-500/10"
      case "trend":
        return "text-green-400 bg-green-500/10"
      case "alert":
        return "text-red-400 bg-red-500/10"
      case "opportunity":
        return "text-primary bg-primary/10"
      default:
        return "text-blue-400 bg-blue-500/10"
    }
  }

  const getImpactColor = () => {
    switch (impact) {
      case "high":
        return "bg-red-500/10 text-red-400 border-red-500/20"
      case "medium":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
      case "low":
        return "bg-green-500/10 text-green-400 border-green-500/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <>
      <Card className={cn("card-hover bg-card border-border/50", className)}>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-lg", getTypeColor())}>{icon || getDefaultIcon()}</div>
              <div className="flex-1">
                <CardTitle className="text-base font-semibold leading-tight text-foreground">{title}</CardTitle>
                {impact && (
                  <Badge variant="outline" className={cn("mt-2 text-xs", getImpactColor())}>
                    {impact} impact
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">{insight}</p>

          <div className="flex items-center justify-between">
            {confidence && (
              <div className="flex items-center gap-3">
                <div className="text-xs text-muted-foreground">Confianza:</div>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all duration-500"
                      style={{ width: `${confidence}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium tech-font text-foreground">{confidence}%</span>
                </div>
              </div>
            )}

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 h-8 px-3 text-muted-foreground hover:text-foreground"
                >
                  <Expand className="h-3 w-3" />
                  Expand
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-card border-border/50">
                <DialogHeader>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={cn("p-3 rounded-lg", getTypeColor())}>{icon || getDefaultIcon()}</div>
                    <div>
                      <DialogTitle className="text-left text-foreground">{title}</DialogTitle>
                      <div className="flex items-center gap-2 mt-2">
                        {impact && (
                          <Badge variant="outline" className={cn("text-xs", getImpactColor())}>
                            {impact} impact
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs capitalize bg-secondary/50 text-muted-foreground">
                          {type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </DialogHeader>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-3 text-foreground">Insight Detallado</h4>
                    <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
                      {detailedInsight || insight}
                    </DialogDescription>
                  </div>

                  {confidence && (
                    <div>
                      <h4 className="font-semibold mb-3 text-foreground">Nivel de Confianza</h4>
                      <div className="flex items-center gap-4">
                        <div className="flex-1 h-3 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all duration-500"
                            style={{ width: `${confidence}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium tech-font text-foreground">{confidence}%</span>
                      </div>
                    </div>
                  )}

                  {actionItems.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 text-foreground">Acciones Recomendadas</h4>
                      <ul className="space-y-2">
                        {actionItems.map((item, index) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-start gap-3">
                            <span className="text-primary mt-1 font-bold">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-6 border-t border-border/50">
                    <Button
                      variant="outline"
                      onClick={() => setIsOpen(false)}
                      className="bg-transparent border-border/50"
                    >
                      Cerrar
                    </Button>
                    <Button className="gradient-button">Aplicar Recomendación</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
