'use client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChartWrapper } from '@/components/ui/chart-wrapper';

export default function CreativeSheet({ open, onOpenChange, creative }:{
  open:boolean, onOpenChange:(o:boolean)=>void, creative:any
}) {
  if(!creative) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[90vh] overflow-auto">
        <DialogHeader><DialogTitle>{creative["Ad Name"]}</DialogTitle></DialogHeader>
        <video src={creative.S3PATH_SCF} controls className="w-full mb-4 rounded" />
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <h3 className="font-bold mb-1">Metrics</h3>
            <p>Spend: ${creative.SPEND}</p>
            <p>Impr: {creative.IMPRESSIONS}</p>
            <p>CTR%: {creative.CTR_pct?.toFixed(2)}</p>
          </div>
          <div>
            <h3 className="font-bold mb-1">Strategic Summary</h3>
            <p className="whitespace-pre-wrap">{creative.Strategic_Summary}</p>
          </div>
        </div>
        <h3 className="font-bold mt-4 mb-1">High‑Fidelity Description</h3>
        <p className="whitespace-pre-wrap text-sm">{creative.High_Fidelity_Description}</p>
        <h3 className="font-bold mt-4 mb-1">Scene by Scene</h3>
        <p className="whitespace-pre-wrap text-sm">{creative.Scene_by_Scene_Breakdown}</p>
      </DialogContent>
    </Dialog>
  );
}
