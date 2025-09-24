"use client";
import { useMemo, useState } from "react";
import { ChartWrapper } from "@/components/ui/chart-wrapper";
import { Card } from "@/components/ui/card";
import { useCreativeData } from "@/hooks/useCreativeData";
import { GlobalFilters } from "@/components/filters/GlobalFilters";
import HeatmapDim from "../explorer/HeatmapDim";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const dimensions = [
  { value: "TONE", label: "Tone" },
  { value: "STYLE", label: "Style" },
  { value: "PERSONA", label: "Persona" },
  { value: "TYPE", label: "Platform" },
  { value: "PRODUCT", label: "Product" },
  { value: "DEMAND_STAGE", label: "Demand Stage" },
  { value: "FUNNEL_STAGE", label: "Funnel Stage" }
];

// Simple product normalization
function cleanProduct(p?: string): string {
  const s = (p || "").trim().toLowerCase();
  if (s.includes("credit builder")) return "Credit Builder Account";
  if (s.includes("rent") || s.includes("bills")) return "Rent and Bills";
  if (s.includes("secured") || s.includes("visa")) return "Self Secured Credit Card";
  if (s === "combined" || s.includes("combined")) return "Combined";
  return p || "Other";
}

function numberFmt(n: number, digits = 0) {
  return n?.toLocaleString(undefined, { maximumFractionDigits: digits }) ?? "0";
}

export default function InsightsPage() {
  const { data, loading, error } = useCreativeData();

  const dataset = useMemo(() => {
    // Map to safe structure and fill deriveds
    return (data || []).map((d: any) => {
      const CTR = Number(d.CTR || 0);
      const IMPRESSIONS = Number(d.IMPRESSIONS || 0);
      const SPEND = Number(d.SPEND || 0);
      const clicks = IMPRESSIONS * CTR;
      const CPC = clicks > 0 ? SPEND / clicks : 0;
      return {
        ...d,
        product: cleanProduct(d.PRODUCT),
        personaNorm: d.persona || d.PERSONA || "General Audience",
        CTR,
        CTR_pct: CTR * 100,
        IMPRESSIONS,
        SPEND,
        CLICKS: Math.round(clicks),
        CPC,
      };
    });
  }, [data]);

  const kpis = useMemo(() => {
    const totalSpend = dataset.reduce((s, r) => s + r.SPEND, 0);
    const totalImpr = dataset.reduce((s, r) => s + r.IMPRESSIONS, 0);
    const totalClicks = dataset.reduce((s, r) => s + r.CLICKS, 0);
    const avgCTR = totalImpr > 0 ? (totalClicks / totalImpr) * 100 : 0;
    const avgCPC = totalClicks > 0 ? totalSpend / totalClicks : 0;
    return { totalSpend, totalImpr, totalClicks, avgCTR, avgCPC };
  }, [dataset]);

  const heatmap = useMemo(() => {
    // Persona x Product CTR% (weighted by impressions)
    const byKey: Record<string, { clicks: number; impr: number } > = {};
    const personas = new Set<string>();
    const products = new Set<string>();
    dataset.forEach(r => {
      const p = r.product || "Other";
      const pe = r.personaNorm || "General Audience";
      const key = `${pe}||${p}`;
      if (!byKey[key]) byKey[key] = { clicks: 0, impr: 0 };
      byKey[key].clicks += r.CLICKS;
      byKey[key].impr += r.IMPRESSIONS;
      personas.add(pe);
      products.add(p);
    });
    const xCats = Array.from(products.values()).sort();
    const yCats = Array.from(personas.values()).sort();
    const dataArr: [number, number, number][] = [];
    yCats.forEach((pe, yi) => {
      xCats.forEach((p, xi) => {
        const cell = byKey[`${pe}||${p}`];
        const ctr = cell && cell.impr > 0 ? (cell.clicks / cell.impr) * 100 : 0;
        dataArr.push([xi, yi, Number(ctr.toFixed(2))]);
      });
    });

    const option = {
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const [x, y, v] = params.data;
          return `${yCats[y]} × ${xCats[x]}<br/>CTR: ${v}%`;
        }
      },
      grid: { top: 10, right: 10, bottom: 60, left: 100 },
      xAxis: {
        type: 'category',
        data: xCats,
        axisLabel: { rotate: 20 }
      },
      yAxis: {
        type: 'category',
        data: yCats,
      },
      visualMap: {
        min: 0,
        max: Math.max(2, Math.min(10, Number((kpis.avgCTR * 2).toFixed(0)))),
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: 0,
      },
      series: [{
        type: 'heatmap',
        data: dataArr,
        label: { show: true, formatter: (p: any) => `${p.data[2]}%`, color: '#fff' },
        emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.5)' } }
      }]
    } as any;

    return option;
  }, [dataset, kpis.avgCTR]);

  const scatter = useMemo(() => {
    // Spend vs CTR% colored by product, size by impressions
    const products = Array.from(new Set(dataset.map(d => d.product))).sort();
    const colorMap: Record<string, string> = {};
    const palette = [
      '#60a5fa', '#34d399', '#fbbf24', '#f472b6', '#a78bfa', '#f87171', '#22d3ee'
    ];
    products.forEach((p, i) => colorMap[p] = palette[i % palette.length]);

    const series = products.map(p => ({
      name: p,
      type: 'scatter',
      data: dataset.filter(d => d.product === p).map(d => [Number((d.CTR_pct).toFixed(2)), d.SPEND, d.IMPRESSIONS, d.CPC, d]),
      symbolSize: (val: any[]) => Math.max(6, Math.sqrt((val?.[2] ?? 0)) / 150),
      itemStyle: { color: colorMap[p] },
      emphasis: { focus: 'series' }
    }));

    const avgCTR = Number(kpis.avgCTR.toFixed(2));
    const medianSpend = (() => {
      const arr = dataset.map(d => d.SPEND).sort((a,b) => a-b);
      if (!arr.length) return 0;
      const mid = Math.floor(arr.length/2);
      return arr.length % 2 ? arr[mid] : (arr[mid-1]+arr[mid])/2;
    })();

    const option = {
      tooltip: {
        trigger: 'item',
        formatter: (p: any) => {
          const d = p.data?.[4];
          if (!d) return `${p.seriesName}<br/>CTR: ${p.data[0]}%<br/>Spend: $${numberFmt(p.data[1])}`;
          return `${p.seriesName}<br/><b>${d["Ad Name"] ?? d.GRID_KEY}</b><br/>CTR: ${p.data[0]}% · Spend: $${numberFmt(p.data[1])}<br/>Impr: ${numberFmt(d.IMPRESSIONS)} · CPC: $${d.CPC.toFixed(2)}`;
        }
      },
      legend: { type: 'scroll', bottom: 0 },
      grid: { top: 10, right: 10, bottom: 80, left: 60 },
      xAxis: { name: 'CTR %' },
      yAxis: { name: 'Spend ($)', scale: true },
      series,
      markLine: {
        silent: true,
        lineStyle: { color: '#94a3b8', type: 'dashed' },
        data: [
          { xAxis: avgCTR },
          { yAxis: medianSpend }
        ]
      }
    } as any;

    return option;
  }, [dataset, kpis.avgCTR]);

  const alerts = useMemo(() => {
    // Top opportunities: high CTR% but low spend; Risks: high spend low CTR%
    if (!dataset.length) return { opp: [], risk: [] };
    const avgCTR = kpis.avgCTR;
    const spendArr = dataset.map(d => d.SPEND).sort((a,b)=>a-b);
    const medianSpend = spendArr.length ? (spendArr.length % 2 ? spendArr[(spendArr.length-1)/2] : (spendArr[spendArr.length/2-1]+spendArr[spendArr.length/2])/2) : 0;

    const scored = dataset.map(d => ({
      id: d["Ad Name"] ?? d.GRID_KEY,
      persona: d.personaNorm,
      product: d.product,
      ctr: d.CTR_pct,
      spend: d.SPEND,
      impr: d.IMPRESSIONS,
      lift: avgCTR > 0 ? (d.CTR_pct - avgCTR) : 0
    }));

    const opp = scored
      .filter(r => r.ctr > avgCTR && r.spend < medianSpend && r.impr > 10000)
      .sort((a,b) => (b.lift) - (a.lift))
      .slice(0, 5);

    const risk = scored
      .filter(r => r.ctr < avgCTR && r.spend > medianSpend)
      .sort((a,b) => (b.spend - a.spend))
      .slice(0, 5);

    return { opp, risk };
  }, [dataset, kpis.avgCTR]);

  const [selectedDimension, setSelectedDimension] = useState<string>("TONE");
  
  const dimensions = [
    { value: "TONE", label: "Tone" },
    { value: "STYLE", label: "Style" },
    { value: "PERSONA", label: "Persona" },
    { value: "TYPE", label: "Platform" },
    { value: "PRODUCT", label: "Product" },
    { value: "DEMAND_STAGE", label: "Demand Stage" },
    { value: "FUNNEL_STAGE", label: "Funnel Stage" }
  ];

  if (loading) return (
    <div className="p-8 text-slate-300">Loading insights…</div>
  );

  if (error) {
    console.error(error);
  }

  return (
    <div className="h-full overflow-auto">
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Strategic Insights</h1>
          <p className="text-slate-400">Performance analysis by dimension</p>
        </div>
        
        <GlobalFilters />

        <Tabs defaultValue="correlations" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="correlations">Performance Correlations</TabsTrigger>
            <TabsTrigger value="heatmap">Dimensional Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="correlations" className="mt-4">

        {/* Main + Sidebar layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-8">
            {/* KPI cards */}
                        <div className="grid grid-cols-4 gap-4">
              <Card className="p-5 border-slate-600/60 bg-slate-800/60">
                <div className="text-slate-400 text-xs uppercase">Total Spend</div>
                <div className="text-white text-2xl font-semibold">${numberFmt(kpis.totalSpend)}</div>
              </Card>
              <Card className="p-5 border-slate-600/60 bg-slate-800/60">
                <div className="text-slate-400 text-xs uppercase">Impressions</div>
                <div className="text-white text-2xl font-semibold">{numberFmt(kpis.totalImpr)}</div>
              </Card>
              <Card className="p-5 border-slate-600/60 bg-slate-800/60">
                <div className="text-slate-400 text-xs uppercase">Avg CTR</div>
                <div className="text-white text-2xl font-semibold">{kpis.avgCTR.toFixed(2)}%</div>
              </Card>
              <Card className="p-5 border-slate-600/60 bg-slate-800/60">
                <div className="text-slate-400 text-xs uppercase">Avg CPC</div>
                <div className="text-white text-2xl font-semibold">${kpis.avgCPC.toFixed(2)}</div>
              </Card>
            </div>

            {/* Heatmap Persona x Product (CTR%) */}
            <div className="space-y-3">
              <div className="text-slate-300 text-sm">Persona × Product — CTR %</div>
              <ChartWrapper option={heatmap as any} height={420} />
            </div>

            {/* Spend vs CTR scatter */}
            <div className="space-y-3">
              <div className="text-slate-300 text-sm">Spend vs CTR % — bubble size by Impressions, color by Product</div>
              <ChartWrapper option={scatter as any} height={440} />
            </div>

            <div className="text-xs text-slate-500 pb-10">Alternative view: values weighted by impressions; reference lines: average CTR and median Spend.</div>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-6 lg:sticky lg:top-4">
            <Card className="p-5 border-emerald-700/40 bg-emerald-900/30">
              <div className="text-emerald-300 font-medium mb-2">Scale opportunities (high CTR, low spend)</div>
              <ul className="text-sm text-emerald-100 space-y-2">
                {alerts.opp.length === 0 && <li className="text-emerald-200/70">No clear candidates.</li>}
                {alerts.opp.map((r, idx) => (
                  <li key={`opp-${idx}`} className="flex justify-between gap-3">
                    <span className="truncate">{r.id} · {r.persona} · {r.product}</span>
                    <span className="shrink-0">{r.ctr.toFixed(2)}% · ${numberFmt(r.spend)}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-5 border-rose-700/40 bg-rose-900/30">
              <div className="text-rose-300 font-medium mb-2">Inefficiency risks (high spend, low CTR)</div>
              <ul className="text-sm text-rose-100 space-y-2">
                {alerts.risk.length === 0 && <li className="text-rose-200/70">No major risks detected.</li>}
                {alerts.risk.map((r, idx) => (
                  <li key={`risk-${idx}`} className="flex justify-between gap-3">
                    <span className="truncate">{r.id} · {r.persona} · {r.product}</span>
                    <span className="shrink-0">{r.ctr.toFixed(2)}% · ${numberFmt(r.spend)}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </aside>
        </div>

          <TabsContent value="heatmap" className="mt-4">
            <div className="space-y-4">
              <div className="flex justify-end">
                <select
                  value={selectedDimension}
                  onChange={(e) => setSelectedDimension(e.target.value)}
                  className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200"
                >
                  {dimensions.map((dim) => (
                    <option key={dim.value} value={dim.value}>
                      {dim.label}
                    </option>
                  ))}
                </select>
              </div>
              <HeatmapDim dim={selectedDimension} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );

            {/* Heatmap Persona x Product (CTR%) */}
            <div className="space-y-3">
              <div className="text-slate-300 text-sm">Persona × Product — CTR %</div>
              <ChartWrapper option={heatmap as any} height={420} />
            </div>

            {/* Spend vs CTR scatter */}
            <div className="space-y-3">
              <div className="text-slate-300 text-sm">Spend vs CTR % — bubble size by Impressions, color by Product</div>
              <ChartWrapper option={scatter as any} height={440} />
            </div>

            <div className="text-xs text-slate-500 pb-10">Alternative view: values weighted by impressions; reference lines: average CTR and median Spend.</div>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-6 lg:sticky lg:top-4">
            <Card className="p-5 border-emerald-700/40 bg-emerald-900/30">
              <div className="text-emerald-300 font-medium mb-2">Scale opportunities (high CTR, low spend)</div>
              <ul className="text-sm text-emerald-100 space-y-2">
                {alerts.opp.length === 0 && <li className="text-emerald-200/70">No clear candidates.</li>}
                {alerts.opp.map((r, idx) => (
                  <li key={`opp-${idx}`} className="flex justify-between gap-3">
                    <span className="truncate">{r.id} · {r.persona} · {r.product}</span>
                    <span className="shrink-0">{r.ctr.toFixed(2)}% · ${numberFmt(r.spend)}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-5 border-rose-700/40 bg-rose-900/30">
              <div className="text-rose-300 font-medium mb-2">Inefficiency risks (high spend, low CTR)</div>
              <ul className="text-sm text-rose-100 space-y-2">
                {alerts.risk.length === 0 && <li className="text-rose-200/70">No major risks detected.</li>}
                {alerts.risk.map((r, idx) => (
                  <li key={`risk-${idx}`} className="flex justify-between gap-3">
                    <span className="truncate">{r.id} · {r.persona} · {r.product}</span>
                    <span className="shrink-0">{r.ctr.toFixed(2)}% · ${numberFmt(r.spend)}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
