import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Play, Pause, RotateCcw, Plus, Loader, Book, Send, Target, Flame, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';

// Defined OUTSIDE Dashboard component so inputs never unmount or lose focus on keystroke!
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

const MODES = {
  focus: { label: 'Focus', duration: 25 * 60, tag: 'FOCUS SESSION' },
  shortBreak: { label: 'Short Break', duration: 5 * 60, tag: 'REST & RECHARGE' },
  longBreak: { label: 'Long Break', duration: 15 * 60, tag: 'DEEP RECOVERY' }
};

const Dashboard = () => {
  const [stats, setStats] = useState({ totalSubjects: 0, totalChapters: 0, completedChapters: 0, completionPercentage: 0 });
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Enhanced Pomodoro State
  const [timerMode, setTimerMode] = useState('focus');
  const [timeLeft, setTimeLeft] = useState(MODES.focus.duration);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);

  // New subject state
  const [newSubject, setNewSubject] = useState('');
  const [chapterCount, setChapterCount] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Play pleasant audio chime when session finishes
  const playChime = useCallback(() => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // A5
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch {
      // AudioContext policy handled gracefully
    }
  }, []);

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

  // Stable, drift-free interval that doesn't recreate every second
  useEffect(() => {
    let interval = null;
    if (isRunning) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            playChime();
            if (timerMode === 'focus') {
              setCompletedSessions((c) => {
                const nextCount = c + 1;
                // Switch to long break after 4 focus sessions, else short break
                if (nextCount % 4 === 0) {
                  setTimerMode('longBreak');
                  return nextCount;
                } else {
                  setTimerMode('shortBreak');
                  return nextCount;
                }
              });
              setIsRunning(false);
              return timerMode === 'focus' ? MODES.shortBreak.duration : MODES.focus.duration;
            } else {
              setTimerMode('focus');
              setIsRunning(false);
              return MODES.focus.duration;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timerMode, playChime]);

  const switchMode = (modeKey) => {
    setIsRunning(false);
    setTimerMode(modeKey);
    setTimeLeft(MODES[modeKey].duration);
  };

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(MODES[timerMode].duration);
  };

  const addFiveMinutes = () => {
    setTimeLeft((t) => t + 5 * 60);
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    if (!newSubject.trim() || !chapterCount) return;
    setIsCreating(true);
    try {
      await api.post('/subjects', { name: newSubject.trim(), chapterCount });
      setNewSubject('');
      setChapterCount('');
      loadDashboardData();
    } catch (err) {
      alert(err.message || 'Error creating subject');
    } finally {
      setIsCreating(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return { m, s };
  };

  const { m, s } = formatTime(timeLeft);
  const totalDuration = MODES[timerMode].duration;
  const progressPercent = Math.min(100, Math.max(0, Math.round(((totalDuration - timeLeft) / totalDuration) * 100)));

  return (
    <div className="pb-12 max-w-7xl mx-auto">
      <motion.div 
        initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
        className="grid grid-cols-1 md:grid-cols-12 gap-6"
      >
        
        {/* LEFT COLUMN: Subjects */}
        <motion.div className="md:col-span-4 flex flex-col gap-6" variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
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
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="stealth-card-inner p-4 hover:bg-white/[0.04] transition-colors cursor-pointer rounded-xl border border-white/5"
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
                          <span className="text-xs font-mono font-medium text-slate-400">{progress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-black rounded-full overflow-hidden border border-white/5">
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

        {/* CENTER COLUMN: Upgraded Pomodoro Timer */}
        <motion.div className="md:col-span-4" variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
          <SpotlightCard className="pomodoro-focus-card p-6 md:p-8 flex flex-col items-center justify-between h-full min-h-[420px] relative group">
            
            {/* Mode Switcher Tabs */}
            <div className="flex bg-white/[0.04] p-1 rounded-xl border border-white/10 gap-1 w-full max-w-[340px] z-20">
              {Object.entries(MODES).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => switchMode(key)}
                  className={`flex-1 py-1.5 text-xs font-mono rounded-lg transition-all ${
                    timerMode === key 
                      ? 'bg-white text-black font-semibold shadow-[0_0_12px_rgba(255,255,255,0.25)]' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {val.label}
                </button>
              ))}
            </div>

            {/* Status Pulse */}
            <div className="flex items-center gap-2 mt-4 z-20">
              <span className={`w-1.5 h-1.5 rounded-full ${
                isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
              }`}></span>
              <span className="text-[11px] font-mono font-medium text-slate-300 tracking-[0.25em] uppercase">
                {MODES[timerMode].tag}
              </span>
            </div>
            
            {/* Giant Digital Time Readout */}
            <div className="relative flex flex-col items-center justify-center my-3 z-20">
              <div className="absolute inset-0 bg-white/5 rounded-full blur-[50px] -z-10 group-hover:bg-white/10 transition-all duration-1000"></div>
              <div className="text-[88px] sm:text-[96px] leading-none font-light tracking-tighter text-white tabular-nums flex items-baseline drop-shadow-[0_4px_30px_rgba(0,0,0,0.95)] select-none">
                {m}<span className={`text-[50px] text-slate-400 mx-1 mb-2 ${isRunning ? 'animate-pulse' : ''}`}>:</span>{s}
              </div>
              {/* Progress Line */}
              <div className="w-48 h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
                <div 
                  className="h-full bg-white transition-all duration-1000 ease-linear shadow-[0_0_8px_rgba(255,255,255,0.8)]" 
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 w-full z-20">
              <button 
                onClick={toggleTimer}
                className={`flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
                  isRunning 
                    ? 'bg-white/10 text-white hover:bg-white/15 border border-white/20' 
                    : 'bg-white text-black hover:bg-slate-200 hover:scale-[1.02] shadow-[0_0_20px_rgba(255,255,255,0.2)] active:scale-95'
                }`}
              >
                {isRunning ? <><Pause size={16} /> Pause</> : <><Play size={16} /> Start</>}
              </button>
              <button 
                onClick={resetTimer}
                className="px-4 py-3 rounded-xl font-medium bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border border-white/10 active:scale-95 transition-all flex items-center justify-center"
                title="Reset Timer"
              >
                <RotateCcw size={16} />
              </button>
              <button 
                onClick={addFiveMinutes}
                className="px-3.5 py-3 rounded-xl font-mono text-xs text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 active:scale-95 transition-all"
                title="Add 5 Minutes"
              >
                +5m
              </button>
            </div>
            
            {/* 4-Cycle Session Progress Dots */}
            <div className="mt-4 flex gap-2.5 items-center z-20">
              {[0, 1, 2, 3].map((idx) => {
                const isDone = (completedSessions % 4) > idx || (completedSessions > 0 && completedSessions % 4 === 0);
                return (
                  <div 
                    key={idx}
                    title={`Session ${idx + 1} of 4`}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      isDone 
                        ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)] scale-110' 
                        : 'bg-white/20'
                    }`}
                  />
                );
              })}
              <span className="text-[10px] font-mono text-slate-500 ml-1.5">
                {completedSessions} {completedSessions === 1 ? 'session' : 'sessions'}
              </span>
            </div>
          </SpotlightCard>
        </motion.div>

        {/* RIGHT COLUMN: AI Tutor & Quick Actions */}
        <motion.div className="md:col-span-4 flex flex-col gap-6" variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
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
                { label: 'Explain Data Structures', path: '/ai' }
              ].map((action, i) => (
                <Link key={i} to={action.path}>
                  <div className="stealth-card-inner px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-white/[0.04] transition-all cursor-pointer rounded-xl border border-white/5">
                    {action.label}
                  </div>
                </Link>
              ))}
            </div>
          </SpotlightCard>
        </motion.div>

        {/* BOTTOM LEFT: Create Subject (FIXED: Continuous typing with no focus loss!) */}
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
