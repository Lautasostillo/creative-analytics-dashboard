'use client';
import { useState, useMemo } from 'react';
import { useFilteredRealCreativeData } from '@/hooks/useRealCreativeData';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreativeWithAI } from "@/lib/aiAnalysisTypes";
import { enhanceRealCreativeWithAI, getPerformanceBadgeColor, getPerformanceBorderColor, getAIInsightPreview } from '@/lib/realAIAnalysisService';
import { Search, Grid, List, Sparkles, TrendingUp, AlertCircle, Wand2 } from "lucide-react";
import CardMedia from '@/components/gallery/CardMedia';
import { AIAnalysisModal } from '@/components/gallery/AIAnalysisModal';

// Enhanced Filter Component matching Overview
function FilterButton({ label, options, selected, onSelect }: {
  label: string;
  options: string[];
  selected: string | null;
  onSelect: (value: string | null) => void;
}) {
  const isActive = !!selected;
  
  return (
    <div className="relative">
      <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">
        {label}
      </label>
      <div className={`relative ${isActive ? 'ring-2 ring-blue-500/50' : ''} rounded-lg`}>
        <select 
          value={selected || ""} 
          onChange={(e) => onSelect(e.target.value || null)}
          className={`bg-slate-800/90 border ${isActive ? 'border-blue-500' : 'border-slate-600'} 
                     rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-400
                     min-w-[140px] transition-all duration-200 hover:bg-slate-700/90`}
        >
          <option value="">All {label}s</option>
          {options.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        {isActive && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border border-white"></div>
        )}
      </div>
    </div>
  );
}

export default function GalleryPage() {
  const [filters, setFilters] = useState<{ tone?: string; persona?: string; style?: string }>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "compact" | "list">("grid");
  const [performanceFilter, setPerformanceFilter] = useState<string | null>(null);
  const [aiFilter, setAiFilter] = useState<string | null>(null);
  const [selectedCreative, setSelectedCreative] = useState<CreativeWithAI | null>(null);
  
  const { data: rawCreatives, loading, error } = useFilteredRealCreativeData(filters);

  // Enhance creatives with real AI analysis
  const enhancedCreatives = useMemo(() => {
    return rawCreatives.map(creative => enhanceRealCreativeWithAI(creative));
  }, [rawCreatives]);

  // Apply all filters
  const filteredCreatives = useMemo(() => {
    let filtered = enhancedCreatives;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((creative) =>
        creative["Ad Name"].toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Performance filter
    if (performanceFilter) {
      filtered = filtered.filter(creative => creative.performanceTier === performanceFilter);
    }

    // AI filter
    if (aiFilter === 'has-recommendations') {
      filtered = filtered.filter(creative => creative.hasAIRecommendations);
    } else if (aiFilter === 'high-potential') {
      filtered = filtered.filter(creative => 
        creative.aiAnalysis?.performanceAnalysis.potential === 'High'
      );
    }

    return filtered;
  }, [enhancedCreatives, searchTerm, performanceFilter, aiFilter]);

  // Extract unique values for filters
  const uniqueTones = [...new Set(rawCreatives.map(d => d.tone))].sort();
  const uniquePersonas = [...new Set(rawCreatives.map(d => d.persona))].sort();
  const uniqueStyles = [...new Set(rawCreatives.map(d => d.style))].sort();

  const handleCreativeClick = (creative: CreativeWithAI) => {
    setSelectedCreative(creative);
  };

  const resetAllFilters = () => {
    setFilters({});
    setSearchTerm('');
    setPerformanceFilter(null);
    setAiFilter(null);
  };

  const CreativeCard = ({ creative }: { creative: CreativeWithAI }) => {
    const badgeColor = getPerformanceBadgeColor(creative.performanceTier);
    const borderColor = getPerformanceBorderColor(creative.performanceTier);
    const aiAnalysisPreview = getAIInsightPreview(creative);
    
    return (
      <Card
        className={`cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] 
                   bg-gradient-to-br from-slate-800/60 to-slate-700/60 border-2 ${borderColor} 
                   hover:border-opacity-100 group backdrop-blur-sm h-full flex flex-col`}
        onClick={() => handleCreativeClick(creative)}
      >
        <CardContent className="p-4 h-full flex flex-col">
          {/* Media with Performance Badges */}
          <div className="relative mb-4">
            <CardMedia creative={creative} />
            {/* Performance Tier Badge - Top Right */}
            <div className="absolute top-2 right-2 z-10">
              <Badge className={`${badgeColor} text-white text-xs font-medium shadow-lg whitespace-nowrap px-2 py-1`}>
                {creative.performanceTier === 'Champion' ? '🏆' : 
                 creative.performanceTier === 'Emerging' ? '📈' : '⚡'}
                <span className="ml-1">{creative.performanceTier}</span>
              </Badge>
            </div>
            {/* CTR Badge - Bottom Left, higher position */}
            <div className="absolute bottom-4 left-2 z-10">
              <Badge variant="secondary" className="bg-black/90 text-white text-xs backdrop-blur-sm border-0 shadow-lg whitespace-nowrap px-2 py-1">
                🎯 {creative.CTR_pct?.toFixed(2)}% CTR
              </Badge>
            </div>
          </div>

          {/* Creative Info */}
          <div className="space-y-3 flex-1 flex flex-col">
            {/* Header Section */}
            <div className="space-y-2">
              <h3 className="font-semibold text-white text-sm line-clamp-1 group-hover:text-blue-300 transition-colors">
                {creative["Ad Name"]}
              </h3>
              
              {/* Dimensions Tags */}
              <div className="flex flex-wrap gap-1">
                <Badge variant="outline" className="text-xs border-slate-600 text-slate-300">
                  🎨 {creative.tone?.slice(0, 12)}{creative.tone?.length > 12 ? '...' : ''}
                </Badge>
                <Badge variant="outline" className="text-xs border-slate-600 text-slate-300">
                  👤 {creative.persona}
                </Badge>
              </div>
            </div>
            
            {/* Performance Metrics */}
            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-800/30 rounded-lg p-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Spend:</span>
                <span className="text-white font-medium">${creative.SPEND?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">CPC:</span>
                <span className="text-white font-medium">${creative.CPC?.toFixed(2)}</span>
              </div>
            </div>
            
            {/* AI Analysis Preview */}
            <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-600/50 flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Wand2 className="h-3 w-3 text-blue-400" />
                <span className="text-xs text-blue-300 font-medium">AI Insight</span>
              </div>
              <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                {aiAnalysisPreview}
              </p>
            </div>
            
            {/* View Analysis Button */}
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full border-blue-500/50 text-blue-300 hover:bg-blue-500/10 hover:border-blue-400 transition-all group-hover:border-blue-400 mt-auto"
              onClick={(e) => {
                e.stopPropagation();
                handleCreativeClick(creative);
              }}
            >
              <Sparkles className="h-3 w-3 mr-2" />
              View Full AI Analysis
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="h-full overflow-auto">
        <div className="p-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">AI-Powered Creative Gallery</h1>
            <p className="text-slate-400">Loading creative analysis...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('Gallery error:', error);
  }

  const getGridCols = () => {
    switch (viewMode) {
      case 'grid': return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
      case 'compact': return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6';
      case 'list': return 'grid-cols-1';
      default: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
    }
  };

  return (
    <div className="h-full overflow-auto bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative z-0">
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            <Wand2 className="h-8 w-8 text-blue-400" />
            AI-Powered Creative Gallery
          </h1>
          <p className="text-slate-400 text-lg">Professional creative analysis with AI insights</p>
        </div>

        {/* Enhanced Filters Section */}
        <div className="bg-gradient-to-r from-slate-800/60 to-slate-700/60 border border-slate-600/50 rounded-2xl p-6 backdrop-blur-sm">
          {/* Primary Filters */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            <FilterButton 
              label="Creative Tone" 
              options={uniqueTones} 
              selected={filters.tone || null}
              onSelect={(tone) => setFilters(prev => ({ ...prev, tone: tone || undefined }))}
            />
            <FilterButton 
              label="Target Persona" 
              options={uniquePersonas} 
              selected={filters.persona || null}
              onSelect={(persona) => setFilters(prev => ({ ...prev, persona: persona || undefined }))}
            />
            <FilterButton 
              label="Creative Style" 
              options={uniqueStyles} 
              selected={filters.style || null}
              onSelect={(style) => setFilters(prev => ({ ...prev, style: style || undefined }))}
            />
          </div>
          
          {/* AI-Powered Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-600/50">
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide">
                Performance Tier
              </label>
              <select 
                value={performanceFilter || ""} 
                onChange={(e) => setPerformanceFilter(e.target.value || null)}
                className="bg-slate-800/90 border border-slate-600 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-400 w-full"
              >
                <option value="">All Performance Levels</option>
                <option value="Champion">🏆 Champions</option>
                <option value="Emerging">📈 Emerging</option>
                <option value="Optimization Needed">⚡ Needs Optimization</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide">
                AI Insights
              </label>
              <select 
                value={aiFilter || ""} 
                onChange={(e) => setAiFilter(e.target.value || null)}
                className="bg-slate-800/90 border border-slate-600 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-400 w-full"
              >
                <option value="">All Creatives</option>
                <option value="has-recommendations">💡 Has Recommendations</option>
                <option value="high-potential">🚀 High Performance Potential</option>
              </select>
            </div>
          </div>
          
          {/* Search and Controls */}
          <div className="flex flex-col lg:flex-row items-center gap-4 pt-4 border-t border-slate-600/50 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                placeholder="Search creatives by name..."
                className="pl-10 bg-slate-800/90 border-slate-600 text-white placeholder-slate-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-4">
              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 bg-slate-800/90 rounded-lg p-1 border border-slate-600">
                <Button 
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
                  size="sm" 
                  onClick={() => setViewMode('grid')}
                  className="h-8 w-8 p-0"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button 
                  variant={viewMode === 'compact' ? 'secondary' : 'ghost'} 
                  size="sm" 
                  onClick={() => setViewMode('compact')}
                  className="h-8 w-8 p-0"
                >
                  <div className="grid grid-cols-2 gap-0.5 w-4 h-4">
                    <div className="bg-current w-1 h-1 rounded-sm"></div>
                    <div className="bg-current w-1 h-1 rounded-sm"></div>
                    <div className="bg-current w-1 h-1 rounded-sm"></div>
                    <div className="bg-current w-1 h-1 rounded-sm"></div>
                  </div>
                </Button>
                <Button 
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
                  size="sm" 
                  onClick={() => setViewMode('list')}
                  className="h-8 w-8 p-0"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Results Counter and Reset */}
              <div className="flex items-center gap-3">
                <div className="text-sm text-slate-300">
                  {filteredCreatives.length} creatives
                </div>
                {(filters.tone || filters.persona || filters.style || performanceFilter || aiFilter || searchTerm) && (
                  <Button 
                    onClick={resetAllFilters}
                    variant="outline"
                    size="sm"
                    className="border-red-500/50 text-red-300 hover:bg-red-500/10"
                  >
                    Reset All
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Creative Grid */}
        {filteredCreatives.length > 0 ? (
          <div className={`grid gap-6 ${getGridCols()}`}>
            {filteredCreatives.map((creative, index) => (
              <CreativeCard key={`${creative.GRID_KEY}-${index}`} creative={creative} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎬</div>
            <h3 className="text-xl font-semibold text-white mb-2">No creatives found</h3>
            <p className="text-slate-400 mb-4">Try adjusting your filters or search terms</p>
            <Button onClick={resetAllFilters} variant="outline">
              Clear All Filters
            </Button>
          </div>
        )}
        
        {/* AI Analysis Modal */}
        <AIAnalysisModal
          creative={selectedCreative}
          open={!!selectedCreative}
          onOpenChange={() => setSelectedCreative(null)}
        />
      </div>
    </div>
  );
}