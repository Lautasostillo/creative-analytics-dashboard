'use client';
import { useEffect, useState } from 'react';
import { query } from './duckdb-client';
import { useFilters } from './filters';

export function useQuery(sqlTemplate: string) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const { dims } = useFilters();

  useEffect(() => {
    const whereClause = buildWhereClause(dims);
    const finalSql = sqlTemplate.replace('{{WHERE}}', whereClause);

    setLoading(true);
    query(finalSql)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [sqlTemplate, dims]);

  return { data, loading, error };
}

function buildWhereClause(dims: Record<string, string[]>) {
  const parts = Object.entries(dims)
    .filter(([, v]) => v?.length)
    .map(([k, v]) => {
      const flat = v.flatMap(x => x.split(/[·,→]/).map(s => s.trim()));
      const uniq = [...new Set(flat)];
      return `array_has_any(tags, [${uniq.map(t => `'${t.replace(/'/g, "''")}'`).join(",")}])`;
    });
  return parts.length ? "WHERE " + parts.join(" AND ") : "";
}
