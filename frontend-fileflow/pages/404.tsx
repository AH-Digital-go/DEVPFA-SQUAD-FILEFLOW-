'use client';

import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import Link from 'next/link';
import { Home, ArrowLeft, FileQuestion } from 'lucide-react';

const NotFoundPage = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const numbersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (numbersRef.current) {
      // Animate the 404 numbers
      gsap.fromTo(
        numbersRef.current,
        { scale: 0.5, opacity: 0, rotationY: 180 },
        { 
          scale: 1, 
          opacity: 1, 
          rotationY: 0, 
          duration: 1.2, 
          ease: 'back.out(1.7)' 
        }
      );

      // Add floating animation to the numbers
      gsap.to(numbersRef.current, {
        y: -10,
        duration: 3,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      });
    }

    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current.children,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.2,
          ease: 'power2.out',
          delay: 0.5,
        }
      );
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center max-w-2xl mx-auto"
      >
        {/* 404 Numbers */}
        <div
          ref={numbersRef}
          className="text-[12rem] md:text-[16rem] font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent leading-none mb-8"
        >
          404
        </div>

        {/* Content */}
        <div ref={containerRef} className="space-y-6">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-100 rounded-full mb-6">
              <FileQuestion className="w-12 h-12 text-blue-600" />
            </div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-5xl font-bold text-slate-900 mb-4"
            >
              Page introuvable
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-lg text-slate-600 max-w-md mx-auto"
            >
              Oups ! La page que vous cherchez semble avoir disparu dans les nuages.
            </motion.p>
          </div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/dashboard">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300"
              >
                <Home className="w-5 h-5" />
                <span>Retour à l&apos;accueil</span>
              </motion.button>
            </Link>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.history.back()}
              className="flex items-center space-x-2 bg-white text-slate-700 px-8 py-4 rounded-xl font-semibold shadow-md hover:shadow-lg border border-slate-200 hover:border-slate-300 transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Page précédente</span>
            </motion.button>
          </motion.div>

          {/* Fun Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.8, ease: 'backOut' }}
            className="mt-12"
          >
            <div className="relative">
              {/* Floating elements */}
              <div className="absolute -top-4 -left-4 w-6 h-6 bg-blue-400 rounded-full animate-pulse opacity-60" />
              <div className="absolute -top-8 right-8 w-4 h-4 bg-indigo-400 rounded-full animate-pulse opacity-40" />
              <div className="absolute -bottom-2 left-8 w-3 h-3 bg-purple-400 rounded-full animate-pulse opacity-50" />
              
              <p className="text-sm text-slate-500 italic">
                &quot;Même les meilleurs explorateurs se perdent parfois...&quot; 🧭
              </p>
            </div>
          </motion.div>
        </div>

        {/* Background Decorations */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-20 left-20 w-32 h-32 bg-blue-200 rounded-full opacity-20 animate-pulse" />
          <div className="absolute bottom-32 right-16 w-24 h-24 bg-indigo-200 rounded-full opacity-30 animate-pulse" />
          <div className="absolute top-1/2 left-10 w-16 h-16 bg-purple-200 rounded-full opacity-25 animate-pulse" />
          <div className="absolute bottom-20 left-1/3 w-20 h-20 bg-blue-300 rounded-full opacity-20 animate-pulse" />
        </div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;