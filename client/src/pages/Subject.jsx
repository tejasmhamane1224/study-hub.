import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Trash, Check, ArrowRight, Loader, AlertTriangle, X, Sparkles, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const Subject = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [subject, setSubject] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadSubjectData = async () => {
    setLoading(true);
    try {
      const subRes = await api.get('/subjects').catch(() => ({ data: [] }));
      const foundSub = subRes.data.find(s => s._id === id);
      setSubject(foundSub || { name: 'Subject Details', _id: id });

      const chapRes = await api.get(`/chapters/subject/${id}`).catch(() => ({ data: [] }));
      setChapters(chapRes.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load subject telemetry.', 'Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubjectData();
  }, [id]);

  const toggleComplete = async (chapterId, isCompleted) => {
    try {
      await api.put(`/chapters/${chapterId}`, { completed: isCompleted });
      toast.success(
        isCompleted ? 'Research node marked as completed!' : 'Research node marked as pending.',
        isCompleted ? 'Progress Logged' : 'Status Updated'
      );
      loadSubjectData();
    } catch (err) {
      const msg = err.response?.data?.msg || err.response?.data?.message || err.message;
      toast.error(msg || 'Error updating chapter', 'Update Failed');
    }
  };

  const confirmDeleteSubject = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/subjects/${id}`);
      toast.info(`Subject "${subject?.name || ''}" decommissioned from orbit.`, 'Subject Removed');
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.msg || err.response?.data?.message || err.message;
      toast.error(msg || 'Error deleting subject', 'Decommission Failed');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader className="animate-spin text-cyan-400" size={32} />
        <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">Loading Sector Data...</span>
      </div>
    );
  }

  const completedCount = chapters.filter(c => c.completed).length;
  const progressPercent = chapters.length ? Math.round((completedCount / chapters.length) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="stealth-card p-6 sm:p-8 mb-6 relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] -z-10"></div>
        
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div>
            <button 
              onClick={() => navigate('/')} 
              className="flex items-center gap-2 text-slate-400 hover:text-white mb-2 text-xs font-mono uppercase tracking-wider transition-colors w-fit cursor-pointer"
            >
              <ArrowLeft size={14} /> Back to Dashboard
            </button>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <span>{subject?.name || 'Subject Details'}</span>
              {progressPercent === 100 && (
                <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-1">
                  <Sparkles size={12} /> Mastered
                </span>
              )}
            </h2>
          </div>
          
          <button 
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/20 transition-all font-medium text-xs font-mono uppercase tracking-wider cursor-pointer self-start sm:self-auto"
          >
            <Trash size={14} /> Decommission Subject
          </button>
        </div>

        {/* Overall Subject Progress Bar */}
        <div className="bg-black/60 p-4 rounded-xl border border-white/5 flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-slate-400 uppercase tracking-wider">Sector Completion</span>
            <span className="text-white font-bold">{completedCount} of {chapters.length} Chapters ({progressPercent}%)</span>
          </div>
          <div className="h-2 w-full bg-black rounded-full overflow-hidden border border-white/10">
            <div 
              className={`h-full transition-all duration-700 ${
                progressPercent === 100 ? 'bg-emerald-400 shadow-[0_0_12px_#34d399]' : 'bg-gradient-to-r from-cyan-400 to-indigo-400'
              }`} 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Chapters List */}
      <div className="stealth-card p-6 md:p-8">
        <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
          <div>
            <h3 className="text-lg font-bold tracking-tight text-white">Research Chapters</h3>
            <p className="text-xs text-slate-400 font-mono">Select a chapter node to upload study notes, run quizzes, or chat with AI</p>
          </div>
          <span className="text-xs font-mono text-slate-400 px-2.5 py-1 rounded bg-white/5 border border-white/10 uppercase">
            {chapters.length} Nodes
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {chapters.length === 0 ? (
            <div className="text-center py-12 text-slate-500 font-mono text-sm">
              No chapter nodes detected in this sector.
            </div>
          ) : (
            chapters.map((chap, idx) => (
              <motion.div 
                key={chap._id}
                whileHover={{ scale: 1.01, y: -1 }}
                className="stealth-card-inner flex flex-col sm:flex-row items-center justify-between p-4 px-6 group cursor-pointer border border-white/10 hover:border-cyan-400/30 transition-all rounded-xl"
                onClick={() => navigate(`/chapter/${chap._id}`)}
              >
                <div className="flex items-center gap-4 w-full sm:w-auto mb-3 sm:mb-0">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                    chap.completed 
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-[0_0_12px_rgba(52,211,153,0.2)]' 
                      : 'bg-black text-slate-400 border-white/10 group-hover:border-white/30'
                  }`}>
                    {chap.completed ? <Check size={18} /> : <span className="text-xs font-mono">{idx + 1}</span>}
                  </div>
                  <div>
                    <span className={`font-semibold text-base transition-colors ${chap.completed ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}>
                      Chapter {chap.chapterIndex}: {chap.name}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] font-mono text-slate-400">
                        {chap.completed ? 'Node Mastered' : 'Knowledge Pending'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto" onClick={(e) => e.stopPropagation()}>
                  <button 
                    className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                      chap.completed 
                        ? 'bg-white/5 text-slate-400 hover:text-white border border-white/10 hover:bg-white/10' 
                        : 'bg-white text-black hover:bg-slate-200 font-bold'
                    }`}
                    onClick={() => toggleComplete(chap._id, !chap.completed)}
                  >
                    {chap.completed ? 'Reset' : 'Complete'}
                  </button>
                  <button 
                    className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/15 flex items-center justify-center text-slate-400 hover:text-white border border-white/10 transition-all cursor-pointer"
                    onClick={() => navigate(`/chapter/${chap._id}`)}
                    title="Open Chapter Workspace"
                  >
                    <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Sleek Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-md bg-[#0A0A0E] border border-rose-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
                  <AlertTriangle size={20} />
                </div>
                <button 
                  onClick={() => setShowDeleteModal(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
                >
                  <X size={18} />
                </button>
              </div>

              <h4 className="text-xl font-bold text-white mb-2 tracking-tight">Decommission Subject?</h4>
              <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                Are you sure you want to delete <span className="text-white font-semibold font-mono">"{subject?.name}"</span>? All associated chapter research notes and quiz telemetry will be permanently wiped.
              </p>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={confirmDeleteSubject}
                  className="px-5 py-2 rounded-xl text-xs font-mono uppercase tracking-wider bg-rose-500 text-white font-semibold hover:bg-rose-600 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  {isDeleting ? <Loader size={14} className="animate-spin" /> : <Trash size={14} />}
                  <span>Confirm Delete</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Subject;
