"use client"

import { useRealCreativeData } from '@/hooks/useRealCreativeData';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Target, X } from "lucide-react";

interface GenomeModalProps {
  selectedKey: string;
  onClose?: () => void;
}

export default function GenomeModal({ selectedKey, onClose }: GenomeModalProps) {
  const { data: creativesData } = useRealCreativeData();
  
  // Find the specific creative by ID
  const selectedCreative = creativesData?.find(creative => 
    creative.GRID_KEY === selectedKey || creative["Ad Name"] === selectedKey
  );

  if (!selectedCreative) return null;

  const ctr = parseFloat(String(selectedCreative.CTR || '0')) * 100;
  const spend = parseFloat(String(selectedCreative.SPEND || '0'));
  const clicks = parseInt(String(selectedCreative.CLICKS || '0'));
  const cpc = parseFloat(String(selectedCreative.CPC || '0'));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background border rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">Creative Deep Dive</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Creative Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-400" />
                {selectedCreative["Ad Name"] || "Creative Analysis"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Creative DNA</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tone:</span>
                      <Badge variant="outline">{selectedCreative.TONE || 'Unknown'}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Persona:</span>
                      <Badge variant="outline">{selectedCreative.PERSONA || 'Unknown'}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Style:</span>
                      <Badge variant="outline">{selectedCreative.STYLE || 'Unknown'}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <Badge variant="outline">{selectedCreative.TYPE || 'Unknown'}</Badge>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Performance Metrics</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-green-400">{ctr.toFixed(2)}%</div>
                      <div className="text-sm text-muted-foreground">CTR</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold">${cpc.toFixed(2)}</div>
                      <div className="text-sm text-muted-foreground">CPC</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold">${spend.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Spend</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold">{clicks.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Clicks</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Strategic Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Strategic Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-500/20">
                  <h5 className="font-semibold text-blue-400 mb-2">Performance Assessment</h5>
                  <p className="text-sm">
                    {ctr >= 1.0 ? "🚀 Elite performer - This creative is significantly outperforming average benchmarks" :
                     ctr >= 0.6 ? "💪 Strong performer - Above average performance with room for scaling" :
                     ctr >= 0.3 ? "📊 Standard performer - Meeting baseline expectations" :
                     "⚠️ Needs attention - Performance below optimal thresholds"}
                  </p>
                </div>
                
                <div className="p-4 bg-green-900/20 rounded-lg border border-green-500/20">
                  <h5 className="font-semibold text-green-400 mb-2">Strategic Recommendation</h5>
                  <p className="text-sm">
                    {ctr >= 1.0 && spend < 5000 ? "Scale investment - High CTR with efficient spend suggests strong scaling potential" :
                     ctr >= 0.6 ? "Test variations - Good performance indicates successful creative elements worth iterating" :
                     ctr < 0.3 && spend > 3000 ? "Consider pausing - Low efficiency with high spend suggests budget reallocation needed" :
                     "Optimize elements - Standard performance suggests testing creative variations"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
