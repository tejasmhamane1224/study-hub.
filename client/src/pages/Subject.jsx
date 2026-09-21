import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Trash, Check, ArrowRight, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

const Subject = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [subject, setSubject] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);

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
      loadSubjectData();
    } catch (err) {
      const msg = err.response?.data?.msg || err.response?.data?.message || err.message;
      alert(msg || 'Error updating chapter');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this subject and all its chapters?')) {
      try {
        await api.delete(`/subjects/${id}`);
        navigate('/');
      } catch (err) {
        const msg = err.response?.data?.msg || err.response?.data?.message || err.message;
        alert(msg || 'Error deleting subject');
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><Loader className="animate-spin text-white" size={32} /></div>;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <motion.div initial="hidden" animate="show" variants={containerVariants} className="max-w-4xl mx-auto pb-12">
      <motion.div 
        layoutId={`subject-card-${id}`}
        className="stealth-card p-8 mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 relative overflow-hidden"
      >
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/5 rounded-full blur-[80px] -z-10"></div>
        <div>
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center gap-2 text-slate-400 hover:text-white mb-2 text-sm transition-colors w-fit"
          >
            <ArrowLeft size={16} /> Dashboard
          </button>
          <h2 className="text-3xl font-bold tracking-tight text-white">{subject?.name || 'Subject Details'}</h2>
        </div>
        
        <button 
          onClick={handleDelete}
          className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl border border-red-500/20 transition-all font-medium text-sm"
        >
          <Trash size={16} /> Delete Subject
        </button>
      </motion.div>

      <motion.div variants={itemVariants} className="stealth-card p-6 md:p-8">
        <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
          <span className="text-xl font-medium tracking-tight text-white">Chapters</span>
          <span className="text-xs font-mono text-slate-500 uppercase">{chapters.length} Items</span>
        </div>

        <div className="flex flex-col gap-3">
          {chapters.length === 0 ? (
            <p className="text-slate-500 text-center py-12">No chapters found.</p>
          ) : (
            chapters.map((chap, idx) => (
              <motion.div 
                key={chap._id}
                variants={itemVariants}
                whileHover={{ scale: 1.01 }}
                className="stealth-card-inner flex flex-col sm:flex-row items-center justify-between p-4 px-6 group cursor-pointer"
                onClick={() => navigate(`/chapter/${chap._id}`)}
              >
                <div className="flex items-center gap-4 w-full sm:w-auto mb-4 sm:mb-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border transition-colors ${
                    chap.completed ? 'bg-white text-black border-white' : 'bg-black text-slate-600 border-white/10 group-hover:border-white/30'
                  }`}>
                    {chap.completed ? <Check size={16} /> : <span className="text-xs font-mono">{idx + 1}</span>}
                  </div>
                  <div className="flex flex-col">
                    <span className={`font-medium text-lg transition-colors ${chap.completed ? 'text-white' : 'text-slate-200'}`}>
                      Chapter {chap.chapterIndex}: {chap.name}
                    </span>
                    <span className="text-xs text-slate-500">
                      {chap.completed ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto" onClick={(e) => e.stopPropagation()}>
                  <button 
                    className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      chap.completed 
                        ? 'bg-white/5 text-slate-400 hover:text-white border border-white/5 hover:bg-white/10' 
                        : 'bg-white text-black hover:bg-slate-200'
                    }`}
                    onClick={() => toggleComplete(chap._id, !chap.completed)}
                  >
                    {chap.completed ? 'Undo' : 'Mark Complete'}
                  </button>
                  <button 
                    className="w-10 h-10 rounded-lg bg-[#111] flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 border border-white/10 transition-all"
                    onClick={() => navigate(`/chapter/${chap._id}`)}
                  >
                    <ArrowRight size={18} />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Subject;
