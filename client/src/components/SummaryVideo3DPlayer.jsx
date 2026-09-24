import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars, Float, Text, OrbitControls, Sparkles, Sphere, MeshDistortMaterial } from '@react-three/drei';
import { Play, Pause, X, Volume2, VolumeX, SkipForward, SkipBack } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GalaxyScene = () => (
  <group>
    <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
    <Sparkles count={200} scale={12} size={2} speed={0.4} opacity={1} color="#4f46e5" />
  </group>
);

const NebulaScene = () => (
  <group>
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <Sphere args={[2, 64, 64]} scale={1.5}>
        <MeshDistortMaterial color="#8b5cf6" attach="material" distort={0.5} speed={2} roughness={0} />
      </Sphere>
    </Float>
    <Stars radius={100} depth={50} count={3000} factor={4} saturation={1} fade speed={2} />
  </group>
);

const ParticlesScene = () => (
  <group>
    <Sparkles count={1000} scale={15} size={1.5} speed={0.8} opacity={1} color="#06b6d4" />
    <Stars radius={100} depth={50} count={2000} factor={2} fade speed={1} />
  </group>
);

const WireframeScene = () => (
  <Float speed={1.5} rotationIntensity={1} floatIntensity={1.5}>
    <mesh>
      <torusKnotGeometry args={[1.5, 0.4, 128, 16]} />
      <meshBasicMaterial color="#ec4899" wireframe={true} />
    </mesh>
    <Sparkles count={100} scale={10} size={2} speed={0.2} color="#ec4899" />
  </Float>
);

const SceneText = ({ text }) => {
  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <Text
        fontSize={1}
        maxWidth={8}
        lineHeight={1.2}
        textAlign="center"
        position={[0, 0, 2]}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#000000"
      >
        {text}
      </Text>
    </Float>
  );
};

const SummaryVideo3DPlayer = ({ scenes, onClose }) => {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const synthRef = useRef(window.speechSynthesis);
  const utteranceRef = useRef(null);
  const progressInterval = useRef(null);

  const currentScene = scenes[currentSceneIndex];
  
  const stopSpeech = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
  };

  const speakCurrentScene = () => {
    stopSpeech();
    if (!currentScene || isMuted) return;

    utteranceRef.current = new SpeechSynthesisUtterance(currentScene.voiceScript);
    
    // Try to find a good voice
    const voices = synthRef.current.getVoices();
    const preferredVoice = voices.find(v => v.lang.includes('en-US') && v.name.includes('Google')) || voices[0];
    if (preferredVoice) {
      utteranceRef.current.voice = preferredVoice;
    }
    
    utteranceRef.current.rate = 0.9;
    utteranceRef.current.pitch = 1.0;
    
    synthRef.current.speak(utteranceRef.current);
  };

  useEffect(() => {
    // Load voices
    synthRef.current.getVoices();
    return () => stopSpeech();
  }, []);

  useEffect(() => {
    if (isPlaying) {
      speakCurrentScene();
      
      const durationMs = (currentScene.duration || 5) * 1000;
      const startTime = Date.now();
      
      progressInterval.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const currentProgress = Math.min((elapsed / durationMs) * 100, 100);
        setProgress(currentProgress);
        
        if (currentProgress >= 100) {
          clearInterval(progressInterval.current);
          if (currentSceneIndex < scenes.length - 1) {
            setCurrentSceneIndex(prev => prev + 1);
          } else {
            setIsPlaying(false);
            setProgress(0);
          }
        }
      }, 50);
    } else {
      stopSpeech();
      clearInterval(progressInterval.current);
    }

    return () => clearInterval(progressInterval.current);
  }, [currentSceneIndex, isPlaying, isMuted, currentScene]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  
  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted) stopSpeech();
    else if (isPlaying) speakCurrentScene();
  };

  const nextScene = () => {
    if (currentSceneIndex < scenes.length - 1) {
      setCurrentSceneIndex(prev => prev + 1);
      setProgress(0);
    }
  };

  const prevScene = () => {
    if (currentSceneIndex > 0) {
      setCurrentSceneIndex(prev => prev - 1);
      setProgress(0);
    }
  };

  if (!scenes || scenes.length === 0) return null;

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

        {/* 3D Canvas */}
        <div className="absolute inset-0 z-0">
          <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#8b5cf6" />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#06b6d4" />
            
            <AnimatePresence mode="wait">
              <group key={currentSceneIndex}>
                {currentScene?.visualMode === 'galaxy' && <GalaxyScene />}
                {currentScene?.visualMode === 'nebula' && <NebulaScene />}
                {currentScene?.visualMode === 'particles' && <ParticlesScene />}
                {currentScene?.visualMode === 'wireframe' && <WireframeScene />}
                {(!currentScene?.visualMode || !['galaxy', 'nebula', 'particles', 'wireframe'].includes(currentScene?.visualMode)) && <GalaxyScene />}
                
                <SceneText text={currentScene?.keyPoint || ''} />
              </group>
            </AnimatePresence>
            
            <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
          </Canvas>
        </div>

        {/* Overlay UI */}
        <div className="absolute bottom-0 inset-x-0 z-10 bg-gradient-to-t from-black via-black/80 to-transparent pt-32 pb-8 px-8">
          
          {/* Subtitles */}
          <div className="mb-8 text-center max-w-4xl mx-auto h-24 flex items-end justify-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={currentSceneIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-xl md:text-2xl text-white font-medium leading-relaxed drop-shadow-md"
              >
                {currentScene?.voiceScript}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="flex flex-col gap-5 max-w-4xl mx-auto bg-white/5 backdrop-blur-xl p-5 rounded-2xl border border-white/10">
            {/* Progress Bar */}
            <div className="relative w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="absolute top-0 left-0 h-full bg-indigo-500 transition-all duration-75 ease-linear shadow-[0_0_10px_rgba(99,102,241,0.8)]"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-slate-300">
                <span className="text-sm font-medium tracking-wide">
                  SCENE {currentSceneIndex + 1} / {scenes.length}
                </span>
                <span className="text-xs px-2 py-1 bg-indigo-500/20 text-indigo-300 rounded uppercase tracking-wider font-bold border border-indigo-500/30">
                  {currentScene?.visualMode || 'galaxy'}
                </span>
              </div>

              <div className="flex items-center gap-6">
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
                  {isPlaying ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current ml-1" />}
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
                {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryVideo3DPlayer;
