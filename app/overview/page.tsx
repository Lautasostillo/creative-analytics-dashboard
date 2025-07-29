'use client';
import { useState } from 'react';
import { useFilteredCreativeData, useCreativeInsights } from '@/hooks/useCreativeData';

// Enhanced Filter Component
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

export default function Overview() {
  const [filters, setFilters] = useState<{ tone?: string; persona?: string; style?: string }>({});
  const { data: filteredData, loading, error } = useFilteredCreativeData(filters);
  const insights = useCreativeInsights(filteredData);

  // Force data to load without infinite loading
  if (loading) {
    return (
      <div className="h-full overflow-auto">
        <div className="p-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Creative Performance Dashboard</h1>
            <p className="text-slate-400">Loading data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('Dashboard error:', error);
    // Continue with empty data instead of blocking
  }

  const { kpis, tonePerformance, personaPerformance, bestCreative, performanceSpread } = insights || {};

  // Extract unique values for filters
  const uniqueTones = [...new Set(filteredData.map(d => d.tone))].sort();
  const uniquePersonas = [...new Set(filteredData.map(d => d.persona))].sort();
  const uniqueStyles = [...new Set(filteredData.map(d => d.style))].sort();

  return (
    <div className="h-full overflow-auto">
      <div className="p-6 space-y-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Creative Performance Dashboard</h1>
          <p className="text-slate-400 text-lg">Executive insights into creative campaign effectiveness</p>
        </div>

        {/* Enhanced Filters Section */}
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
                  Showing {filteredData.length} concepts
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

        {/* Primary KPIs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Campaign Investment */}
          <div className="bg-gradient-to-br from-blue-900/60 to-blue-800/60 border-2 border-blue-500/50 rounded-3xl p-8 shadow-2xl">
            <div className="text-center">
              <div className="text-blue-300 text-sm font-semibold uppercase tracking-wider mb-2">Campaign Investment</div>
              <div className="text-5xl font-bold text-white mb-2">
                ${kpis?.totalSpend?.toLocaleString(undefined, { maximumFractionDigits: 0 }) || '0'}
              </div>
              <div className="text-slate-300 text-lg">
                Generated {(kpis?.totalImpressions / 1000000 || 0).toFixed(1)}M impressions
              </div>
              <div className="mt-4 p-4 bg-blue-500/20 rounded-xl">
                <div className="text-blue-200 text-sm">Cost Efficiency</div>
                <div className="text-white text-xl font-semibold">
                  ${kpis?.avgCPC?.toFixed(2) || '0.00'} CPC
                </div>
              </div>
            </div>
          </div>

          {/* Campaign Performance */}
          <div className="bg-gradient-to-br from-emerald-900/60 to-emerald-800/60 border-2 border-emerald-500/50 rounded-3xl p-8 shadow-2xl">
            <div className="text-center">
              <div className="text-emerald-300 text-sm font-semibold uppercase tracking-wider mb-2">Campaign Performance</div>
              <div className="text-5xl font-bold text-white mb-2">
                {kpis?.avgCTR?.toFixed(2) || '0.00'}%
              </div>
              <div className="text-slate-300 text-lg">Average Click-Through Rate</div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="p-3 bg-emerald-500/20 rounded-xl">
                  <div className="text-emerald-200 text-xs uppercase tracking-wide">Conversions</div>
                  <div className="text-white text-lg font-semibold">
                    {kpis?.totalConversions?.toLocaleString() || '0'}
                  </div>
                </div>
                <div className="p-3 bg-emerald-500/20 rounded-xl">
                  <div className="text-emerald-200 text-xs uppercase tracking-wide">Est. ROAS</div>
                  <div className="text-white text-lg font-semibold">
                    {(kpis?.roas || 0).toFixed(1)}x
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 border border-slate-600/50 rounded-xl p-4">
            <div className="text-slate-400 text-xs uppercase tracking-wide mb-1">Creative Concepts</div>
            <div className="text-white text-2xl font-bold">{kpis?.totalConcepts || 0}</div>
          </div>
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 border border-slate-600/50 rounded-xl p-4">
            <div className="text-slate-400 text-xs uppercase tracking-wide mb-1">Total Clicks</div>
            <div className="text-white text-2xl font-bold">{(kpis?.totalClicks || 0).toLocaleString()}</div>
          </div>
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 border border-slate-600/50 rounded-xl p-4">
            <div className="text-slate-400 text-xs uppercase tracking-wide mb-1">Cost/Conversion</div>
            <div className="text-white text-2xl font-bold">${(kpis?.costPerConversion || 0).toFixed(0)}</div>
          </div>
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 border border-slate-600/50 rounded-xl p-4">
            <div className="text-slate-400 text-xs uppercase tracking-wide mb-1">Avg Order Value</div>
            <div className="text-white text-2xl font-bold">$50</div>
          </div>
        </div>

        {/* Key Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Best Performer */}
          <div className="bg-gradient-to-br from-emerald-900/50 to-emerald-800/50 border border-emerald-600/50 rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-emerald-300 mb-4">🏆 Top Performing Creative</h3>
            {bestCreative && (
              <div className="space-y-3">
                <div className="text-white font-medium">{bestCreative.tone} | {bestCreative.persona} | {bestCreative.style}</div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-emerald-400">CTR:</span>
                    <span className="text-white font-semibold ml-2">{(bestCreative.CTR * 100).toFixed(2)}%</span>
                  </div>
                  <div>
                    <span className="text-emerald-400">Spend:</span>
                    <span className="text-white font-semibold ml-2">${bestCreative.SPEND.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Performance Distribution */}
          <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border border-slate-600/50 rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-300 mb-4">📊 Performance Distribution</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">CTR Range:</span>
                <span className="text-white font-semibold">{performanceSpread?.ctrRange?.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Best CTR:</span>
                <span className="text-emerald-400 font-semibold">{performanceSpread?.maxCTR?.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Lowest CTR:</span>
                <span className="text-red-400 font-semibold">{performanceSpread?.minCTR?.toFixed(2)}%</span>
              </div>
              <div className="pt-3 border-t border-slate-600">
                <p className="text-xs text-slate-400">
                  {filteredData.length} creatives analyzed with {performanceSpread?.ctrRange > 2 ? 'high' : 'moderate'} performance variation
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}