'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const AnimatedLoader = () => {
  const loaderRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (loaderRef.current) {
      // Animate the main loader
      gsap.to(loaderRef.current, {
        rotation: 360,
        duration: 2,
        ease: 'none',
        repeat: -1,
      });

      // Animate individual dots
      dotsRef.current.forEach((dot, index) => {
        if (dot) {
          gsap.to(dot, {
            scale: 1.5,
            duration: 0.6,
            ease: 'power2.inOut',
            repeat: -1,
            yoyo: true,
            delay: index * 0.2,
          });
        }
      });
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div
        ref={loaderRef}
        className="relative w-16 h-16 border-4 border-slate-200 border-t-blue-600 rounded-full"
      >
        <div className="absolute inset-2 border-2 border-slate-100 border-t-indigo-500 rounded-full animate-pulse" />
      </div>
      
      <div className="flex space-x-2">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            ref={(el) => (dotsRef.current[index] = el as HTMLDivElement)}
            className="w-2 h-2 bg-blue-600 rounded-full"
          />
        ))}
      </div>
      
      <p className="text-sm text-slate-600 animate-pulse">Chargement...</p>
    </div>
  );
};

export default AnimatedLoader;