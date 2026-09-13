import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Book, ChevronRight, Loader } from 'lucide-react';
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
    return <div className="flex justify-center items-center h-64"><Loader className="animate-spin text-white" size={32} /></div>;
  }

  return (
    <div className="pb-12 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 flex items-center gap-3 text-white"><Book className="text-white" /> All Subjects</h2>
      
      {subjects.length === 0 ? (
        <div className="stealth-card p-12 text-center">
          <p className="text-slate-400 mb-4">You haven't added any subjects yet.</p>
          <Link to="/" className="px-6 py-2 bg-white text-black font-semibold uppercase tracking-widest inline-flex hover:bg-slate-200 transition-colors">Go to Dashboard to add one</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map(subject => {
            const total = subject.chapters?.length || 0;
            const completed = subject.chapters?.filter(c => c.completed)?.length || 0;
            const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

            return (
              <Link key={subject._id} to={`/subject/${subject._id}`} className="block group">
                <div className="stealth-card p-6 h-full flex flex-col hover:border-white/20 transition-all">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-slate-300 transition-colors">{subject.name}</h3>
                  <p className="text-sm text-slate-400">Created on {new Date(subject.createdAt).toLocaleDateString()}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SubjectsList;
