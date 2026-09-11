import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, LogIn, Loader } from 'lucide-react';
import api from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user || { name: 'Student' }));
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="flex justify-center items-center min-h-screen w-full p-4 text-slate-100"
      style={{
        backgroundColor: '#050b14',
        backgroundImage: `
          radial-gradient(circle at 15% 50%, rgba(6, 182, 212, 0.25), transparent 30%),
          radial-gradient(circle at 85% 30%, rgba(139, 92, 246, 0.25), transparent 30%),
          radial-gradient(circle at 50% 100%, rgba(14, 165, 233, 0.2), transparent 40%)
        `,
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="glass-card w-full max-w-md p-10">
        <div className="text-center text-3xl text-cyan-400 font-bold mb-8 flex items-center justify-center gap-2">
          <GraduationCap size={32} /> STUDY HUB
        </div>
        <h2 className="text-center text-xl font-semibold mb-6 text-white">Welcome Back</h2>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input 
            type="email" 
            placeholder="Email Address" 
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="glass-input"
          />
          <input 
            type="password" 
            placeholder="Password" 
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="glass-input"
          />
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium flex justify-center items-center gap-2 transition-colors disabled:opacity-70 mt-2"
          >
            {loading ? <Loader className="animate-spin" size={20} /> : <><LogIn size={20} /> Login</>}
          </button>
        </form>
        <p className="text-center mt-6 text-slate-400">
          Don't have an account? <Link to="/register" className="text-cyan-400 font-medium hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
