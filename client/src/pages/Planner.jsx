import React, { useState, useEffect } from 'react';
import { CalendarCheck, Plus, Trash2, CheckCircle2, Circle } from 'lucide-react';

const Planner = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [reminders, setReminders] = useState('');

  useEffect(() => {
    const savedTasks = localStorage.getItem('planner_tasks');
    if (savedTasks) setTasks(JSON.parse(savedTasks));

    const savedReminders = localStorage.getItem('planner_reminders');
    if (savedReminders) setReminders(savedReminders);
  }, []);

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
      <h2 className="text-3xl font-bold mb-8 flex items-center gap-3 text-white"><CalendarCheck className="text-cyan-400" /> Study Planner</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-6 border border-white/5 shadow-lg">
          <h3 className="text-xl font-semibold text-white mb-6">Today's Tasks</h3>
          
          <form onSubmit={addTask} className="flex gap-3 mb-6">
            <input 
              type="text" 
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="E.g., Read Chapter 3 of Database Systems..."
              className="glass-input flex-1 py-3 px-4 rounded-xl text-sm"
            />
            <button type="submit" className="btn-glow px-4 py-2 rounded-xl">
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
                      ? 'bg-teal-500/10 border-teal-500/30 opacity-70' 
                      : 'bg-white/5 border-white/10 hover:border-cyan-400/30'
                  }`}
                >
                  <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => toggleTask(task.id)}>
                    {task.completed ? <CheckCircle2 className="text-teal-400" size={20} /> : <Circle className="text-slate-400" size={20} />}
                    <span className={`text-sm ${task.completed ? 'text-slate-400 line-through' : 'text-slate-200'}`}>
                      {task.text}
                    </span>
                  </div>
                  <button onClick={() => deleteTask(task.id)} className="text-slate-500 hover:text-red-400 transition-colors ml-4">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex flex-col gap-8">
          <div className="glass-card p-6 border border-white/5 flex flex-col items-center justify-center min-h-[300px]">
            <div className="w-48 h-48 rounded-full border-8 border-white/10 flex flex-col items-center justify-center mb-6 shadow-inner relative">
               <div className="absolute inset-0 border-8 border-cyan-400 rounded-full" 
                    style={{ 
                      clipPath: `polygon(0 0, 100% 0, 100% ${tasks.length === 0 ? 0 : Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100)}%, 0 ${tasks.length === 0 ? 0 : Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100)}%)`,
                      transition: 'clip-path 1s ease-in-out'
                    }}></div>
               <h2 className="text-4xl font-bold text-white relative z-10">
                 {tasks.length === 0 ? 0 : Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100)}%
               </h2>
               <p className="text-xs text-slate-400 uppercase tracking-widest relative z-10">Done</p>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Daily Goal Progress</h3>
            <p className="text-slate-400 text-sm text-center">Complete your tasks to fill the ring!</p>
          </div>

          <div className="glass-card p-6 border border-white/5 shadow-lg flex-1 flex flex-col">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <span className="p-2 bg-purple-500/20 text-purple-400 rounded-lg"><CalendarCheck size={18} /></span> 
              Quick Reminders
            </h3>
            <textarea 
              value={reminders}
              onChange={handleReminderChange}
              placeholder="Jot down quick notes, upcoming deadlines, or study reminders here..."
              className="glass-input flex-1 w-full min-h-[150px] resize-none p-4 text-sm"
            ></textarea>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Planner;
