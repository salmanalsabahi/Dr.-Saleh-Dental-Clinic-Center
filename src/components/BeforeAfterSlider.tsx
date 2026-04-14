import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  title: string;
  description: string;
  key?: string;
}

export function BeforeAfterSlider({ beforeImage, afterImage, title, description }: BeforeAfterSliderProps) {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setSliderPos((x / rect.width) * 100);
  };

  const onMouseMove = (e: React.MouseEvent) => handleMove(e.clientX);
  const onTouchMove = (e: React.TouchEvent) => handleMove(e.touches[0].clientX);

  return (
    <div className="flex flex-col gap-6">
      <div 
        ref={containerRef}
        className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden cursor-ew-resize select-none shadow-xl border border-slate-200"
        onMouseMove={onMouseMove}
        onTouchMove={onTouchMove}
      >
        {/* After Image (Background) */}
        <img 
          src={afterImage} 
          alt="After" 
          className="absolute inset-0 w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />

        {/* Before Image (Foreground with Clip) */}
        <div 
          className="absolute inset-0 w-full h-full overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
        >
          <img 
            src={beforeImage} 
            alt="Before" 
            className="absolute inset-0 w-full h-full object-cover grayscale-[0.3] brightness-90"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Slider Handle */}
        <div 
          className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.3)] z-10"
          style={{ left: `${sliderPos}%` }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-primary-500">
            <div className="flex gap-1">
              <div className="w-1 h-4 bg-primary-200 rounded-full" />
              <div className="w-1 h-4 bg-primary-500 rounded-full" />
              <div className="w-1 h-4 bg-primary-200 rounded-full" />
            </div>
          </div>
        </div>

        {/* Labels */}
        <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold z-20">
          قبل
        </div>
        <div className="absolute bottom-4 right-4 bg-primary-600/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold z-20">
          بعد
        </div>
      </div>

      <div className="text-center">
        <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-slate-600 text-sm">{description}</p>
      </div>
    </div>
  );
}
