import { useFilters } from "./filters";

export function whereSql() {
  const { dims } = useFilters.getState();
  const parts = Object.entries(dims)
    .filter(([, v]) => v?.length)
    .map(([k, v]) => {
      const flat = v.flatMap(x => x.split(/[·,→]/).map(s => s.trim()));
      const uniq = [...new Set(flat)];
      // Use array_has_any to check for tag intersection
      return `array_has_any(tags, [${uniq.map(t => `'${t.replace(/'/g,"''")}'`).join(",")}])`;
    });
  return parts.length ? "WHERE " + parts.join(" AND ") : "";
}
