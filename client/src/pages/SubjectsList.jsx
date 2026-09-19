import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Book, ChevronRight, Loader, Plus, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';

const SubjectsList = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSubjects = async () => {
    try {
      const res = await api.get('/subjects');
      setSubjects(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubjects();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin text-slate-400" size={32} />
      </div>
    );
  }

  return (
    <div className="pb-16 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Curriculum Registry</span>
          </div>
          <h2 className="text-3xl font-bold flex items-center gap-3 text-white tracking-tight">
            <Book className="text-white" /> All Subjects
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Manage your courses, syllabi, and track milestone progression across chapters.
          </p>
        </div>

        <Link 
          to="/" 
          className="btn-primary py-2.5 px-5 text-xs font-semibold self-start sm:self-auto"
        >
          <Plus size={16} /> New Subject
        </Link>
      </div>
      
      {subjects.length === 0 ? (
        <div className="stealth-card p-12 text-center flex flex-col items-center justify-center">
          <Book size={36} className="text-slate-600 mb-3" />
          <p className="text-slate-400 mb-6 text-sm">You haven't created any subjects yet.</p>
          <Link to="/" className="btn-primary">
            Go to Dashboard to Add One
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject, idx) => {
            const total = subject.chapters?.length || 0;
            const completed = subject.chapters?.filter(c => c.completed)?.length || 0;
            const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

            return (
              <Link key={subject._id || idx} to={`/subject/${subject._id}`} className="block group">
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="stealth-card p-6 h-full flex flex-col justify-between cursor-pointer"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                        <Book size={20} className="text-slate-200" />
                      </div>
                      <span className="text-xs font-mono font-medium text-slate-400 px-2 py-0.5 rounded bg-white/5 border border-white/10">
                        {progress}%
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-slate-200 transition-colors">
                      {subject.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono mb-4">
                      {total} Chapters • {completed} Completed
                    </p>
                  </div>

                  <div>
                    <div className="h-1.5 w-full bg-black/60 rounded-full overflow-hidden border border-white/5 mb-3">
                      <div 
                        className="h-full bg-white transition-all duration-500" 
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[11px] font-mono text-slate-500">
                      <span>Open Workspace</span>
                      <ArrowRight size={13} className="group-hover:translate-x-1 text-slate-400 group-hover:text-white transition-all" />
                    </div>
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SubjectsList;
