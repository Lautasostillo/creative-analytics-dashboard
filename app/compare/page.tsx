'use client';
import { useEffect, useState, useMemo } from 'react';
import { useRealCreativeData } from '@/hooks/useRealCreativeData';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChartWrapper } from "@/components/ui/chart-wrapper";
import type { Creative } from "@/lib/types";
import { Plus, X, TrendingUp, Award, Lightbulb, Download, Play, Users, Target, Palette } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import CardMedia from "@/components/gallery/CardMedia";

export default function ComparePage() {
  const { data: creativesData, loading, error } = useRealCreativeData();
  const [selectedCreatives, setSelectedCreatives] = useState<any[]>([]);
  const [isSelectDialogOpen, setIsSelectDialogOpen] = useState(false);
  
  // Convert RealCreativeData to Creative format for compatibility
  const creatives = useMemo(() => {
    if (!creativesData || !Array.isArray(creativesData)) return [];
    return creativesData.map(item => ({
      ...item,
      "Ad Name": item["Ad Name"],
      CTR_pct: parseFloat(String(item.CTR || '0')),
      CLICKS: parseInt(String(item.CLICKS || '0')),
      SPEND: parseFloat(String(item.SPEND || '0')),
      IMPRESSIONS: parseInt(String(item.IMPRESSIONS || '0')),
      cluster_id: (item as any).CLUSTER || 'Unknown'
    }));
  }, [creativesData]);

  const addCreative = (creative: Creative) => {
    if (selectedCreatives.length < 4 && !selectedCreatives.find((c) => c["Ad Name"] === creative["Ad Name"])) {
      setSelectedCreatives([...selectedCreatives, creative]);
      setIsSelectDialogOpen(false);
    }
  };

  // Calculate performance differentials
  const getPerformanceDifferentials = () => {
    if (selectedCreatives.length < 2) return [];
    
    const bestPerformer = selectedCreatives.reduce((best, current) => 
      (current.CTR_pct || 0) > (best.CTR_pct || 0) ? current : best
    );
    
    return selectedCreatives.map(creative => {
      const ctrDiff = ((creative.CTR_pct || 0) - (bestPerformer.CTR_pct || 0)) / (bestPerformer.CTR_pct || 1) * 100;
      const spendEfficiency = (creative.CLICKS || 0) / (creative.SPEND || 1);
      const bestSpendEfficiency = (bestPerformer.CLICKS || 0) / (bestPerformer.SPEND || 1);
      const efficiencyDiff = (spendEfficiency - bestSpendEfficiency) / bestSpendEfficiency * 100;
      
      return {
        creative,
        isBest: creative["Ad Name"] === bestPerformer["Ad Name"],
        ctrDifferential: ctrDiff,
        efficiencyDifferential: efficiencyDiff,
        performanceScore: (creative.CTR_pct || 0) * 100 + (creative.CLICKS || 0) / 1000
      };
    }).sort((a, b) => b.performanceScore - a.performanceScore);
  };

  // Generate AI insights
  const generateComparisonInsights = () => {
    const differentials = getPerformanceDifferentials();
    if (differentials.length < 2) return [];
    
    const insights = [];
    const best = differentials[0];
    const worst = differentials[differentials.length - 1];
    
    // Performance insight
    if (best.ctrDifferential > 20) {
      insights.push({
        type: 'performance',
        title: 'Significant Performance Gap',
        message: `${best.creative["Ad Name"]} performs ${Math.abs(best.ctrDifferential - worst.ctrDifferential).toFixed(1)}% better in CTR than ${worst.creative["Ad Name"]}`,
        icon: TrendingUp,
        color: 'text-green-400'
      });
    }
    
    // Creative dimension insights
    const tones = selectedCreatives.map(c => c.TONE).filter(Boolean);
    const uniqueTones = [...new Set(tones)];
    if (uniqueTones.length > 1) {
      insights.push({
        type: 'creative',
        title: 'Tone Variation Impact',
        message: `Testing ${uniqueTones.length} different tones: ${uniqueTones.slice(0, 3).join(', ')}`,
        icon: Palette,
        color: 'text-blue-400'
      });
    }
    
    // ICP targeting insight
    const icps = selectedCreatives.map(c => c.ICP).filter(Boolean);
    const uniqueICPs = [...new Set(icps)];
    if (uniqueICPs.length > 1) {
      insights.push({
        type: 'targeting',
        title: 'Multi-Audience Testing',
        message: `Comparing performance across ${uniqueICPs.length} ICPs: ${uniqueICPs.join(', ')}`,
        icon: Users,
        color: 'text-purple-400'
      });
    }
    
    return insights;
  };

  const getCreativeDimensionsComparison = () => {
    return selectedCreatives.map(creative => ({
      name: creative["Ad Name"],
      tone: creative.TONE || 'Unknown',
      icp: creative.ICP || 'Unknown',
      concept: creative.CONCEPT || 'Unknown',
      style: creative.STYLE || 'Unknown',
      ctr: creative.CTR_pct || 0,
      spend: creative.SPEND || 0,
      clicks: creative.CLICKS || 0
    }));
  };

  const removeCreative = (adName: string) => {
    setSelectedCreatives(selectedCreatives.filter((c) => c["Ad Name"] !== adName));
  };

  const columns: ColumnDef<Creative>[] = useMemo(() => [
    {
      accessorKey: "Ad Name",
      header: "Ad Name",
    },
    {
      accessorKey: "cluster_id",
      header: "Cluster",
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button
          size="sm"
          onClick={() => addCreative(row.original)}
          disabled={selectedCreatives.length >= 4 || selectedCreatives.some((c) => c["Ad Name"] === row.original["Ad Name"])}
        >
          Add
        </Button>
      ),
    },
  ], [selectedCreatives]);

  const getPerformanceChartOption = () => {
    const metrics = ["CTR_pct", "CLICKS", "SPEND", "IMPRESSIONS"];
    const metricLabels = ["CTR %", "Clicks", "Spend ($)", "Impressions"];
    
    const series = selectedCreatives.map((creative, index) => ({
      name: creative["Ad Name"]?.substring(0, 20) + '...' || `Creative ${index + 1}`,
      type: "bar",
      data: metrics.map((metric) => {
        let value = creative[metric as keyof Creative] as number || 0;
        // Normalize impressions for better visualization
        if (metric === "IMPRESSIONS") value = value / 1000;
        return value;
      }),
      itemStyle: {
        color: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"][index],
      },
    }));

    return {
      title: {
        text: "Performance Metrics Comparison",
        textStyle: { color: "#fff", fontSize: 16 },
      },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        formatter: (params: any) => {
          let result = `<div style="background: rgba(0,0,0,0.8); padding: 8px; border-radius: 4px;">`;
          params.forEach((param: any) => {
            let value = param.value;
            let unit = '';
            if (param.dataIndex === 0) unit = '%';
            else if (param.dataIndex === 2) unit = '$';
            else if (param.dataIndex === 3) { value = value * 1000; unit = ''; }
            result += `<div style="color: ${param.color};">● ${param.seriesName}: ${value.toLocaleString()}${unit}</div>`;
          });
          result += '</div>';
          return result;
        }
      },
      legend: {
        data: selectedCreatives.map((c) => c["Ad Name"]?.substring(0, 20) + '...' || ''),
        textStyle: { color: "#fff" },
        bottom: 0
      },
      xAxis: {
        type: "category",
        data: metricLabels,
        axisLabel: { color: "#fff", rotate: 0 },
      },
      yAxis: {
        type: "value",
        axisLabel: { color: "#fff" },
      },
      series,
    };
  };

  const getCreativeDimensionsChart = () => {
    const dimensions = getCreativeDimensionsComparison();
    if (dimensions.length === 0) return null;

    return {
      title: {
        text: "Creative Dimensions Analysis",
        textStyle: { color: "#fff", fontSize: 16 },
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c}%'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        textStyle: { color: "#fff" }
      },
      series: [
        {
          name: 'Tone Distribution',
          type: 'pie',
          radius: '50%',
          data: [...new Set(dimensions.map(d => d.tone))].map(tone => ({
            value: dimensions.filter(d => d.tone === tone).length,
            name: tone
          })),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    };
  };

  if (loading) return <div className="p-4">Loading creatives...</div>
  if (error) return <div className="p-4 text-red-400">Error: {error}</div>
  if (creatives.length === 0) return <div className="p-4">No creatives found</div>

  const differentials = getPerformanceDifferentials();
  const insights = generateComparisonInsights();
  const dimensionsData = getCreativeDimensionsComparison();

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tech-font">Creative Intelligence Compare</h1>
          <p className="text-muted-foreground">Strategic comparison of creative performance and dimensions</p>
        </div>
        {selectedCreatives.length >= 2 && (
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        )}
      </div>

      {/* Creative Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) =>
          selectedCreatives[index] ? (
            <Card key={selectedCreatives[index]["Ad Name"]} className="relative overflow-hidden">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 z-10 bg-black/50 hover:bg-black/70"
                onClick={() => removeCreative(selectedCreatives[index]["Ad Name"])}
              >
                <X className="h-4 w-4" />
              </Button>
              
              {/* Video Preview */}
              <div className="aspect-video bg-gray-900 relative">
                <CardMedia creative={selectedCreatives[index]} showPlayButton={false} />
                <div className="absolute bottom-2 left-2">
                  <Badge variant="secondary" className="text-xs">
                    #{index + 1}
                  </Badge>
                </div>
              </div>
              
              <CardHeader className="pb-2">
                <CardTitle className="text-sm line-clamp-2">
                  {selectedCreatives[index]["Ad Name"]}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="pt-0 space-y-2">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">CTR:</span>
                    <span className="ml-1 font-medium">
                      {(selectedCreatives[index].CTR_pct || 0).toFixed(2)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Clicks:</span>
                    <span className="ml-1 font-medium">
                      {(selectedCreatives[index].CLICKS || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {selectedCreatives[index].TONE && (
                    <Badge variant="outline" className="text-xs">
                      {selectedCreatives[index].TONE}
                    </Badge>
                  )}
                  {selectedCreatives[index].ICP && (
                    <Badge variant="outline" className="text-xs">
                      {selectedCreatives[index].ICP}
                    </Badge>
                  )}
                </div>
                
                {differentials[index] && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Performance Score</span>
                      {differentials[index].isBest && (
                        <Award className="h-3 w-3 text-yellow-400" />
                      )}
                    </div>
                    <Progress 
                      value={Math.max(0, differentials[index].performanceScore / 10)} 
                      className="h-2 mt-1" 
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Dialog key={index} open={isSelectDialogOpen} onOpenChange={setIsSelectDialogOpen}>
              <DialogTrigger asChild>
                <Card className="flex items-center justify-center border-2 border-dashed h-64 cursor-pointer hover:border-primary/50 transition-colors">
                  <div className="text-center">
                    <Plus className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mt-2">Add Creative</p>
                    <p className="text-xs text-muted-foreground">Slot {index + 1}/4</p>
                  </div>
                </Card>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Select a Creative to Compare</DialogTitle>
                </DialogHeader>
                <DataTable columns={columns} data={creatives} />
              </DialogContent>
            </Dialog>
          )
        )}
      </div>

      {/* AI Insights */}
      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-400" />
              AI Performance Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {insights.map((insight, index) => {
                const Icon = insight.icon;
                return (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-900/50 rounded-lg">
                    <Icon className={`h-5 w-5 mt-0.5 ${insight.color}`} />
                    <div>
                      <h4 className="font-medium">{insight.title}</h4>
                      <p className="text-sm text-muted-foreground">{insight.message}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comparison Analysis */}
      {selectedCreatives.length >= 2 ? (
        <Tabs defaultValue="performance" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="dimensions">Creative Dimensions</TabsTrigger>
            <TabsTrigger value="breakdown">Detailed Breakdown</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="performance" className="space-y-4">
            <div className="grid gap-4">
              <ChartWrapper option={getPerformanceChartOption()} height={400} />
              
              {/* Performance Differentials */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Differentials</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {differentials.map((diff, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-900/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          {diff.isBest && <Award className="h-4 w-4 text-yellow-400" />}
                          <div>
                            <div className="font-medium text-sm">
                              {diff.creative["Ad Name"]?.substring(0, 40)}...
                            </div>
                            <div className="text-xs text-muted-foreground">
                              CTR: {(diff.creative.CTR_pct || 0).toFixed(2)}% • 
                              Clicks: {(diff.creative.CLICKS || 0).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-medium ${
                            diff.ctrDifferential >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {diff.ctrDifferential >= 0 ? '+' : ''}
                            {diff.ctrDifferential.toFixed(1)}% CTR
                          </div>
                          <div className={`text-xs ${
                            diff.efficiencyDifferential >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {diff.efficiencyDifferential >= 0 ? '+' : ''}
                            {diff.efficiencyDifferential.toFixed(1)}% efficiency
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="dimensions" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {getCreativeDimensionsChart() && (
                <ChartWrapper option={getCreativeDimensionsChart()} height={300} />
              )}
              
              <Card>
                <CardHeader>
                  <CardTitle>Creative Attributes Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dimensionsData.map((creative, index) => (
                      <div key={index} className="space-y-2">
                        <div className="font-medium text-sm">{creative.name.substring(0, 30)}...</div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center gap-2">
                            <Palette className="h-3 w-3" />
                            <span>Tone: {creative.tone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-3 w-3" />
                            <span>ICP: {creative.icp}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Target className="h-3 w-3" />
                            <span>Concept: {creative.concept.substring(0, 15)}...</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Play className="h-3 w-3" />
                            <span>Style: {creative.style}</span>
                          </div>
                        </div>
                        {index < dimensionsData.length - 1 && <Separator />}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="breakdown" className="space-y-4">
            <div className="grid gap-4">
              {selectedCreatives.map((creative, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Badge>#{index + 1}</Badge>
                      {creative["Ad Name"]?.substring(0, 50)}...
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <h4 className="font-medium mb-2 text-sm">Performance Metrics</h4>
                        <div className="space-y-1 text-xs">
                          <div>CTR: {(creative.CTR_pct || 0).toFixed(2)}%</div>
                          <div>Clicks: {(creative.CLICKS || 0).toLocaleString()}</div>
                          <div>Spend: ${(creative.SPEND || 0).toLocaleString()}</div>
                          <div>Impressions: {(creative.IMPRESSIONS || 0).toLocaleString()}</div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2 text-sm">Creative Dimensions</h4>
                        <div className="space-y-1 text-xs">
                          <div>Tone: {creative.TONE || 'Unknown'}</div>
                          <div>ICP: {creative.ICP || 'Unknown'}</div>
                          <div>Concept: {creative.CONCEPT || 'Unknown'}</div>
                          <div>Style: {creative.STYLE || 'Unknown'}</div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2 text-sm">Key Insights</h4>
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <div>• {creative.TONE} tone targeting {creative.ICP}</div>
                          <div>• {creative.STYLE} creative approach</div>
                          <div>• Focus on {creative.CONCEPT?.substring(0, 30)}...</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="recommendations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-400" />
                  Strategic Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {differentials.length > 0 && (
                    <div className="p-4 bg-green-900/20 border border-green-500/20 rounded-lg">
                      <h4 className="font-medium text-green-400 mb-2">💡 Top Performer Analysis</h4>
                      <p className="text-sm text-muted-foreground">
                        <strong>{differentials[0].creative["Ad Name"]?.substring(0, 40)}...</strong> is your best performer. 
                        Key success factors: {differentials[0].creative.TONE} tone, targeting {differentials[0].creative.ICP}, 
                        using {differentials[0].creative.STYLE} approach.
                      </p>
                    </div>
                  )}
                  
                  <div className="p-4 bg-blue-900/20 border border-blue-500/20 rounded-lg">
                    <h4 className="font-medium text-blue-400 mb-2">🎯 Optimization Opportunities</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Apply the winning tone across underperforming creatives</li>
                      <li>• Test the successful concept with different visual styles</li>
                      <li>• Scale the top performer's targeting to similar audiences</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-purple-900/20 border border-purple-500/20 rounded-lg">
                    <h4 className="font-medium text-purple-400 mb-2">🚀 Next Steps</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Create 2-3 variations of your top performer</li>
                      <li>• Test winning creative elements in new contexts</li>
                      <li>• Analyze why certain tones work better for specific ICPs</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <Plus className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Ready to Compare Creatives?</h3>
            <p className="text-muted-foreground mb-4">
              Add at least 2 creatives to unlock powerful comparison insights, performance analysis, 
              and strategic recommendations.
            </p>
            <Button 
              onClick={() => setIsSelectDialogOpen(true)}
              className="mb-2"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Creative
            </Button>
            <div className="text-xs text-muted-foreground">
              Compare up to 4 creatives side-by-side
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
