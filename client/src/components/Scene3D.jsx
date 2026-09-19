import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import CyberModel3D from './CyberModel3D';

// Efficient event-driven scroll tracking without layout thrashing
let cachedScrollProgress = 0;
if (typeof window !== 'undefined') {
  let ticking = false;
  const updateScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const docHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
        const scrollMax = Math.max(1, docHeight - window.innerHeight);
        cachedScrollProgress = Math.min(1, Math.max(0, window.scrollY / scrollMax));
        ticking = false;
      });
      ticking = true;
    }
  };
  window.addEventListener('scroll', updateScroll, { passive: true });
  window.addEventListener('resize', updateScroll, { passive: true });
  updateScroll();
}

export const getScrollProgress = () => cachedScrollProgress;

// Hyper-optimized, elegant particle galaxy
const ParticleGalaxy = ({ showIntro }) => {
  const pointsRef = useRef();
  const count = 3500;
  
  const [positions, sizes] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      const radius = Math.random() * 22;
      const theta = Math.random() * 2 * Math.PI;
      const y = (Math.random() - 0.5) * 3 * (1 / (radius + 0.1));
      
      positions[i * 3] = Math.cos(theta) * radius;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(theta) * radius;
      
      sizes[i] = Math.random() * 1.5;
    }
    return [positions, sizes];
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const time = state.clock.getElapsedTime();
    const progress = getScrollProgress();
    
    const targetX = ((state.pointer.y * Math.PI) * 0.04) + (progress * Math.PI * 0.4);
    const targetY = (time * 0.03) + ((state.pointer.x * Math.PI) * 0.04) + (progress * Math.PI * 1.5);
    
    pointsRef.current.rotation.x = THREE.MathUtils.lerp(pointsRef.current.rotation.x, targetX, 0.03);
    pointsRef.current.rotation.y = THREE.MathUtils.lerp(pointsRef.current.rotation.y, targetY, 0.03);
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={sizes.length}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.045}
        color="#ffffff"
        transparent
        opacity={0.28}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

// Camera Controller for cinematic scroll tracking
const CameraController = ({ showIntro }) => {
  useFrame((state) => {
    const progress = getScrollProgress();

    const targetZ = showIntro ? 7.5 : THREE.MathUtils.lerp(7.5, 6.2, progress);
    const targetY = showIntro ? 0 : THREE.MathUtils.lerp(0, -0.4, progress);
    
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetZ, 0.04);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetY, 0.04);
    
    const targetRotationZ = showIntro ? 0 : THREE.MathUtils.lerp(0, Math.PI / 16, progress);
    state.camera.rotation.z = THREE.MathUtils.lerp(state.camera.rotation.z, targetRotationZ, 0.04);
  });
  return null;
};

const Scene3D = ({ showIntro = false, showModel = true, isEntering = false, hovered = false }) => {
  return (
    <div className="fixed inset-0 w-full h-full z-0 pointer-events-none bg-[#000000]">
      <Canvas 
        camera={{ position: [0, 0, 7.5], fov: 50 }} 
        dpr={[1, 1.5]} 
        performance={{ min: 0.5 }}
      >
        <fog attach="fog" args={['#000000', 5, 25]} />
        <CameraController showIntro={showIntro} />
        {showModel && <CyberModel3D showIntro={showIntro} isEntering={isEntering} hovered={hovered} />}
        <ParticleGalaxy showIntro={showIntro} />
      </Canvas>
    </div>
  );
};

export default Scene3D;
