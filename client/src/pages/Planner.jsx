import React, { useState } from 'react';
import { CalendarCheck, Plus, Trash2, CheckCircle2, Circle } from 'lucide-react';

const Planner = () => {
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

  return (
    <div>
      <h2 className="text-3xl font-bold mb-8 flex items-center gap-3 text-white"><CalendarCheck className="text-white" /> Study Planner</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="stealth-card p-6 border border-white/5 shadow-lg">
          <h3 className="text-xl font-semibold text-white mb-6">Today's Tasks</h3>
          
          <form onSubmit={addTask} className="flex gap-3 mb-6">
            <input 
              type="text" 
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="E.g., Read Chapter 3 of Database Systems..."
              className="stealth-input flex-1 py-3 px-4 rounded-xl text-sm"
            />
            <button type="submit" className="px-5 py-3 bg-white text-black font-semibold rounded-xl hover:bg-slate-200 active:scale-95 transition-all">
              <Plus size={20} />
            </button>
          </form>

          <div className="flex flex-col gap-3">
            {tasks.length === 0 ? (
              <p className="text-slate-400 text-center py-6">Your planner is empty. Add a task above!</p>
            ) : (
              tasks.map(task => (
                <div 
                  key={task.id} 
                  className={`flex justify-between items-center p-4 rounded-xl border transition-all duration-300 ${
                    task.completed 
                      ? 'bg-white/[0.02] border-white/5 opacity-50' 
                      : 'bg-white/[0.04] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => toggleTask(task.id)}>
                    {task.completed ? <CheckCircle2 className="text-white" size={20} /> : <Circle className="text-slate-500" size={20} />}
                    <span className={`text-sm ${task.completed ? 'text-slate-500 line-through font-mono' : 'text-slate-200'}`}>
                      {task.text}
                    </span>
                  </div>
                  <button onClick={() => deleteTask(task.id)} className="text-slate-500 hover:text-white transition-colors ml-4">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex flex-col gap-8">
          <div className="stealth-card p-6 border border-white/5 flex flex-col items-center justify-center min-h-[300px]">
            {/* High-end SVG Circular Progress Ring */}
            {(() => {
              const percentage = tasks.length === 0 ? 0 : Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100);
              const radius = 70;
              const circumference = 2 * Math.PI * radius;
              const strokeDashoffset = circumference - (percentage / 100) * circumference;

              return (
                <div className="relative w-48 h-48 flex items-center justify-center mb-6">
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
                    <h2 className="text-4xl font-black text-white tracking-tighter">
                      {percentage}%
                    </h2>
                    <p className="text-[10px] text-slate-400 font-mono tracking-[0.25em] uppercase">DONE</p>
                  </div>
                </div>
              );
            })()}
            <h3 className="text-lg font-medium text-white mb-2">Daily Goal Progress</h3>
            <p className="text-slate-400 text-sm text-center">Complete your tasks to fill the ring!</p>
          </div>

          <div className="stealth-card p-6 border border-white/5 shadow-lg flex-1 flex flex-col">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <span className="p-2 bg-white/5 text-white rounded-lg"><CalendarCheck size={18} /></span> 
              Quick Reminders
            </h3>
            <textarea 
              value={reminders}
              onChange={handleReminderChange}
              placeholder="Jot down quick notes, upcoming deadlines, or study reminders here..."
              className="stealth-input flex-1 w-full min-h-[150px] resize-none p-4 text-sm"
            ></textarea>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Planner;
