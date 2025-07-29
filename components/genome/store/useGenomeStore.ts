import { create } from 'zustand';

interface GenomeState {
  gridData: any[];
  selectedKey: string | null;
  tone: string | null;
  persona: string | null;
  style: string | null;
  fetchGridData: () => Promise<void>;
  select: (k: string | null) => void;
  setTone: (tone: string | null) => void;
  setPersona: (persona: string | null) => void;
  setStyle: (style: string | null) => void;
}

export const useGenomeStore = create<GenomeState>((set) => ({
  gridData: [],
  selectedKey: null,
  tone: null,
  persona: null,
  style: null,
  fetchGridData: async () => {
    const r = await fetch("/api/genome/grid");
    const data = await r.json();
    set({ gridData: data });
  },
  select: (k) => set({ selectedKey: k }),
  setTone: (tone) => set({ tone }),
  setPersona: (persona) => set({ persona }),
  setStyle: (style) => set({ style })
}));

// devolvemos utilidades pero el filtrado se hará vía useMemo en el componente
