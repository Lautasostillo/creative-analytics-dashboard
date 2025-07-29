"use client"

import React, { useEffect, useState, useMemo } from 'react';
import { useGenomeStore } from './store/useGenomeStore';
import GenomeModal from './GenomeModal';

// Helper to scale colors
const colorScale = (value: number, min: number, max: number) => {
  const percentage = (value - min) / (max - min);
  const red = 255 * (1 - percentage);
  const green = 255 * percentage;
  return `rgb(${red.toFixed(0)}, ${green.toFixed(0)}, 50)`;
};

export default function CreativeGenome() {
  const { gridData, tone, persona, style, fetchGridData } = useGenomeStore();
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  useEffect(() => {
    fetchGridData();
  }, [fetchGridData]);

  const filtered = useMemo(() => {
    if (!gridData.length) return [];
    
    // If no filters are active, return all data
    if (!tone && !persona && !style) {
      return gridData;
    }
    
    const result = gridData.filter(g => {
      const [gridTone, gridPersona, gridStyle] = g.GRID_KEY.split('|').map(s => s.trim());
      
      if (tone && gridTone.toLowerCase() !== tone.toLowerCase()) return false;
      if (persona && gridPersona !== persona) return false;
      if (style && gridStyle !== style) return false;
      return true;
    });
    
    return result;
  }, [gridData, tone, persona, style]);

  if (!gridData.length) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-lg">Loading Grid...</div>
      </div>
    );
  }

  if (!filtered.length) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-lg">No cards match current filters. Total available: {gridData.length}</div>
      </div>
    );
  }

  const minCtr = Math.min(...filtered.map(d => d.CTR));
  const maxCtr = Math.max(...filtered.map(d => d.CTR));

  // Calculate metrics for filtered data
  const totalAds = filtered.length;
  const totalSpend = filtered.reduce((sum, card) => sum + card.SPEND, 0);
  const totalImpressions = filtered.reduce((sum, card) => sum + card.IMPRESSIONS, 0);
  const averageCTR = totalAds > 0 ? filtered.reduce((sum, card) => sum + card.CTR, 0) / totalAds : 0;

  return (
    <>
      {/* Active Filters */}
      {(tone || persona || style) && (
        <div className="mb-6 p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl shrink-0">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-medium text-slate-300">Active Filters:</span>
            {tone && (
              <span className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-xs font-medium rounded-lg shadow-sm">
                Tone: {tone}
              </span>
            )}
            {persona && (
              <span className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-xs font-medium rounded-lg shadow-sm">
                Persona: {persona}
              </span>
            )}
            {style && (
              <span className="px-3 py-1.5 bg-gradient-to-r from-violet-600 to-violet-500 text-white text-xs font-medium rounded-lg shadow-sm">
                Style: {style}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Metrics Panel */}
      <div className="mb-8 bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-slate-700/50 rounded-2xl p-6 shadow-xl shrink-0">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white">Performance Overview</h2>
          <p className="text-sm text-slate-400">Key metrics for selected creative concepts</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">{totalAds.toLocaleString()}</div>
            <div className="text-sm font-medium text-slate-400 uppercase tracking-wide">Total Concepts</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-400 mb-1">{(averageCTR * 100).toFixed(2)}%</div>
            <div className="text-sm font-medium text-slate-400 uppercase tracking-wide">Average CTR</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400 mb-1">${totalSpend.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
            <div className="text-sm font-medium text-slate-400 uppercase tracking-wide">Total Spend</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-violet-400 mb-1">{totalImpressions.toLocaleString()}</div>
            <div className="text-sm font-medium text-slate-400 uppercase tracking-wide">Total Impressions</div>
          </div>
        </div>
      </div>

      {/* Grid Container */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(250px,1fr))] auto-rows-max p-2">
          {filtered.map((c) => {
            const [tone, persona, style] = c.GRID_KEY.split('|').map(s => s.trim());
            const ctr = (c.CTR * 100).toFixed(2);
            const spend = c.SPEND.toLocaleString(undefined, {maximumFractionDigits: 0});
            const impressions = (c.IMPRESSIONS / 1000).toFixed(0) + 'K';
            
            return (
              <div
                key={c.GRID_KEY}
                className="bg-slate-800 border border-slate-600 rounded-lg p-4 hover:border-slate-500 transition-colors cursor-pointer"
                style={{ backgroundColor: colorScale(c.CTR, minCtr, maxCtr) }}
              >
                <div className="text-white">
                  <div className="text-xs font-semibold uppercase tracking-wide mb-2 opacity-90">
                    {tone}
                  </div>
                  
                  <div className="mb-3">
                    <div className="font-medium text-sm">{persona}</div>
                    <div className="text-xs opacity-80">{style}</div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs">CTR</span>
                      <span className="font-bold">{ctr}%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Spend</span>
                      <span>${spend}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Impressions</span>
                      <span>{impressions}</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-2 border-t border-white/20">
                    <div className="flex justify-between text-xs">
                      <span>Performance</span>
                      <span className={c.CTR_DELTA > 0 ? 'text-green-300' : 'text-red-300'}>
                        {c.CTR_DELTA > 0 ? '+' : ''}{(c.CTR_DELTA * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
    </>
  );
}