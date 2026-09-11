import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Book, ChevronRight, Loader } from 'lucide-react';
import api from '../services/api';

const SubjectsList = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubjects();
  }, []);

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

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader className="animate-spin text-cyan-400" size={32} /></div>;
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-8 flex items-center gap-3 text-white"><Book className="text-cyan-400" /> All Subjects</h2>
      
      {subjects.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-slate-400 mb-4">You haven't added any subjects yet.</p>
          <Link to="/" className="btn-glow inline-flex">Go to Dashboard to add one</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map(subject => (
            <Link 
              key={subject._id} 
              to={`/subject/${subject._id}`}
              className="glass-card p-6 flex flex-col justify-between hover:scale-[1.02] transition-transform duration-300 border border-white/5 hover:border-cyan-400/30 group"
            >
              <div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">{subject.name}</h3>
                <p className="text-sm text-slate-400">Created on {new Date(subject.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="mt-6 flex justify-end">
                <div className="btn-glass px-4 py-2 text-sm rounded-full">
                  Open <ChevronRight size={16} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubjectsList;
