import React from 'react';
import { motion } from 'framer-motion';

export default function LoadingScreen({ logoUrl }: { logoUrl?: string }) {
  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
      className="fixed inset-0 z-[999] flex items-center justify-center bg-[#F9F6F1]"
    >
      <div className="relative flex flex-col items-center">
        {/* Logo Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ 
            duration: 1.2, 
            ease: [0.23, 1, 0.32, 1],
            delay: 0.2
          }}
          className="relative"
        >
          {logoUrl ? (
            <img src={logoUrl} alt="Satvastones" className="h-16 md:h-24 w-auto object-contain" />
          ) : (
            <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tighter text-[#3D2B24]">
              SATVASTONES.
            </h1>
          )}
          
          {/* Elegant Shimmer Effect */}
          <motion.div 
            initial={{ left: '-100%' }}
            animate={{ left: '200%' }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "linear",
              repeatDelay: 0.5
            }}
            className="absolute top-0 bottom-0 w-20 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg]"
          />
        </motion.div>

        {/* Minimalist Progress Line */}
        <div className="mt-12 w-48 h-[1px] bg-stone-200 overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ 
              duration: 2.5, 
              ease: [0.23, 1, 0.32, 1] 
            }}
            className="h-full bg-[#3D2B24]"
          />
        </div>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-4 text-[9px] font-bold uppercase tracking-[0.4em] text-stone-400"
        >
          Crafting Your Vibe
        </motion.p>
      </div>
    </motion.div>
  );
}
