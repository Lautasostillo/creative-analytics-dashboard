'use client';
import DimensionFilter from "./dimension-filter";

const dims = ["TONE", "PERSONA", "STYLE"]; // length bucket removido

export default function FilterSidebar() {
  return (
    <aside className="w-64 overflow-y-auto h-screen border-r border-neutral-800 p-3 space-y-4">
      {dims.map(d => <DimensionFilter key={d} dim={d} />)}
    </aside>
  );
}
