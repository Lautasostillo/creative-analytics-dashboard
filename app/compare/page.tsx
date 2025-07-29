'use client';
import { useEffect, useState, useMemo } from 'react';
import { query } from '../../src/lib/duckdb-client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChartWrapper } from "@/components/ui/chart-wrapper";
import type { Creative } from "@/lib/types";
import { Plus, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef } from "@tanstack/react-table";

export default function ComparePage() {
  const [creatives, setCreatives] = useState<Creative[]>([]);
  const [selectedCreatives, setSelectedCreatives] = useState<Creative[]>([]);
  const [isSelectDialogOpen, setIsSelectDialogOpen] = useState(false);

  useEffect(() => {
    query('SELECT * FROM v_creatives').then((rows: any) => setCreatives(rows));
  }, []);

  const addCreative = (creative: Creative) => {
    if (selectedCreatives.length < 4 && !selectedCreatives.find((c) => c["Ad Name"] === creative["Ad Name"])) {
      setSelectedCreatives([...selectedCreatives, creative]);
      setIsSelectDialogOpen(false);
    }
  };

  const removeCreative = (adName: string) => {
    setSelectedCreatives(selectedCreatives.filter((c) => c["Ad Name"] !== adName));
  };

  const columns: ColumnDef<Creative>[] = useMemo(() => [
    {
      accessorKey: "Ad Name",
      header: "Ad Name",
    },
    {
      accessorKey: "cluster_id",
      header: "Cluster",
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button
          size="sm"
          onClick={() => addCreative(row.original)}
          disabled={selectedCreatives.length >= 4 || selectedCreatives.some((c) => c["Ad Name"] === row.original["Ad Name"])}
        >
          Add
        </Button>
      ),
    },
  ], [selectedCreatives]);

  const getComparisonChartOption = () => {
    const metrics = ["IMPRESSIONS", "CLICKS", "SPEND", "CTR_pct"];
    const series = selectedCreatives.map((creative, index) => ({
      name: creative["Ad Name"],
      type: "bar",
      data: metrics.map((metric) => creative[metric as keyof Creative] as number),
      itemStyle: {
        color: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"][index],
      },
    }));

    return {
      title: {
        text: "Performance Comparison",
        textStyle: { color: "#fff" },
      },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
      },
      legend: {
        data: selectedCreatives.map((c) => c["Ad Name"]),
        textStyle: { color: "#fff" },
      },
      xAxis: {
        type: "category",
        data: metrics,
        axisLabel: { color: "#fff" },
      },
      yAxis: {
        type: "value",
        axisLabel: { color: "#fff" },
      },
      series,
    };
  };

  if (creatives.length === 0) return <div className="p-4">Loading creatives...</div>

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold tech-font">Compare</h1>
        <p className="text-muted-foreground">Compare performance across multiple creatives</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) =>
          selectedCreatives[index] ? (
            <Card key={selectedCreatives[index]["Ad Name"]} className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6"
                onClick={() => removeCreative(selectedCreatives[index]["Ad Name"])}
              >
                <X className="h-4 w-4" />
              </Button>
              <CardHeader>
                <CardTitle className="text-sm line-clamp-2">{selectedCreatives[index]["Ad Name"]}</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge>Cluster {selectedCreatives[index].cluster_id}</Badge>
              </CardContent>
            </Card>
          ) : (
            <Dialog key={index} open={isSelectDialogOpen} onOpenChange={setIsSelectDialogOpen}>
              <DialogTrigger asChild>
                <Card className="flex items-center justify-center border-2 border-dashed h-48 cursor-pointer">
                  <div className="text-center">
                    <Plus className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Add Creative</p>
                  </div>
                </Card>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Select a Creative to Compare</DialogTitle>
                </DialogHeader>
                <DataTable columns={columns} data={creatives} />
              </DialogContent>
            </Dialog>
          )
        )}
      </div>
      {selectedCreatives.length >= 2 ? (
        <ChartWrapper option={getComparisonChartOption()} height={400} />
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Add at least 2 creatives to begin comparison</p>
        </div>
      )}
    </div>
  );
}
