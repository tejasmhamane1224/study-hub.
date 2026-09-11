import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Trash, Check, ArrowRight, Loader } from 'lucide-react';
import api from '../services/api';

const Subject = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [subject, setSubject] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubjectData();
  }, [id]);

  const loadSubjectData = async () => {
    setLoading(true);
    try {
      // Mocked up based on HTML: Get all subjects to find this one, then get chapters
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

  const toggleComplete = async (chapterId, isCompleted) => {
    try {
      await api.put(`/chapters/${chapterId}`, { completed: isCompleted });
      loadSubjectData();
    } catch (err) {
      alert(err.message || 'Error updating chapter');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this subject and all its chapters?')) {
      try {
        await api.delete(`/subjects/${id}`);
        navigate('/');
      } catch (err) {
        alert(err.message || 'Error deleting subject');
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><Loader className="animate-spin text-cyan-400" size={32} /></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
        <h2 className="text-2xl font-bold">{subject?.name || 'Subject Details'}</h2>
        <button 
          onClick={() => navigate('/')} 
          className="btn-glass"
        >
          <ArrowLeft size={18} /> Back to Dashboard
        </button>
      </div>

      <div className="glass-card shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <span className="text-lg font-semibold">Chapters</span>
          <button 
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/80 hover:bg-red-500 text-white rounded-xl border border-red-400/30 transition-colors shadow-[0_0_15px_rgba(239,68,68,0.2)]"
          >
            <Trash size={18} /> Delete Subject
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {chapters.length === 0 ? (
            <p className="text-slate-400 text-center py-4">No chapters found.</p>
          ) : (
            chapters.map(chap => (
              <div 
                key={chap._id} 
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border border-white/10 rounded-xl bg-white/5 hover:bg-white/10 transition-colors gap-4"
              >
                <div>
                  <h4 className="font-semibold text-white flex items-center gap-2">
                    {chap.title}
                    {chap.completed ? (
                      <span className="text-xs font-bold px-2 py-1 bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 rounded-full flex items-center gap-1 uppercase tracking-wide">
                        Completed <Check size={12} />
                      </span>
                    ) : (
                      <span className="text-xs font-bold px-2 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full uppercase tracking-wide">
                        Pending
                      </span>
                    )}
                  </h4>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  <label className="flex items-center gap-2 text-sm cursor-pointer select-none text-slate-700 dark:text-slate-300">
                    <input 
                      type="checkbox" 
                      checked={chap.completed || false} 
                      onChange={(e) => toggleComplete(chap._id, e.target.checked)}
                      className="w-4 h-4 text-cyan-400 rounded border-slate-300 focus:ring-blue-500"
                    />
                    Mark Complete
                  </label>
                  <Link 
                    to={`/chapter/${chap._id}`}
                    className="btn-glow px-4 py-2 text-sm"
                  >
                    Open <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Subject;
