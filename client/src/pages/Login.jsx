import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  GraduationCap, LogIn, UserPlus, Loader, AlertCircle, 
  Sparkles, ChevronDown, Mail, Lock, User, Eye, EyeOff, ArrowRight 
} from 'lucide-react';
import { AnimatePresence, motion, useScroll, useTransform, useSpring } from 'framer-motion';
import Lenis from '@studio-freight/lenis';
import api from '../services/api';
import Scene3D from '../components/Scene3D';
import Animated3DIntro from '../components/Animated3DIntro';

const Login = () => {
  const navigate = useNavigate();
  
  // Auth state
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Intro & Scrollytelling state
  const [showIntro, setShowIntro] = useState(true);
  const [isEntering, setIsEntering] = useState(false);
  const [isEnteringWorkspace, setIsEnteringWorkspace] = useState(false);

  // Global window scroll tracking with buttery smooth spring physics
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });
  
  // Text section opacities tied to scroll
  const section1Opacity = useTransform(smoothProgress, [0, 0.12, 0.22], [1, 1, 0]);
  const section1Y = useTransform(smoothProgress, [0, 0.22], [0, -40]);

  const section2Opacity = useTransform(smoothProgress, [0.24, 0.36, 0.48], [0, 1, 0]);
  const section2Y = useTransform(smoothProgress, [0.24, 0.36, 0.48], [40, 0, -40]);

  const section3Opacity = useTransform(smoothProgress, [0.50, 0.62, 0.74], [0, 1, 0]);
  const section3Y = useTransform(smoothProgress, [0.50, 0.62, 0.74], [40, 0, -40]);
  
  // Final Auth Card appears at the end of scroll
  const formOpacity = useTransform(smoothProgress, [0.76, 0.94], [0, 1]);
  const formY = useTransform(smoothProgress, [0.76, 0.94], [60, 0]);

  // Lock scroll while the initial intro HUD is active
  useEffect(() => {
    if (showIntro) {
      document.body.style.overflow = 'hidden';
      return;
    } 
    
    document.body.style.overflow = 'auto';

    // Initialize ultra-smooth Lenis scroll once the intro finishes
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // standard easing
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      smoothTouch: false,
      touchMultiplier: 2,
    });

    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      document.body.style.overflow = 'auto';
    };
  }, [showIntro]);

  const handleStartExperience = () => {
    setIsEntering(true);
    setTimeout(() => {
      setShowIntro(false);
      setIsEntering(false);
      window.scrollTo({ top: 0, behavior: 'auto' });
    }, 600);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || isEnteringWorkspace) return;
    setLoading(true);
    setError('');
    
    try {
      let res;
      if (authMode === 'login') {
        res = await api.post('/auth/login', { email, password });
      } else {
        res = await api.post('/auth/register', { name, email, password, role });
      }
      
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user || { name: name || 'Student' }));
      
      // Start smooth cinematic warp transition
      setIsEnteringWorkspace(true);
      setIsEntering(true);
      
      // Smoothly navigate after the animation plays gracefully
      setTimeout(() => {
        navigate('/');
      }, 750);
    } catch (err) {
      const serverMsg = err.response?.data?.msg || err.response?.data?.message || err.message;
      setError(serverMsg || 'Authentication failed. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full min-h-[420vh] bg-transparent text-slate-100 selection:bg-white/20">
      {/* 3D WebGL Canvas (Continuous Centerpiece Model + Particles) */}
      <Scene3D showIntro={showIntro} isEntering={isEntering} variant="hero" />

      {/* Grid Lines Overlay */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none z-10" />

      {/* Intro Gate HUD */}
      <AnimatePresence>
        {showIntro && (
          <Animated3DIntro 
            onEnter={handleStartExperience} 
            isEntering={isEntering}
            title="STUDY HUB" 
            subtitle="ACTIVE THEORY SCROLLYTELLING // 3D CORE" 
          />
        )}
      </AnimatePresence>

      {/* Scrollytelling Typography Stages */}
      {!showIntro && (
        <div className="fixed inset-0 pointer-events-none flex flex-col justify-center items-center px-6 z-20">
          
          {/* Stage 1 */}
          <motion.div 
            style={{ opacity: section1Opacity, y: section1Y }} 
            className="absolute text-center flex flex-col items-center max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono tracking-widest text-slate-400 uppercase">
              <span>01 // ARCHITECTURE</span>
            </div>
            <h2 className="text-5xl sm:text-7xl md:text-8xl font-black uppercase tracking-tighter mb-4 text-white drop-shadow-[0_0_35px_rgba(255,255,255,0.3)]">
              IMMERSIVE<br/>WORKSPACE
            </h2>
            <p className="text-slate-400 font-mono text-xs sm:text-sm tracking-widest uppercase leading-relaxed max-w-lg">
              Spatial cognitive environment designed for hyper-focus and distraction-free deep study.
            </p>
            <div className="mt-8 flex items-center gap-4 pointer-events-auto">
              <button
                type="button"
                onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
                className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-mono tracking-widest uppercase text-white transition-all cursor-pointer shadow-lg"
              >
                Skip to Sign In ➔
              </button>
            </div>

            <motion.div 
              animate={{ y: [0, 8, 0] }} 
              transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
              className="mt-8 text-white/60 flex flex-col items-center gap-2"
            >
              <span className="text-[10px] tracking-[0.3em] font-mono uppercase">OR SCROLL TO EXPLORE</span>
              <ChevronDown size={20} />
            </motion.div>
          </motion.div>

          {/* Stage 2 */}
          <motion.div 
            style={{ opacity: section2Opacity, y: section2Y }} 
            className="absolute text-center flex flex-col items-center max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono tracking-widest text-slate-400 uppercase">
              <span>02 // TELEMETRY</span>
            </div>
            <h2 className="text-5xl sm:text-7xl md:text-8xl font-black uppercase tracking-tighter mb-4 text-white drop-shadow-[0_0_35px_rgba(255,255,255,0.3)]">
              NEURAL<br/>ANALYTICS
            </h2>
            <p className="text-slate-400 font-mono text-xs sm:text-sm tracking-widest uppercase leading-relaxed max-w-lg">
              Real-time velocity metrics, retention intervals, and predictive mastery tracking across subjects.
            </p>
          </motion.div>

          {/* Stage 3 */}
          <motion.div 
            style={{ opacity: section3Opacity, y: section3Y }} 
            className="absolute text-center flex flex-col items-center max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono tracking-widest text-slate-400 uppercase">
              <span>03 // INTELLIGENCE</span>
            </div>
            <h2 className="text-5xl sm:text-7xl md:text-8xl font-black uppercase tracking-tighter mb-4 text-white drop-shadow-[0_0_35px_rgba(255,255,255,0.3)]">
              AI TUTOR<br/>NODE
            </h2>
            <p className="text-slate-400 font-mono text-xs sm:text-sm tracking-widest uppercase leading-relaxed max-w-lg">
              Context-aware problem solving, formula derivation, and structured concept mastery on demand.
            </p>
          </motion.div>

        </div>
      )}

      {/* Stage 4: Authentication Gate at the End of Scroll */}
      <div className="absolute bottom-0 w-full h-screen flex items-center justify-center p-4 z-30 pointer-events-none">
        <motion.div 
          style={{ opacity: formOpacity, y: formY }}
          animate={isEnteringWorkspace ? {
            opacity: 0,
            scale: 0.94,
            y: -24,
            filter: 'blur(16px)',
            transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] }
          } : {}}
          className="relative w-full max-w-md p-8 md:p-10 bg-[#0A0A0A]/95 border border-white/10 rounded-2xl shadow-[0_0_80px_rgba(0,0,0,0.95)] backdrop-blur-2xl pointer-events-auto"
        >
          {/* Brand Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 border border-white/15 text-white mb-3 shadow-[0_0_20px_rgba(255,255,255,0.15)]">
              <GraduationCap size={24} className="text-cyan-300" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white uppercase">STUDY HUB</h1>
            <p className="text-xs font-mono tracking-widest text-slate-400 mt-1 uppercase pb-1 leading-normal">
              AUTHENTICATION GATE
            </p>
          </div>

          {/* Mode Switcher Tabs (Sign In / Register) */}
          <div className="grid grid-cols-2 gap-1.5 p-1.5 bg-black/60 rounded-xl border border-white/10 mb-6">
            <button
              type="button"
              onClick={() => { setAuthMode('login'); setError(''); }}
              className={`py-2.5 text-xs font-mono uppercase tracking-wider rounded-lg transition-all cursor-pointer font-bold ${
                authMode === 'login' 
                  ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.25)]' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('register'); setError(''); }}
              className={`py-2.5 text-xs font-mono uppercase tracking-wider rounded-lg transition-all cursor-pointer font-bold ${
                authMode === 'register' 
                  ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.25)]' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Register
            </button>
          </div>

          {/* Error Notification */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2.5 animate-slide-up">
              <AlertCircle size={16} className="shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {authMode === 'register' && (
              <div>
                <label className="block text-xs font-mono tracking-wider text-slate-400 uppercase mb-2">Full Name</label>
                <div className="relative flex items-center">
                  <User size={18} className="text-slate-400 absolute left-3.5 pointer-events-none z-10 shrink-0" />
                  <input 
                    type="text" 
                    placeholder="Alex Walker" 
                    required
                    autoComplete="name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="stealth-input has-left-icon text-sm text-white w-full"
                    style={{ paddingLeft: '2.85rem' }}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-mono tracking-wider text-slate-400 uppercase mb-2">Email Address</label>
              <div className="relative flex items-center">
                <Mail size={18} className="text-slate-400 absolute left-3.5 pointer-events-none z-10 shrink-0" />
                <input 
                  type="email" 
                  placeholder="student@studyhub.internal" 
                  required
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="stealth-input has-left-icon text-sm text-white w-full"
                  style={{ paddingLeft: '2.85rem' }}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono tracking-wider text-slate-400 uppercase mb-2">Password</label>
              <div className="relative flex items-center">
                <Lock size={18} className="text-slate-400 absolute left-3.5 pointer-events-none z-10 shrink-0" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••••••" 
                  required
                  autoComplete={authMode === 'login' ? "current-password" : "new-password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="stealth-input has-both-icons text-sm text-white w-full"
                  style={{ paddingLeft: '2.85rem', paddingRight: '2.85rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-slate-400 hover:text-white p-1 transition-colors cursor-pointer z-10"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {authMode === 'register' && (
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
            )}

            <button 
              type="submit" 
              disabled={loading || isEnteringWorkspace}
              className="w-full mt-2 py-3.5 bg-white text-black font-bold text-xs uppercase tracking-[0.2em] rounded-xl hover:bg-slate-100 active:scale-[0.98] transition-all duration-200 flex justify-center items-center gap-2 disabled:opacity-80 cursor-pointer shadow-[0_0_25px_rgba(255,255,255,0.25)]"
            >
              {isEnteringWorkspace ? (
                <div className="flex items-center gap-2">
                  <Sparkles className="animate-spin text-black" size={16} />
                  <span>INITIALIZING WORKSPACE...</span>
                </div>
              ) : loading ? (
                <Loader className="animate-spin text-black" size={18} />
              ) : authMode === 'login' ? (
                <><LogIn size={16} /> Enter Workspace</>
              ) : (
                <><UserPlus size={16} /> Create Account</>
              )}
            </button>
          </form>

          {/* Replay 3D Intro Button */}
          <div className="mt-6 pt-4 border-t border-white/5 text-center">
            <button
              type="button"
              onClick={() => {
                setShowIntro(true);
                window.scrollTo({ top: 0, behavior: 'auto' });
              }}
              className="text-[10px] font-mono tracking-widest text-slate-500 hover:text-white uppercase inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles size={11} className="text-cyan-400" />
              <span>REPLAY 3D INTRO</span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* Fullscreen Warp Flash Fade on Enter */}
      <AnimatePresence>
        {isEnteringWorkspace && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md pointer-events-none z-50"
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Login;
