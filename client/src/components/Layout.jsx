import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, User, Menu, X, Sparkles } from 'lucide-react';
import Lenis from '@studio-freight/lenis';
import Scene3D from './Scene3D';
import BrunoSimonIntro from './BrunoSimonIntro';

const TopNav = ({ toggleMobileMenu, onReplayIntro }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/subjects', label: 'Subjects' },
    { path: '/ai', label: 'AI Tutor' },
    { path: '/planner', label: 'Focus' },
    { path: '/how-to-use', label: 'How to Use' }
  ];

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || {};
    } catch {
      return {};
    }
  })();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <header className="h-[64px] border-b border-white/[0.08] bg-black/75 backdrop-blur-xl flex items-center justify-between px-6 md:px-10 sticky top-0 z-40 transition-colors">
      <div className="flex items-center gap-8 lg:gap-12">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-white tracking-tighter">STUDY HUB</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-slate-400 border border-white/10 hidden md:block">
            COSMOS v2.5
          </span>
        </div>
        
        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
                            (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link 
                key={item.path}
                to={item.path}
                className={`relative px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {item.label}
                {isActive && (
                  <motion.div 
                    layoutId="nav-indicator"
                    className="absolute inset-0 bg-white/[0.08] rounded-full -z-10 border border-white/10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={onReplayIntro}
          className="text-xs font-mono px-3 py-1.5 rounded-full border border-white/10 hover:border-white/30 text-slate-400 hover:text-white flex items-center gap-1.5 transition-all bg-white/[0.02] cursor-pointer"
          title="Replay 3D Space Intro"
        >
          <Sparkles size={12} className="text-cyan-400 animate-pulse" />
          <span className="hidden sm:inline">SPACE INTRO</span>
        </button>

        <div className="w-[1px] h-4 bg-white/10 mx-1"></div>

        {/* User Pill & Sign out */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/10">
            <div className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300 text-[10px] font-mono font-bold uppercase">
              {user.name ? user.name.charAt(0) : 'S'}
            </div>
            <span className="text-xs font-mono text-slate-300 hidden lg:inline max-w-[120px] truncate">
              {user.name || 'Cosmic Student'}
            </span>
          </div>
          <button 
            onClick={handleLogout} 
            className="text-xs font-mono px-3 py-1.5 rounded-full bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-white/10 hover:border-rose-500/30 transition-all cursor-pointer"
            title="Sign out of station"
          >
            Exit
          </button>
        </div>

        <button onClick={toggleMobileMenu} className="md:hidden text-slate-400 hover:text-white ml-2 p-1 cursor-pointer">
          <Menu size={20} />
        </button>
      </div>
    </header>
  );
};

const MobileNav = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const navItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/subjects', label: 'Subjects' },
    { path: '/ai', label: 'AI Tutor' },
    { path: '/planner', label: 'Focus' },
    { path: '/how-to-use', label: 'How to Use' }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 md:hidden"
          />
          <motion.div 
            initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}
            className="fixed top-0 left-0 right-0 bg-[#0A0A0A] border-b border-white/10 p-6 z-50 flex flex-col gap-4 md:hidden"
          >
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-bold text-white tracking-tighter">STUDY HUB</span>
              <button onClick={() => setIsOpen(false)} className="text-slate-400"><X size={24} /></button>
            </div>
            {navItems.map((item) => (
              <Link 
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`text-lg font-medium py-2 border-b border-white/5 ${
                  location.pathname === item.path ? 'text-white' : 'text-slate-400'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// 3D Intro handled in Scene3D now

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Remember if intro was seen in this session so user isn't interrupted on page reloads
  const [showIntro, setShowIntro] = useState(() => {
    try {
      return !sessionStorage.getItem('study_hub_intro_seen');
    } catch {
      return false;
    }
  });
  const [isEntering, setIsEntering] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    if (showIntro) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [showIntro]);

  const handleEngage = () => {
    setIsEntering(true);
  };

  const handleStart = () => {
    setShowIntro(false);
    setIsEntering(false);
    try {
      sessionStorage.setItem('study_hub_intro_seen', 'true');
    } catch {
      // Storage error handling
    }
  };

  useEffect(() => {
    if (showIntro) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [showIntro]);

  return (
    <div className="min-h-screen text-slate-100 font-sans relative">
      <AnimatePresence>
        {showIntro && (
          <BrunoSimonIntro onEngage={handleEngage} onStart={handleStart} />
        )}
      </AnimatePresence>

      <Scene3D showIntro={showIntro} isEntering={isEntering} variant="workspace" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`relative z-10 flex flex-col min-h-screen ${showIntro ? 'pointer-events-none' : ''}`}
      >
        <TopNav 
          toggleMobileMenu={() => setMobileMenuOpen(true)} 
          onReplayIntro={() => setShowIntro(true)} 
        />
        <MobileNav isOpen={mobileMenuOpen} setIsOpen={setMobileMenuOpen} />
        
        <main className="flex-1 w-full max-w-[1400px] mx-auto p-6 md:p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </motion.div>
    </div>
  );
};

export default Layout;

