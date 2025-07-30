'use client';
import { useMemo, useState } from 'react';
import { useRealCreativeData } from '@/hooks/useRealCreativeData';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChartWrapper } from "@/components/ui/chart-wrapper";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, Award, Lightbulb, Target, 
  BarChart3, Brain, Layers, Network,
  Calculator, Radar, Sparkles, ArrowRight,
  DollarSign, AlertTriangle, CheckCircle,
  TrendingDown, Activity, Zap
} from "lucide-react";

export default function CreativeIntelligencePage() {
  const { data: creativesData, loading, error } = useRealCreativeData();
  const [viewMode, setViewMode] = useState<'heatmap' | 'impact' | 'predictions' | 'visualizations' | 'strategy'>('heatmap');

  // Convert and clean data
  const creatives = useMemo(() => {
    if (!creativesData || !Array.isArray(creativesData)) return [];
    return creativesData
      .filter(item => item && item.CTR !== undefined && item.CLICKS !== undefined && item.SPEND !== undefined)
      .map(item => ({
        ...item,
        CTR_pct: parseFloat(String(item.CTR || '0')) * 100, // Convert to percentage
        CLICKS: parseInt(String(item.CLICKS || '0')),
        SPEND: parseFloat(String(item.SPEND || '0')),
        IMPRESSIONS: parseInt(String(item.IMPRESSIONS || '0')),
        CPC: parseFloat(String(item.CPC || '0')),
        CPM: parseFloat(String(item.CPM || '0'))
      }));
  }, [creativesData]);

  // CROSS-DIMENSIONAL ANALYSIS - Real insights based on data
  const dimensionAnalysis = useMemo(() => {
    if (creatives.length === 0) return { heatmapData: [], topCombinations: [] };

    const dimensions = ['TONE', 'PERSONA', 'STYLE', 'TYPE'];
    const combinations = new Map<string, { 
      creatives: any[], 
      totalCTR: number, 
      totalSpend: number,
      totalClicks: number,
      dimension1: string,
      dimension2: string,
      value1: string,
      value2: string
    }>();
    
    // Generate meaningful combinations
    dimensions.forEach(dim1 => {
      dimensions.forEach(dim2 => {
        if (dim1 !== dim2) {
          creatives.forEach(creative => {
            const val1 = (creative as any)[dim1];
            const val2 = (creative as any)[dim2];
            if (val1 && val2) {
              const key = `${dim1}:${val1}|${dim2}:${val2}`;
              if (!combinations.has(key)) {
                combinations.set(key, { 
                  creatives: [], 
                  totalCTR: 0, 
                  totalSpend: 0,
                  totalClicks: 0,
                  dimension1: dim1,
                  dimension2: dim2,
                  value1: val1,
                  value2: val2
                });
              }
              const combo = combinations.get(key)!;
              combo.creatives.push(creative);
              combo.totalCTR += creative.CTR_pct;
              combo.totalSpend += creative.SPEND;
              combo.totalClicks += creative.CLICKS;
            }
          });
        }
      });
    });

    // Calculate performance metrics
    const heatmapData = Array.from(combinations.values())
      .filter(combo => combo.creatives.length >= 2)
      .map(combo => ({
        ...combo,
        avgCTR: combo.totalCTR / combo.creatives.length,
        avgSpend: combo.totalSpend / combo.creatives.length,
        avgClicks: combo.totalClicks / combo.creatives.length,
        efficiency: (combo.totalClicks / combo.totalSpend) * 1000, // Clicks per $1000
        count: combo.creatives.length
      }))
      .sort((a, b) => b.avgCTR - a.avgCTR);

    return { 
      heatmapData: heatmapData.slice(0, 30),
      topCombinations: heatmapData.slice(0, 5)
    };
  }, [creatives]);

  // REAL IMPACT ANALYSIS - Actionable insights
  const impactAnalysis = useMemo(() => {
    if (creatives.length === 0) return [];

    const overallAvgCTR = creatives.reduce((sum, c) => sum + c.CTR_pct, 0) / creatives.length;
    const overallAvgCPC = creatives.reduce((sum, c) => sum + c.CPC, 0) / creatives.length;
    
    const insights = [];

    // Analyze TONE performance
    const toneGroups = creatives.reduce((acc, creative) => {
      const tone = creative.TONE;
      if (tone) {
        if (!acc[tone]) acc[tone] = [];
        acc[tone].push(creative);
      }
      return acc;
    }, {} as Record<string, any[]>);

    Object.entries(toneGroups)
      .filter(([_, creatives]) => creatives.length >= 2)
      .forEach(([tone, creativesInTone]) => {
        const avgCTR = creativesInTone.reduce((sum, c) => sum + c.CTR_pct, 0) / creativesInTone.length;
        const avgCPC = creativesInTone.reduce((sum, c) => sum + c.CPC, 0) / creativesInTone.length;
        const totalSpend = creativesInTone.reduce((sum, c) => sum + c.SPEND, 0);
        const performanceLift = ((avgCTR - overallAvgCTR) / overallAvgCTR) * 100;
        const costEfficiency = ((overallAvgCPC - avgCPC) / overallAvgCPC) * 100;

        insights.push({
          type: 'tone',
          element: tone,
          avgCTR: avgCTR,
          performanceLift: performanceLift,
          costEfficiency: costEfficiency,
          totalSpend: totalSpend,
          count: creativesInTone.length,
          recommendation: performanceLift > 15 ? 
            `SCALE UP: "${tone}" tone performs ${performanceLift.toFixed(1)}% better than average. Increase budget by 40%.` :
            performanceLift < -15 ? 
            `REDUCE: "${tone}" tone underperforms by ${Math.abs(performanceLift).toFixed(1)}%. Consider reducing budget.` :
            `MAINTAIN: "${tone}" tone performs at average levels.`,
          impact: Math.abs(performanceLift) > 20 ? 'high' : Math.abs(performanceLift) > 10 ? 'medium' : 'low',
          creatives: creativesInTone
        });
      });

    // Analyze PERSONA performance
    const personaGroups = creatives.reduce((acc, creative) => {
      const persona = creative.PERSONA;
      if (persona) {
        if (!acc[persona]) acc[persona] = [];
        acc[persona].push(creative);
      }
      return acc;
    }, {} as Record<string, any[]>);

    Object.entries(personaGroups)
      .filter(([_, creatives]) => creatives.length >= 2)
      .forEach(([persona, creativesInPersona]) => {
        const avgCTR = creativesInPersona.reduce((sum, c) => sum + c.CTR_pct, 0) / creativesInPersona.length;
        const totalSpend = creativesInPersona.reduce((sum, c) => sum + c.SPEND, 0);
        const performanceLift = ((avgCTR - overallAvgCTR) / overallAvgCTR) * 100;

        insights.push({
          type: 'persona',
          element: persona,
          avgCTR: avgCTR,
          performanceLift: performanceLift,
          totalSpend: totalSpend,
          count: creativesInPersona.length,
          recommendation: performanceLift > 15 ? 
            `OPPORTUNITY: "${persona}" persona shows ${performanceLift.toFixed(1)}% higher CTR. Create 5+ more creatives.` :
            `ANALYZE: "${persona}" persona needs optimization or budget shift.`,
          impact: Math.abs(performanceLift) > 20 ? 'high' : Math.abs(performanceLift) > 10 ? 'medium' : 'low'
        });
      });

    return insights.sort((a, b) => b.performanceLift - a.performanceLift);
  }, [creatives]);

  // STRATEGIC PREDICTIONS based on real data patterns
  const strategicInsights = useMemo(() => {
    if (creatives.length === 0) return { predictions: [], opportunities: [], warnings: [] };

    const predictions = [];
    const opportunities = [];
    const warnings = [];

    // Identify winning patterns
    const winningTones = impactAnalysis.filter(insight => 
      insight.type === 'tone' && insight.performanceLift > 15
    );
    
    const winningPersonas = impactAnalysis.filter(insight => 
      insight.type === 'persona' && insight.performanceLift > 15
    );

    // Generate strategic predictions
    winningTones.forEach(tone => {
      winningPersonas.forEach(persona => {
        const existingCombo = creatives.filter(c => 
          c.TONE === tone.element && c.PERSONA === persona.element
        );
        
        if (existingCombo.length < 3) {
          predictions.push({
            combination: `${tone.element} + ${persona.element}`,
            predictedCTR: (tone.avgCTR + persona.avgCTR) / 2,
            confidence: Math.min(tone.count + persona.count, 10) / 10,
            currentCount: existingCombo.length,
            recommendation: `HIGH PRIORITY: Create 5-8 creatives with this combination`
          });
        }
      });
    });

    // Identify budget reallocation opportunities
    const highSpendLowPerformance = impactAnalysis.filter(insight => 
      insight.totalSpend > 300000 && insight.performanceLift < -10
    );

    highSpendLowPerformance.forEach(insight => {
      opportunities.push({
        type: 'budget-shift',
        element: insight.element,
        currentSpend: insight.totalSpend,
        suggestedAction: `REALLOCATE: Move $${(insight.totalSpend * 0.3).toLocaleString()} from "${insight.element}" to winning combinations`,
        potentialSavings: insight.totalSpend * 0.3
      });
    });

    // Generate warnings for underperforming high-spend campaigns
    const dangerZone = impactAnalysis.filter(insight => 
      insight.totalSpend > 400000 && insight.performanceLift < -20
    );

    dangerZone.forEach(insight => {
      warnings.push({
        element: insight.element,
        issue: `Critical underperformance: ${Math.abs(insight.performanceLift).toFixed(1)}% below average`,
        spend: insight.totalSpend,
        action: 'IMMEDIATE REVIEW REQUIRED - Consider pausing or major optimization'
      });
    });

    return {
      predictions: predictions.slice(0, 5),
      opportunities: opportunities.slice(0, 3),
      warnings: warnings.slice(0, 3)
    };
  }, [impactAnalysis, creatives]);

  // HEATMAP VISUALIZATION
  const getHeatmapOption = () => {
    const data = dimensionAnalysis.heatmapData.slice(0, 20);
    
    return {
      title: { text: "Performance Heatmap: Tone × Persona Combinations", textStyle: { color: "#fff", fontSize: 16 } },
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const item = data[params.dataIndex];
          return `
            <div style="background: rgba(0,0,0,0.9); padding: 12px; border-radius: 8px; border: 1px solid #333;">
              <div style="font-weight: bold; margin-bottom: 8px; color: #fff;">
                ${item.value1} × ${item.value2}
              </div>
              <div style="color: #10b981; font-size: 18px; font-weight: bold; margin-bottom: 4px;">
                ${item.avgCTR.toFixed(2)}% CTR
              </div>
              <div style="color: #f59e0b; margin-bottom: 4px;">
                $${item.avgSpend.toLocaleString()} avg spend
              </div>
              <div style="color: #94a3b8; font-size: 12px;">
                ${item.count} creatives • ${item.avgClicks.toLocaleString()} avg clicks
              </div>
            </div>
          `;
        }
      },
      xAxis: {
        type: 'category',
        data: data.map((_, i) => `#${i + 1}`),
        axisLabel: { color: "#fff" }
      },
      yAxis: {
        type: 'value',
        name: 'CTR %',
        axisLabel: { color: "#fff" }
      },
      series: [{
        name: 'CTR Performance',
        type: 'bar',
        data: data.map(item => ({
          value: item.avgCTR,
          itemStyle: {
            color: item.avgCTR > 1.0 ? '#10b981' : item.avgCTR > 0.5 ? '#f59e0b' : '#ef4444'
          }
        }))
      }]
    };
  };

  // EFFICIENCY SCATTER PLOT
  const getEfficiencyScatterOption = () => {
    if (creatives.length === 0) {
      return {
        title: { text: "No data available for efficiency analysis", textStyle: { color: "#fff", fontSize: 16 } },
        graphic: {
          type: 'text',
          left: 'center',
          top: 'middle',
          style: { text: 'No creatives data available', fontSize: 14, fill: '#888' }
        }
      };
    }

    return {
      title: { text: "Spend Efficiency: CTR vs Cost per Click", textStyle: { color: "#fff", fontSize: 16 } },
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const creative = params.data.creative;
          return `
            <div style="background: rgba(0,0,0,0.9); padding: 12px; border-radius: 8px; border: 1px solid #333;">
              <div style="font-weight: bold; margin-bottom: 8px; color: #fff;">
                ${creative["Ad Name"]?.substring(0, 30) || 'Unknown Creative'}...
              </div>
              <div>CTR: <span style="color: #10b981;">${creative.CTR_pct?.toFixed(2) || '0.00'}%</span></div>
              <div>CPC: <span style="color: #f59e0b;">$${creative.CPC?.toFixed(2) || '0.00'}</span></div>
              <div>Tone: <span style="color: #3b82f6;">${creative.TONE || 'Unknown'}</span></div>
              <div>Total Spend: <span style="color: #8b5cf6;">$${creative.SPEND?.toLocaleString() || '0'}</span></div>
            </div>
          `;
        }
      },
      xAxis: {
        type: 'value',
        name: 'Cost per Click ($)',
        axisLabel: { color: "#fff" }
      },
      yAxis: {
        type: 'value',
        name: 'CTR (%)',
        axisLabel: { color: "#fff" }
      },
      series: [{
        name: 'Creatives',
        type: 'scatter',
        data: creatives.map(creative => ({
          value: [creative.CPC || 0, creative.CTR_pct || 0],
          creative,
          itemStyle: {
            color: (creative.CTR_pct || 0) > 1.0 && (creative.CPC || 0) < 3 ? '#10b981' : // High CTR, Low CPC = Green
                   (creative.CTR_pct || 0) > 1.0 ? '#f59e0b' : // High CTR = Yellow
                   (creative.CPC || 0) < 3 ? '#3b82f6' : // Low CPC = Blue
                   '#ef4444' // Poor performance = Red
          }
        })),
        symbolSize: (data: any) => Math.min((data.creative.SPEND || 0) / 50000, 30) + 8
      }]
    };
  };

  if (loading) return <div className="p-4">Analyzing creative intelligence...</div>
  if (error) return <div className="p-4 text-red-400">Error: {error}</div>
  if (creatives.length === 0) return <div className="p-4">No creatives found</div>

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tech-font flex items-center gap-3">
            <Brain className="h-8 w-8 text-purple-400" />
            Creative Intelligence Platform
          </h1>
          <p className="text-muted-foreground">
            Real performance insights from {creatives.length} creatives • 
            ${creatives.reduce((sum, c) => sum + c.SPEND, 0).toLocaleString()} total spend
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={viewMode === 'heatmap' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setViewMode('heatmap')}
          >
            <Layers className="h-4 w-4 mr-2" />
            Performance Map
          </Button>
          <Button 
            variant={viewMode === 'impact' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setViewMode('impact')}
          >
            <Calculator className="h-4 w-4 mr-2" />
            Impact Analysis
          </Button>
          <Button 
            variant={viewMode === 'predictions' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setViewMode('predictions')}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Strategic Insights
          </Button>
          <Button 
            variant={viewMode === 'visualizations' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setViewMode('visualizations')}
          >
            <Activity className="h-4 w-4 mr-2" />
            Efficiency Analysis
          </Button>
          <Button 
            variant={viewMode === 'strategy' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setViewMode('strategy')}
          >
            <Target className="h-4 w-4 mr-2" />
            Action Plan
          </Button>
        </div>
      </div>

      {/* Performance Heatmap */}
      {viewMode === 'heatmap' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5 text-blue-400" />
                Top Performing Creative Combinations
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Ranked by average CTR performance - focus on combinations with 2+ creatives
              </p>
            </CardHeader>
            <CardContent>
              <ChartWrapper option={getHeatmapOption()} height={400} />
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>🏆 Winning Combinations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dimensionAnalysis.topCombinations.slice(0, 5).map((combo, i) => (
                    <div key={i} className="p-4 bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-lg border border-green-500/20">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-green-400">
                          #{i + 1}: {combo.value1} × {combo.value2}
                        </h4>
                        <Badge className="bg-green-500/20 text-green-400">
                          {combo.avgCTR.toFixed(2)}% CTR
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Creatives: </span>
                          <span className="font-medium">{combo.count}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Avg Spend: </span>
                          <span className="font-medium">${combo.avgSpend.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Efficiency: </span>
                          <span className="font-medium">{combo.efficiency.toFixed(1)} clicks/$1k</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>📊 Portfolio Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-blue-400">
                        {(creatives.reduce((sum, c) => sum + c.CTR_pct, 0) / creatives.length).toFixed(2)}%
                      </div>
                      <div className="text-xs text-muted-foreground">Average CTR</div>
                    </div>
                    <div className="text-center p-3 bg-green-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-green-400">
                        {creatives.filter(c => c.CTR_pct > 1.0).length}
                      </div>
                      <div className="text-xs text-muted-foreground">High Performers</div>
                    </div>
                    <div className="text-center p-3 bg-orange-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-orange-400">
                        ${(creatives.reduce((sum, c) => sum + c.CPC, 0) / creatives.length).toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">Avg CPC</div>
                    </div>
                    <div className="text-center p-3 bg-purple-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-purple-400">
                        {dimensionAnalysis.topCombinations.length}
                      </div>
                      <div className="text-xs text-muted-foreground">Proven Combos</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Real Impact Analysis */}
      {viewMode === 'impact' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-orange-400" />
                Performance Impact Analysis
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Actionable insights based on real performance data - sorted by impact level
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {impactAnalysis.slice(0, 10).map((insight, i) => (
                  <div key={i} className={`p-4 rounded-lg border ${
                    insight.impact === 'high' ? 'bg-green-900/20 border-green-500/20' :
                    insight.impact === 'medium' ? 'bg-yellow-900/20 border-yellow-500/20' :
                    'bg-gray-900/20 border-gray-500/20'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-xs capitalize">
                          {insight.type}
                        </Badge>
                        <h4 className="font-medium">{insight.element}</h4>
                        {insight.impact === 'high' && <CheckCircle className="h-4 w-4 text-green-400" />}
                        {insight.impact === 'medium' && <AlertTriangle className="h-4 w-4 text-yellow-400" />}
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-bold ${
                          insight.performanceLift > 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {insight.performanceLift > 0 ? '+' : ''}{insight.performanceLift.toFixed(1)}% vs avg
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {insight.avgCTR.toFixed(2)}% CTR • ${insight.totalSpend.toLocaleString()} spend
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-gray-900/50 rounded text-sm">
                      <strong>💡 Action:</strong> {insight.recommendation}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Strategic Insights */}
      {viewMode === 'predictions' && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-400" />
                  High-Opportunity Combinations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {strategicInsights.predictions.map((pred, i) => (
                    <div key={i} className="p-4 bg-purple-900/20 border border-purple-500/20 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-purple-400">{pred.combination}</h4>
                        <Badge className="bg-purple-500/20 text-purple-400">
                          {pred.predictedCTR.toFixed(2)}% predicted CTR
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        Currently {pred.currentCount} creatives • Confidence: {(pred.confidence * 100).toFixed(0)}%
                      </div>
                      <div className="text-xs bg-gray-900/50 p-2 rounded">
                        {pred.recommendation}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                  Performance Warnings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {strategicInsights.warnings.map((warning, i) => (
                    <div key={i} className="p-4 bg-red-900/20 border border-red-500/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-red-400" />
                        <h4 className="font-medium text-red-400">{warning.element}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{warning.issue}</p>
                      <p className="text-xs text-red-300 mb-2">Spend: ${warning.spend.toLocaleString()}</p>
                      <div className="text-xs bg-gray-900/50 p-2 rounded font-medium">
                        ⚠️ {warning.action}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-400" />
                Budget Reallocation Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {strategicInsights.opportunities.map((opp, i) => (
                  <div key={i} className="p-4 bg-green-900/20 border border-green-500/20 rounded-lg">
                    <h4 className="font-medium text-green-400 mb-2">{opp.element}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{opp.suggestedAction}</p>
                    <div className="text-lg font-bold text-green-400">
                      ${opp.potentialSavings.toLocaleString()} potential savings
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Efficiency Analysis */}
      {viewMode === 'visualizations' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cost Efficiency Analysis</CardTitle>
              <p className="text-sm text-muted-foreground">
                Find the sweet spot: High CTR + Low CPC = Maximum efficiency (green bubbles)
              </p>
            </CardHeader>
            <CardContent>
              <ChartWrapper option={getEfficiencyScatterOption()} height={500} />
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">🎯 Efficiency Champions</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const champions = creatives
                    .filter(c => c.CTR_pct > 0.5 && c.CPC < 5) // More lenient filters
                    .sort((a, b) => (b.CTR_pct / (b.CPC || 1)) - (a.CTR_pct / (a.CPC || 1)))
                    .slice(0, 3);
                  
                  if (champions.length === 0) {
                    return (
                      <div className="text-center text-muted-foreground py-4">
                        <div className="text-sm">No efficiency champions found</div>
                        <div className="text-xs mt-1">Try adjusting performance criteria</div>
                      </div>
                    );
                  }
                  
                  return champions.map((creative, i) => (
                    <div key={i} className="mb-3 p-2 bg-green-900/20 rounded text-xs">
                      <div className="font-medium text-green-400 mb-1">
                        {creative["Ad Name"]?.substring(0, 25)}...
                      </div>
                      <div>CTR: {creative.CTR_pct.toFixed(2)}% • CPC: ${creative.CPC.toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">
                        Efficiency: {(creative.CTR_pct / (creative.CPC || 1)).toFixed(1)}
                      </div>
                    </div>
                  ));
                })()}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">💸 Budget Drains</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const drains = creatives
                    .filter(c => c.CTR_pct < 0.8 && c.SPEND > 100000) // More realistic filters
                    .sort((a, b) => b.SPEND - a.SPEND)
                    .slice(0, 3);
                  
                  if (drains.length === 0) {
                    return (
                      <div className="text-center text-muted-foreground py-4">
                        <div className="text-sm">No major budget drains detected</div>
                        <div className="text-xs mt-1">Good portfolio efficiency!</div>
                      </div>
                    );
                  }
                  
                  return drains.map((creative, i) => (
                    <div key={i} className="mb-3 p-2 bg-red-900/20 rounded text-xs">
                      <div className="font-medium text-red-400 mb-1">
                        {creative["Ad Name"]?.substring(0, 25)}...
                      </div>
                      <div>CTR: {creative.CTR_pct.toFixed(2)}% • Spend: ${creative.SPEND.toLocaleString()}</div>
                      <div className="text-xs text-red-300">
                        ⚠️ Review for optimization
                      </div>
                    </div>
                  ));
                })()}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">📈 Hidden Gems</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const avgSpend = creatives.reduce((sum, c) => sum + c.SPEND, 0) / creatives.length;
                  const gems = creatives
                    .filter(c => c.CTR_pct > 0.6 && c.SPEND < avgSpend) // Above average CTR, below average spend
                    .sort((a, b) => b.CTR_pct - a.CTR_pct)
                    .slice(0, 3);
                  
                  if (gems.length === 0) {
                    return (
                      <div className="text-center text-muted-foreground py-4">
                        <div className="text-sm">No hidden gems identified</div>
                        <div className="text-xs mt-1">All high performers already have high investment</div>
                      </div>
                    );
                  }
                  
                  return gems.map((creative, i) => (
                    <div key={i} className="mb-3 p-2 bg-blue-900/20 rounded text-xs">
                      <div className="font-medium text-blue-400 mb-1">
                        {creative["Ad Name"]?.substring(0, 25)}...
                      </div>
                      <div>CTR: {creative.CTR_pct.toFixed(2)}% • Spend: ${creative.SPEND.toLocaleString()}</div>
                      <div className="text-green-400 mt-1">💡 Scale opportunity</div>
                      <div className="text-xs text-muted-foreground">
                        Potential: +{((avgSpend - creative.SPEND) / 1000).toFixed(0)}k budget increase
                      </div>
                    </div>
                  ));
                })()}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Strategic Action Plan */}
      {viewMode === 'strategy' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-red-400" />
                30-Day Strategic Action Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Week 1-2: Immediate Actions */}
                <div className="p-4 bg-red-900/20 border border-red-500/20 rounded-lg">
                  <h4 className="font-medium text-red-400 mb-3 flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Week 1-2: Immediate Actions (High Impact)
                  </h4>
                  <div className="space-y-3">
                    {strategicInsights.predictions.slice(0, 2).map((pred, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <ArrowRight className="h-3 w-3 text-red-400 mt-1" />
                        <span>Create 5-8 creatives using <strong>{pred.combination}</strong> (Predicted: {pred.predictedCTR.toFixed(2)}% CTR)</span>
                      </div>
                    ))}
                    {strategicInsights.warnings.slice(0, 1).map((warning, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <ArrowRight className="h-3 w-3 text-red-400 mt-1" />
                        <span>URGENT: Review/pause "{warning.element}" (${warning.spend.toLocaleString()} at risk)</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Week 3-4: Optimization */}
                <div className="p-4 bg-blue-900/20 border border-blue-500/20 rounded-lg">
                  <h4 className="font-medium text-blue-400 mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Week 3-4: Budget Optimization
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium mb-2 text-green-400">📈 Increase Budget (+40%)</h5>
                        {impactAnalysis.filter(i => i.performanceLift > 15).slice(0, 2).map((insight, i) => (
                          <div key={i} className="text-xs text-muted-foreground mb-1">
                            • {insight.element}: +{insight.performanceLift.toFixed(1)}% performance
                          </div>
                        ))}
                      </div>
                      <div>
                        <h5 className="font-medium mb-2 text-red-400">📉 Reduce Budget (-30%)</h5>
                        {impactAnalysis.filter(i => i.performanceLift < -15).slice(0, 2).map((insight, i) => (
                          <div key={i} className="text-xs text-muted-foreground mb-1">
                            • {insight.element}: {insight.performanceLift.toFixed(1)}% performance
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Expected Results */}
                <div className="p-4 bg-green-900/20 border border-green-500/20 rounded-lg">
                  <h4 className="font-medium text-green-400 mb-3 flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Expected Results (30 days)
                  </h4>
                  <div className="grid md:grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-400">+25%</div>
                      <div className="text-sm text-muted-foreground">Average CTR Improvement</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-400">
                        ${strategicInsights.opportunities.reduce((sum, opp) => sum + opp.potentialSavings, 0).toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">Potential Cost Savings</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-400">
                        {strategicInsights.predictions.length + 5}
                      </div>
                      <div className="text-sm text-muted-foreground">New High-Performing Assets</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}