'use client';
import { useEffect, useState } from "react";
import { useGenomeStore } from "@/components/genome/store/useGenomeStore";
import { Command, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

export default function DimensionFilter({ dim }: { dim: string }) {
  const { gridData, setTone, setPersona, setStyle, tone, persona, style } = useGenomeStore();
  const [options, setOptions] = useState<string[]>([]);
  
  // Get selected value for this dimension
  const selected = dim === "TONE" ? tone : dim === "PERSONA" ? persona : dim === "STYLE" ? style : null;

  useEffect(() => {
    if (!gridData.length) return;
    
    // Extract unique values for this dimension from the grid data
    const values = new Set<string>();
    gridData.forEach(item => {
      const parts = item.GRID_KEY.split('|');
      if (dim === "TONE" && parts[0]) {
        values.add(parts[0].trim());
      } else if (dim === "PERSONA" && parts[1]) {
        values.add(parts[1].trim());
      } else if (dim === "STYLE" && parts[2]) {
        values.add(parts[2].trim());
      }
    });
    
    const sortedOptions = Array.from(values).sort();
    setOptions(sortedOptions);
  }, [gridData, dim]);

  const handleSelect = (opt: string) => {
    // Toggle selection: if already selected, clear it; otherwise select it
    const newValue = selected === opt ? null : opt;
    
    if (dim === "TONE") {
      setTone(newValue);
    } else if (dim === "PERSONA") {
      setPersona(newValue);
    } else if (dim === "STYLE") {
      setStyle(newValue);
    }
  };

  return (
    <div className="space-y-1">
      <p className="font-semibold text-xs">{dim}</p>
      <Command className="border w-full max-h-60 overflow-auto bg-neutral-900">
        <CommandInput placeholder={`Search ${dim.toLowerCase()}…`} />
        <CommandList>
          {options.map(opt => (
            <CommandItem
              key={opt}
              onSelect={() => handleSelect(opt)}
            >
              <span className={`${selected === opt ? 'font-bold text-blue-400' : ''}`}>{opt}</span>
            </CommandItem>
          ))}
        </CommandList>
      </Command>
    </div>
  );
}