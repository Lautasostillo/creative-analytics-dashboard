"use client"

import { useQuery } from '@tanstack/react-query';

interface GenomeModalProps {
  selectedKey: string;
}

export default function GenomeModal({ selectedKey }: GenomeModalProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['gridCell', selectedKey],
    queryFn: () => fetch(`/api/genome/grid/${selectedKey}`).then(r => r.json()),
    enabled: !!selectedKey
  });

  if (isLoading) return <div>Loading...</div>;
  if (!data) return null;

  return (
    <div>
      <h2>Details for {selectedKey}</h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
