import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import CyberModel3D from './CyberModel3D';
import { getScrollProgress } from '../utils/scrollTracker';
import { getGlowParticleTexture } from '../utils/particleTexture';

// Re-export for any external consumers
export { getScrollProgress };

// Photorealistic celestial starfield (anti-aliased round glowing stars, no square pixels)
const ParticleGalaxy = ({ showIntro, variant = 'hero' }) => {
  const pointsRef = useRef();
  const count = 3000;
  const particleTexture = useMemo(() => getGlowParticleTexture(), []);
  
  const [positions, sizes] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      const radius = 2.5 + Math.random() * 20;
      const theta = Math.random() * 2 * Math.PI;
      const y = (Math.random() - 0.5) * 4.0 * (1 / (radius * 0.1 + 0.1));
      
      positions[i * 3] = Math.cos(theta) * radius;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(theta) * radius;
      
      sizes[i] = 0.5 + Math.random() * 1.2;
    }
    return [positions, sizes];
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const time = state.clock.getElapsedTime();
    const progress = getScrollProgress();
    
    const targetX = ((state.pointer.y * Math.PI) * 0.03) + (progress * Math.PI * 0.3);
    const targetY = (time * 0.02) + ((state.pointer.x * Math.PI) * 0.03) + (progress * Math.PI * 1.2);
    
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
        size={0.026}
        color="#f1f5f9"
        transparent={true}
        opacity={0.22}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        map={particleTexture}
      />
    </points>
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
        <fog attach="fog" args={['#000000', 6, 24]} />
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
