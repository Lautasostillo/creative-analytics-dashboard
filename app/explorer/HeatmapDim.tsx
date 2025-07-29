'use client';
import { useEffect, useState } from 'react';
import { query } from '../../src/lib/duckdb-client';
import ChartWrapper from '@/components/charts/chart-wrapper';

export default function HeatmapDim({ dim }: { dim: string }) {
  const [opt, setOpt] = useState<any | null>(null);
  useEffect(() => {
    (async () => {
      const rows = await query(`
        WITH a AS (
          SELECT "${dim}" d,
                 AVG(CTR_pct) ctr,
                 AVG(CPC) cpc,
                 AVG(CPM) cpm
          FROM v_creatives GROUP BY 1
        )
        SELECT d,'CTR' m,ctr v FROM a UNION ALL
        SELECT d,'CPC',cpc FROM a UNION ALL
        SELECT d,'CPM',cpm FROM a;
      `);
      if (!rows.length) return;
      const dims = [...new Set(rows.map((r: any) => r.d))];
      const mets = ['CTR', 'CPC', 'CPM'];
      const vals = rows.map((r: any) => r.v);
      setOpt({
        tooltip: {},
        xAxis: { type: 'category', data: mets },
        yAxis: { type: 'category', data: dims },
        visualMap: { min: Math.min(...vals), max: Math.max(...vals), orient: 'horizontal', left: 'center' },
        series: [{ type: 'heatmap', data: rows.map((r: any) => [mets.indexOf(r.m), dims.indexOf(r.d), r.v]) }]
      });
    })();
  }, [dim]);
  return <ChartWrapper option={opt} height={420} />;
}
