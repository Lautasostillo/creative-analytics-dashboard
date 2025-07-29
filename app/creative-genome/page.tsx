"use client"

import CreativeGenome from "@/components/genome/CreativeGenome";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const qc = new QueryClient();

export default function CreativeGenomePage() {
  return (
    <QueryClientProvider client={qc}>
      <div className="h-full flex flex-col p-6">
        <h1 className="text-2xl font-bold mb-6 shrink-0">Creative Genome</h1>
        <div className="flex-1 min-h-0">
          <CreativeGenome />
        </div>
      </div>
    </QueryClientProvider>
  );
}