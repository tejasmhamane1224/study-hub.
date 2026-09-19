import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play } from 'lucide-react';

const BrunoSimonIntro = ({ onStart, onEngage }) => {
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Fast, crisp asset loading simulation
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setIsReady(true);
          return 100;
        }
        const jump = Math.floor(Math.random() * 12) + 8;
        return Math.min(100, prev + jump);
      });
    }, 35);

    return () => clearInterval(timer);
  }, []);

  const handleStart = () => {
    setIsExiting(true);
    if (onEngage) onEngage();
    setTimeout(() => {
      onStart();
    }, 800);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.code === 'Space' || e.code === 'Enter') && isReady) {
        handleStart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isReady]);

  return (
    <div className="fixed inset-0 z-[999] overflow-hidden pointer-events-auto flex items-center justify-center">
      {/* Top and Bottom Curtains for the Bruno Simon Theatrical Split */}
      <motion.div 
        className="absolute top-0 left-0 right-0 h-1/2 bg-[#000000] border-b border-white/[0.08]"
        initial={{ y: 0 }}
        animate={{ y: isExiting ? '-100%' : '0%' }}
        transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
      />
      <motion.div 
        className="absolute bottom-0 left-0 right-0 h-1/2 bg-[#000000] border-t border-white/[0.08]"
        initial={{ y: 0 }}
        animate={{ y: isExiting ? '100%' : '0%' }}
        transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
      />

      {/* Grid Pattern Overlay */}
      <motion.div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none"
        initial={{ opacity: 0.6 }}
        animate={{ opacity: isExiting ? 0 : 0.6 }}
        transition={{ duration: 0.4 }}
      />

      {/* Center Interactive Portal Card (Bruno Simon Style) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ 
          opacity: isExiting ? 0 : 1, 
          scale: isExiting ? 1.15 : 1,
          filter: isExiting ? 'blur(20px)' : 'blur(0px)'
        }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-lg mx-6 p-8 md:p-12 bg-black/90 border border-white/10 rounded-2xl shadow-[0_0_80px_rgba(0,0,0,0.9)] backdrop-blur-xl flex flex-col items-center text-center"
      >
        {/* Top Technical Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono tracking-widest text-slate-400 uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>STUDY HUB // WEBGL CORE</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-2">
          STUDY HUB
        </h1>
        <p className="text-xs font-mono tracking-[0.2em] text-slate-400 uppercase mb-8">
          Interactive 3D Workspace
        </p>

        {/* State 1: Progress Loader */}
        <AnimatePresence mode="wait">
          {!isReady ? (
            <motion.div 
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full flex flex-col items-center gap-3"
            >
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-white"
                  style={{ width: `${progress}%` }}
                  transition={{ ease: "easeOut", duration: 0.1 }}
                />
              </div>
              <div className="w-full flex justify-between text-xs font-mono text-slate-500">
                <span>INITIALIZING ENGINE</span>
                <span className="text-white font-bold">{progress}%</span>
              </div>
            </motion.div>
          ) : (
            /* State 2: Bruno Simon "START" Action Gate */
            <motion.div 
              key="start-btn"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="w-full flex flex-col items-center gap-4"
            >
              <button
                onClick={handleStart}
                className="group relative w-full py-4 px-8 bg-white text-black font-black text-sm tracking-[0.2em] uppercase rounded-xl hover:bg-slate-200 active:scale-95 transition-all duration-300 flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(255,255,255,0.25)] cursor-pointer"
              >
                <Play size={16} className="fill-black group-hover:translate-x-0.5 transition-transform" />
                <span>ENTER EXPERIENCE</span>
              </button>
              
              <div className="flex items-center gap-4 text-[10px] font-mono text-slate-500 tracking-wider">
                <span>60 FPS LOCKED</span>
                <span>•</span>
                <span>WEBGL ACTIVE</span>
                <span>•</span>
                <span>CLICK TO ENTER</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default BrunoSimonIntro;
