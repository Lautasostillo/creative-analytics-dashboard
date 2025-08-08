'use client';
import { useMemo, useState } from 'react';
import { ChartWrapper } from "@/components/ui/chart-wrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFilteredCreativeData, useCreativeInsights } from '@/hooks/useCreativeData';

type Filters = { tone?: string; persona?: string; style?: string };

function FilterSelect({ label, options, selected, onChange }: {
  label: string;
  options: string[];
  selected: string | undefined;
  onChange: (v: string | undefined) => void;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</label>
      <select
        className="bg-slate-800/90 border border-slate-600 rounded-lg px-4 py-2 text-white text-sm min-w-[160px]"
        value={selected || ''}
        onChange={(e)=> onChange(e.target.value || undefined)}
      >
        <option value="">All {label}s</option>
        {options.map(o=> <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

export default function ClustersPage() {
  const [filters, setFilters] = useState<Filters>({});
  const { data, loading } = useFilteredCreativeData(filters);
  const insights = useCreativeInsights(data);

  const overallAvgCTR = insights?.kpis?.avgCTR || 0; // percent

  // Unique values
  const tones = useMemo(()=>[...new Set(data.map(d=> d.tone))].sort(), [data]);
  const personas = useMemo(()=>[...new Set(data.map(d=> d.persona))].sort(), [data]);
  const styles = useMemo(()=>[...new Set(data.map(d=> d.style))].sort(), [data]);

  // Heatmap: Tone x Persona with avg CTR (%)
  const heatmap = useMemo(()=>{
    const toneIdx: Record<string, number> = {}; tones.forEach((t,i)=> toneIdx[t]=i);
    const personaIdx: Record<string, number> = {}; personas.forEach((p,i)=> personaIdx[p]=i);
    const agg: Record<string, {sum:number; count:number}> = {};
    for (const d of data) {
      const key = `${d.tone}||${d.persona}`;
      const ctrPct = (d.CTR || 0) * 100;
      if (!agg[key]) agg[key] = { sum: 0, count: 0 };
      agg[key].sum += ctrPct; agg[key].count += 1;
    }
    const values: [number, number, number][] = [];
    Object.entries(agg).forEach(([k,v])=>{
      const [t,p] = k.split('||');
      values.push([toneIdx[t], personaIdx[p], v.count ? v.sum / v.count : 0]);
    });
    return { x: tones, y: personas, values };
  }, [data, tones, personas]);

  const heatmapOption = useMemo(() => ({
    title: { text: 'Tone × Persona Performance (CTR%)', left: 'center' },
    tooltip: { position: 'top', formatter: (p:any)=> `${tones[p.data[0]]} × ${personas[p.data[1]]}: ${p.data[2].toFixed(2)}% CTR` },
    grid: { height: '70%', top: 40 },
    xAxis: { type: 'category', data: heatmap.x, splitArea: { show: true }, axisLabel:{ color:'#ccc', rotate:30 } },
    yAxis: { type: 'category', data: heatmap.y, splitArea: { show: true }, axisLabel:{ color:'#ccc' } },
    visualMap: { min: 0, max: Math.max(2, Math.max(...(heatmap.values.map(v=>v[2])) || [2])), calculable: true, orient: 'horizontal', left: 'center', bottom: 0 },
    series: [{ name: 'CTR %', type: 'heatmap', data: heatmap.values, emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.5)' } } }]
  }), [heatmap, tones, personas]);

  // Correlation/Lift matrix vs overall avg CTR
  const liftOption = useMemo(()=>{
    const liftValues = heatmap.values.map(([x,y,val])=> [x,y, overallAvgCTR ? (val / overallAvgCTR * 100 - 100) : 0]);
    const vmax = Math.max(20, Math.max(...liftValues.map(v=> Math.abs(v[2] as number))));
    return {
      title: { text: 'Lift vs Overall CTR', left:'center' },
      tooltip: { formatter: (p:any)=> `${tones[p.data[0]]} × ${personas[p.data[1]]}: ${p.data[2].toFixed(0)}% lift` },
      xAxis: { type:'category', data: heatmap.x, axisLabel:{ color:'#ccc', rotate:30 } },
      yAxis: { type:'category', data: heatmap.y, axisLabel:{ color:'#ccc' } },
      visualMap: { min: -vmax, max: vmax, calculable:true, orient:'horizontal', left:'center', bottom:0 },
      series: [{ type:'heatmap', data: liftValues }]
    }
  }, [heatmap, overallAvgCTR, tones, personas]);

  // Scatter: Spend vs CTR colored by Style
  const scatterOption = useMemo(()=>{
    const seriesByStyle: Record<string, any[]> = {};
    for (const d of data) {
      const s = d.style || 'Other';
      if (!seriesByStyle[s]) seriesByStyle[s] = [];
      seriesByStyle[s].push([Number(d.SPEND)||0, (Number(d.CTR)||0)*100, Number(d.IMPRESSIONS)||0]);
    }
    return {
      title: { text: 'Spend vs CTR (size = Impressions)' },
      tooltip: { trigger: 'item', formatter: (p:any)=> `Spend: $${p.value[0].toLocaleString()}<br/>CTR: ${p.value[1].toFixed(2)}%<br/>Impr: ${p.value[2].toLocaleString()}` },
      xAxis: { name: 'Spend', axisLabel:{ color:'#ccc' } },
      yAxis: { name: 'CTR %', axisLabel:{ color:'#ccc' } },
      legend: { bottom: 0, textStyle:{ color:'#ccc' } },
      series: Object.entries(seriesByStyle).map(([name, pts])=> ({ name, type:'scatter', data: pts, symbolSize: (val:any)=> Math.max(6, Math.sqrt(val[2]) / 50) }))
    }
  }, [data]);

  // Element Impact Analysis (rankings by avg CTR)
  const impact = useMemo(()=>{
    function rankBy<T extends string>(key: 'tone'|'persona'|'style'){
      const agg: Record<string, {sum:number; count:number}> = {};
      for (const d of data) {
        const k = (d as any)[key];
        const ctrPct = (d.CTR||0)*100;
        if (!k) continue;
        if (!agg[k]) agg[k] = { sum:0, count:0 };
        agg[k].sum += ctrPct; agg[k].count += 1;
      }
      const rows = Object.entries(agg).map(([k,v])=> ({ name:k, avg: v.sum/(v.count||1), n: v.count }));
      rows.sort((a,b)=> b.avg - a.avg);
      return rows;
    }
    return {
      tone: rankBy('tone'),
      persona: rankBy('persona'),
      style: rankBy('style')
    }
  }, [data]);

  // Strategic recommendations
  const recommendations = useMemo(()=>{
    const underusedHigh = impact.tone.filter(r=> r.n < 5 && r.avg > (overallAvgCTR || 0)).slice(0,3);
    const reallocate = data
      .map(d=> ({ key: `${d.tone} | ${d.persona} | ${d.style}` , spend: d.SPEND||0, ctr: (d.CTR||0)*100 }))
      .sort((a,b)=> (b.spend - a.spend))
      .filter(d=> d.ctr < (overallAvgCTR||0))
      .slice(0,3);
    return { underusedHigh, reallocate };
  }, [impact, data, overallAvgCTR]);

  if (loading) return <div className="p-6">Loading advanced analytics...</div>;

  return (
    <div className="h-full min-h-0 flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Advanced Creative Intelligence</h1>
          <p className="text-slate-400">Deep analytics that reveal cross-dimensional performance patterns</p>
        </div>

        {/* Filters */}
        <div className="bg-slate-800/60 border border-slate-600/50 rounded-2xl p-6">
          <div className="flex flex-wrap gap-4 items-end">
            <FilterSelect label="Tone" options={tones} selected={filters.tone} onChange={(v)=> setFilters(f=> ({...f, tone:v}))} />
            <FilterSelect label="Persona" options={personas} selected={filters.persona} onChange={(v)=> setFilters(f=> ({...f, persona:v}))} />
            <FilterSelect label="Style" options={styles} selected={filters.style} onChange={(v)=> setFilters(f=> ({...f, style:v}))} />
            {(filters.tone||filters.persona||filters.style) && (
              <button onClick={()=> setFilters({})} className="ml-auto px-4 py-2 rounded-lg bg-red-600 text-white text-sm">Reset</button>
            )}
          </div>
        </div>

        {/* Cross-Dimensional Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartWrapper className="overflow-visible" option={heatmapOption as any} height={420} />
          <ChartWrapper className="overflow-visible" option={liftOption as any} height={420} />
        </div>

        {/* Visualizations */}
        <div className="grid grid-cols-1 gap-6">
          <ChartWrapper className="overflow-visible" option={scatterOption as any} height={420} />
        </div>

        {/* Element Impact Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[['Tone', impact.tone], ['Persona', impact.persona], ['Style', impact.style]].map(([label, rows]: any, i:number)=> (
            <Card key={i}>
              <CardHeader><CardTitle>{label} Impact (avg CTR%)</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(rows as any[]).slice(0,6).map((r, idx)=> (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <div className="truncate pr-2">{r.name}</div>
                      <div className="text-slate-300">{r.avg.toFixed(2)}% <span className="text-xs text-slate-500">({r.n})</span></div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Strategic Recommendations */}
        <Card>
          <CardHeader><CardTitle>Strategic Recommendations</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <div className="font-semibold text-emerald-300 mb-2">Top Underused High-Performers</div>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  {recommendations.underusedHigh.map((r, i)=> (
                    <li key={i}><span className="text-white font-medium">{r.name}</span> averages {r.avg.toFixed(2)}% CTR with only {r.n} concepts tested</li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="font-semibold text-amber-300 mb-2">Budget Reallocation Suggestions</div>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  {recommendations.reallocate.map((r, i)=> (
                    <li key={i}><span className="text-white font-medium">{r.key}</span>: High spend (${r.spend.toLocaleString()}) with below-average CTR ({r.ctr.toFixed(2)}%). Consider reallocating budget.</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}
