import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  GraduationCap, UserPlus, Loader, AlertCircle, 
  Mail, Lock, User, Eye, EyeOff 
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';
import Scene3D from '../components/Scene3D';

const Register = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/register', { name, email, password, role });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user || { name }));
      navigate('/');
    } catch (err) {
      const serverMsg = err.response?.data?.msg || err.response?.data?.message || err.message;
      setError(serverMsg || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 bg-[#000000] text-slate-100 overflow-hidden">
      {/* 3D Background Galaxy */}
      <Scene3D showIntro={false} />

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Register Portal Card */}
      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md p-8 md:p-10 bg-[#0A0A0A]/95 border border-white/10 rounded-2xl shadow-[0_0_80px_rgba(0,0,0,0.95)] backdrop-blur-2xl"
      >
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 border border-white/15 text-white mb-3 shadow-[0_0_20px_rgba(255,255,255,0.15)]">
            <GraduationCap size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white uppercase">STUDY HUB</h1>
          <p className="text-xs font-mono tracking-widest text-slate-400 mt-1 uppercase pb-1 leading-normal">
            ACCOUNT REGISTRATION
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2.5 animate-slide-up">
            <AlertCircle size={16} className="shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-mono tracking-wider text-slate-400 uppercase mb-2">Full Name</label>
            <div className="relative">
              <User size={16} className="text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input 
                type="text" 
                placeholder="Alex Walker" 
                required
                autoComplete="name"
                value={name}
                onChange={e => setName(e.target.value)}
                className="stealth-input pl-10 pr-4 py-3 w-full text-sm text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono tracking-wider text-slate-400 uppercase mb-2">Email Address</label>
            <div className="relative">
              <Mail size={16} className="text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input 
                type="email" 
                placeholder="alex@studyhub.internal" 
                required
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="stealth-input pl-10 pr-4 py-3 w-full text-sm text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono tracking-wider text-slate-400 uppercase mb-2">Password</label>
            <div className="relative">
              <Lock size={16} className="text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••••••" 
                required
                autoComplete="new-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="stealth-input pl-10 pr-11 py-3 w-full text-sm text-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 transition-colors cursor-pointer"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono tracking-wider text-slate-400 uppercase mb-2">Account Role</label>
            <select 
              value={role}
              onChange={e => setRole(e.target.value)}
              className="stealth-input px-4 py-3 w-full text-sm text-white bg-[#0A0A0E] cursor-pointer"
            >
              <option value="student" className="bg-black text-white">Student</option>
              <option value="teacher" className="bg-black text-white">Teacher / Instructor</option>
            </select>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-2 py-3.5 bg-white text-black font-bold text-xs uppercase tracking-[0.2em] rounded-xl hover:bg-slate-100 active:scale-[0.98] transition-all duration-200 flex justify-center items-center gap-2 disabled:opacity-80 cursor-pointer shadow-[0_0_25px_rgba(255,255,255,0.25)]"
          >
            {loading ? <Loader className="animate-spin text-black" size={18} /> : <><UserPlus size={16} /> Create Account</>}
          </button>
        </form>

        <p className="text-center mt-6 text-xs text-slate-400 font-sans">
          Already have an account?{' '}
          <Link to="/login" className="text-white font-medium hover:underline underline-offset-4 transition-colors">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
