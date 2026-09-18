import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Play, Pause, RotateCcw, Maximize2, Minimize2, Volume2, VolumeX,
  Book, Brain, Sparkles, Clock, CheckCircle2, FileText, HelpCircle,
  ArrowRight, ShieldCheck, Zap, Layers, Target, ChevronRight,
  Sparkle, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Video Walkthrough Simulation Component with realistic playback controls
const AestheticVideoPlayer = ({ section, isPlaying, onTogglePlay, speed, onSpeedChange }) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const playerRef = useRef(null);

  const duration = section.duration || 20;

  // Video progress timer
  useEffect(() => {
    let timer = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            return 0; // loop
          }
          return prev + 1;
        });
      }, 1000 / speed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, duration, speed]);

  const handleSeek = (e) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (playerRef.current?.requestFullscreen) {
        playerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  const formatSecs = (s) => {
    const min = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <div 
      ref={playerRef}
      className="w-full bg-[#080808] border border-white/15 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col relative group"
    >
      {/* Top Cinematic Window Bar */}
      <div className="bg-black/90 px-4 py-3 border-b border-white/10 flex items-center justify-between z-20">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
          </div>
          <span className="text-[11px] font-mono text-slate-400 ml-2 hidden sm:inline">
            STUDY_HUB_WALKTHROUGH // {section.title.toUpperCase()}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>SIMULATED 60FPS</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-white/10 text-[10px] font-mono text-slate-300">1080p HD</span>
        </div>
      </div>

      {/* 16:9 Screen Viewport / Simulated Live Video Render */}
      <div className="relative aspect-video w-full bg-gradient-to-br from-black via-[#0a0a0f] to-black flex items-center justify-center overflow-hidden">
        {/* Animated Cyber Grid / Tech scanline effect */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none" />

        {/* Ambient video glow in background */}
        <div 
          className="absolute w-72 h-72 rounded-full blur-[90px] pointer-events-none opacity-20 transition-all duration-700"
          style={{ backgroundColor: section.accentColor || '#ffffff' }}
        />

        {/* Real-time Dynamic Visual Scene based on Section */}
        <div className="relative z-10 w-full h-full p-4 sm:p-8 flex items-center justify-center">
          {section.id === 'pomodoro' && (
            <div className="flex flex-col items-center justify-center text-center">
              <div className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] font-mono text-emerald-400 mb-3 tracking-widest uppercase">
                {currentTime % 2 === 0 ? '● FOCUS SESSION ACTIVE' : '○ SYNCING INTERVAL'}
              </div>
              <div className="text-5xl sm:text-7xl font-light text-white font-mono tracking-tighter drop-shadow-[0_0_30px_rgba(255,255,255,0.4)]">
                {24 - Math.floor(currentTime / 2)}:{59 - (currentTime * 7) % 60 < 10 ? '0' : ''}{59 - (currentTime * 7) % 60}
              </div>
              <div className="w-48 sm:w-64 h-1.5 bg-white/10 rounded-full mt-4 overflow-hidden">
                <div 
                  className="h-full bg-white transition-all duration-300 shadow-[0_0_10px_white]"
                  style={{ width: `${Math.min(100, (currentTime / duration) * 100)}%` }}
                />
              </div>
              <div className="flex gap-2 mt-4">
                {[0, 1, 2, 3].map((dot) => (
                  <div 
                    key={dot}
                    className={`w-2.5 h-2.5 rounded-full ${
                      (currentTime > dot * 4) ? 'bg-white shadow-[0_0_8px_white]' : 'bg-white/20'
                    } transition-all`}
                  />
                ))}
              </div>
              <span className="text-[11px] font-mono text-slate-400 mt-2">
                Sprint 1 of 4 • 25m Focus ➔ 5m Break
              </span>
            </div>
          )}

          {section.id === 'subjects' && (
            <div className="w-full max-w-md bg-black/70 border border-white/20 rounded-xl p-5 shadow-2xl backdrop-blur-md">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Book size={16} className="text-cyan-400" />
                  <span className="font-semibold text-white text-sm">Advanced Algorithms</span>
                </div>
                <span className="text-xs font-mono text-emerald-400">80% Done</span>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between p-2.5 rounded bg-white/5 border border-white/10 items-center">
                  <span className="text-slate-200">1. Graph Traversal & DFS</span>
                  <CheckCircle2 size={15} className="text-emerald-400" />
                </div>
                <div className="flex justify-between p-2.5 rounded bg-white/5 border border-white/10 items-center">
                  <span className="text-slate-200">2. Dynamic Programming</span>
                  <CheckCircle2 size={15} className="text-emerald-400" />
                </div>
                <div className="flex justify-between p-2.5 rounded bg-white/5 border border-white/10 items-center">
                  <span className="text-slate-200">3. Shortest Path & Dijkstra</span>
                  <span className="text-[10px] font-mono text-cyan-400 animate-pulse">STUDYING NOW</span>
                </div>
              </div>
            </div>
          )}

          {section.id === 'pdf' && (
            <div className="w-full max-w-md bg-black/70 border border-white/20 rounded-xl p-5 shadow-2xl backdrop-blur-md flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-purple-400" />
                  <span className="text-sm font-semibold text-white">Lecture_Notes_Week_4.pdf</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded">
                  AI SYNTHESIS
                </span>
              </div>
              <div className="bg-white/5 p-3 rounded border border-white/10 text-xs text-slate-300 leading-relaxed font-mono">
                <p className="text-emerald-400 font-bold mb-1">⚡ Key Formula Extracted:</p>
                <code className="text-white block bg-black/50 p-2 rounded mb-2">
                  f'(x) = lim (h-&gt;0) [f(x+h) - f(x)] / h
                </code>
                <p className="text-slate-400 text-[11px]">✓ 4 Core Definitions indexed • 2 Practice Examples extracted</p>
              </div>
            </div>
          )}

          {section.id === 'ai' && (
            <div className="w-full max-w-md bg-black/70 border border-white/20 rounded-xl p-5 shadow-2xl backdrop-blur-md flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <Brain size={15} className="text-emerald-400" />
                <span>STUDY HUB AI TUTOR</span>
              </div>
              <div className="p-3 bg-white/5 border border-white/10 rounded-lg text-xs text-white">
                <span className="text-slate-400 block text-[10px] font-mono mb-1">USER QUERY:</span>
                "Explain how binary search achieves O(log n) step-by-step."
              </div>
              <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-lg text-xs text-slate-200">
                <span className="text-emerald-400 block text-[10px] font-mono mb-1">AI RESPONSE:</span>
                "Each comparison eliminates half of the remaining search space. After k steps, n / 2^k = 1, giving k = log2(n)."
              </div>
            </div>
          )}

          {section.id === 'quiz' && (
            <div className="w-full max-w-md bg-black/70 border border-white/20 rounded-xl p-5 shadow-2xl backdrop-blur-md flex flex-col gap-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-mono text-slate-400">Question 3 of 5</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono">ACTIVE RECALL</span>
              </div>
              <p className="text-sm text-white font-medium">
                Which data structure guarantees O(1) average lookup time?
              </p>
              <div className="space-y-1.5 text-xs">
                <div className="p-2.5 rounded bg-white/5 border border-white/10 text-slate-400">A) Binary Search Tree</div>
                <div className="p-2.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-semibold flex justify-between items-center">
                  <span>B) Hash Table (Map)</span>
                  <CheckCircle2 size={15} className="text-emerald-400" />
                </div>
                <div className="p-2.5 rounded bg-white/5 border border-white/10 text-slate-400">C) Linked List</div>
              </div>
            </div>
          )}

          {section.id === 'planner' && (
            <div className="w-full max-w-md bg-black/70 border border-white/20 rounded-xl p-5 shadow-2xl backdrop-blur-md flex items-center gap-6">
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="transparent" />
                  <circle 
                    cx="50" cy="50" r="40" stroke="#ffffff" strokeWidth="8" 
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={(2 * Math.PI * 40) * 0.25}
                    strokeLinecap="round" fill="transparent"
                  />
                </svg>
                <span className="absolute text-xl font-black text-white">75%</span>
              </div>
              <div className="flex-1 space-y-2 text-xs">
                <div className="text-white font-semibold">Today's Daily Target</div>
                <div className="text-slate-400 line-through">✓ Read Chapter 4</div>
                <div className="text-slate-400 line-through">✓ Complete 10 MCQs</div>
                <div className="text-emerald-400">● Run 25m Focus Sprint</div>
              </div>
            </div>
          )}
        </div>

        {/* Center Big Play Button Overlay if paused */}
        {!isPlaying && (
          <div 
            onClick={onTogglePlay}
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center cursor-pointer z-20 group-hover:bg-black/50 transition-all"
          >
            <div className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.5)] transform group-hover:scale-110 transition-transform">
              <Play size={24} className="ml-1 fill-black" />
            </div>
          </div>
        )}
      </div>

      {/* Video Controls Bar */}
      <div className="bg-black/95 px-4 py-3 border-t border-white/10 flex flex-col gap-2 z-20">
        {/* Scrubber Timeline */}
        <div className="flex items-center gap-3">
          <input 
            type="range" 
            min="0" 
            max={duration} 
            value={currentTime} 
            onChange={handleSeek}
            className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white hover:accent-emerald-400"
          />
        </div>

        {/* Control Buttons & Timestamps */}
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <div className="flex items-center gap-3">
            <button 
              onClick={onTogglePlay}
              className="p-1.5 rounded-lg text-white hover:bg-white/10 transition-colors"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <button 
              onClick={() => setCurrentTime(0)}
              className="p-1.5 rounded-lg hover:text-white hover:bg-white/10 transition-colors"
              title="Replay from start"
            >
              <RotateCcw size={14} />
            </button>
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 rounded-lg hover:text-white hover:bg-white/10 transition-colors"
            >
              {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>
            <span className="text-[11px] text-slate-300">
              {formatSecs(currentTime)} / {formatSecs(duration)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => onSpeedChange(speed === 1 ? 1.5 : speed === 1.5 ? 2 : 1)}
              className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] text-white"
              title="Change Speed"
            >
              {speed}x
            </button>
            <button 
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg hover:text-white hover:bg-white/10 transition-colors"
              title="Fullscreen"
            >
              <Maximize2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const HowToUse = () => {
  const [selectedSectionId, setSelectedSectionId] = useState('pomodoro');
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);

  // All core sections of STUDY HUB
  const sections = [
    {
      id: 'pomodoro',
      title: 'Pomodoro Focus Protocol',
      tagline: 'Master the 25/5 Deep Work Sprint Engine',
      duration: 25,
      accentColor: '#10b981',
      icon: Clock,
      targetPath: '/planner',
      targetLabel: 'Launch Focus Session',
      steps: [
        {
          title: 'Select Sprint Duration',
          desc: 'Choose between 25-minute deep focus sprints, 5-minute cognitive resets, or 15-minute long recharge periods.'
        },
        {
          title: 'Eliminate All Distractions',
          desc: 'A Pomodoro is an indivisible unit of work. Protect the 25-minute boundary without looking at social media or checking notifications.'
        },
        {
          title: 'Complete 4 Cycles (100 Mins)',
          desc: 'Completing 4 successive focus sprints fills your progress tracker, triggering an automatic long break to cement memory retention.'
        },
        {
          title: '+5m Flow Extension',
          desc: 'If you are deeply in the zone when the timer finishes, hit the +5m button to ride your momentum without interrupting cognitive flow.'
        }
      ],
      proTips: [
        'Synaptic consolidation happens during the 5-minute break. Step away from your computer screen during breaks.',
        'If interrupted for more than 2 minutes, restart the timer to preserve neuroplastic adaptation.'
      ]
    },
    {
      id: 'subjects',
      title: 'Subject Workspaces & Chapters',
      tagline: 'Structure Courses, Syllabi & Chapter Milestones',
      duration: 20,
      accentColor: '#06b6d4',
      icon: Book,
      targetPath: '/subjects',
      targetLabel: 'View All Subjects',
      steps: [
        {
          title: 'Create a New Subject',
          desc: 'Type your course name (e.g., "Calculus II", "Operating Systems") and allocate the total number of chapters.'
        },
        {
          title: 'Organize Chapter Studios',
          desc: 'Click into any subject to access individual chapter workspaces with auto-calculated progress meters.'
        },
        {
          title: 'Track Completion Rates',
          desc: 'Mark chapters complete as you finish them. Your overall progress ring on the dashboard updates in real-time.'
        }
      ],
      proTips: [
        'Keep subject names clean and specific to ensure AI queries retrieve accurate course context.',
        'Break hefty textbooks down into chapter chunks of 15–25 pages each.'
      ]
    },
    {
      id: 'pdf',
      title: 'Chapter Studio & PDF Summarizer',
      tagline: 'Upload Lecture Slides & Extract Instant AI Notes',
      duration: 22,
      accentColor: '#a855f7',
      icon: FileText,
      targetPath: '/subjects',
      targetLabel: 'Open Chapter Studio',
      steps: [
        {
          title: 'Upload Lecture PDFs or Slides',
          desc: 'Drop textbook chapters, professor slide decks, or lecture notes directly into the Chapter Studio dropzone.'
        },
        {
          title: 'Instant AI Document Parsing',
          desc: 'STUDY HUB parses the text in memory and extracts key theorems, formulas, definitions, and chapter summaries.'
        },
        {
          title: 'Review Key Takeaways',
          desc: 'Read through the bulleted synthesis and LaTeX mathematical equations formatted with crisp KaTeX typography.'
        }
      ],
      proTips: [
        'PDFs under 50 pages process in seconds with zero server memory degradation.',
        'Upload your syllabus at the start of the semester to get an instant chapter roadmap.'
      ]
    },
    {
      id: 'ai',
      title: 'Conversational AI Tutor',
      tagline: 'Ask Any Concept, Derive Proofs & Debug Code',
      duration: 24,
      accentColor: '#3b82f6',
      icon: Brain,
      targetPath: '/ai',
      targetLabel: 'Chat With AI Tutor',
      steps: [
        {
          title: 'Ask Open-Ended Concept Questions',
          desc: 'Ask the tutor to explain complex topics: "Explain the Second Law of Thermodynamics like I am in college."'
        },
        {
          title: 'Generate Instant Study Guides',
          desc: 'Use quick action presets to generate lecture summaries, practice quizzes, or step-by-step mathematical proofs.'
        },
        {
          title: 'Interactive Follow-Ups',
          desc: 'Ask clarifying questions on specific formulas, edge cases, or code snippets with full chat history preserved.'
        }
      ],
      proTips: [
        'Ask the AI tutor to test you: "Ask me 3 hard questions about eigenvalues and rate my answers."',
        'Use the KaTeX renderer to view clean mathematical fractions and matrices.'
      ]
    },
    {
      id: 'quiz',
      title: 'Practice Quizzes & Active Recall',
      tagline: 'Self-Test Before Exams with AI-Generated MCQs',
      duration: 20,
      accentColor: '#f59e0b',
      icon: HelpCircle,
      targetPath: '/ai',
      targetLabel: 'Generate Practice Quiz',
      steps: [
        {
          title: 'Generate Targeted Quizzes',
          desc: 'Request custom multiple-choice quizzes on any subject or specific chapter topic.'
        },
        {
          title: 'Select Answers & Get Feedback',
          desc: 'Instant evaluation reveals whether your response was correct along with detailed conceptual explanations.'
        },
        {
          title: 'Review Missed Questions',
          desc: 'Identify cognitive blindspots before actual midterms or finals to maximize exam scores.'
        }
      ],
      proTips: [
        'Active recall produces up to 50% higher exam retention compared to passive rereading.',
        'Retake quizzes after 24 hours to trigger spaced repetition memory consolidation.'
      ]
    },
    {
      id: 'planner',
      title: 'Daily Goals & Focus Planner',
      tagline: 'Micro-Task Scheduling & SVG Completion Rings',
      duration: 18,
      accentColor: '#ec4899',
      icon: Target,
      targetPath: '/planner',
      targetLabel: 'Open Study Planner',
      steps: [
        {
          title: 'Add Daily Micro-Tasks',
          desc: 'Chunk your day into achievable goals: "Finish 1 Pomodoro on Linear Algebra", "Review 5 Flashcards".'
        },
        {
          title: 'Watch the SVG Ring Fill',
          desc: 'Each checked task dynamically updates the circular progress ring toward 100% daily mastery.'
        },
        {
          title: 'Save Quick Reminders',
          desc: 'Use the persistent scratchpad to write formulas, upcoming deadlines, or professor office hours.'
        }
      ],
      proTips: [
        'Tasks and reminders automatically persist in your browser local storage across reloads.',
        'Aim to complete 4 to 6 micro-tasks per day to maintain steady academic momentum.'
      ]
    }
  ];

  const currentSection = sections.find(s => s.id === selectedSectionId) || sections[0];

  return (
    <div className="pb-24 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-[0.3em]">
              STUDY HUB System Manual // v2.0
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            How to Use STUDY HUB
          </h1>
          <p className="text-sm text-slate-400 mt-2 max-w-2xl leading-relaxed">
            Everything you need to master your syllabus. Watch aesthetic short video walkthroughs, learn the cognitive science behind each feature, and maximize your GPA.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/planner"
            className="px-4 py-2.5 rounded-xl bg-white text-black font-semibold text-xs flex items-center gap-2 hover:bg-slate-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)]"
          >
            <Clock size={14} /> Launch Pomodoro
          </Link>
          <Link
            to="/ai"
            className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-medium text-xs flex items-center gap-2 hover:bg-white/10 transition-all"
          >
            <Brain size={14} className="text-emerald-400" /> Ask AI Tutor
          </Link>
        </div>
      </div>

      {/* Feature Selector Tabs / Video Playlist */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-8 custom-scrollbar">
        {sections.map((sec) => {
          const Icon = sec.icon;
          const isActive = sec.id === selectedSectionId;
          return (
            <button
              key={sec.id}
              onClick={() => {
                setSelectedSectionId(sec.id);
                setIsPlaying(true);
              }}
              className={`px-4 py-3 rounded-xl text-xs font-mono flex items-center gap-2.5 whitespace-nowrap transition-all border ${
                isActive
                  ? 'bg-white text-black font-bold border-white shadow-[0_0_15px_rgba(255,255,255,0.2)] scale-105'
                  : 'bg-white/[0.02] text-slate-400 border-white/10 hover:border-white/25 hover:text-white'
              }`}
            >
              <Icon size={16} className={isActive ? 'text-black' : 'text-slate-400'} />
              <span>{sec.title}</span>
            </button>
          );
        })}
      </div>

      {/* Main Interactive Video Showcase & Walkthrough Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        {/* Left 7 Columns: Aesthetic Video Player */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <AestheticVideoPlayer 
            section={currentSection}
            isPlaying={isPlaying}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
            speed={speed}
            onSpeedChange={setSpeed}
          />

          <div className="flex items-center justify-between px-2 text-xs font-mono text-slate-500">
            <span>TIP: Click any control to scrub timeline or speed up simulation</span>
            <span className="flex items-center gap-1 text-slate-400">
              <Sparkles size={12} className="text-emerald-400" /> Autoplay Active
            </span>
          </div>
        </div>

        {/* Right 5 Columns: Step-by-Step Instructions & Pro Tips */}
        <div className="lg:col-span-5 flex flex-col justify-between stealth-card p-6 sm:p-8 border border-white/15 bg-white/[0.01]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest">
                  Walkthrough Guide
                </span>
              </div>
              <span className="text-xs font-mono text-emerald-400 border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                Step-by-Step
              </span>
            </div>

            <h2 className="text-2xl font-bold text-white tracking-tight mb-1">
              {currentSection.title}
            </h2>
            <p className="text-xs font-mono text-slate-400 mb-6">
              {currentSection.tagline}
            </p>

            {/* Steps list */}
            <div className="space-y-4 mb-6">
              {currentSection.steps.map((step, idx) => (
                <div key={idx} className="flex gap-3 items-start">
                  <span className="w-6 h-6 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center text-xs font-mono font-bold text-white shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-200 mb-0.5">{step.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pro Tips Box */}
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 mb-6">
              <div className="flex items-center gap-2 text-xs font-bold text-white mb-2">
                <Zap size={14} className="text-amber-400" />
                <span>Cognitive Pro Tips:</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-400">
                {currentSection.proTips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-400">▸</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Quick Navigation Action Button */}
          <Link
            to={currentSection.targetPath}
            className="w-full py-3.5 px-6 rounded-xl bg-white text-black font-semibold text-sm flex items-center justify-center gap-2 hover:bg-slate-200 transition-all active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          >
            <span>{currentSection.targetLabel}</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* BOTTOM SECTION: The Master 4-Step Study Routine */}
      <div className="stealth-card p-6 sm:p-10 border border-white/15 bg-white/[0.01] rounded-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-[0.25em]">
                Workflow Optimization
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white tracking-tight">
              The STUDY HUB 4-Step Semester Blueprint
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              Combine all modules in this exact chronological order to maximize academic retention:
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>Proven 95% Retention Protocol</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl border border-white/10 bg-white/[0.02] flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">PHASE 01 // 25 MIN</span>
              <h4 className="text-base font-semibold text-white mt-1 mb-2">Upload & Annotate</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Upload your slides into Chapter Studio. Read the key takeaways and flag confusing formulas.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 text-[11px] font-mono text-slate-500">
              Module: Chapter Studio
            </div>
          </div>

          <div className="p-5 rounded-xl border border-white/10 bg-white/[0.02] flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono text-cyan-400 font-bold">PHASE 02 // 25 MIN</span>
              <h4 className="text-base font-semibold text-white mt-1 mb-2">AI Deep Dive</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Open AI Tutor. Ask for intuitive proofs, code examples, or analogies for difficult concepts.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 text-[11px] font-mono text-slate-500">
              Module: AI Assistant
            </div>
          </div>

          <div className="p-5 rounded-xl border border-white/10 bg-white/[0.02] flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono text-purple-400 font-bold">PHASE 03 // 25 MIN</span>
              <h4 className="text-base font-semibold text-white mt-1 mb-2">Practice Quizzing</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Generate 5–10 MCQs. Answer them under timed pressure to identify lingering knowledge gaps.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 text-[11px] font-mono text-slate-500">
              Module: Quiz Generator
            </div>
          </div>

          <div className="p-5 rounded-xl border border-white/10 bg-white/[0.02] flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono text-amber-400 font-bold">PHASE 04 // 25 MIN</span>
              <h4 className="text-base font-semibold text-white mt-1 mb-2">Sprint & Complete</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Check off tasks in Focus Planner, fill your Daily Target Ring, and let your brain consolidate.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 text-[11px] font-mono text-slate-500">
              Module: Focus Command Center
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowToUse;
