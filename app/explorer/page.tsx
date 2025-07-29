'use client';
import { useState, useMemo } from 'react';
import { useFilteredCreativeData, useCreativeInsights } from '@/hooks/useCreativeData';

// Enhanced Filter Component (reused from Overview)
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

// Creative Cluster Component
function CreativeCluster({ 
  title, 
  description, 
  creatives, 
  avgCTR, 
  totalSpend, 
  conceptCount,
  color = "blue" 
}: {
  title: string;
  description: string;
  creatives: any[];
  avgCTR: number;
  totalSpend: number;
  conceptCount: number;
  color?: string;
}) {
  const colorClasses = {
    blue: "from-blue-900/60 to-blue-800/60 border-blue-500/50",
    green: "from-emerald-900/60 to-emerald-800/60 border-emerald-500/50",
    purple: "from-violet-900/60 to-violet-800/60 border-violet-500/50",
    orange: "from-orange-900/60 to-orange-800/60 border-orange-500/50",
    red: "from-red-900/60 to-red-800/60 border-red-500/50"
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} border rounded-2xl p-6 shadow-xl`}>
      <div className="mb-4">
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-slate-300 text-sm leading-relaxed">{description}</p>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{conceptCount}</div>
          <div className="text-xs text-slate-400 uppercase tracking-wide">Concepts</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{avgCTR.toFixed(2)}%</div>
          <div className="text-xs text-slate-400 uppercase tracking-wide">Avg CTR</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">${(totalSpend / 1000).toFixed(0)}K</div>
          <div className="text-xs text-slate-400 uppercase tracking-wide">Total Spend</div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-xs text-slate-400 font-medium mb-2">Sample Concepts:</div>
        {creatives.slice(0, 3).map((creative, idx) => (
          <div key={idx} className="bg-white/5 rounded-lg p-3">
            <div className="text-white text-sm font-medium mb-1">
              {creative.tone} | {creative.persona} | {creative.style}
            </div>
            <div className="text-slate-400 text-xs">
              CTR: {(creative.CTR * 100).toFixed(2)}% • Spend: ${creative.SPEND.toLocaleString()}
            </div>
          </div>
        ))}
        {creatives.length > 3 && (
          <div className="text-xs text-slate-400 text-center py-2">
            +{creatives.length - 3} more concepts in this cluster
          </div>
        )}
      </div>
    </div>
  );
}

export default function ExplorerPage() {
  const [filters, setFilters] = useState<{ tone?: string; persona?: string; style?: string }>({});
  const { data: filteredData, loading, error } = useFilteredCreativeData(filters);
  const insights = useCreativeInsights(filteredData);

  // Generate intelligent clusters based on business logic
  const creativeClusters = useMemo(() => {
    if (!filteredData.length) return [];

    // Cluster 1: High Performers (Top 25% by CTR)
    const sortedByCTR = [...filteredData].sort((a, b) => b.CTR - a.CTR);
    const topPerformers = sortedByCTR.slice(0, Math.ceil(filteredData.length * 0.25));

    // Cluster 2: Budget Efficient (Low CPC, Decent CTR)
    const budgetEfficient = filteredData.filter(c => 
      c.CPC < (insights?.kpis?.avgCPC || 0) && c.CTR > (insights?.kpis?.avgCTR || 0) / 100
    );

    // Cluster 3: High Investment (Top 25% by spend)
    const sortedBySpend = [...filteredData].sort((a, b) => b.SPEND - a.SPEND);
    const highInvestment = sortedBySpend.slice(0, Math.ceil(filteredData.length * 0.25));

    // Cluster 4: Emerging Opportunities (Above average CTR, below average spend)
    const emerging = filteredData.filter(c => 
      c.CTR > (insights?.kpis?.avgCTR || 0) / 100 && c.SPEND < (insights?.kpis?.totalSpend || 0) / filteredData.length
    );

    // Cluster 5: Needs Optimization (Below average CTR)
    const needsOptimization = filteredData.filter(c => 
      c.CTR < (insights?.kpis?.avgCTR || 0) / 100
    );

    return [
      {
        title: "🏆 Champion Performers",
        description: "Top 25% highest CTR creatives. These concepts consistently deliver exceptional engagement and should be scaled for maximum impact.",
        creatives: topPerformers,
        avgCTR: topPerformers.reduce((sum, c) => sum + c.CTR, 0) / topPerformers.length * 100,
        totalSpend: topPerformers.reduce((sum, c) => sum + c.SPEND, 0),
        conceptCount: topPerformers.length,
        color: "green"
      },
      {
        title: "💎 Budget Efficient",
        description: "Low cost-per-click with strong performance. Perfect for budget optimization and scaling cost-effective campaigns.",
        creatives: budgetEfficient,
        avgCTR: budgetEfficient.reduce((sum, c) => sum + c.CTR, 0) / budgetEfficient.length * 100,
        totalSpend: budgetEfficient.reduce((sum, c) => sum + c.SPEND, 0),
        conceptCount: budgetEfficient.length,
        color: "blue"
      },
      {
        title: "🚀 High Investment",
        description: "Top 25% highest spend creatives. Major budget allocation indicates strategic importance - analyze for optimization opportunities.",
        creatives: highInvestment,
        avgCTR: highInvestment.reduce((sum, c) => sum + c.CTR, 0) / highInvestment.length * 100,
        totalSpend: highInvestment.reduce((sum, c) => sum + c.SPEND, 0),
        conceptCount: highInvestment.length,
        color: "purple"
      },
      {
        title: "⭐ Emerging Opportunities",
        description: "Strong performance with lower investment. Hidden gems that could benefit from increased budget allocation.",
        creatives: emerging,
        avgCTR: emerging.reduce((sum, c) => sum + c.CTR, 0) / emerging.length * 100,
        totalSpend: emerging.reduce((sum, c) => sum + c.SPEND, 0),
        conceptCount: emerging.length,
        color: "orange"
      },
      {
        title: "🔧 Needs Optimization",
        description: "Below-average CTR creatives requiring attention. Opportunities for creative refresh, audience retargeting, or budget reallocation.",
        creatives: needsOptimization,
        avgCTR: needsOptimization.reduce((sum, c) => sum + c.CTR, 0) / needsOptimization.length * 100,
        totalSpend: needsOptimization.reduce((sum, c) => sum + c.SPEND, 0),
        conceptCount: needsOptimization.length,
        color: "red"
      }
    ].filter(cluster => cluster.conceptCount > 0);
  }, [filteredData, insights]);

  if (loading) {
    return (
      <div className="h-full overflow-auto">
        <div className="p-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Creative Explorer</h1>
            <p className="text-slate-400">Loading creative insights...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('Explorer error:', error);
  }

  // Extract unique values for filters
  const uniqueTones = [...new Set(filteredData.map(d => d.tone))].sort();
  const uniquePersonas = [...new Set(filteredData.map(d => d.persona))].sort();
  const uniqueStyles = [...new Set(filteredData.map(d => d.style))].sort();

  return (
    <div className="h-full overflow-auto">
      <div className="p-6 space-y-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Creative Explorer</h1>
          <p className="text-slate-400 text-lg">Discover patterns and insights across your creative portfolio</p>
        </div>

        {/* Filters Section */}
        <div className="bg-gradient-to-r from-slate-800/60 to-slate-700/60 border border-slate-600/50 rounded-2xl p-8 mb-8 backdrop-blur-sm">
          <div className="flex flex-col lg:flex-row lg:items-end gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
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
            
            {(filters.tone || filters.persona || filters.style) && (
              <div className="flex items-center gap-4">
                <div className="text-sm text-slate-300">
                  Analyzing {filteredData.length} concepts
                </div>
                <button 
                  onClick={() => setFilters({})}
                  className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 
                            rounded-xl text-white text-sm font-medium transition-all duration-200 shadow-lg
                            hover:shadow-red-500/25"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Clustering Explanation */}
        <div className="bg-gradient-to-r from-amber-900/40 to-orange-900/40 border border-amber-600/50 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg">🧠</span>
            </div>
            <h3 className="text-xl font-bold text-amber-300">Intelligent Creative Clustering</h3>
          </div>
          <p className="text-amber-200 text-sm leading-relaxed">
            Our AI analyzes your {filteredData.length} creative concepts and automatically groups them into 5 strategic clusters based on 
            performance patterns, budget efficiency, and business impact. Each cluster reveals actionable insights for campaign optimization.
          </p>
        </div>

        {/* Creative Clusters */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white mb-6">Strategic Creative Clusters</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {creativeClusters.map((cluster, index) => (
              <CreativeCluster
                key={index}
                title={cluster.title}
                description={cluster.description}
                creatives={cluster.creatives}
                avgCTR={cluster.avgCTR}
                totalSpend={cluster.totalSpend}
                conceptCount={cluster.conceptCount}
                color={cluster.color}
              />
            ))}
          </div>
        </div>

        {/* Business Insights */}
        <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/60 border border-slate-600/50 rounded-2xl p-8">
          <h3 className="text-xl font-bold text-white mb-6">🔍 Key Discovery Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-emerald-300">Performance Patterns</h4>
              <div className="space-y-2 text-sm">
                <div className="text-slate-300">
                  • <span className="font-medium text-white">{creativeClusters[0]?.conceptCount || 0}</span> champion performers 
                  driving {((creativeClusters[0]?.avgCTR || 0) / (insights?.kpis?.avgCTR || 1) * 100 - 100).toFixed(0)}% above average engagement
                </div>
                <div className="text-slate-300">
                  • <span className="font-medium text-white">{creativeClusters[1]?.conceptCount || 0}</span> budget-efficient concepts 
                  with optimized cost-per-click
                </div>
                <div className="text-slate-300">
                  • <span className="font-medium text-white">{creativeClusters[3]?.conceptCount || 0}</span> emerging opportunities 
                  ready for budget scaling
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-amber-300">Optimization Opportunities</h4>
              <div className="space-y-2 text-sm">
                <div className="text-slate-300">
                  • Scale champion performers for maximum ROI
                </div>
                <div className="text-slate-300">
                  • Reallocate budget from underperformers to emerging opportunities
                </div>
                <div className="text-slate-300">
                  • Analyze high-investment concepts for efficiency improvements
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}