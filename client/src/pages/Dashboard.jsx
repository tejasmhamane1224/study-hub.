import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Timer, Play, Pause, RotateCcw, Plus, ChevronRight, Loader, BookOpen, FileText, Zap, Bot } from 'lucide-react';
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

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const statsRes = await api.get('/dashboard').catch(() => ({ data: { totalSubjects: 0, totalChapters: 0, completedChapters: 0, completionPercentage: 0 }}));
      setStats(statsRes.data);

      const subRes = await api.get('/subjects').catch(() => ({ data: [] }));
      setSubjects(subRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(25 * 60);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const today = new Date().toLocaleDateString('en-US', dateOptions);
  
  const hour = new Date().getHours();
  let greeting = 'Good evening!';
  if (hour < 12) greeting = 'Good morning!';
  else if (hour < 18) greeting = 'Good afternoon!';

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Welcome Card */}
        <div className="ios-glass p-6 flex flex-col justify-center">
          <h2 className="text-2xl font-bold mb-2 text-white">{greeting}</h2>
          <p className="opacity-80 mb-4 text-slate-300">Ready to conquer your goals today?</p>
          <p className="font-semibold text-white">{today}</p>
        </div>

        {/* Pomodoro Timer Card */}
        <div className="ios-glass p-6 flex flex-col relative overflow-hidden">
          <div className="flex justify-between items-center mb-4 z-10 relative">
            <span className="font-semibold flex items-center gap-2 text-white"><Timer size={20} className="text-cyan-400" /> Pomodoro Timer</span>
            <div className="flex gap-2">
              <button onClick={() => { setIsRunning(false); setTimeLeft(25 * 60); }} className={`text-xs px-2 py-1 rounded-md transition-colors ${timeLeft === 25*60 && !isRunning ? 'bg-cyan-500/20 text-cyan-400' : 'hover:bg-white/10 text-slate-400'}`}>Pomodoro</button>
              <button onClick={() => { setIsRunning(false); setTimeLeft(5 * 60); }} className={`text-xs px-2 py-1 rounded-md transition-colors ${timeLeft === 5*60 && !isRunning ? 'bg-teal-500/20 text-teal-400' : 'hover:bg-white/10 text-slate-400'}`}>Short Break</button>
              <button onClick={() => { setIsRunning(false); setTimeLeft(15 * 60); }} className={`text-xs px-2 py-1 rounded-md transition-colors ${timeLeft === 15*60 && !isRunning ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-white/10 text-slate-400'}`}>Long Break</button>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center flex-1 py-2 z-10 relative">
            <div className="text-6xl md:text-7xl font-bold tabular-nums mb-6 text-white drop-shadow-lg">
              {formatTime(timeLeft)}
            </div>
            <div className="flex gap-4">
              <button 
                onClick={toggleTimer} 
                className="btn-glow px-6 py-2"
              >
                {isRunning ? <><Pause size={18} /> Pause</> : <><Play size={18} /> Start</>}
              </button>
              <button 
                onClick={resetTimer} 
                className="btn-glass px-4"
              >
                <RotateCcw size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="ios-glass p-4 flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-400">Total Subjects</span>
          <span className="text-3xl font-bold text-white">{stats.totalSubjects}</span>
        </div>
        <div className="ios-glass p-4 flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-400">Total Chapters</span>
          <span className="text-3xl font-bold text-white">{stats.totalChapters}</span>
        </div>
        <div className="ios-glass p-4 flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-400">Completed Chapters</span>
          <span className="text-3xl font-bold text-white">{stats.completedChapters}</span>
        </div>
        <div className="ios-glass p-4 flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-400">Overall Progress</span>
          <span className="text-3xl font-bold text-white">{stats.completionPercentage}%</span>
        </div>
      </div>

      {/* Subjects & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subjects List */}
        <div className="lg:col-span-2 ios-glass">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold text-lg text-white">Active Subjects</span>
            </div>
            <div className="flex flex-col gap-3">
              {loading ? (
                <p className="text-slate-400 text-center py-4 flex justify-center"><Loader className="animate-spin" /></p>
              ) : subjects.length === 0 ? (
                <p className="text-slate-400 text-center py-4">No subjects yet. Create one to get started!</p>
              ) : (
                subjects.map(sub => (
                  <Link 
                    key={sub._id} 
                    to={`/subject/${sub._id}`}
                    className="ios-glass-inner p-4 hover:brightness-125 transition-all flex justify-between items-center"
                  >
                    <div>
                      <h4 className="font-semibold mb-1 text-white">{sub.name}</h4>
                      <p className="text-sm text-slate-400">Created on {new Date(sub.createdAt || Date.now()).toLocaleDateString()}</p>
                    </div>
                    <ChevronRight size={20} className="text-slate-400" />
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Add Subject */}
        <div className="ios-glass p-6 h-fit">
          <div className="flex justify-between items-center mb-4">
            <span className="font-semibold text-lg text-white">Add New Subject</span>
          </div>
          <form onSubmit={handleCreateSubject} className="flex flex-col gap-4">
            <input 
              type="text" 
              placeholder="E.g. Database Systems" 
              required
              value={newSubject}
              onChange={e => setNewSubject(e.target.value)}
              className="glass-input"
            />
            <input 
              type="number" 
              placeholder="Number of Chapters" 
              min="1" 
              required
              value={chapterCount}
              onChange={e => setChapterCount(e.target.value)}
              className="glass-input"
            />
            <button 
              type="submit" 
              disabled={isCreating}
              className="btn-glow w-full flex justify-center items-center gap-2"
            >
              {isCreating ? <Loader className="animate-spin" size={18} /> : <><Plus size={18} /> Create Subject</>}
            </button>
          </form>
        </div>
      </div>

      {/* How to Use Guide */}
      <div className="ios-glass p-6 sm:p-8 mt-6">
        <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-2"><BookOpen size={24} className="text-cyan-400" /> How to use Study Hub</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="ios-glass-inner p-5">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mb-4"><Plus size={20} /></div>
            <h4 className="font-semibold text-white mb-2">1. Create a Subject</h4>
            <p className="text-sm text-slate-400">Use the 'Add New Subject' panel to create a new course and specify how many chapters it has.</p>
          </div>

          <div className="ios-glass-inner p-5">
            <div className="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4"><FileText size={20} /></div>
            <h4 className="font-semibold text-white mb-2">2. Upload PDFs</h4>
            <p className="text-sm text-slate-400">Open a chapter and upload your study materials or textbooks. Our AI instantly reads and learns it.</p>
          </div>

          <div className="ios-glass-inner p-5">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4"><Bot size={20} /></div>
            <h4 className="font-semibold text-white mb-2">3. Chat with AI Tutor</h4>
            <p className="text-sm text-slate-400">Ask the AI to summarize key points, explain difficult concepts, or generate flashcards for you.</p>
          </div>

          <div className="ios-glass-inner p-5">
            <div className="w-10 h-10 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center mb-4"><Zap size={20} /></div>
            <h4 className="font-semibold text-white mb-2">4. Test Your Knowledge</h4>
            <p className="text-sm text-slate-400">Click 'Generate Quiz' to take an interactive practice test, and tick the chapter as Completed when done!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
