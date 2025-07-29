'use client';
import Image from 'next/image';
import { useState, useRef } from 'react';
import { Play, Pause } from 'lucide-react';
import { VideoModal } from './VideoModal';

export default function CardMedia({ creative, showPlayButton = true }: { creative: any, showPlayButton?: boolean }) {
  const [err, setErr] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Safe URL construction with validation
  const raw = creative.S3PATH_SCF ?? creative.NAME_SCF ?? '';
  const adName = creative["Ad Name"] || "Unknown";
  
  // Early return if no valid path
  if (!raw || raw.trim() === '') {
    return (
      <div className="flex items-center justify-center w-full aspect-video bg-gradient-to-br from-slate-800 to-slate-700 text-xs text-slate-400 rounded-lg border-2 border-dashed border-slate-600">
        <div className="text-center">
          <div className="text-2xl mb-2">🎬</div>
          <div>No Media</div>
        </div>
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
      <div className="flex items-center justify-center w-full aspect-video bg-gradient-to-br from-red-900/20 to-red-800/20 text-xs text-red-400 rounded-lg border border-red-500/30">
        <div className="text-center">
          <div className="text-2xl mb-2">⚠️</div>
          <div>Invalid URL</div>
        </div>
      </div>
    );
  }

  const isVideo = /\.(mp4|mov|webm)$/i.test(src);

  const handleVideoToggle = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    if (!isVideo) return;
    
    // Open video in modal instead of playing inline
    setShowVideoModal(true);
  };

  const handleVideoLoad = () => {
    setVideoLoaded(true);
    setErr(false);
  };

  const handleVideoError = (e: any) => {
    setErr(true);
    setVideoLoaded(false);
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
  };

  // Enhanced fallback for failed videos
  const VideoFallback = () => (
    <div 
      className="relative w-full aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-slate-800 to-slate-700 cursor-pointer group"
      onClick={handleVideoToggle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
        <div className="text-4xl mb-2">🎬</div>
        <div className="text-white text-sm font-medium mb-1">
          {creative["Ad Name"] ? creative["Ad Name"].substring(0, 30) + '...' : 'Video Content'}
        </div>
        <div className="text-slate-400 text-xs mb-2">
          {isVideo ? 'Click to play in modal' : 'Media unavailable'}
        </div>
        <div className="text-slate-500 text-xs">
          {creative.LENGTH || 'Duration unknown'}
        </div>
      </div>
      
      {/* Play button overlay */}
      {isVideo && showPlayButton && (
        <div className={`absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity duration-200 ${
          isHovered ? 'opacity-100' : 'opacity-60'
        }`}>
          <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg hover:bg-white transition-colors">
            <Play className="h-6 w-6 text-slate-900 ml-1" />
          </div>
        </div>
      )}
      
      {/* Video modal still works */}
      {isVideo && (
        <VideoModal
          isOpen={showVideoModal}
          onClose={() => setShowVideoModal(false)}
          videoSrc={src}
          title={creative["Ad Name"] || creative.NAME_SCF || 'Creative Video'}
        />
      )}
    </div>
  );

  if (err) {
    return <VideoFallback />;
  }

  return (
    <>
      <div 
        className="relative w-full aspect-video rounded-lg overflow-hidden bg-slate-900 group cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {isVideo ? (
          <>
            {/* Video thumbnail - show first frame */}
            <video
              ref={videoRef}
              src={src}
              muted
              preload="metadata"
              playsInline
              className="w-full h-full object-cover"
              onError={handleVideoError}
              onLoadedMetadata={() => {
                // Set to a small time to show first frame
                if (videoRef.current) {
                  videoRef.current.currentTime = 0.1;
                }
                handleVideoLoad();
              }}
            />
            
            {showPlayButton && (
              <div 
                className={`absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity duration-200 ${
                  isHovered ? 'opacity-100' : 'opacity-60'
                }`}
                onClick={handleVideoToggle}
              >
                <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg hover:bg-white transition-colors">
                  <Play className="h-6 w-6 text-slate-900 ml-1" />
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <Image
              src={src}
              alt={creative.NAME_SCF ?? creative["Ad Name"] ?? 'Creative'}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
              onError={() => setErr(true)}
              unoptimized
            />
            {showPlayButton && (
              <div className={`absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity duration-200 ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}>
                <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg hover:bg-white transition-colors">
                  <Play className="h-6 w-6 text-slate-900 ml-1" />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Video Modal */}
      {isVideo && (
        <VideoModal
          isOpen={showVideoModal}
          onClose={() => setShowVideoModal(false)}
          videoSrc={src}
          title={creative["Ad Name"] || creative.NAME_SCF || 'Creative Video'}
        />
      )}
    </>
  );
}