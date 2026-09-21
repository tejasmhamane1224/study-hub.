import React, { useState, useEffect } from 'react';
import { LineChart, TrendingUp, Award, Book, CheckCircle, Clock, Loader, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard');
        setStats(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin text-slate-400" size={32} />
      </div>
    );
  }

  const totalSubjects = stats?.totalSubjects || 0;
  const completedChapters = stats?.completedChapters || 0;
  const totalChapters = stats?.totalChapters || 0;
  const progressPercent = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.4 }}
      className="max-w-7xl mx-auto pb-16"
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Academic Telemetry</span>
          </div>
          <h2 className="text-3xl font-bold flex items-center gap-3 text-white tracking-tight">
            <LineChart className="text-white" /> Study Analytics
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Track your semester velocity, syllabus completion metrics, and focus consistency.
          </p>
        </div>

        <Link to="/planner" className="btn-primary py-2.5 px-5 text-xs font-semibold self-start sm:self-auto">
          View Focus Planner <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="stealth-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-white">
            <Book size={22} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-mono uppercase tracking-wider">Total Subjects</p>
            <h3 className="text-2xl font-bold text-white mt-0.5">{totalSubjects}</h3>
          </div>
        </div>

        <div className="stealth-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-white">
            <CheckCircle size={22} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-mono uppercase tracking-wider">Completed Chapters</p>
            <h3 className="text-2xl font-bold text-white mt-0.5">{completedChapters} / {totalChapters}</h3>
          </div>
        </div>

        <div className="stealth-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-white">
            <Clock size={22} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-mono uppercase tracking-wider">Overall Syllabus Progress</p>
            <h3 className="text-3xl font-bold text-white mt-0.5">{progressPercent}%</h3>
          </div>
        </div>
      </div>

      {/* Visual Analytics Progress Card */}
      <div className="stealth-card p-8 min-h-[300px] flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 mb-4">
          <TrendingUp size={32} className="text-emerald-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Syllabus Velocity Tracking</h3>
        <p className="text-slate-400 text-sm max-w-md mb-6 leading-relaxed">
          You have completed <span className="text-white font-semibold">{completedChapters}</span> out of <span className="text-white font-semibold">{totalChapters}</span> total chapters across your registered courses. Keep running 25-minute Pomodoro sprints in the Focus tab to accelerate completion.
        </p>
        <div className="w-full max-w-md h-2 bg-black/60 rounded-full overflow-hidden border border-white/10">
          <div 
            className="h-full bg-white transition-all duration-700 shadow-[0_0_10px_white]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default Analytics;
