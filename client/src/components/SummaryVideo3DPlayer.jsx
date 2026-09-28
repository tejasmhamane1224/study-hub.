import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Float, Text, OrbitControls, Sparkles, Sphere, MeshDistortMaterial, Billboard, Ring, Torus } from '@react-three/drei';
import { Play, Pause, X, Volume2, VolumeX, SkipForward, SkipBack, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';

/* ── Animated particle ring that orbits around the scene ── */
const OrbitRing = ({ color = '#4f46e5', radius = 4, speed = 0.3 }) => {
  const ref = useRef();
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.x += delta * speed * 0.5;
      ref.current.rotation.z += delta * speed;
    }
  });
  return (
    <group ref={ref}>
      <Ring args={[radius - 0.02, radius + 0.02, 128]}>
        <meshBasicMaterial color={color} transparent opacity={0.25} side={THREE.DoubleSide} />
      </Ring>
    </group>
  );
};

/* ── Pulsing glow sphere ── */
const PulseOrb = ({ color = '#8b5cf6', scale = 0.3 }) => {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) {
      const s = scale + Math.sin(clock.getElapsedTime() * 2) * 0.08;
      ref.current.scale.setScalar(s);
    }
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshBasicMaterial color={color} transparent opacity={0.15} />
    </mesh>
  );
};

/* ── Rotating wireframe icosahedron ── */
const SpinningIco = ({ color = '#06b6d4' }) => {
  const ref = useRef();
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.x += delta * 0.2;
      ref.current.rotation.y += delta * 0.35;
    }
  });
  return (
    <mesh ref={ref} scale={2.5}>
      <icosahedronGeometry args={[1, 1]} />
      <meshBasicMaterial color={color} wireframe transparent opacity={0.3} />
    </mesh>
  );
};

/* ── Scene: Galaxy (deep space with ring orbits) ── */
const GalaxyScene = () => (
  <group>
    <Stars radius={100} depth={50} count={6000} factor={4} saturation={0} fade speed={1.5} />
    <Sparkles count={300} scale={14} size={2.5} speed={0.4} opacity={0.9} color="#4f46e5" />
    <Sparkles count={100} scale={10} size={1} speed={0.2} opacity={0.5} color="#a78bfa" />
    <OrbitRing color="#6366f1" radius={5} speed={0.2} />
    <OrbitRing color="#818cf8" radius={3.5} speed={-0.3} />
    <PulseOrb color="#4f46e5" scale={0.4} />
  </group>
);

/* ── Scene: Nebula (glowing distorted sphere with volumetric feel) ── */
const NebulaScene = () => (
  <group>
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.8}>
      <Sphere args={[2.2, 64, 64]} scale={1.4}>
        <MeshDistortMaterial color="#8b5cf6" attach="material" distort={0.6} speed={3} roughness={0} transparent opacity={0.85} />
      </Sphere>
    </Float>
    <Float speed={2.5} rotationIntensity={0.5} floatIntensity={1.2}>
      <Sphere args={[1, 32, 32]} position={[2.5, 1, -1]} scale={0.6}>
        <MeshDistortMaterial color="#c084fc" distort={0.4} speed={2} roughness={0} transparent opacity={0.5} />
      </Sphere>
    </Float>
    <Stars radius={100} depth={50} count={3000} factor={4} saturation={1} fade speed={2} />
    <Sparkles count={150} scale={8} size={2} speed={0.6} color="#c084fc" />
    <PulseOrb color="#7c3aed" scale={0.2} />
  </group>
);

/* ── Scene: Particles (cyan data streams) ── */
const ParticlesScene = () => (
  <group>
    <Sparkles count={1200} scale={16} size={1.8} speed={1} opacity={0.9} color="#06b6d4" />
    <Sparkles count={400} scale={12} size={1} speed={0.5} opacity={0.6} color="#22d3ee" />
    <Stars radius={100} depth={50} count={2000} factor={2} fade speed={1} />
    <SpinningIco color="#06b6d4" />
    <OrbitRing color="#22d3ee" radius={4.5} speed={0.4} />
  </group>
);

/* ── Scene: Wireframe (torus knot + orbiting geometry) ── */
const WireframeScene = () => {
  const knotRef = useRef();
  useFrame((_, delta) => {
    if (knotRef.current) {
      knotRef.current.rotation.x += delta * 0.15;
      knotRef.current.rotation.y += delta * 0.25;
    }
  });

  return (
    <group>
      <mesh ref={knotRef}>
        <torusKnotGeometry args={[1.8, 0.45, 200, 32]} />
        <meshBasicMaterial color="#ec4899" wireframe transparent opacity={0.7} />
      </mesh>
      <Sparkles count={200} scale={12} size={2} speed={0.3} color="#f472b6" />
      <OrbitRing color="#ec4899" radius={4} speed={-0.25} />
      <Stars radius={80} depth={40} count={1500} factor={3} fade speed={1} />
    </group>
  );
};

/* ── Scene: Solar (sun-like orb with flare rings) ── */
const SolarScene = () => (
  <group>
    <Float speed={1} rotationIntensity={0.1} floatIntensity={0.3}>
      <Sphere args={[1.5, 64, 64]}>
        <MeshDistortMaterial color="#f59e0b" distort={0.3} speed={4} roughness={0} transparent opacity={0.9} />
      </Sphere>
    </Float>
    <OrbitRing color="#fbbf24" radius={3} speed={0.5} />
    <OrbitRing color="#f59e0b" radius={4.5} speed={-0.35} />
    <Sparkles count={300} scale={14} size={2} speed={0.6} color="#fbbf24" />
    <Stars radius={100} depth={50} count={2500} factor={3} fade speed={1} />
  </group>
);

/* ── Scene: Matrix (green digital rain feel) ── */
const MatrixScene = () => (
  <group>
    <Sparkles count={800} scale={16} size={1.2} speed={2} opacity={0.8} color="#22c55e" />
    <Sparkles count={300} scale={10} size={2} speed={0.3} opacity={0.4} color="#4ade80" />
    <Stars radius={80} depth={40} count={1500} factor={2} fade speed={0.5} />
    <SpinningIco color="#22c55e" />
    <OrbitRing color="#22c55e" radius={5} speed={0.6} />
  </group>
);

/* ── 3D Key Point text (always faces camera) ── */
const SceneText = ({ text }) => (
  <Billboard>
    <Text
      fontSize={0.7}
      maxWidth={7}
      lineHeight={1.3}
      textAlign="center"
      position={[0, 2.8, 0]}
      color="#ffffff"
      anchorX="center"
      anchorY="middle"
      outlineWidth={0.04}
      outlineColor="#000000"
      font={undefined}
    >
      {text}
    </Text>
  </Billboard>
);

/* ── Visual mode selector ── */
const VISUAL_MODES = ['galaxy', 'nebula', 'particles', 'wireframe', 'solar', 'matrix'];

const VisualScene = ({ mode }) => {
  switch (mode) {
    case 'nebula':     return <NebulaScene />;
    case 'particles':  return <ParticlesScene />;
    case 'wireframe':  return <WireframeScene />;
    case 'solar':      return <SolarScene />;
    case 'matrix':     return <MatrixScene />;
    case 'galaxy':
    default:           return <GalaxyScene />;
  }
};

/* ════════════════════════════════════════════════
   ██  MAIN PLAYER COMPONENT
   ════════════════════════════════════════════════ */
const SummaryVideo3DPlayer = ({ scenes, onClose }) => {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalProgress, setTotalProgress] = useState(0);
  
  const synthRef = useRef(window.speechSynthesis);
  const utteranceRef = useRef(null);
  const progressInterval = useRef(null);
  const speechEndedRef = useRef(false);

  const currentScene = scenes[currentSceneIndex];

  // Compute total duration for the global progress bar
  const totalDuration = useMemo(() => {
    return scenes.reduce((acc, s) => {
      const words = s.voiceScript ? s.voiceScript.split(' ').length : 10;
      return acc + Math.max(s.duration || 5, (words / 2.5) + 1.5);
    }, 0);
  }, [scenes]);

  const elapsedBeforeCurrent = useMemo(() => {
    let t = 0;
    for (let i = 0; i < currentSceneIndex; i++) {
      const words = scenes[i].voiceScript ? scenes[i].voiceScript.split(' ').length : 10;
      t += Math.max(scenes[i].duration || 5, (words / 2.5) + 1.5);
    }
    return t;
  }, [scenes, currentSceneIndex]);

  const stopSpeech = () => {
    if (synthRef.current) synthRef.current.cancel();
  };

  const speakCurrentScene = () => {
    stopSpeech();
    speechEndedRef.current = false;
    if (!currentScene || isMuted) return;

    utteranceRef.current = new SpeechSynthesisUtterance(currentScene.voiceScript);
    const voices = synthRef.current.getVoices();
    const preferred = voices.find(v => v.lang.includes('en') && (v.name.includes('Google') || v.name.includes('Microsoft'))) || voices[0];
    if (preferred) utteranceRef.current.voice = preferred;
    
    utteranceRef.current.rate = 0.95;
    utteranceRef.current.pitch = 1.0;
    utteranceRef.current.onend = () => { speechEndedRef.current = true; };
    
    synthRef.current.speak(utteranceRef.current);
  };

  useEffect(() => {
    const loadVoices = () => synthRef.current.getVoices();
    loadVoices();
    if (synthRef.current.onvoiceschanged !== undefined) {
      synthRef.current.onvoiceschanged = loadVoices;
    }
    return () => stopSpeech();
  }, []);

  useEffect(() => {
    if (isPlaying) {
      speakCurrentScene();
      
      const wordCount = currentScene.voiceScript ? currentScene.voiceScript.split(' ').length : 10;
      const sceneDurationSecs = Math.max(currentScene.duration || 5, (wordCount / 2.5) + 1.5);
      const durationMs = sceneDurationSecs * 1000;
      const startTime = Date.now();
      
      progressInterval.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const sceneProgress = Math.min((elapsed / durationMs) * 100, 100);
        setProgress(sceneProgress);

        // Global progress
        const globalSecs = elapsedBeforeCurrent + (elapsed / 1000);
        setTotalProgress(Math.min((globalSecs / totalDuration) * 100, 100));
        
        // Advance when timer completes AND speech has ended (or is muted)
        if (sceneProgress >= 100 && (speechEndedRef.current || isMuted || elapsed > durationMs + 2000)) {
          clearInterval(progressInterval.current);
          if (currentSceneIndex < scenes.length - 1) {
            setCurrentSceneIndex(prev => prev + 1);
            setProgress(0);
          } else {
            setIsPlaying(false);
            setProgress(0);
            setTotalProgress(100);
          }
        }
      }, 30);
    } else {
      stopSpeech();
      clearInterval(progressInterval.current);
    }

    return () => clearInterval(progressInterval.current);
  }, [currentSceneIndex, isPlaying, isMuted]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  
  const toggleMute = () => {
    if (!isMuted) stopSpeech();
    setIsMuted(!isMuted);
  };

  const goToScene = (idx) => {
    stopSpeech();
    clearInterval(progressInterval.current);
    setCurrentSceneIndex(idx);
    setProgress(0);
  };

  const nextScene = () => { if (currentSceneIndex < scenes.length - 1) goToScene(currentSceneIndex + 1); };
  const prevScene = () => { if (currentSceneIndex > 0) goToScene(currentSceneIndex - 1); };
  const restart = () => { goToScene(0); setIsPlaying(true); };

  if (!scenes || scenes.length === 0) return null;

  const effectiveMode = VISUAL_MODES.includes(currentScene?.visualMode) ? currentScene.visualMode : 'galaxy';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl">
      <div className="relative w-full h-full max-w-6xl max-h-[85vh] bg-black rounded-3xl overflow-hidden shadow-2xl shadow-indigo-500/20 border border-indigo-500/30">
        
        {/* Close Button */}
        <button 
          onClick={() => { stopSpeech(); onClose(); }}
          className="absolute top-6 right-6 z-20 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors backdrop-blur-md"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Scene counter badge (top-left) */}
        <div className="absolute top-6 left-6 z-20 flex items-center gap-3">
          <span className="text-xs font-bold px-3 py-1.5 bg-white/10 text-white rounded-full uppercase tracking-wider border border-white/10 backdrop-blur-md">
            {currentSceneIndex + 1} / {scenes.length}
          </span>
          <span className="text-xs px-2 py-1 bg-indigo-500/20 text-indigo-300 rounded uppercase tracking-wider font-bold border border-indigo-500/30 backdrop-blur-md">
            {effectiveMode}
          </span>
        </div>

        {/* 3D Canvas */}
        <div className="absolute inset-0 z-0">
          <Canvas camera={{ position: [0, 0, 8], fov: 60 }} dpr={[1, 2]}>
            <ambientLight intensity={0.4} />
            <pointLight position={[10, 10, 10]} intensity={1.2} color="#8b5cf6" />
            <pointLight position={[-10, -10, -10]} intensity={0.6} color="#06b6d4" />
            <pointLight position={[0, 5, 5]} intensity={0.3} color="#f59e0b" />
            
            <VisualScene mode={effectiveMode} />
            <SceneText text={currentScene?.keyPoint || ''} />
            
            <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.4} />
          </Canvas>
        </div>

        {/* Bottom Overlay */}
        <div className="absolute bottom-0 inset-x-0 z-10 bg-gradient-to-t from-black via-black/80 to-transparent pt-32 pb-6 px-6">
          
          {/* Subtitle text */}
          <div className="mb-6 text-center max-w-3xl mx-auto min-h-[4.5rem] flex items-end justify-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={currentSceneIndex}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
                className="text-lg md:text-xl text-white/95 font-medium leading-relaxed drop-shadow-lg"
              >
                {currentScene?.voiceScript}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Scene dots timeline */}
          <div className="flex justify-center gap-1.5 mb-4">
            {scenes.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToScene(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentSceneIndex 
                    ? 'w-8 bg-indigo-400' 
                    : idx < currentSceneIndex 
                      ? 'w-3 bg-indigo-400/50' 
                      : 'w-3 bg-white/20'
                }`}
              />
            ))}
          </div>

          {/* Controls bar */}
          <div className="flex flex-col gap-4 max-w-3xl mx-auto bg-white/5 backdrop-blur-xl p-4 rounded-2xl border border-white/10">
            {/* Global progress bar */}
            <div className="relative w-full h-1 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.7)]"
                style={{ width: `${totalProgress}%`, transition: 'width 0.1s linear' }}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <button 
                onClick={restart}
                className="p-2 text-white/40 hover:text-white transition-colors"
                title="Restart"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-5">
                <button 
                  onClick={prevScene}
                  disabled={currentSceneIndex === 0}
                  className="p-2 text-white/60 hover:text-white disabled:opacity-20 transition-colors"
                >
                  <SkipBack className="w-6 h-6" />
                </button>
                
                <button 
                  onClick={togglePlay}
                  className="p-4 bg-white text-black hover:bg-slate-200 rounded-full transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95"
                >
                  {isPlaying ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current ml-0.5" />}
                </button>
                
                <button 
                  onClick={nextScene}
                  disabled={currentSceneIndex === scenes.length - 1}
                  className="p-2 text-white/60 hover:text-white disabled:opacity-20 transition-colors"
                >
                  <SkipForward className="w-6 h-6" />
                </button>
              </div>

              <button 
                onClick={toggleMute}
                className="p-2 text-white/60 hover:text-white transition-colors"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryVideo3DPlayer;
