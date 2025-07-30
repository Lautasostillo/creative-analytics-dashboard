'use client';
import { useMemo, useState } from 'react';
import { useRealCreativeData } from '@/hooks/useRealCreativeData';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChartWrapper } from "@/components/ui/chart-wrapper";
import CardMedia from "@/components/gallery/CardMedia";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  TrendingUp, Award, Lightbulb, Users, Target, Palette, 
  Eye, MousePointer, DollarSign, BarChart3, Filter,
  ArrowRight, Star, Zap
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface CreativePattern {
  id: string;
  name: string;
  description: string;
  creatives: any[];
  avgCTR: number;
  avgClicks: number;
  avgSpend: number;
  avgImpressions: number;
  successRate: number;
  keyAttributes: {
    tone?: string;
    icp?: string;
    concept?: string;
    style?: string;
  };
  insights: string[];
  recommendedFor: string[];
}

export default function ClustersPage() {
  const { data: creativesData, loading, error } = useRealCreativeData();
  const [selectedPattern, setSelectedPattern] = useState<CreativePattern | null>(null);
  const [viewMode, setViewMode] = useState<'patterns' | 'performance' | 'insights'>('patterns');

  // Convert to format with performance metrics
  const creatives = useMemo(() => {
    return creativesData.map(item => ({
      ...item,
      CTR_pct: parseFloat(String(item.CTR || '0')),
      CLICKS: parseInt(String(item.CLICKS || '0')),
      SPEND: parseFloat(String(item.SPEND || '0')),
      IMPRESSIONS: parseInt(String(item.IMPRESSIONS || '0'))
    }));
  }, [creativesData]);

  // AI-powered pattern discovery
  const creativePatterns: CreativePattern[] = useMemo(() => {
    if (creatives.length === 0) return [];

    const patterns: CreativePattern[] = [];

    // Pattern 1: High-Performing Tone + ICP Combinations
    const toneICPCombos = creatives.reduce((acc, creative) => {
      const key = `${creative.TONE}_${creative.ICP}`;
      if (!acc[key] && creative.TONE && creative.ICP) {
        acc[key] = {
          tone: creative.TONE,
          icp: creative.ICP,
          creatives: []
        };
      }
      if (acc[key]) acc[key].creatives.push(creative);
      return acc;
    }, {} as Record<string, any>);

    Object.entries(toneICPCombos)
      .filter(([_, data]) => data.creatives.length >= 2)
      .forEach(([key, data]) => {
        const avgCTR = data.creatives.reduce((sum: number, c: any) => sum + c.CTR_pct, 0) / data.creatives.length;
        const avgClicks = data.creatives.reduce((sum: number, c: any) => sum + c.CLICKS, 0) / data.creatives.length;
        const avgSpend = data.creatives.reduce((sum: number, c: any) => sum + c.SPEND, 0) / data.creatives.length;
        const avgImpressions = data.creatives.reduce((sum: number, c: any) => sum + c.IMPRESSIONS, 0) / data.creatives.length;
        const successRate = data.creatives.filter((c: any) => c.CTR_pct > 1.5).length / data.creatives.length * 100;

        patterns.push({
          id: `tone-icp-${key}`,
          name: `${data.tone} + ${data.icp}`,
          description: `${data.tone} tone targeting ${data.icp} personas`,
          creatives: data.creatives,
          avgCTR,
          avgClicks,
          avgSpend,
          avgImpressions,
          successRate,
          keyAttributes: {
            tone: data.tone,
            icp: data.icp
          },
          insights: [
            `${data.creatives.length} creatives using this combination`,
            `${successRate.toFixed(1)}% success rate (CTR > 1.5%)`,
            avgCTR > 2 ? 'High-performing combination' : 'Standard performance'
          ],
          recommendedFor: [
            `Scale ${data.tone} creative approach`,
            `Expand ${data.icp} targeting`,
            'Test variations of winning elements'
          ]
        });
      });

    // Pattern 2: Style + Concept Combinations
    const styleConcepts = creatives.reduce((acc, creative) => {
      const key = `${creative.STYLE}_${creative.CONCEPT?.substring(0, 20)}`;
      if (!acc[key] && creative.STYLE && creative.CONCEPT) {
        acc[key] = {
          style: creative.STYLE,
          concept: creative.CONCEPT,
          creatives: []
        };
      }
      if (acc[key]) acc[key].creatives.push(creative);
      return acc;
    }, {} as Record<string, any>);

    Object.entries(styleConcepts)
      .filter(([_, data]) => data.creatives.length >= 2)
      .slice(0, 5) // Limit for performance
      .forEach(([key, data]) => {
        const avgCTR = data.creatives.reduce((sum: number, c: any) => sum + c.CTR_pct, 0) / data.creatives.length;
        const avgClicks = data.creatives.reduce((sum: number, c: any) => sum + c.CLICKS, 0) / data.creatives.length;
        const avgSpend = data.creatives.reduce((sum: number, c: any) => sum + c.SPEND, 0) / data.creatives.length;
        const avgImpressions = data.creatives.reduce((sum: number, c: any) => sum + c.IMPRESSIONS, 0) / data.creatives.length;
        const successRate = data.creatives.filter((c: any) => c.CTR_pct > 1.5).length / data.creatives.length * 100;

        patterns.push({
          id: `style-concept-${key}`,
          name: `${data.style} Style`,
          description: `${data.style} approach with ${data.concept.substring(0, 30)}...`,
          creatives: data.creatives,
          avgCTR,
          avgClicks,
          avgSpend,
          avgImpressions,
          successRate,
          keyAttributes: {
            style: data.style,
            concept: data.concept
          },
          insights: [
            `${data.creatives.length} creatives with this style`,
            `${avgCTR.toFixed(2)}% average CTR`,
            avgCTR > 2 ? 'Above-average performance' :'Room for optimization'
          ],
          recommendedFor: [
            `Apply ${data.style} to other concepts`,
            'Test style variations',
            'Scale successful creative approach'
          ]
        });
      });

    // Pattern 3: High-Performance Outliers
    const topPerformers = creatives
      .filter(c => c.CTR_pct > 3)
      .sort((a, b) => b.CTR_pct - a.CTR_pct)
      .slice(0, 10);

    if (topPerformers.length > 0) {
      const avgCTR = topPerformers.reduce((sum, c) => sum + c.CTR_pct, 0) / topPerformers.length;
      const avgClicks = topPerformers.reduce((sum, c) => sum + c.CLICKS, 0) / topPerformers.length;
      const avgSpend = topPerformers.reduce((sum, c) => sum + c.SPEND, 0) / topPerformers.length;
      const avgImpressions = topPerformers.reduce((sum, c) => sum + c.IMPRESSIONS, 0) / topPerformers.length;

      patterns.push({
        id: 'top-performers',
        name: 'Elite Performers',
        description: 'Highest-performing creatives across all dimensions',
        creatives: topPerformers,
        avgCTR,
        avgClicks,
        avgSpend,
        avgImpressions,
        successRate: 100,
        keyAttributes: {},
        insights: [
          `${topPerformers.length} elite performers (CTR > 3%)`,
          `${avgCTR.toFixed(2)}% average CTR - exceptional`,
          'Common patterns among top performers'
        ],
        recommendedFor: [
          'Analyze common success factors',
          'Apply winning elements to other creatives',
          'Scale high-performing approaches'
        ]
      });
    }

    return patterns.sort((a, b) => b.avgCTR - a.avgCTR);
  }, [creatives]);

  // Generate pattern insights
  const getPatternInsights = () => {
    if (creativePatterns.length === 0) return [];

    const insights = [];
    const bestPattern = creativePatterns[0];
    
    insights.push({
      type: 'top-pattern',
      title: 'Highest-Performing Pattern',
      message: `"${bestPattern.name}" achieves ${bestPattern.avgCTR.toFixed(2)}% CTR with ${bestPattern.creatives.length} creatives`,
      icon: Award,
      color: 'text-yellow-400'
    });

    const highSuccessPatterns = creativePatterns.filter(p => p.successRate > 60);
    if (highSuccessPatterns.length > 0) {
      insights.push({
        type: 'success-rate',
        title: 'Consistent Winners',
        message: `${highSuccessPatterns.length} patterns have >60% success rate - scale these approaches`,
        icon: TrendingUp,
        color: 'text-green-400'
      });
    }

    const tonePatterns = creativePatterns.filter(p => p.keyAttributes.tone);
    if (tonePatterns.length > 0) {
      const bestTone = tonePatterns.reduce((best, current) => 
        current.avgCTR > best.avgCTR ? current : best
      );
      insights.push({
        type: 'tone-insight',
        title: 'Winning Tone Strategy',
        message: `"${bestTone.keyAttributes.tone}" tone performs best - consider expanding this approach`,
        icon: Palette,
        color: 'text-blue-400'
      });
    }

    return insights;
  };

  const getPatternDistributionOption = () => ({
    title: { text: "Creative Pattern Distribution", textStyle: { color: "#fff", fontSize: 16 } },
    tooltip: { 
      trigger: "item", 
      formatter: (params: any) => `
        <div style="background: rgba(0,0,0,0.8); padding: 8px; border-radius: 4px;">
          <div style="color: ${params.color};">● ${params.name}</div>
          <div>Creatives: ${params.value}</div>
          <div>Avg CTR: ${creativePatterns.find(p => p.name === params.name)?.avgCTR.toFixed(2)}%</div>
        </div>
      `
    },
    series: [{
      name: "Pattern",
      type: "pie",
      radius: ["40%", "70%"],
      avoidLabelOverlap: false,
      label: {
        show: false,
        position: 'center'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: '16',
          fontWeight: 'bold',
          color: '#fff'
        }
      },
      data: creativePatterns.map((pattern, index) => ({
        value: pattern.creatives.length,
        name: pattern.name,
        itemStyle: {
          color: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"][index % 6]
        }
      })),
    }],
  });

  const getPatternPerformanceOption = () => ({
    title: { text: "Pattern Performance Comparison", textStyle: { color: "#fff", fontSize: 16 } },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        const pattern = creativePatterns[params[0].dataIndex];
        return `
          <div style="background: rgba(0,0,0,0.8); padding: 8px; border-radius: 4px;">
            <div style="font-weight: bold; margin-bottom: 4px;">${pattern.name}</div>
            <div>CTR: ${pattern.avgCTR.toFixed(2)}%</div>
            <div>Clicks: ${pattern.avgClicks.toLocaleString()}</div>
            <div>Success Rate: ${pattern.successRate.toFixed(1)}%</div>
            <div>Creatives: ${pattern.creatives.length}</div>
          </div>
        `;
      }
    },
    xAxis: { 
      type: 'category', 
      data: creativePatterns.map(p => p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name),
      axisLabel: { color: "#fff", rotate: 45 }
    },
    yAxis: [{
      type: 'value',
      name: 'CTR %',
      axisLabel: { color: "#fff" },
      position: 'left'
    }, {
      type: 'value',
      name: 'Success Rate %',
      axisLabel: { color: "#fff" },
      position: 'right'
    }],
    series: [{
      name: 'Average CTR',
      type: 'bar',
      data: creativePatterns.map(p => p.avgCTR),
      itemStyle: { color: '#3b82f6' }
    }, {
      name: 'Success Rate',
      type: 'line',
      yAxisIndex: 1,
      data: creativePatterns.map(p => p.successRate),
      itemStyle: { color: '#10b981' },
      lineStyle: { color: '#10b981' }
    }]
  });

  if (loading) return <div className="p-4">Discovering creative patterns...</div>
  if (error) return <div className="p-4 text-red-400">Error: {error}</div>
  if (creatives.length === 0) return <div className="p-4">No creatives found</div>

  const insights = getPatternInsights();

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tech-font">Creative Pattern Discovery</h1>
          <p className="text-muted-foreground">AI-powered analysis of creative patterns and performance clusters</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={viewMode === 'patterns' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setViewMode('patterns')}
          >
            <Filter className="h-4 w-4 mr-2" />
            Patterns
          </Button>
          <Button 
            variant={viewMode === 'performance' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setViewMode('performance')}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Performance
          </Button>
          <Button 
            variant={viewMode === 'insights' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setViewMode('insights')}
          >
            <Lightbulb className="h-4 w-4 mr-2" />
            Insights
          </Button>
        </div>
      </div>

      {/* AI Insights */}
      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-400" />
              Pattern Intelligence
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

      {/* Pattern Analysis */}
      {viewMode === 'patterns' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Pattern Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartWrapper option={getPatternDistributionOption()} height={350} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {creativePatterns.slice(0, 4).map((pattern, index) => (
                    <div key={pattern.id} className="flex items-center justify-between p-3 bg-gray-900/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        {index === 0 && <Star className="h-4 w-4 text-yellow-400" />}
                        <div>
                          <div className="font-medium text-sm">{pattern.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {pattern.creatives.length} creatives
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {pattern.avgCTR.toFixed(2)}% CTR
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {pattern.successRate.toFixed(0)}% success
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pattern Cards */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Discovered Patterns</h2>
            <div className="grid gap-6">
              {creativePatterns.map((pattern) => (
                <Card key={pattern.id} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {pattern.successRate > 70 && <Award className="h-5 w-5 text-yellow-400" />}
                          {pattern.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{pattern.description}</p>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            View Details
                            <ArrowRight className="h-4 w-4 ml-1" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>{pattern.name} - Detailed Analysis</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid md:grid-cols-4 gap-4">
                              <div className="text-center p-3 bg-blue-900/20 rounded-lg">
                                <div className="text-2xl font-bold text-blue-400">
                                  {pattern.avgCTR.toFixed(2)}%
                                </div>
                                <div className="text-xs text-muted-foreground">Avg CTR</div>
                              </div>
                              <div className="text-center p-3 bg-green-900/20 rounded-lg">
                                <div className="text-2xl font-bold text-green-400">
                                  {pattern.successRate.toFixed(0)}%
                                </div>
                                <div className="text-xs text-muted-foreground">Success Rate</div>
                              </div>
                              <div className="text-center p-3 bg-purple-900/20 rounded-lg">
                                <div className="text-2xl font-bold text-purple-400">
                                  {pattern.creatives.length}
                                </div>
                                <div className="text-xs text-muted-foreground">Creatives</div>
                              </div>
                              <div className="text-center p-3 bg-orange-900/20 rounded-lg">
                                <div className="text-2xl font-bold text-orange-400">
                                  ${pattern.avgSpend.toLocaleString()}
                                </div>
                                <div className="text-xs text-muted-foreground">Avg Spend</div>
                              </div>
                            </div>
                            
                            <Separator />
                            
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-medium mb-2">Key Insights</h4>
                                <ul className="space-y-1">
                                  {pattern.insights.map((insight, i) => (
                                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                      <span className="text-blue-400 mt-1">•</span>
                                      {insight}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <h4 className="font-medium mb-2">Recommended Actions</h4>
                                <ul className="space-y-1">
                                  {pattern.recommendedFor.map((rec, i) => (
                                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                      <ArrowRight className="h-3 w-3 text-green-400 mt-1" />
                                      {rec}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                            
                            <Separator />
                            
                            <div>
                              <h4 className="font-medium mb-3">Pattern Creatives</h4>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {pattern.creatives.slice(0, 6).map((creative, i) => (
                                  <div key={i} className="relative">
                                    <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                                      <CardMedia creative={creative} showPlayButton={false} />
                                    </div>
                                    <div className="absolute bottom-1 left-1 right-1">
                                      <div className="bg-black/70 rounded px-2 py-1">
                                        <div className="text-xs font-medium line-clamp-1">
                                          {creative["Ad Name"]?.substring(0, 30)}...
                                        </div>
                                        <div className="text-xs text-green-400">
                                          {creative.CTR_pct.toFixed(2)}% CTR
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-5 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-blue-400" />
                        <div>
                          <div className="text-sm font-medium">{pattern.avgCTR.toFixed(2)}%</div>
                          <div className="text-xs text-muted-foreground">Avg CTR</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <MousePointer className="h-4 w-4 text-green-400" />
                        <div>
                          <div className="text-sm font-medium">{pattern.avgClicks.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">Avg Clicks</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-yellow-400" />
                        <div>
                          <div className="text-sm font-medium">${pattern.avgSpend.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">Avg Spend</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-purple-400" />
                        <div>
                          <div className="text-sm font-medium">{pattern.successRate.toFixed(0)}%</div>
                          <div className="text-xs text-muted-foreground">Success Rate</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-orange-400" />
                        <div>
                          <div className="text-sm font-medium">{pattern.creatives.length}</div>
                          <div className="text-xs text-muted-foreground">Creatives</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Performance Score</span>
                        <span>{pattern.successRate.toFixed(0)}%</span>
                      </div>
                      <Progress value={pattern.successRate} className="h-2" />
                    </div>
                    
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                      {pattern.creatives.slice(0, 6).map((creative, i) => (
                        <div key={i} className="relative group">
                          <div className="aspect-video bg-gray-900 rounded overflow-hidden">
                            <CardMedia creative={creative} showPlayButton={false} />
                          </div>
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                            <div className="text-center text-xs">
                              <div className="font-medium">{creative.CTR_pct.toFixed(1)}%</div>
                              <div className="text-muted-foreground">CTR</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Performance View */}
      {viewMode === 'performance' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pattern Performance Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartWrapper option={getPatternPerformanceOption()} height={400} />
            </CardContent>
          </Card>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {creativePatterns.slice(0, 4).map((pattern, index) => (
              <Card key={pattern.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {index === 0 && <Award className="h-4 w-4 text-yellow-400" />}
                    {pattern.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <div className="text-muted-foreground">CTR</div>
                        <div className="font-medium">{pattern.avgCTR.toFixed(2)}%</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Success</div>
                        <div className="font-medium">{pattern.successRate.toFixed(0)}%</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <div className="text-muted-foreground">Clicks</div>
                        <div className="font-medium">{pattern.avgClicks.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Count</div>
                        <div className="font-medium">{pattern.creatives.length}</div>
                      </div>
                    </div>
                    <Progress value={pattern.successRate} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Insights View */}
      {viewMode === 'insights' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-400" />
                Strategic Pattern Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Top Performing Patterns */}
                <div className="p-4 bg-green-900/20 border border-green-500/20 rounded-lg">
                  <h4 className="font-medium text-green-400 mb-3 flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Top Performing Patterns
                  </h4>
                  <div className="space-y-2">
                    {creativePatterns.slice(0, 3).map((pattern, i) => (
                      <div key={i} className="text-sm">
                        <span className="font-medium">{pattern.name}</span>
                        <span className="text-muted-foreground"> - {pattern.avgCTR.toFixed(2)}% CTR with {pattern.creatives.length} creatives</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Optimization Opportunities */}
                <div className="p-4 bg-blue-900/20 border border-blue-500/20 rounded-lg">
                  <h4 className="font-medium text-blue-400 mb-3 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Optimization Opportunities
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <ArrowRight className="h-3 w-3 text-blue-400 mt-1" />
                      <span>Scale the "{creativePatterns[0]?.name}" pattern across more creatives</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="h-3 w-3 text-blue-400 mt-1" />
                      <span>Test variations of high-performing tone + ICP combinations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="h-3 w-3 text-blue-400 mt-1" />
                      <span>Apply winning creative elements to underperforming patterns</span>
                    </li>
                  </ul>
                </div>
                
                {/* Next Steps */}
                <div className="p-4 bg-purple-900/20 border border-purple-500/20 rounded-lg">
                  <h4 className="font-medium text-purple-400 mb-3 flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Recommended Next Steps
                  </h4>
                  <ol className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 font-mono">1.</span>
                      <span>Focus budget on top 3 performing patterns</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 font-mono">2.</span>
                      <span>Create 2-3 new creatives using winning pattern elements</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 font-mono">3.</span>
                      <span>A/B test different tones within successful ICP groups</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 font-mono">4.</span>
                      <span>Monitor pattern performance weekly and adjust strategy</span>
                    </li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
