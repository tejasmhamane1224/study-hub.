import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Pause, Plus, Loader, Book, Send, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({ totalSubjects: 0, totalChapters: 0, completedChapters: 0, completionPercentage: 0 });
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Timer state
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);

  // New subject state
  const [newSubject, setNewSubject] = useState('');
  const [chapterCount, setChapterCount] = useState('');
  const [isCreating, setIsCreating] = useState(false);

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

  useEffect(() => {
    let interval = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      alert("Pomodoro session complete! Take a break.");
      setTimeLeft(25 * 60);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    if (!newSubject || !chapterCount) return;
    setIsCreating(true);
    try {
      await api.post('/subjects', { name: newSubject, chapterCount });
      setNewSubject('');
      setChapterCount('');
      loadDashboardData();
    } catch (err) {
      alert(err.message || 'Error creating subject');
    } finally {
      setIsCreating(false);
    }
  };

  const toggleTimer = () => setIsRunning(!isRunning);
  const skipBreak = () => {
    setIsRunning(false);
    setTimeLeft(25 * 60);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return { m, s };
  };

  const itemTransition = { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 };

  const { m, s } = formatTime(timeLeft);

  // God-Tier Spotlight Effect Component with Active Theory HUD
  const SpotlightCard = ({ children, className = "" }) => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [opacity, setOpacity] = useState(0);

    const handleMouseMove = (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    return (
      <div 
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setOpacity(1)}
        onMouseLeave={() => setOpacity(0)}
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
          className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 z-30"
          style={{
            opacity,
            background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(255,255,255,0.06), transparent 40%)`,
          }}
        />
        {children}
      </div>
    );
  };

  return (
    <div className="pb-12 max-w-7xl mx-auto">
      <motion.div 
        initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
        className="grid grid-cols-1 md:grid-cols-12 gap-6"
      >
        
        {/* LEFT COLUMN: Subjects */}
        <motion.div className="md:col-span-4 flex flex-col gap-6" variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
          <SpotlightCard className="stealth-card p-6 h-full min-h-[400px] flex flex-col">
            <h3 className="text-xl font-medium text-white mb-6 tracking-tight">Active Subjects</h3>
            <div className="flex-1 flex flex-col gap-4">
              {loading ? (
                <div className="flex-1 flex items-center justify-center"><Loader className="animate-spin text-slate-500" size={24}/></div>
              ) : subjects.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">No active subjects.</div>
              ) : (
                subjects.map((sub, i) => {
                  const progress = sub.chapters ? Math.round((sub.chapters.filter(c => c.completed).length / sub.chapters.length) * 100) : 0;
                  return (
                    <Link key={sub._id} to={`/subject/${sub._id}`}>
                      <motion.div 
                        layoutId={`subject-card-${sub._id}`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="stealth-card-inner p-4 hover:bg-white/[0.04] transition-colors cursor-pointer"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex gap-3 items-center">
                            <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center border border-white/10">
                              <Book size={18} className="text-slate-300" />
                            </div>
                            <div>
                              <h4 className="font-medium text-slate-200">{sub.name}</h4>
                              <p className="text-xs text-slate-500">{sub.chapters?.length || 0} Chapters</p>
                            </div>
                          </div>
                          <span className="text-xs font-medium text-slate-400">{progress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-black rounded-full overflow-hidden">
                          <div className="h-full bg-white transition-all duration-500" style={{ width: `${progress}%` }}></div>
                        </div>
                      </motion.div>
                    </Link>
                  );
                })
              )}
            </div>
          </SpotlightCard>
        </motion.div>

        {/* CENTER COLUMN: Pomodoro */}
        <motion.div className="md:col-span-4" variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
          <SpotlightCard className="pomodoro-focus-card p-8 flex flex-col items-center justify-center h-full min-h-[400px] relative group">
            <div className="flex items-center gap-2 mb-10">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-mono font-medium text-slate-300 tracking-[0.25em] uppercase">Focus Session</span>
            </div>
            
            <div className="relative flex items-center justify-center mb-10">
              <div className="absolute inset-0 bg-white/5 rounded-full blur-[60px] -z-10 group-hover:bg-white/10 transition-all duration-1000"></div>
              <div className="text-[96px] leading-none font-light tracking-tighter text-white tabular-nums flex items-baseline drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]">
                {m}<span className="text-[54px] text-slate-400 mx-1 mb-3 animate-pulse">:</span>{s}
              </div>
            </div>

            <div className="flex items-center gap-3 w-full">
              <button 
                onClick={toggleTimer}
                className={`flex-1 py-3.5 rounded-xl font-semibold transition-all duration-300 ${
                  isRunning 
                    ? 'bg-white/10 text-white hover:bg-white/15 border border-white/20' 
                    : 'bg-white text-black hover:bg-slate-200 hover:scale-[1.02] shadow-[0_0_20px_rgba(255,255,255,0.15)] active:scale-95'
                }`}
              >
                {isRunning ? 'Pause' : 'Start'}
              </button>
              <button 
                onClick={skipBreak}
                className="flex-1 py-3.5 rounded-xl font-medium bg-white/10 text-slate-200 hover:text-white hover:bg-white/15 border border-white/15 active:scale-95 transition-all"
              >
                Reset
              </button>
            </div>
            
            <div className="mt-8 flex gap-2.5 items-center">
              <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]"></div>
              <div className="w-2 h-2 rounded-full bg-white/20"></div>
              <div className="w-2 h-2 rounded-full bg-white/20"></div>
              <div className="w-2 h-2 rounded-full bg-white/20"></div>
            </div>
          </SpotlightCard>
        </motion.div>

        {/* RIGHT COLUMN: AI Tutor & Quick Actions */}
        <motion.div className="md:col-span-4 flex flex-col gap-6" variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
          <SpotlightCard className="stealth-card p-6 flex flex-col min-h-[400px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-medium text-white tracking-tight">General AI Tutor</h3>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">Always Available</span>
            </div>
            
            <Link to="/ai" className="block w-full">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-[#111] border border-white/10 rounded-2xl p-4 text-slate-500 flex justify-between items-center mb-8 hover:bg-[#161616] hover:border-white/20 transition-all cursor-text"
              >
                <span className="text-sm">Ask anything...</span>
                <Send size={16} className="text-slate-600" />
              </motion.div>
            </Link>

            <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase mb-3 block">Quick Actions</span>
            <div className="flex flex-col gap-2">
              {[
                { label: 'Generate Practice Quiz', path: '/ai' },
                { label: 'Summarize Lecture Notes', path: '/ai' },
                { label: 'Explain Data Structures', path: '/ai' }
              ].map((action, i) => (
                <Link key={i} to={action.path}>
                  <div className="stealth-card-inner px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-white/[0.04] transition-all cursor-pointer">
                    {action.label}
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
                placeholder="Subject Name (e.g. Algorithms)" 
                required
                value={newSubject}
                onChange={e => setNewSubject(e.target.value)}
                className="stealth-input flex-1"
              />
              <input 
                type="number" 
                placeholder="Chapters" 
                min="1" 
                required
                value={chapterCount}
                onChange={e => setChapterCount(e.target.value)}
                className="stealth-input w-full sm:w-32"
              />
              <button 
                type="submit" 
                disabled={isCreating}
                className="btn-primary sm:w-auto"
              >
                {isCreating ? <Loader className="animate-spin" size={18} /> : <><Plus size={18} /> Create</>}
              </button>
            </form>
          </SpotlightCard>
        </motion.div>

        {/* BOTTOM RIGHT: Goals */}
        <motion.div className="md:col-span-4" variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
          <SpotlightCard className="stealth-card p-6 h-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-white tracking-tight">Goals Progress</h3>
              <div className="px-2 py-1 bg-white/5 rounded text-xs text-slate-400 border border-white/5"><Target size={12} className="inline mr-1"/>{stats.completionPercentage}%</div>
            </div>
            <div className="flex flex-col justify-center h-[calc(100%-2rem)]">
              <div className="flex justify-between text-sm text-slate-400 mb-2">
                <span>Overall Completion</span>
                <span className="text-white">{stats.completedChapters} / {stats.totalChapters} Chapters</span>
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

