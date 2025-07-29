'use client';
import { useMemo } from 'react';
import { useQuery } from '../../src/lib/useQuery';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChartWrapper } from "@/components/ui/chart-wrapper";
import { CreativeSheet } from "@/components/ui/creative-sheet";
import type { Creative } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Cluster {
  id: number;
  name: string;
  creatives: Creative[];
  avgImpressions: number;
  avgCTR: number;
  avgSpend: number;
}

export default function ClustersPage() {
  const { data: creatives, loading } = useQuery('SELECT * FROM v_creatives {{WHERE}}');

  const clusters: Cluster[] = useMemo(() => {
    if (creatives.length === 0) return [];

    const groupedByCluster = creatives.reduce((acc, creative: Creative) => {
      const clusterId = creative.cluster_id;
      if (!acc[clusterId]) {
        acc[clusterId] = [];
      }
      acc[clusterId].push(creative);
      return acc;
    }, {} as Record<number, Creative[]>);

    return Object.entries(groupedByCluster).map(([id, clusterCreatives]) => {
      const numCreatives = clusterCreatives.length;
      return {
        id: Number(id),
        name: `Cluster ${id}`,
        creatives: clusterCreatives,
        avgImpressions: clusterCreatives.reduce((sum, c) => sum + Number(c.IMPRESSIONS), 0) / numCreatives,
        avgCTR: clusterCreatives.reduce((sum, c) => sum + Number(c.CTR_pct), 0) / numCreatives,
        avgSpend: clusterCreatives.reduce((sum, c) => sum + Number(c.SPEND), 0) / numCreatives,
      };
    });
  }, [creatives]);

  const handleCreativeClick = (creative: Creative) => {
    console.log("Selected creative:", creative);
  };

  const getClusterDistributionOption = () => ({
    title: { text: "Cluster Distribution", textStyle: { color: "#fff" } },
    tooltip: { trigger: "item", formatter: "{a} <br/>{b}: {c} ({d}%)" },
    series: [{
      name: "Creatives",
      type: "pie",
      radius: "50%",
      data: clusters.map((cluster) => ({
        value: cluster.creatives.length,
        name: cluster.name,
      })),
    }],
  });

  const getClusterPerformanceOption = (metric: 'avgImpressions' | 'avgCTR' | 'avgSpend') => ({
    title: { text: `Average ${metric.replace('avg', '')} by Cluster`, textStyle: { color: "#fff" } },
    xAxis: { type: 'category', data: clusters.map(c => c.name), axisLabel: { color: "#fff" } },
    yAxis: { type: 'value', axisLabel: { color: "#fff" } },
    series: [{ type: 'bar', data: clusters.map(c => c[metric]) }],
  });

  if (loading) return <div className="p-4">Loading clusters...</div>

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold tech-font">Creative Clusters</h1>
        <p className="text-muted-foreground">Analyze groups of similar creatives based on performance</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Cluster Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartWrapper option={getClusterDistributionOption()} height={300} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Cluster Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="avgImpressions">
              <TabsList>
                <TabsTrigger value="avgImpressions">Impressions</TabsTrigger>
                <TabsTrigger value="avgCTR">CTR</TabsTrigger>
                <TabsTrigger value="avgSpend">Spend</TabsTrigger>
              </TabsList>
              <TabsContent value="avgImpressions">
                <ChartWrapper option={getClusterPerformanceOption('avgImpressions')} height={300} />
              </TabsContent>
              <TabsContent value="avgCTR">
                <ChartWrapper option={getClusterPerformanceOption('avgCTR')} height={300} />
              </TabsContent>
              <TabsContent value="avgSpend">
                <ChartWrapper option={getClusterPerformanceOption('avgSpend')} height={300} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      <div>
        <h2 className="text-2xl font-semibold mb-4">Explore Clusters</h2>
        {clusters.map((cluster) => (
          <div key={cluster.id} className="mb-8">
            <h3 className="text-xl font-bold mb-2">{cluster.name}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {cluster.creatives.slice(0, 6).map(creative => (
                <Card key={creative["Ad Name"]} onClick={() => handleCreativeClick(creative)} className="cursor-pointer">
                  <CardContent className="p-2">
                    <p className="text-xs font-medium line-clamp-2">{creative["Ad Name"]}</p>
                    <Badge variant="secondary" className="mt-2">
                      {creative.IMPRESSIONS.toLocaleString()} Imp
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
      <CreativeSheet />
    </div>
  );
}
