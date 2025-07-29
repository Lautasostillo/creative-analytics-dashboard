import { create } from "zustand"
import type { Creative, FilterState, InsightData } from "./types"

interface AppState {
  // Data
  creatives: Creative[]
  insights: InsightData[]
  loading: boolean

  // Filters
  filters: FilterState

  // UI State
  selectedCreative: Creative | null
  isCreativeSheetOpen: boolean
  isChatOpen: boolean

  // Actions
  setCreatives: (creatives: Creative[]) => void
  setInsights: (insights: InsightData[]) => void
  setLoading: (loading: boolean) => void
  updateFilters: (filters: Partial<FilterState>) => void
  setSelectedCreative: (creative: Creative | null) => void
  setCreativeSheetOpen: (open: boolean) => void
  setChatOpen: (open: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  // Initial state
  creatives: [],
  insights: [],
  loading: true,

  filters: {
    // Initialize with empty/default values
  },

  selectedCreative: null,
  isCreativeSheetOpen: false,
  isChatOpen: false,

  // Actions
  setCreatives: (creatives) => set({ creatives, loading: false }),
  setInsights: (insights) => set({ insights }),
  setLoading: (loading) => set({ loading }),
  updateFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),
  setSelectedCreative: (creative) => set({ selectedCreative: creative }),
  setCreativeSheetOpen: (open) => set({ isCreativeSheetOpen: open }),
  setChatOpen: (open) => set({ isChatOpen: open }),
}))
