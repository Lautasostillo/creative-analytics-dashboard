'use client';
import { useState } from 'react';
import { useQuery } from '../../src/lib/useQuery';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Creative } from "@/lib/types";
import { Search, Grid, List } from "lucide-react";
import CardMedia from './CardMedia';
import CreativeSheet from '../../components/creative/creative-sheet';

export default function GalleryPage() {
  const { data: creatives, loading } = useQuery('SELECT * FROM v_creatives {{WHERE}}');
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCreative, setSelectedCreative] = useState<Creative | null>(null);

  const filteredCreatives = creatives.filter((creative) =>
    creative["Ad Name"].toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreativeClick = (creative: Creative) => {
    setSelectedCreative(creative);
  };

  const CreativeCard = ({ creative }: { creative: Creative }) => (
    <Card
      className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
      onClick={() => handleCreativeClick(creative)}
    >
      <CardContent className="p-4">
        <CardMedia creative={creative} />
        <div className="space-y-2 mt-4">
          <h3 className="font-semibold text-sm line-clamp-1">{creative["Ad Name"]}</h3>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs capitalize">
              Cluster {creative.cluster_id}
            </Badge>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{creative.IMPRESSIONS.toLocaleString()} views</span>
            <span>{creative.CTR_pct.toFixed(1)}% CTR</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) return <div className="p-4">Loading creatives...</div>

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold tech-font">Gallery</h1>
        <p className="text-muted-foreground">Visual overview of all your creative assets</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search creatives..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('grid')}>
            <Grid className="h-5 w-5" />
          </Button>
          <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('list')}>
            <List className="h-5 w-5" />
          </Button>
        </div>
      </div>
      {filteredCreatives.length > 0 ? (
        <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'}`}>
          {filteredCreatives.map((creative, index) => (
            <CreativeCard key={index} creative={creative} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No creatives found.</p>
        </div>
      )}
      <CreativeSheet
        open={!!selectedCreative}
        onOpenChange={() => setSelectedCreative(null)}
        creative={selectedCreative}
      />
    </div>
  );
}