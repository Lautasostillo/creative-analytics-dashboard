"use client"

import { useMemo, useState } from "react";
import CreativeGenome from "@/components/genome/CreativeGenome";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFilteredRealCreativeData } from "@/hooks/useRealCreativeData";

const qc = new QueryClient();

type Filters = { tone?: string; persona?: string; style?: string; perf?: 'top'|'opt'; budget?: 'high'|'efficient' };

function FilterSelect({ label, options, value, onChange }: { label:string; options:string[]; value:string|undefined; onChange:(v:string|undefined)=>void }){
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</label>
      <select className="bg-slate-800/90 border border-slate-600 rounded-lg px-4 py-2 text-white text-sm min-w-[160px]" value={value || ''} onChange={e=> onChange(e.target.value || undefined)}>
        <option value="">All {label}s</option>
        {options.map(o=> <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

export default function CreativeGenomePage() {
  const [filters, setFilters] = useState<Filters>({});
  const { data } = useFilteredRealCreativeData({ tone: filters.tone, persona: filters.persona, style: filters.style });

  const uniqueTones = useMemo(()=> [...new Set(data.map(d=> d.tone))].sort(), [data]);
  const uniquePersonas = useMemo(()=> [...new Set(data.map(d=> d.persona))].sort(), [data]);
  const uniqueStyles = useMemo(()=> [...new Set(data.map(d=> d.style))].sort(), [data]);

  // Strategic summary helpers
  const avgCTR = useMemo(()=> data.length ? (data.reduce((s,d)=> s + (d.CTR||0), 0) / data.length) * 100 : 0, [data]);
  const bestCombo = useMemo(()=>{
    const agg = new Map<string, {sum:number; n:number}>();
    for (const d of data) {
      const key = `${d.tone} | ${d.persona} | ${d.style}`;
      const v = agg.get(key) || { sum:0, n:0 };
      v.sum += (d.CTR||0)*100; v.n += 1; agg.set(key, v);
    }
    const rows = [...agg.entries()].map(([k,v])=> ({ key:k, avg: v.sum/(v.n||1), n:v.n }));
    rows.sort((a,b)=> b.avg - a.avg);
    return rows[0];
  }, [data]);

  // Derive performance/budget filters
  const filteredForGenome = useMemo(()=>{
    const overall = avgCTR;
    const byPerf = filters.perf ? data.filter(d=> filters.perf === 'top' ? (d.CTR||0)*100 >= Math.max(overall, 1) : (d.CTR||0)*100 < overall) : data;
    const byBudget = filters.budget ? byPerf.filter(d=> filters.budget === 'high' ? (d.SPEND||0) >= (data.reduce((s,x)=> s + (x.SPEND||0), 0) / Math.max(1, data.length)) : (d.CPC||0) <= (data.reduce((s,x)=> s + (x.CPC||0), 0) / Math.max(1, data.length))) : byPerf;
    return byBudget;
  }, [data, filters.perf, filters.budget, avgCTR]);

  return (
    <QueryClientProvider client={qc}>
      <div className="h-full min-h-0 flex flex-col">
        <div className="p-6 pb-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Creative Genome</h1>
            <p className="text-slate-400">Strategic intelligence view for creative DNA patterns</p>
          </div>
        </div>

        <div className="px-6 pb-4">
          {/* Unified Filters */}
          <div className="bg-slate-800/60 border border-slate-600/50 rounded-2xl p-4">
            <div className="flex flex-wrap gap-4 items-end">
              <FilterSelect label="Tone" options={uniqueTones} value={filters.tone} onChange={v=> setFilters(f=> ({...f, tone:v}))} />
              <FilterSelect label="Persona" options={uniquePersonas} value={filters.persona} onChange={v=> setFilters(f=> ({...f, persona:v}))} />
              <FilterSelect label="Style" options={uniqueStyles} value={filters.style} onChange={v=> setFilters(f=> ({...f, style:v}))} />
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide">Performance</label>
                <select className="bg-slate-800/90 border border-slate-600 rounded-lg px-4 py-2 text-white text-sm" value={filters.perf || ''} onChange={e=> setFilters(f=> ({...f, perf: (e.target.value||undefined) as any}))}>
                  <option value="">All</option>
                  <option value="top">Top Performers</option>
                  <option value="opt">Optimization Needed</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide">Budget</label>
                <select className="bg-slate-800/90 border border-slate-600 rounded-lg px-4 py-2 text-white text-sm" value={filters.budget || ''} onChange={e=> setFilters(f=> ({...f, budget: (e.target.value||undefined) as any}))}>
                  <option value="">All</option>
                  <option value="high">High Investment</option>
                  <option value="efficient">Cost Efficient</option>
                </select>
              </div>
              <div className="ml-auto text-slate-300 text-sm">{filteredForGenome.length} results</div>
            </div>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="p-6 pt-0 space-y-4">
            {/* Executive Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="bg-emerald-900/40 border border-emerald-700/40 rounded-xl p-4">
                <div className="text-emerald-300 text-xs uppercase mb-1">Portfolio Avg CTR</div>
                <div className="text-white text-3xl font-bold">{avgCTR.toFixed(2)}%</div>
              </div>
              <div className="bg-blue-900/40 border border-blue-700/40 rounded-xl p-4">
                <div className="text-blue-300 text-xs uppercase mb-1">Best Performing DNA</div>
                <div className="text-white text-sm">{bestCombo?.key || '—'}</div>
                <div className="text-slate-300 text-xs">Avg CTR: {(bestCombo?.avg || 0).toFixed(2)}% ({bestCombo?.n || 0} concepts)</div>
              </div>
              <div className="bg-amber-900/40 border border-amber-700/40 rounded-xl p-4">
                <div className="text-amber-300 text-xs uppercase mb-1">Recommendations</div>
                <div className="text-white text-sm">Scale {bestCombo?.key?.split('|')[0]?.trim() || 'top tones'} in {bestCombo?.key?.split('|')[2]?.trim() || 'best styles'}</div>
              </div>
            </div>

            {/* Strategic Cards */}
            <div className="min-h-0">
              <CreativeGenome />
            </div>
          </div>
        </div>
      </div>
    </QueryClientProvider>
  );
}