'use client';
import { create } from 'zustand';

type State = { dims: Record<string,string[]> };
type Actions = { set:(dim:string,val:string[])=>void; clear:()=>void };

export const useFilters = create<State & Actions>(set=>({
  dims:{},
  set:(d,v)=>set(s=>({dims:{...s.dims,[d]:v}})),
  clear:()=>set({dims:{}})
}));
