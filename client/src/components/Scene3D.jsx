import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import CyberModel3D from './CyberModel3D';
import { getScrollProgress } from '../utils/scrollTracker';
import { getGlowParticleTexture } from '../utils/particleTexture';

// Re-export for any external consumers
export { getScrollProgress };

// Vivid, luminous celestial starfield with foreground depth embers
const ParticleGalaxy = ({ showIntro, variant = 'hero' }) => {
  const galaxyRef = useRef();
  const foregroundRef = useRef();
  
  const particleTexture = useMemo(() => getGlowParticleTexture(), []);

  // 1. Deep Galactic Starfield (3,200 brilliant stars)
  const count = 3200;
  const [positions, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      const radius = 2.0 + Math.random() * 24;
      const theta = Math.random() * 2 * Math.PI;
      // Dense galactic disc with gentle vertical falloff
      const y = (Math.random() - 0.5) * 5.0 * (1 / (radius * 0.08 + 0.1));
      
      pos[i * 3] = Math.cos(theta) * radius;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = Math.sin(theta) * radius;
      
      sz[i] = 0.8 + Math.random() * 1.6;
    }
    return [pos, sz];
  }, [count]);

  // 2. Foreground Luminous Photons (350 large floating embers for cinematic parallax)
  const fgCount = 350;
  const fgPositions = useMemo(() => {
    const pos = new Float32Array(fgCount * 3);
    for (let i = 0; i < fgCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8 + 2; // Closer to camera
    }
    return pos;
  }, [fgCount]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const progress = getScrollProgress();
    
    if (galaxyRef.current) {
      const targetX = ((state.pointer.y * Math.PI) * 0.04) + (progress * Math.PI * 0.35);
      const targetY = (time * 0.025) + ((state.pointer.x * Math.PI) * 0.04) + (progress * Math.PI * 1.4);
      galaxyRef.current.rotation.x = THREE.MathUtils.lerp(galaxyRef.current.rotation.x, targetX, 0.03);
      galaxyRef.current.rotation.y = THREE.MathUtils.lerp(galaxyRef.current.rotation.y, targetY, 0.03);
    }

    if (foregroundRef.current) {
      foregroundRef.current.rotation.y = time * 0.04 + (state.pointer.x * 0.1);
      foregroundRef.current.rotation.x = Math.sin(time * 0.2) * 0.05 + (state.pointer.y * 0.1);
    }
  });

  return (
    <group>
      {/* Deep Galactic Stars (Crisp, High-Luminance Starlight) */}
      <points ref={galaxyRef}>
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
          size={0.048}
          color="#ffffff"
          transparent={true}
          opacity={0.82}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          map={particleTexture}
        />
      </points>

      {/* Foreground Floating Luminous Photons */}
      <points ref={foregroundRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={fgPositions.length / 3}
            array={fgPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.075}
          color="#e0f2fe"
          transparent={true}
          opacity={0.7}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          map={particleTexture}
        />
      </points>
    </group>
  );
};

// Camera Controller for cinematic scroll tracking
const CameraController = ({ showIntro, variant = 'hero' }) => {
  useFrame((state) => {
    const progress = getScrollProgress();
    const isHero = variant === 'hero';

    if (isHero) {
      // Keep camera stable at z=7.5 with subtle fluid tilt for cinematic depth
      const targetZ = 7.5;
      const targetY = THREE.MathUtils.lerp(0, -0.2, progress);
      const targetRotationZ = THREE.MathUtils.lerp(0, Math.PI / 32, progress);

      state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetZ, 0.04);
      state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetY, 0.04);
      state.camera.rotation.z = THREE.MathUtils.lerp(state.camera.rotation.z, targetRotationZ, 0.04);
    } else {
      // Workspace ambient camera
      const targetZ = 7.2;
      const targetY = 0;
      state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetZ, 0.04);
      state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetY, 0.04);
    }
  });
  return null;
};

const Scene3D = ({ 
  showIntro = false, 
  showModel = true, 
  isEntering = false, 
  hovered = false,
  variant = 'hero'
}) => {
  return (
    <div className="fixed inset-0 w-full h-full z-0 pointer-events-none bg-[#000000]">
      <Canvas 
        camera={{ position: [0, 0, 7.5], fov: 50 }} 
        dpr={[1, 1.5]} 
        performance={{ min: 0.5 }}
      >
        <fog attach="fog" args={['#000000', 8, 32]} />
        <CameraController showIntro={showIntro} variant={variant} />
        {showModel && (
          <CyberModel3D 
            showIntro={showIntro} 
            isEntering={isEntering} 
            hovered={hovered} 
            variant={variant}
          />
        )}
        <ParticleGalaxy showIntro={showIntro} variant={variant} />
      </Canvas>
    </div>
  );
};

export default Scene3D;
