"use client"

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useAppStore } from "@/lib/store"
import { Eye, MousePointer, ShoppingCart, DollarSign, Calendar, Tag, TrendingUp, Heart } from "lucide-react"

export function CreativeSheet() {
  const { selectedCreative, isCreativeSheetOpen, setCreativeSheetOpen } = useAppStore()

  if (!selectedCreative) return null

  const metrics = [
    {
      label: "Impressions",
      value: selectedCreative.impressions.toLocaleString(),
      icon: Eye,
      color: "text-blue-500",
    },
    {
      label: "Clicks",
      value: selectedCreative.clicks.toLocaleString(),
      icon: MousePointer,
      color: "text-green-500",
    },
    {
      label: "Conversions",
      value: selectedCreative.conversions.toLocaleString(),
      icon: ShoppingCart,
      color: "text-purple-500",
    },
    {
      label: "Spend",
      value: `$${selectedCreative.spend.toLocaleString()}`,
      icon: DollarSign,
      color: "text-red-500",
    },
  ]

  const kpis = [
    { label: "CTR", value: `${selectedCreative.ctr.toFixed(2)}%` },
    { label: "CPM", value: `$${selectedCreative.cpm.toFixed(2)}` },
    { label: "CPC", value: `$${selectedCreative.cpc.toFixed(2)}` },
    { label: "ROAS", value: `${selectedCreative.roas.toFixed(2)}x` },
  ]

  return (
    <Sheet open={isCreativeSheetOpen} onOpenChange={setCreativeSheetOpen}>
      <SheetContent className="w-[600px] sm:max-w-[600px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {selectedCreative.title}
            <Badge variant="outline" className="capitalize">
              {selectedCreative.format}
            </Badge>
          </SheetTitle>
          <SheetDescription>{selectedCreative.description}</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Creative Preview */}
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <div className="text-4xl mb-2">🎨</div>
              <p>Creative Preview</p>
              <p className="text-sm">({selectedCreative.format})</p>
            </div>
          </div>

          {/* Platform & Campaign Info */}
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="capitalize">
              {selectedCreative.platform}
            </Badge>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {new Date(selectedCreative.created_at).toLocaleDateString()}
            </div>
          </div>

          <Separator />

          {/* Key Metrics */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Performance Metrics
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {metrics.map((metric) => (
                <div key={metric.label} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <metric.icon className={`h-5 w-5 ${metric.color}`} />
                  <div>
                    <p className="text-sm text-muted-foreground">{metric.label}</p>
                    <p className="font-semibold tech-font">{metric.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* KPIs */}
          <div>
            <h3 className="font-semibold mb-3">Key Performance Indicators</h3>
            <div className="grid grid-cols-2 gap-3">
              {kpis.map((kpi) => (
                <div key={kpi.label} className="flex justify-between p-2 bg-muted/30 rounded">
                  <span className="text-sm text-muted-foreground">{kpi.label}</span>
                  <span className="font-medium tech-font">{kpi.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Score */}
          <div>
            <h3 className="font-semibold mb-3">Performance Score</h3>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-muted rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${selectedCreative.performance_score}%` }}
                />
              </div>
              <span className="font-bold tech-font text-lg">{selectedCreative.performance_score}/100</span>
            </div>
          </div>

          {/* Tags */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {selectedCreative.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Sentiment */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Sentiment Analysis
            </h3>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-muted rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    selectedCreative.sentiment_score > 0 ? "bg-green-500" : "bg-red-500"
                  }`}
                  style={{
                    width: `${Math.abs(selectedCreative.sentiment_score) * 50}%`,
                    marginLeft:
                      selectedCreative.sentiment_score < 0 ? `${50 + selectedCreative.sentiment_score * 50}%` : "50%",
                  }}
                />
              </div>
              <span className="font-medium tech-font">
                {selectedCreative.sentiment_score > 0 ? "Positive" : "Negative"}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button className="flex-1">Duplicate Creative</Button>
            <Button variant="outline" className="flex-1 bg-transparent">
              Edit Creative
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
