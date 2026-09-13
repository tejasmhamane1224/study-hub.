import React, { useState, useEffect } from 'react';
import { LineChart, TrendingUp, Award, Book, CheckCircle, Clock, Loader } from 'lucide-react';
import api from '../services/api';

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // We'll fetch dashboard data which has good basic stats
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
    return <div className="flex justify-center items-center h-64"><Loader className="animate-spin text-white" size={32} /></div>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 flex items-center gap-3 text-white"><LineChart className="text-white" /> Study Analytics</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="stealth-card p-6 flex items-center gap-4">
          <div className="p-4 bg-white/5 border border-white/10 rounded-full text-white">
            <Book size={24} />
          </div>
          <div>
            <p className="text-slate-400 text-sm">Total Subjects</p>
            <h3 className="text-2xl font-bold text-white">{stats.totalSubjects}</h3>
          </div>
        </div>
        <div className="stealth-card p-6 flex items-center gap-4">
          <div className="p-4 bg-white/5 border border-white/10 rounded-full text-white">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-slate-400 text-sm">Completed Chapters</p>
            <h3 className="text-2xl font-bold text-white">{stats.completedChapters} / {stats.totalChapters}</h3>
          </div>
        </div>
        <div className="stealth-card p-6 flex items-center gap-4">
          <div className="p-4 bg-white/5 border border-white/10 rounded-full text-white">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Overall Progress</p>
            <h3 className="text-3xl font-bold text-white">
              {stats?.totalChapters ? Math.round((stats.completedChapters / stats.totalChapters) * 100) : 0}%
            </h3>
          </div>
        </div>
      </div>

      <div className="stealth-card p-8 min-h-[300px] flex flex-col items-center justify-center border border-white/5">
        <LineChart size={64} className="text-slate-600 mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Detailed charts coming soon!</h3>
        <p className="text-slate-400 text-center max-w-md">Keep studying and checking off your chapters. Your learning velocity graphs will appear here as you accumulate more data.</p>
      </div>
    </motion.div>
  );
};

export default Analytics;
