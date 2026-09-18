import React, { useState, useEffect, useCallback } from 'react';
import { 
  CalendarCheck, Plus, Trash2, CheckCircle2, Circle, 
  Play, Pause, RotateCcw, Clock, Sparkles, Brain, ShieldCheck, Zap
} from 'lucide-react';

const MODES = {
  focus: { label: 'Focus', duration: 25 * 60, tag: 'FOCUS SESSION', desc: '25-min high cognitive focus' },
  shortBreak: { label: 'Short Break', duration: 5 * 60, tag: 'BRAIN DETOX', desc: '5-min rest & hydration' },
  longBreak: { label: 'Long Break', duration: 15 * 60, tag: 'DEEP RECOVERY', desc: '15-min extended recharge' }
};

const Planner = () => {
  // Tasks state
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem('planner_tasks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [newTask, setNewTask] = useState('');
  const [reminders, setReminders] = useState(() => {
    try {
      return localStorage.getItem('planner_reminders') || '';
    } catch {
      return '';
    }
  });

  // Pomodoro Timer State
  const [timerMode, setTimerMode] = useState('focus');
  const [timeLeft, setTimeLeft] = useState(MODES.focus.duration);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(() => {
    try {
      return parseInt(localStorage.getItem('pomodoro_completed_sessions') || '0', 10);
    } catch {
      return 0;
    }
  });

  // Chime sound on session completion
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
      // Ignore if blocked by browser audio policy
    }
  }, []);

  // Stable drift-free timer countdown
  useEffect(() => {
    let interval = null;
    if (isRunning) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            playChime();
            if (timerMode === 'focus') {
              const nextCount = completedSessions + 1;
              setCompletedSessions(nextCount);
              try {
                localStorage.setItem('pomodoro_completed_sessions', nextCount.toString());
              } catch {
                // Ignore storage error
              }
              setIsRunning(false);
              if (nextCount % 4 === 0) {
                setTimerMode('longBreak');
                return MODES.longBreak.duration;
              } else {
                setTimerMode('shortBreak');
                return MODES.shortBreak.duration;
              }
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
  }, [isRunning, timerMode, completedSessions, playChime]);

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

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return { m, s };
  };

  const { m, s } = formatTime(timeLeft);
  const totalDuration = MODES[timerMode].duration;
  const progressPercent = Math.min(100, Math.max(0, Math.round(((totalDuration - timeLeft) / totalDuration) * 100)));

  // Task & Reminder Handlers
  const handleReminderChange = (e) => {
    const val = e.target.value;
    setReminders(val);
    localStorage.setItem('planner_reminders', val);
  };

  const saveTasks = (newTasks) => {
    setTasks(newTasks);
    localStorage.setItem('planner_tasks', JSON.stringify(newTasks));
  };

  const addTask = (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    const task = {
      id: Date.now().toString(),
      text: newTask,
      completed: false
    };
    saveTasks([...tasks, task]);
    setNewTask('');
  };

  const toggleTask = (id) => {
    const newTasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    saveTasks(newTasks);
  };

  const deleteTask = (id) => {
    saveTasks(tasks.filter(t => t.id !== id));
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const percentage = tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100);

  return (
    <div className="pb-16 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Focus Command Center</span>
          </div>
          <h2 className="text-3xl font-bold flex items-center gap-3 text-white tracking-tight">
            <CalendarCheck className="text-white" /> Focus & Study Planner
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Combine 25-minute Pomodoro sprints with micro-task scheduling to enter sustained cognitive flow.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-slate-300">
          <span className="text-emerald-400 font-bold">25m</span> Focus
          <span className="text-slate-500">➔</span>
          <span className="text-cyan-400 font-bold">5m</span> Break
          <span className="text-slate-500">➔</span>
          <span className="text-purple-400 font-bold">4x</span> Cycles
        </div>
      </div>

      {/* TOP SECTION: Pomodoro Timer & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        {/* Main Pomodoro Clock Card */}
        <div className="lg:col-span-7 stealth-card p-6 md:p-8 flex flex-col items-center justify-between border border-white/10 relative overflow-hidden group">
          {/* Subtle background glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />

          {/* Mode Switcher Tabs */}
          <div className="flex bg-white/[0.04] p-1 rounded-xl border border-white/10 gap-1 w-full max-w-md z-10">
            {Object.entries(MODES).map(([key, val]) => (
              <button
                key={key}
                onClick={() => switchMode(key)}
                className={`flex-1 py-2 text-xs font-mono rounded-lg transition-all ${
                  timerMode === key 
                    ? 'bg-white text-black font-semibold shadow-[0_0_12px_rgba(255,255,255,0.25)]' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {val.label}
              </button>
            ))}
          </div>

          {/* Status Tag */}
          <div className="flex items-center gap-2 mt-4 z-10">
            <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}></span>
            <span className="text-xs font-mono font-medium text-slate-300 tracking-[0.25em] uppercase">
              {MODES[timerMode].tag} • {MODES[timerMode].desc}
            </span>
          </div>

          {/* Giant Time Display */}
          <div className="relative flex flex-col items-center justify-center my-6 z-10">
            <div className="text-[84px] sm:text-[104px] leading-none font-light tracking-tighter text-white tabular-nums flex items-baseline drop-shadow-[0_4px_30px_rgba(0,0,0,0.95)] select-none">
              {m}<span className={`text-[54px] text-slate-400 mx-1 mb-2 ${isRunning ? 'animate-pulse' : ''}`}>:</span>{s}
            </div>
            {/* Progress line */}
            <div className="w-56 h-1.5 bg-white/10 rounded-full mt-3 overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-1000 ease-linear shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 w-full max-w-md z-10">
            <button 
              onClick={toggleTimer}
              className={`flex-1 py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
                isRunning 
                  ? 'bg-white/10 text-white hover:bg-white/15 border border-white/20' 
                  : 'bg-white text-black hover:bg-slate-200 hover:scale-[1.02] shadow-[0_0_20px_rgba(255,255,255,0.2)] active:scale-95'
              }`}
            >
              {isRunning ? <><Pause size={18} /> Pause Session</> : <><Play size={18} /> Start Focus</>}
            </button>
            <button 
              onClick={resetTimer}
              className="px-4 py-3.5 rounded-xl font-medium bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border border-white/10 active:scale-95 transition-all flex items-center justify-center"
              title="Reset Timer"
            >
              <RotateCcw size={18} />
            </button>
            <button 
              onClick={addFiveMinutes}
              className="px-4 py-3.5 rounded-xl font-mono text-xs text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 active:scale-95 transition-all"
              title="Extend session by 5 minutes"
            >
              +5m
            </button>
          </div>

          {/* Cycle Indicators */}
          <div className="mt-5 flex items-center gap-2.5 z-10">
            {[0, 1, 2, 3].map((idx) => {
              const isDone = (completedSessions % 4) > idx || (completedSessions > 0 && completedSessions % 4 === 0);
              return (
                <div 
                  key={idx}
                  title={`Session ${idx + 1} of 4`}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    isDone 
                      ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)] scale-110' 
                      : 'bg-white/20'
                  }`}
                />
              );
            })}
            <span className="text-xs font-mono text-slate-400 ml-2">
              Sprint {(completedSessions % 4) + 1} of 4 ({completedSessions} Total Sessions)
            </span>
          </div>
        </div>

        {/* Right: Goal Progress Ring & Focus Protocol Tips */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Circular Progress Ring */}
          <div className="stealth-card p-6 border border-white/10 flex flex-col items-center justify-center min-h-[260px]">
            {(() => {
              const radius = 64;
              const circumference = 2 * Math.PI * radius;
              const strokeDashoffset = circumference - (percentage / 100) * circumference;

              return (
                <div className="relative w-40 h-40 flex items-center justify-center mb-3">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                    <circle
                      cx="80"
                      cy="80"
                      r={radius}
                      stroke="rgba(255, 255, 255, 0.08)"
                      strokeWidth="8"
                      fill="transparent"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r={radius}
                      stroke="#ffffff"
                      strokeWidth="8"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-700 ease-out"
                      style={{
                        filter: percentage === 100 ? 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.6))' : 'none'
                      }}
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <h2 className="text-3xl font-black text-white tracking-tighter">
                      {percentage}%
                    </h2>
                    <p className="text-[9px] text-slate-400 font-mono tracking-[0.25em] uppercase">GOALS DONE</p>
                  </div>
                </div>
              );
            })()}
            <h3 className="text-base font-semibold text-white">Daily Target Completion</h3>
            <p className="text-xs text-slate-400 text-center mt-1">
              {completedCount} of {tasks.length} tasks completed today
            </p>
          </div>

          {/* Quick Focus Science Reminder */}
          <div className="stealth-card p-5 border border-white/10 bg-white/[0.02]">
            <div className="flex items-center gap-2 mb-2 text-white font-medium text-sm">
              <Brain size={16} className="text-emerald-400" />
              <span>The 25/5 Deep Work Principle</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              25 minutes of zero-distraction focus prevents cognitive fatigue and beats Parkinson's Law. Never look at phones during 5-minute break intervals.
            </p>
          </div>
        </div>
      </div>
      
      {/* BOTTOM SECTION: Today's Tasks & Quick Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Today's Tasks */}
        <div className="stealth-card p-6 border border-white/10 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Today's Tasks</h3>
            <span className="text-xs font-mono text-slate-400">{tasks.length} Total</span>
          </div>
          
          <form onSubmit={addTask} className="flex gap-3 mb-6">
            <input 
              type="text" 
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="E.g., Finish Chapter 3 practice quiz, read lecture notes..."
              className="stealth-input flex-1 py-3 px-4 rounded-xl text-sm"
            />
            <button type="submit" className="px-5 py-3 bg-white text-black font-semibold rounded-xl hover:bg-slate-200 active:scale-95 transition-all">
              <Plus size={20} />
            </button>
          </form>

          <div className="flex flex-col gap-3 max-h-[320px] overflow-y-auto custom-scrollbar pr-1">
            {tasks.length === 0 ? (
              <p className="text-slate-400 text-center py-8 text-sm">Your planner is empty. Add a task above!</p>
            ) : (
              tasks.map(task => (
                <div 
                  key={task.id} 
                  className={`flex justify-between items-center p-3.5 rounded-xl border transition-all duration-300 ${
                    task.completed 
                      ? 'bg-white/[0.02] border-white/5 opacity-50' 
                      : 'bg-white/[0.04] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => toggleTask(task.id)}>
                    {task.completed ? <CheckCircle2 className="text-white" size={18} /> : <Circle className="text-slate-500" size={18} />}
                    <span className={`text-sm ${task.completed ? 'text-slate-500 line-through font-mono' : 'text-slate-200'}`}>
                      {task.text}
                    </span>
                  </div>
                  <button onClick={() => deleteTask(task.id)} className="text-slate-500 hover:text-white transition-colors ml-4">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Reminders Scratchpad */}
        <div className="stealth-card p-6 border border-white/10 shadow-lg flex flex-col">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <span className="p-2 bg-white/5 text-white rounded-lg"><CalendarCheck size={18} /></span> 
            Quick Reminders & Formulas
          </h3>
          <textarea 
            value={reminders}
            onChange={handleReminderChange}
            placeholder="Jot down quick study thoughts, formulas to memorize, exam deadlines, or chapter notes here... (Saves automatically)"
            className="stealth-input flex-1 w-full min-h-[220px] resize-none p-4 text-sm"
          ></textarea>
        </div>
      </div>
    </div>
  );
};

export default Planner;
