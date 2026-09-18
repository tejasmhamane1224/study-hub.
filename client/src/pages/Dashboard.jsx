import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Play, Pause, RotateCcw, Plus, Loader, Book, Send, Target, Flame, 
  Sparkles, HelpCircle, Clock, Brain, Coffee, Zap, BookOpen, X, 
  CheckCircle2, ShieldCheck, ArrowRight, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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

// Comprehensive Pomodoro Technique & Cognitive Science Modal
const PomodoroGuideModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('how');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/85 backdrop-blur-md"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-3xl bg-[#0C0C0C] border border-white/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col z-10 max-h-[88vh]"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/10 bg-white/[0.02]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Protocol Specification // v2.0</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <Clock size={20} className="text-white" /> The Pomodoro Technique & Focus Science
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 bg-black/50 px-6 gap-2 overflow-x-auto custom-scrollbar">
          {[
            { id: 'how', label: '1. How It Works' },
            { id: 'rules', label: '2. The 4 Golden Rules' },
            { id: 'science', label: '3. Cognitive Science' },
            { id: 'routine', label: '4. STUDY HUB Routine' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-3 text-xs font-mono border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-white text-white font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar text-sm leading-relaxed text-slate-300 space-y-6">
          {activeTab === 'how' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02]">
                <h4 className="text-white font-semibold text-base mb-1">The 25/5 Sprint Methodology</h4>
                <p className="text-xs text-slate-400">
                  Invented by Francesco Cirillo in the late 1980s, the Pomodoro Technique uses structured timeboxing to turn time from a source of stress into an engine of continuous productivity.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-white/5 bg-black/40">
                  <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-semibold mb-2">
                    <span>PHASE 01</span> // 25 MINS
                  </div>
                  <h5 className="text-white font-medium mb-1">Deep Work Sprint</h5>
                  <p className="text-xs text-slate-400">
                    Select a single chapter or problem set. Start the timer and work with 100% single-task focus. No notifications, no tab hopping.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-white/5 bg-black/40">
                  <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-semibold mb-2">
                    <span>PHASE 02</span> // 5 MINS
                  </div>
                  <h5 className="text-white font-medium mb-1">Brain Decompression</h5>
                  <p className="text-xs text-slate-400">
                    Step completely away from your monitor. Stretch, hydrate, breathe, or look into the distance to rest your ocular muscles and reset cognitive load.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-white/5 bg-black/40">
                  <div className="flex items-center gap-2 text-purple-400 font-mono text-xs font-semibold mb-2">
                    <span>PHASE 03</span> // 4 CYCLES
                  </div>
                  <h5 className="text-white font-medium mb-1">Session Progress</h5>
                  <p className="text-xs text-slate-400">
                    Complete 4 successive focus sprints (illuminating all 4 progress dots). 4 Pomodoro sessions equal 100 minutes of pure deep work.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-white/5 bg-black/40">
                  <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-semibold mb-2">
                    <span>PHASE 04</span> // 15-30 MINS
                  </div>
                  <h5 className="text-white font-medium mb-1">Long Recovery Break</h5>
                  <p className="text-xs text-slate-400">
                    After 4 cycles, take a prolonged restorative break. Go for a walk, eat a healthy snack, or relax before launching into the next study block.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="space-y-4">
              {[
                {
                  rule: 'Rule 01',
                  title: 'An Indivisible 25 Minutes',
                  desc: 'A Pomodoro cannot be fragmented into fractions. If you are interrupted for more than 2 minutes, reset the timer. Protect your 25-minute boundary like an unbreachable fortress.'
                },
                {
                  rule: 'Rule 02',
                  title: 'Zero Screen-Time During Breaks',
                  desc: 'Do NOT check social media, YouTube, or emails during the 5-minute break. Digital scrolling keeps your dopamine receptors locked in hyper-stimulation. True physical rest consolidates memory.'
                },
                {
                  rule: 'Rule 03',
                  title: 'The Flow Extension (+5m)',
                  desc: 'If the chime sounds while you are in a breakthrough thought, finishing a math proof, or completing a sentence, use the "+5m" button to gracefully wrap up without breaking momentum.'
                },
                {
                  rule: 'Rule 04',
                  title: 'Active Retrospect (2 Minutes)',
                  desc: 'Spend the first 2 minutes of each new Pomodoro quickly reviewing what you produced in the previous session to ensure seamless cognitive continuity.'
                }
              ].map((r, i) => (
                <div key={i} className="p-4 rounded-xl border border-white/5 bg-white/[0.01] flex gap-4 items-start">
                  <span className="text-xs font-mono px-2.5 py-1 rounded bg-white/10 text-white font-bold whitespace-nowrap">
                    {r.rule}
                  </span>
                  <div>
                    <h5 className="text-white font-medium mb-1">{r.title}</h5>
                    <p className="text-xs text-slate-400 leading-relaxed">{r.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'science' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02]">
                <h4 className="text-white font-semibold text-base mb-1">Why The Brain Craves 25-Minute Intervals</h4>
                <p className="text-xs text-slate-400">
                  Neuroscience research from Stanford and MIT explains the profound physiological mechanics behind this technique:
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-xl border border-white/5 bg-black/40">
                  <div className="flex items-center gap-2 text-white font-medium mb-1">
                    <Brain size={16} className="text-emerald-400" /> Overcoming Parkinson's Law
                  </div>
                  <p className="text-xs text-slate-400">
                    "Work expands to fill the time available for its completion." When you have an entire evening to study, your brain defaults to procrastination. A ticking 25-minute sprint creates a healthy psychological deadline that forces immediate engagement.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-white/5 bg-black/40">
                  <div className="flex items-center gap-2 text-white font-medium mb-1">
                    <ShieldCheck size={16} className="text-cyan-400" /> Eliminating Attention Residue
                  </div>
                  <p className="text-xs text-slate-400">
                    Every time you switch between tasks (checking a phone alert, replying to a message), a residue of your attention stays stuck on the previous activity. Strict monotasking prevents cognitive drag and preserves up to 40% of mental stamina.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-white/5 bg-black/40">
                  <div className="flex items-center gap-2 text-white font-medium mb-1">
                    <Activity size={16} className="text-purple-400" /> Synaptic Consolidation During Rest
                  </div>
                  <p className="text-xs text-slate-400">
                    The brain does not solidify memories while you are inputting information; it consolidates neural pathways during the 5-minute pause (the Default Mode Network). Breaks are not lost time—they are when learning actually becomes permanent.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'routine' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02]">
                <h4 className="text-white font-semibold text-base mb-1">The Ideal STUDY HUB Chapter Routine</h4>
                <p className="text-xs text-slate-400">
                  How to combine STUDY HUB's AI Tutor, Chapter Studio, and Pomodoro Timer for maximum retention:
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center gap-3 p-3.5 rounded-xl border border-white/5 bg-black/30">
                  <span className="w-6 h-6 rounded-full bg-white text-black font-mono font-bold text-xs flex items-center justify-center shrink-0">1</span>
                  <div>
                    <span className="text-xs font-semibold text-white">Pomodoro #1 (25m) — Reading & Annotation</span>
                    <p className="text-[11px] text-slate-400">Upload your PDF in Chapter Studio. Read through the primary concepts and note confusing areas.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded-xl border border-white/5 bg-black/30">
                  <span className="w-6 h-6 rounded-full bg-white text-black font-mono font-bold text-xs flex items-center justify-center shrink-0">2</span>
                  <div>
                    <span className="text-xs font-semibold text-white">Pomodoro #2 (25m) — AI Tutor Deep-Dive</span>
                    <p className="text-[11px] text-slate-400">Use the chat box to ask the AI Tutor: "Explain concept X simply" or "Give me real-world examples of Y".</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded-xl border border-white/5 bg-black/30">
                  <span className="w-6 h-6 rounded-full bg-white text-black font-mono font-bold text-xs flex items-center justify-center shrink-0">3</span>
                  <div>
                    <span className="text-xs font-semibold text-white">Pomodoro #3 (25m) — Practice Quiz & Recall</span>
                    <p className="text-[11px] text-slate-400">Click "Generate Quiz". Test yourself without looking at notes to leverage active recall.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded-xl border border-white/5 bg-black/30">
                  <span className="w-6 h-6 rounded-full bg-white text-black font-mono font-bold text-xs flex items-center justify-center shrink-0">4</span>
                  <div>
                    <span className="text-xs font-semibold text-white">Pomodoro #4 (25m) — Flashcards & Synthesis</span>
                    <p className="text-[11px] text-slate-400">Generate flashcards, review incorrect quiz answers, and write a 3-bullet summary in Planner.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-white/10 bg-white/[0.02] flex justify-between items-center text-xs text-slate-400 font-mono">
          <span>25M FOCUS // 5M REST // 4 CYCLES</span>
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-white text-black font-semibold rounded-xl hover:bg-slate-200 transition-colors shadow-sm"
          >
            Got It, Let's Focus
          </button>
        </div>
      </motion.div>
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
  const [showGuideModal, setShowGuideModal] = useState(false);

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
      {/* Full Guide Modal */}
      <PomodoroGuideModal 
        isOpen={showGuideModal} 
        onClose={() => setShowGuideModal(false)} 
      />

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

        {/* CENTER COLUMN: Upgraded Pomodoro Timer with Details Trigger */}
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

            {/* Status Pulse & Details Guide Button */}
            <div className="flex items-center justify-between w-full mt-3 px-1 z-20">
              <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${
                  isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                }`}></span>
                <span className="text-[11px] font-mono font-medium text-slate-300 tracking-[0.25em] uppercase">
                  {MODES[timerMode].tag}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-[10px] font-mono transition-all cursor-pointer"
                title="View Pomodoro Technique Protocol & Science"
              >
                <HelpCircle size={12} className="text-emerald-400" />
                <span>DETAILS & RULES</span>
              </button>
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
                title="Add 5 Minutes of Flow"
              >
                +5m
              </button>
            </div>
            
            {/* 4-Cycle Session Progress Dots & Explanatory Subtitle */}
            <div className="mt-4 flex flex-col items-center gap-2 z-20 w-full">
              <div className="flex gap-2.5 items-center">
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
                <span className="text-[10px] font-mono text-slate-400 ml-1.5">
                  Cycle {(completedSessions % 4) + 1} of 4 ({completedSessions} total)
                </span>
              </div>
              <button 
                type="button"
                onClick={() => setShowGuideModal(true)}
                className="text-[10px] font-mono text-slate-400 hover:text-white transition-colors underline underline-offset-4 decoration-white/20 hover:decoration-white"
              >
                25m Focus ➔ 5m Break ➔ 4x ➔ 15m Long Break (Read Protocol)
              </button>
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

        {/* FULL WIDTH: Pomodoro Technique Architecture & Deep Details */}
        <motion.div className="md:col-span-12 mt-2" variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
          <SpotlightCard className="stealth-card p-6 md:p-8 rounded-2xl border border-white/10 bg-white/[0.01]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-[0.25em]">Focus Protocol & Cognitive Science</span>
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
                  <Clock className="text-white" size={22} /> The Pomodoro Focus Architecture
                </h3>
                <p className="text-sm text-slate-400 mt-1 max-w-3xl">
                  The Pomodoro Technique chunks your study sessions into 25-minute high-intensity cognitive sprints followed by deliberate 5-minute recovery intervals, engineered to eliminate procrastination and maximize memory consolidation.
                </p>
              </div>
              <button 
                onClick={() => setShowGuideModal(true)}
                className="btn-primary py-2.5 px-5 text-xs font-semibold whitespace-nowrap self-start md:self-auto flex items-center gap-2"
              >
                <BookOpen size={14} /> Full Technique Guide
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1 */}
              <div className="stealth-card-inner p-5 rounded-xl border border-white/5 bg-white/[0.02] flex flex-col justify-between hover:bg-white/[0.04] transition-all">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-400/10 border border-emerald-400/20">STAGE 01</span>
                    <Brain size={18} className="text-slate-400" />
                  </div>
                  <h4 className="font-semibold text-white text-base mb-1.5">25-Min Deep Focus</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Single-task without interruption. Monotasking bypasses attention residue and triggers dopamine rewards upon sprint completion.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span>Urgency window</span>
                  <span className="text-white font-medium">25:00 min</span>
                </div>
              </div>

              {/* Card 2 */}
              <div className="stealth-card-inner p-5 rounded-xl border border-white/5 bg-white/[0.02] flex flex-col justify-between hover:bg-white/[0.04] transition-all">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono text-cyan-400 font-semibold px-2 py-0.5 rounded bg-cyan-400/10 border border-cyan-400/20">STAGE 02</span>
                    <Coffee size={18} className="text-slate-400" />
                  </div>
                  <h4 className="font-semibold text-white text-base mb-1.5">5-Min Brain Detox</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Mandatory screen-free break. Stand up, hydrate, and look away. Resting your visual field allows your brain to encode new synapses.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span>Recovery window</span>
                  <span className="text-white font-medium">05:00 min</span>
                </div>
              </div>

              {/* Card 3 */}
              <div className="stealth-card-inner p-5 rounded-xl border border-white/5 bg-white/[0.02] flex flex-col justify-between hover:bg-white/[0.04] transition-all">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono text-purple-400 font-semibold px-2 py-0.5 rounded bg-purple-400/10 border border-purple-400/20">STAGE 03</span>
                    <Flame size={18} className="text-slate-400" />
                  </div>
                  <h4 className="font-semibold text-white text-base mb-1.5">4-Cycle Mastery</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Every 4 completed focus sprints triggers an automatic 15-minute Long Break. Clears neural fatigue and restores executive function.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span>Cycle cadence</span>
                  <span className="text-white font-medium">4 Sessions = 15m</span>
                </div>
              </div>

              {/* Card 4 */}
              <div className="stealth-card-inner p-5 rounded-xl border border-white/5 bg-white/[0.02] flex flex-col justify-between hover:bg-white/[0.04] transition-all">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono text-amber-400 font-semibold px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/20">STAGE 04</span>
                    <Zap size={18} className="text-slate-400" />
                  </div>
                  <h4 className="font-semibold text-white text-base mb-1.5">Flow Extension (+5m)</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    In the zone solving a proof or writing a key takeaway? Tap the +5m button to seamlessly extend your session without losing momentum.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span>Quick extension</span>
                  <span className="text-white font-medium">+300 sec</span>
                </div>
              </div>
            </div>
          </SpotlightCard>
        </motion.div>

      </motion.div>
    </div>
  );
};

export default Dashboard;
