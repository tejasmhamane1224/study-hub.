import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, Loader, Book, Send, Target, 
  Clock, HelpCircle, ArrowRight, ArrowUpRight,
  Orbit, Layers, Zap, Sparkles, CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

// Defined OUTSIDE Dashboard component with CSS Custom Properties for ZERO re-renders on mousemove
const SpotlightCard = ({ children, className = "" }) => {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    cardRef.current.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    cardRef.current.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  return (
    <div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className={`relative overflow-hidden group ${className}`}
    >
      {/* HUD Crosshairs */}
      <div className="absolute top-2 left-2 text-[10px] text-white/20 font-mono pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity z-40">+</div>
      <div className="absolute top-2 right-2 text-[10px] text-white/20 font-mono pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity z-40">+</div>
      <div className="absolute bottom-2 left-2 text-[10px] text-white/20 font-mono pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity z-40">+</div>
      <div className="absolute bottom-2 right-2 text-[10px] text-white/20 font-mono pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity z-40">+</div>
      
      {/* HUD Data Accents */}
      <div className="absolute top-0 right-10 px-2 py-0.5 bg-white/5 border border-white/10 text-[8px] font-mono tracking-widest text-white/40 uppercase hidden sm:block z-40">
        SYS.RDY
      </div>

      <div
        className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30"
        style={{
          background: `radial-gradient(600px circle at var(--mouse-x, -500px) var(--mouse-y, -500px), rgba(255,255,255,0.06), transparent 40%)`,
        }}
      />
      {children}
    </div>
  );
};

const Dashboard = () => {
  const toast = useToast();
  const [stats, setStats] = useState({ totalSubjects: 0, totalChapters: 0, completedChapters: 0, completionPercentage: 0 });
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // New subject state
  const [newSubject, setNewSubject] = useState('');
  const [chapterCount, setChapterCount] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Completed pomodoro sessions from localStorage
  const completedPomodoros = parseInt(localStorage.getItem('pomodoro_completed_sessions') || '0', 10);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const statsRes = await api.get('/dashboard').catch(() => ({ data: { totalSubjects: 0, totalChapters: 0, completedChapters: 0, completionPercentage: 0 }}));
      setStats(statsRes.data);

      const subRes = await api.get('/subjects').catch(() => ({ data: [] }));
      setSubjects(subRes.data);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    if (!newSubject.trim() || !chapterCount) return;
    setIsCreating(true);
    try {
      await api.post('/subjects', { name: newSubject.trim(), chapterCount });
      toast.success(`Subject "${newSubject.trim()}" initialized with ${chapterCount} chapters!`, 'Mission Ready');
      setNewSubject('');
      setChapterCount('');
      loadDashboardData();
    } catch (err) {
      const msg = err.response?.data?.msg || err.response?.data?.message || err.message;
      toast.error(msg || 'Error creating subject', 'Initialization Failed');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="pb-12 max-w-7xl mx-auto">
      {/* Top Header & Fast Navigation Shortcuts */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Cosmic Station // Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Orbital Overview</span>
            <Sparkles size={18} className="text-cyan-400 animate-pulse hidden sm:inline" />
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Link 
            to="/planner" 
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-300 hover:text-white transition-all"
          >
            <Clock size={13} className="text-emerald-400" />
            <span>Focus & Pomodoro</span>
            <ArrowRight size={12} className="text-slate-500" />
          </Link>
          <Link 
            to="/how-to-use" 
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-300 hover:text-white transition-all"
          >
            <HelpCircle size={13} className="text-cyan-400" />
            <span>How to Use</span>
            <ArrowUpRight size={12} className="text-slate-500" />
          </Link>
        </div>
      </div>

      {/* Cosmic Telemetry Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Metric 1: Planetary Subjects */}
        <SpotlightCard className="stealth-card p-4 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400">Planetary Subjects</span>
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Orbit size={14} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">{subjects.length}</div>
          <p className="text-[11px] text-slate-500 mt-1 font-mono">Active knowledge domains</p>
        </SpotlightCard>

        {/* Metric 2: Chapters Explored */}
        <SpotlightCard className="stealth-card p-4 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400">Chapters Explored</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Layers size={14} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            {stats.completedChapters} <span className="text-xs text-slate-500 font-normal">/ {stats.totalChapters}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-mono">Completed research nodes</p>
        </SpotlightCard>

        {/* Metric 3: Orbit Completion */}
        <SpotlightCard className="stealth-card p-4 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400">Orbital Trajectory</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Target size={14} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">{stats.completionPercentage}%</div>
          <div className="h-1 w-full bg-black rounded-full overflow-hidden border border-white/10 mt-2">
            <div className="h-full bg-gradient-to-r from-cyan-400 to-indigo-400 transition-all duration-700" style={{ width: `${stats.completionPercentage}%` }}></div>
          </div>
        </SpotlightCard>

        {/* Metric 4: Focus Velocity */}
        <SpotlightCard className="stealth-card p-4 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400">Deep Focus</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Zap size={14} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">{completedPomodoros * 25}m</div>
          <p className="text-[11px] text-slate-500 mt-1 font-mono">{completedPomodoros} Focus intervals logged</p>
        </SpotlightCard>
      </div>

      <motion.div 
        initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
        className="grid grid-cols-1 md:grid-cols-12 gap-6"
      >
        
        {/* LEFT COLUMN: Subjects */}
        <motion.div className="md:col-span-6 flex flex-col gap-6" variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
          <SpotlightCard className="stealth-card p-6 h-full min-h-[420px] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-medium text-white tracking-tight">Active Subjects</h3>
              <span className="text-xs font-mono text-slate-500">{subjects.length} Total</span>
            </div>
            <div className="flex-1 flex flex-col gap-4 overflow-y-auto max-h-[340px] custom-scrollbar pr-1">
              {loading ? (
                <div className="flex-1 flex items-center justify-center"><Loader className="animate-spin text-slate-500" size={24}/></div>
              ) : subjects.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-sm gap-2">
                  <Book size={28} className="text-slate-600 mb-1" />
                  <span>No active subjects yet.</span>
                  <span className="text-xs text-slate-600">Create one below to start studying!</span>
                </div>
              ) : (
                subjects.map((sub) => {
                  const progress = sub.chapters ? Math.round((sub.chapters.filter(c => c.completed).length / Math.max(1, sub.chapters.length)) * 100) : 0;
                  return (
                    <Link key={sub._id} to={`/subject/${sub._id}`}>
                      <motion.div 
                        whileHover={{ scale: 1.015, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="stealth-card-inner p-4 hover:bg-white/[0.05] transition-all cursor-pointer rounded-xl border border-white/10 group/card"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex gap-3 items-center">
                            <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center border border-white/10 group-hover/card:border-cyan-400/40 group-hover/card:bg-cyan-400/10 transition-colors">
                              <Book size={18} className="text-slate-300 group-hover/card:text-cyan-300 transition-colors" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-slate-200 group-hover/card:text-white transition-colors">{sub.name}</h4>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-slate-500 font-mono">{sub.chapters?.length || 0} Chapters</span>
                                <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                                <span className={`text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.2 rounded ${
                                  progress === 100 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                  progress > 0 ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                                  'bg-white/5 text-slate-400 border border-white/5'
                                }`}>
                                  {progress === 100 ? 'Completed' : progress > 0 ? 'In Progress' : 'Pending'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-medium text-slate-400">{progress}%</span>
                            <ArrowRight size={14} className="text-slate-600 group-hover/card:text-white group-hover/card:translate-x-0.5 transition-all" />
                          </div>
                        </div>
                        <div className="h-1.5 w-full bg-black/60 rounded-full overflow-hidden border border-white/10">
                          <div 
                            className={`h-full transition-all duration-700 ${
                              progress === 100 ? 'bg-emerald-400' : 'bg-gradient-to-r from-cyan-400 to-white'
                            }`} 
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </motion.div>
                    </Link>
                  );
                })
              )}
            </div>
          </SpotlightCard>
        </motion.div>

        {/* RIGHT COLUMN: AI Tutor & Quick Actions */}
        <motion.div className="md:col-span-6 flex flex-col gap-6" variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
          <SpotlightCard className="stealth-card p-6 flex flex-col min-h-[420px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-medium text-white tracking-tight">General AI Tutor</h3>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">Always Available</span>
            </div>
            
            <Link to="/ai" className="block w-full">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-[#111] border border-white/10 rounded-2xl p-4 text-slate-400 flex justify-between items-center mb-6 hover:bg-[#161616] hover:border-white/20 transition-all cursor-pointer"
              >
                <span className="text-sm">Ask anything...</span>
                <Send size={16} className="text-slate-500" />
              </motion.div>
            </Link>

            <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase mb-3 block">Quick Actions</span>
            <div className="flex flex-col gap-2">
              {[
                { label: 'Generate Practice Quiz', path: '/ai' },
                { label: 'Summarize Lecture Notes', path: '/ai' },
                { label: 'Explain Complex Formulas & Concepts', path: '/ai' },
                { label: 'Launch 25-Min Pomodoro Session', path: '/planner' }
              ].map((action, i) => (
                <Link key={i} to={action.path}>
                  <div className="stealth-card-inner px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-white/[0.04] transition-all cursor-pointer rounded-xl border border-white/5 flex items-center justify-between">
                    <span>{action.label}</span>
                    <ArrowRight size={14} className="text-slate-600" />
                  </div>
                </Link>
              ))}
            </div>
          </SpotlightCard>
        </motion.div>

        {/* BOTTOM LEFT: Create Subject */}
        <motion.div className="md:col-span-8" variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
          <SpotlightCard className="stealth-card p-6">
            <h3 className="text-lg font-medium text-white tracking-tight mb-4">Create New Subject</h3>
            <form onSubmit={handleCreateSubject} className="flex flex-col sm:flex-row gap-4">
              <input 
                type="text" 
                placeholder="Subject Name (e.g. Algorithms, Thermodynamics)" 
                required
                autoComplete="off"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                className="stealth-input flex-1 py-3 px-4 rounded-xl text-sm"
              />
              <input 
                type="number" 
                placeholder="Chapters (e.g. 5)" 
                min="1" 
                required
                autoComplete="off"
                value={chapterCount}
                onChange={(e) => setChapterCount(e.target.value)}
                className="stealth-input w-full sm:w-36 py-3 px-4 rounded-xl text-sm"
              />
              <button 
                type="submit" 
                disabled={isCreating}
                className="btn-primary sm:w-auto px-6 py-3"
              >
                {isCreating ? <Loader className="animate-spin" size={18} /> : <><Plus size={18} /> Create</>}
              </button>
            </form>
          </SpotlightCard>
        </motion.div>

        {/* BOTTOM RIGHT: Goals */}
        <motion.div className="md:col-span-4" variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
          <SpotlightCard className="stealth-card p-6 h-full min-h-[140px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-white tracking-tight">Goals Progress</h3>
              <div className="px-2 py-1 bg-white/5 rounded text-xs font-mono text-slate-300 border border-white/10">
                <Target size={12} className="inline mr-1 text-white"/>
                {stats.completionPercentage}%
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex justify-between text-sm text-slate-400 mb-2">
                <span>Overall Completion</span>
                <span className="text-white font-mono">{stats.completedChapters} / {stats.totalChapters} Chapters</span>
              </div>
              <div className="h-2 w-full bg-[#111] rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-white transition-all duration-1000" style={{ width: `${stats.completionPercentage}%` }}></div>
              </div>
            </div>
          </SpotlightCard>
        </motion.div>

      </motion.div>
    </div>
  );
};

export default Dashboard;
