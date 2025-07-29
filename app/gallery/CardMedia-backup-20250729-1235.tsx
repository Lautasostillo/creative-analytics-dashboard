'use client';
import Image from 'next/image';
import { useState } from 'react';

export default function CardMedia({ creative }: { creative: any }) {
  const [err, setErr] = useState(false);
  
  // Safe URL construction with validation
  const raw = creative.S3PATH_SCF ?? creative.NAME_SCF ?? '';
  
  // Early return if no valid path
  if (!raw || raw.trim() === '') {
    return (
      <div className="flex items-center justify-center w-full aspect-video bg-neutral-800 text-xs text-neutral-400 rounded">
        no media
      </div>
    );
  }
  
  let src = '';
  try {
    // Safe URL construction
    if (raw.startsWith('http://') || raw.startsWith('https://')) {
      src = raw;
    } else {
      // Clean path and construct URL
      const cleanPath = raw.replace(/^\/+/, '');
      if (cleanPath) {
        src = `https://${cleanPath}`;
      }
    }
    
    // Validate URL before using
    new URL(src);
  } catch (e) {
    return (
      <div className="flex items-center justify-center w-full aspect-video bg-neutral-800 text-xs text-neutral-400 rounded">
        invalid url
      </div>
    );
  }

  const isVideo = /\.(mp4|mov|webm)$/i.test(src);

  if (err) {
    return (
      <div className="flex items-center justify-center w-full aspect-video bg-neutral-800 text-xs text-neutral-400 rounded">
        failed to load
      </div>
    );
  }

  return isVideo ? (
    <video
      src={src}
      muted
      loop
      playsInline
      controls
      preload="metadata"
      className="w-full h-full object-cover rounded"
      onError={() => setErr(true)}
    />
  ) : (
    <div className="relative w-full aspect-video">
      <Image
        src={src}
        alt={creative.NAME_SCF ?? 'creative'}
        fill
        sizes="(max-width:768px) 100vw, 33vw"
        className="object-cover rounded"
        onError={() => setErr(true)}
        unoptimized
      />
    </div>
  );
}
