"use client"

import React, { useEffect, useState, useMemo } from 'react';
import { useRealCreativeData } from '@/hooks/useRealCreativeData';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Zap, 
  Target, DollarSign, Award, Lightbulb, ArrowUp, ArrowDown,
  Filter, Download, BarChart3, Activity, Users, Palette
} from "lucide-react";
import GenomeModal from './GenomeModal';

interface GenomeCard {
  id: string;
  title: string;
  tone: string;
  persona: string;
  style: string;
  type: string;
  ctr: number;
  spend: number;
  clicks: number;
  impressions: number;
  cpc: number;
  performanceCategory: 'elite' | 'strong' | 'standard' | 'needs-attention';
  strategicLabel: 'scale-this' | 'test-more' | 'optimize' | 'pause';
  trendDirection: 'up' | 'down' | 'stable';
  competitiveBenchmark: number;
  creative: any;
}

export default function CreativeGenome() {
  const { data: creativesData, loading, error } = useRealCreativeData();
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  
  // Filter states
  const [toneFilter, setToneFilter] = useState<string>('all');
  const [personaFilter, setPersonaFilter] = useState<string>('all');
  const [styleFilter, setStyleFilter] = useState<string>('all');
  const [performanceFilter, setPerformanceFilter] = useState<string>('all');
  const [budgetFilter, setBudgetFilter] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Clean and transform data into genome cards
  const genomeCards: GenomeCard[] = useMemo(() => {
    if (!creativesData?.length) return [];
    
    const avgCTR = creativesData.reduce((sum, c) => sum + (parseFloat(String(c.CTR || '0')) * 100), 0) / creativesData.length;
    const avgSpend = creativesData.reduce((sum, c) => sum + parseFloat(String(c.SPEND || '0')), 0) / creativesData.length;
    
    return creativesData.map((creative, index) => {
      const ctr = parseFloat(String(creative.CTR || '0')) * 100;
      const spend = parseFloat(String(creative.SPEND || '0'));
      const clicks = parseInt(String(creative.CLICKS || '0'));
      const impressions = parseInt(String(creative.IMPRESSIONS || '0'));
      const cpc = parseFloat(String(creative.CPC || '0'));
      
      // Performance categorization
      let performanceCategory: GenomeCard['performanceCategory'] = 'standard';
      if (ctr >= 1.0) performanceCategory = 'elite';
      else if (ctr >= 0.6) performanceCategory = 'strong';
      else if (ctr < 0.3) performanceCategory = 'needs-attention';
      
      // Strategic label
      let strategicLabel: GenomeCard['strategicLabel'] = 'test-more';
      if (ctr >= 1.0 && spend < avgSpend) strategicLabel = 'scale-this';
      else if (ctr >= 0.6) strategicLabel = 'test-more';
      else if (ctr < 0.3 && spend > avgSpend) strategicLabel = 'pause';
      else strategicLabel = 'optimize';
      
      // Trend direction (simulated based on performance vs average)
      const trendDirection: GenomeCard['trendDirection'] = 
        ctr > avgCTR * 1.2 ? 'up' : 
        ctr < avgCTR * 0.8 ? 'down' : 'stable';
      
      return {
        id: creative.GRID_KEY || `creative-${index}`,
        title: creative["Ad Name"] || `Creative ${index + 1}`,
        tone: creative.TONE || 'Unknown',
        persona: creative.PERSONA || 'Unknown',
        style: creative.STYLE || 'Unknown',
        type: creative.TYPE || 'Unknown',
        ctr,
        spend,
        clicks,
        impressions,
        cpc,
        performanceCategory,
        strategicLabel,
        trendDirection,
        competitiveBenchmark: (ctr / avgCTR) * 100,
        creative
      };
    });
  }, [creativesData]);

  // Get unique filter values
  const uniqueTones = [...new Set(genomeCards.map(c => c.tone))].filter(Boolean).sort();
  const uniquePersonas = [...new Set(genomeCards.map(c => c.persona))].filter(Boolean).sort();
  const uniqueStyles = [...new Set(genomeCards.map(c => c.style))].filter(Boolean).sort();

  // Apply filters
  const filteredCards = useMemo(() => {
    return genomeCards.filter(card => {
      if (toneFilter && toneFilter !== 'all' && card.tone !== toneFilter) return false;
      if (personaFilter && personaFilter !== 'all' && card.persona !== personaFilter) return false;
      if (styleFilter && styleFilter !== 'all' && card.style !== styleFilter) return false;
      if (performanceFilter && performanceFilter !== 'all') {
        if (performanceFilter === 'top-performers' && card.performanceCategory !== 'elite') return false;
        if (performanceFilter === 'optimization-needed' && !['needs-attention', 'standard'].includes(card.performanceCategory)) return false;
      }
      if (budgetFilter && budgetFilter !== 'all') {
        const avgSpend = genomeCards.reduce((sum, c) => sum + c.spend, 0) / genomeCards.length;
        if (budgetFilter === 'high-investment' && card.spend < avgSpend * 1.5) return false;
        if (budgetFilter === 'cost-efficient' && card.cpc >= 3) return false;
      }
      if (searchFilter && !card.title.toLowerCase().includes(searchFilter.toLowerCase())) return false;
      return true;
    });
  }, [genomeCards, toneFilter, personaFilter, styleFilter, performanceFilter, budgetFilter, searchFilter]);

  // Generate strategic insights
  const strategicInsights = useMemo(() => {
    if (!genomeCards.length) return { topPatterns: [], opportunities: [], warnings: [] };
    
    // Top performing combinations
    const combinationPerformance = new Map<string, { cards: GenomeCard[], avgCTR: number }>();
    genomeCards.forEach(card => {
      const key = `${card.tone}|${card.persona}|${card.style}`;
      if (!combinationPerformance.has(key)) {
        combinationPerformance.set(key, { cards: [], avgCTR: 0 });
      }
      const combo = combinationPerformance.get(key)!;
      combo.cards.push(card);
      combo.avgCTR = combo.cards.reduce((sum, c) => sum + c.ctr, 0) / combo.cards.length;
    });
    
    const topPatterns = Array.from(combinationPerformance.entries())
      .filter(([_, data]) => data.cards.length >= 2 && data.avgCTR > 0.8)
      .sort((a, b) => b[1].avgCTR - a[1].avgCTR)
      .slice(0, 3)
      .map(([key, data]) => {
        const [tone, persona, style] = key.split('|');
        return {
          combination: `${tone} + ${persona} + ${style}`,
          avgCTR: data.avgCTR,
          count: data.cards.length,
          totalSpend: data.cards.reduce((sum, c) => sum + c.spend, 0)
        };
      });
    
    // Opportunities (high CTR, low spend)
    const opportunities = genomeCards
      .filter(card => card.strategicLabel === 'scale-this')
      .sort((a, b) => b.ctr - a.ctr)
      .slice(0, 3);
    
    // Warnings (high spend, low CTR)
    const warnings = genomeCards
      .filter(card => card.strategicLabel === 'pause')
      .sort((a, b) => b.spend - a.spend)
      .slice(0, 3);
    
    return { topPatterns, opportunities, warnings };
  }, [genomeCards]);

  if (loading) return <div className="p-8 text-center">Loading Creative Intelligence...</div>;
  if (error) return <div className="p-8 text-center text-red-400">Error: {error}</div>;

  return (
    <div className="space-y-6 p-6">
      {/* Header with Executive Summary */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold tech-font flex items-center gap-3">
            <Activity className="h-8 w-8 text-purple-400" />
            Strategic Creative Intelligence
          </h1>
          <p className="text-muted-foreground mt-2">
            {filteredCards.length} of {genomeCards.length} creative patterns • 
            Strategic command center for creative investment decisions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
          <Button variant="default" size="sm" className="gap-2">
            <Target className="h-4 w-4" />
            Action Plan
          </Button>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-5 w-5 text-green-400" />
              Top Patterns to Scale
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {strategicInsights.topPatterns.map((pattern, i) => (
                <div key={i} className="p-3 bg-green-900/20 rounded-lg border border-green-500/20">
                  <div className="text-sm font-medium text-green-400 mb-1">
                    #{i + 1}: {pattern.combination.split(' + ').map(part => part.split(' ')[0]).join(' × ')}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {pattern.avgCTR.toFixed(2)}% CTR • {pattern.count} creatives • ${pattern.totalSpend.toLocaleString()} spend
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-400" />
              Scale Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {strategicInsights.opportunities.map((opp, i) => (
                <div key={i} className="p-3 bg-blue-900/20 rounded-lg border border-blue-500/20">
                  <div className="text-sm font-medium text-blue-400 mb-1">
                    {opp.title.substring(0, 30)}...
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {opp.ctr.toFixed(2)}% CTR • ${opp.spend.toLocaleString()} spend
                  </div>
                  <div className="text-xs text-green-400 mt-1">💡 Scale potential: High</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              Review Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {strategicInsights.warnings.map((warning, i) => (
                <div key={i} className="p-3 bg-red-900/20 rounded-lg border border-red-500/20">
                  <div className="text-sm font-medium text-red-400 mb-1">
                    {warning.title.substring(0, 30)}...
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {warning.ctr.toFixed(2)}% CTR • ${warning.spend.toLocaleString()} spend
                  </div>
                  <div className="text-xs text-red-300 mt-1">⚠️ Optimize or pause</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Unified Filter System */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Strategic Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-6 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Tone</label>
              <Select value={toneFilter} onValueChange={setToneFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Tones" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tones</SelectItem>
                  {uniqueTones.map(tone => (
                    <SelectItem key={tone} value={tone}>{tone}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Persona</label>
              <Select value={personaFilter} onValueChange={setPersonaFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Personas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Personas</SelectItem>
                  {uniquePersonas.map(persona => (
                    <SelectItem key={persona} value={persona}>{persona}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Style</label>
              <Select value={styleFilter} onValueChange={setStyleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Styles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Styles</SelectItem>
                  {uniqueStyles.map(style => (
                    <SelectItem key={style} value={style}>{style}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Performance</label>
              <Select value={performanceFilter} onValueChange={setPerformanceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Performance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Performance</SelectItem>
                  <SelectItem value="top-performers">Top Performers</SelectItem>
                  <SelectItem value="optimization-needed">Optimization Needed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Budget</label>
              <Select value={budgetFilter} onValueChange={setBudgetFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Budget" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Budget</SelectItem>
                  <SelectItem value="high-investment">High Investment</SelectItem>
                  <SelectItem value="cost-efficient">Cost Efficient</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <Input 
                placeholder="Search creatives..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
              />
            </div>
          </div>
          
          {(toneFilter && toneFilter !== 'all' || personaFilter && personaFilter !== 'all' || styleFilter && styleFilter !== 'all' || performanceFilter && performanceFilter !== 'all' || budgetFilter && budgetFilter !== 'all' || searchFilter) && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {toneFilter && toneFilter !== 'all' && <Badge variant="secondary">Tone: {toneFilter}</Badge>}
              {personaFilter && personaFilter !== 'all' && <Badge variant="secondary">Persona: {personaFilter}</Badge>}
              {styleFilter && styleFilter !== 'all' && <Badge variant="secondary">Style: {styleFilter}</Badge>}
              {performanceFilter && performanceFilter !== 'all' && <Badge variant="secondary">Performance: {performanceFilter.replace('-', ' ')}</Badge>}
              {budgetFilter && budgetFilter !== 'all' && <Badge variant="secondary">Budget: {budgetFilter.replace('-', ' ')}</Badge>}
              {searchFilter && <Badge variant="secondary">Search: {searchFilter}</Badge>}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setToneFilter('all');
                  setPersonaFilter('all');
                  setStyleFilter('all');
                  setPerformanceFilter('all');
                  setBudgetFilter('all');
                  setSearchFilter('');
                }}
              >
                Clear All
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Strategic Creative Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredCards.map((card) => (
          <Card 
            key={card.id} 
            className={`cursor-pointer transition-all hover:shadow-lg border-l-4 ${
              card.performanceCategory === 'elite' ? 'border-l-green-500 bg-green-900/5' :
              card.performanceCategory === 'strong' ? 'border-l-blue-500 bg-blue-900/5' :
              card.performanceCategory === 'standard' ? 'border-l-yellow-500 bg-yellow-900/5' :
              'border-l-red-500 bg-red-900/5'
            }`}
            onClick={() => setSelectedKey(card.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge 
                      variant={
                        card.strategicLabel === 'scale-this' ? 'default' :
                        card.strategicLabel === 'test-more' ? 'secondary' :
                        card.strategicLabel === 'optimize' ? 'outline' :
                        'destructive'
                      }
                      className="text-xs"
                    >
                      {card.strategicLabel === 'scale-this' ? '🚀 Scale This' :
                       card.strategicLabel === 'test-more' ? '🧪 Test More' :
                       card.strategicLabel === 'optimize' ? '⚡ Optimize' :
                       '⏸️ Pause'}
                    </Badge>
                    {card.trendDirection === 'up' && <ArrowUp className="h-3 w-3 text-green-400" />}
                    {card.trendDirection === 'down' && <ArrowDown className="h-3 w-3 text-red-400" />}
                  </div>
                  <CardTitle className="text-sm line-clamp-2">
                    {card.title}
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Creative DNA */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-xs">
                    <Palette className="h-3 w-3 text-blue-400" />
                    <span className="text-muted-foreground">Tone:</span>
                    <span className="font-medium">{card.tone}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <Users className="h-3 w-3 text-green-400" />
                    <span className="text-muted-foreground">Persona:</span>
                    <span className="font-medium">{card.persona}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <BarChart3 className="h-3 w-3 text-purple-400" />
                    <span className="text-muted-foreground">Style:</span>
                    <span className="font-medium">{card.style}</span>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="text-muted-foreground">CTR</div>
                    <div className={`font-bold ${
                      card.ctr >= 1.0 ? 'text-green-400' :
                      card.ctr >= 0.6 ? 'text-blue-400' :
                      card.ctr >= 0.3 ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {card.ctr.toFixed(2)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">CPC</div>
                    <div className="font-bold">${card.cpc.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Spend</div>
                    <div className="font-bold">${card.spend.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Clicks</div>
                    <div className="font-bold">{card.clicks.toLocaleString()}</div>
                  </div>
                </div>

                {/* Competitive Benchmark */}
                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">vs Portfolio Avg</span>
                    <span className={`font-bold ${
                      card.competitiveBenchmark >= 120 ? 'text-green-400' :
                      card.competitiveBenchmark >= 80 ? 'text-blue-400' :
                      'text-red-400'
                    }`}>
                      {card.competitiveBenchmark.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Genome Analysis Modal */}
      {selectedKey && (
        <GenomeModal 
          selectedKey={selectedKey}
          onClose={() => setSelectedKey(null)}
        />
      )}
    </div>
  );
}