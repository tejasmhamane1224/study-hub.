import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  GraduationCap, 
  PieChart, 
  Book, 
  CalendarCheck, 
  LineChart, 
  Moon, 
  Bell, 
  LogOut,
  Bot
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', icon: PieChart, label: 'Dashboard' },
    { path: '/ai', icon: Bot, label: 'AI Tutor' },
    { path: '/subjects', icon: Book, label: 'Subjects' },
    { path: '/planner', icon: CalendarCheck, label: 'Study Planner' },
    { path: '/analytics', icon: LineChart, label: 'Analytics' },
  ];

  return (
    <aside className="w-[260px] ios-glass flex flex-col py-6 px-4 fixed h-screen z-50 transition-transform md:translate-x-0 -translate-x-full rounded-none rounded-r-[28px] border-l-0">
      <div className="text-2xl font-bold text-cyan-400 mb-8 px-3 flex items-center gap-2">
        <GraduationCap size={28} /> STUDY HUB
      </div>
      
      <nav className="flex-1 flex flex-col gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || 
                          (item.path !== '/' && location.pathname.startsWith(item.path));
          
          return (
            <Link 
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                isActive 
                  ? 'bg-gradient-to-r from-cyan-500/20 to-sky-500/20 text-cyan-400 shadow-[inset_2px_0_0_#22d3ee]' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-cyan-400' : 'opacity-70'} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-white/10">
        <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all w-full font-medium">
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
};

const Topbar = () => {
  const navigate = useNavigate();
  
  // In a real app, this would get the user from context/Redux
  const user = { name: "Student", initials: "ST" };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <header className="h-[72px] ios-glass flex items-center justify-between px-4 md:px-8 sticky top-0 z-40 rounded-none rounded-b-[28px] border-t-0 border-l-0 border-r-0">
      <div>
        <h2 className="text-lg font-semibold m-0 text-white">Student Workspace</h2>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="w-10 h-10 rounded-full flex items-center justify-center text-slate-300 hover:bg-white/10 transition-colors">
          <Moon size={20} />
        </button>
        <button className="w-10 h-10 rounded-full flex items-center justify-center text-slate-300 hover:bg-white/10 transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.8)]"></span>
        </button>
        
        <div className="flex items-center gap-3 ml-2 pl-4 border-l border-white/10">
          <span className="font-medium text-sm hidden sm:block text-white">{user.name}</span>
          <button 
            onClick={handleLogout}
            className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-sky-600 flex items-center justify-center font-bold text-white shadow-lg cursor-pointer"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};

const Layout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div className="flex w-full min-h-screen text-slate-100 transition-colors duration-300 bg-transparent">
      <Sidebar />
      <main className="flex-1 md:ml-[260px] flex flex-col min-h-screen overflow-hidden">
        <Topbar />
        <div className="flex-1 p-4 md:p-8 overflow-y-auto custom-scrollbar relative z-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
