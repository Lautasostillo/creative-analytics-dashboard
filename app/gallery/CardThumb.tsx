'use client';
import Image from 'next/image';

export default function CardThumb({ creative }: { creative: any }) {
  const src = creative.S3PATH_SCF
     ? creative.S3PATH_SCF
     : `https://your-s3-bucket.s3.amazonaws.com/${creative.NAME_SCF}`;
     
  return (
    <div className="relative w-full aspect-video bg-neutral-800 rounded">
      {src ? (
        <Image
          src={src}
          alt={creative.NAME_SCF ?? 'creative'}
          fill
          className="object-cover rounded"
        />
      ) : (
        <div className="flex items-center justify-center h-full text-xs text-neutral-400">
          no thumbnail
        </div>
      )}
    </div>
  );
}
