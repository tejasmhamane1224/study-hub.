import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getScrollProgress } from '../utils/scrollTracker';

export const CyberModel3D = ({ 
  isEntering = false, 
  hovered = false, 
  showIntro = true, 
  variant = 'hero' 
}) => {
  const groupRef = useRef();
  const outerRingRef = useRef();
  const middleRingRef = useRef();
  const innerCoreRef = useRef();
  const particlesRef = useRef();

  const isHero = variant === 'hero';

  // Original floating particle points around the model
  const particleCount = 800;
  const [positions] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 2.8 + Math.random() * 1.5;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return [pos];
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const speedMultiplier = isEntering ? 3.5 : (hovered ? 1.8 : 1.0);
    const scrollProgress = getScrollProgress();

    if (groupRef.current) {
      if (isHero) {
        // Hero mode on login: Maintain centered alignment and stable scale
        const authProgress = Math.min(1, Math.max(0, (scrollProgress - 0.75) / 0.22));
        const targetPosY = 0.0; // Cleanly centered behind the auth card
        const targetPosZ = THREE.MathUtils.lerp(0.1, -0.2, authProgress);

        groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetPosY, 0.04);
        groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetPosZ, 0.04);

        const targetRotX = (state.pointer.y * 0.4) + (scrollProgress * Math.PI * 1.5);
        const targetRotY = (time * 0.15 * speedMultiplier) + (state.pointer.x * 0.5) + (scrollProgress * Math.PI * 3);
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 0.04);
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.04);

        // Stable scale: stays 1.25 base, never drops to 0.48 or 0.85
        const scrollSurge = Math.sin(scrollProgress * Math.PI) * 0.12;
        const targetScale = isEntering ? 1.45 : (1.25 + scrollSurge);
        groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.04);
      } else {
        // Workspace mode in dashboard
        const targetPosY = 0.8;
        const targetPosZ = -4.5;
        groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetPosY, 0.03);
        groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetPosZ, 0.03);

        const targetRotX = state.pointer.y * 0.2;
        const targetRotY = (time * 0.1 * speedMultiplier) + (state.pointer.x * 0.2);
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 0.03);
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.03);

        const targetScale = 0.5;
        groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.03);
      }
    }

    // Outer gyro ring
    if (outerRingRef.current) {
      outerRingRef.current.rotation.x = (time * 0.4 * speedMultiplier) + (scrollProgress * Math.PI * 4);
      outerRingRef.current.rotation.z = (time * 0.2 * speedMultiplier) + (scrollProgress * Math.PI * 2);
    }

    // Middle technical ring
    if (middleRingRef.current) {
      middleRingRef.current.rotation.y = (-time * 0.5 * speedMultiplier) - (scrollProgress * Math.PI * 3);
      middleRingRef.current.rotation.x = (time * 0.3 * speedMultiplier) + (scrollProgress * Math.PI * 2);
    }

    // Inner core pulsing
    if (innerCoreRef.current) {
      innerCoreRef.current.rotation.y = time * 0.8 + (scrollProgress * Math.PI * 4);
      const pulse = Math.sin(time * 3) * 0.08 + 1;
      innerCoreRef.current.scale.set(pulse, pulse, pulse);
    }

    // Surrounding orbital particle swarm
    if (particlesRef.current) {
      particlesRef.current.rotation.y = -time * 0.08 - (scrollProgress * Math.PI * 2);
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* 1. Inner Glowing Polyhedral Core */}
      <mesh ref={innerCoreRef}>
        <octahedronGeometry args={[1.1, 0]} />
        <meshStandardMaterial
          color="#ffffff"
          roughness={0.1}
          metalness={0.9}
          wireframe={false}
          transparent={true}
          opacity={0.3}
          emissive="#ffffff"
          emissiveIntensity={hovered ? 0.4 : 0.2}
        />
      </mesh>

      {/* 2. Core Wireframe Cage */}
      <mesh>
        <icosahedronGeometry args={[1.5, 1]} />
        <meshBasicMaterial
          color="#ffffff"
          wireframe={true}
          transparent={true}
          opacity={0.3}
        />
      </mesh>

      {/* 3. Outer Gyroscope Ring 1 */}
      <mesh ref={outerRingRef}>
        <torusGeometry args={[2.2, 0.02, 16, 100]} />
        <meshStandardMaterial
          color="#ffffff"
          metalness={1}
          roughness={0.2}
          emissive="#ffffff"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* 4. Middle Technical Ring 2 */}
      <mesh ref={middleRingRef}>
        <torusGeometry args={[2.5, 0.015, 16, 100]} />
        <meshStandardMaterial
          color="#ffffff"
          metalness={1}
          roughness={0.3}
          emissive="#ffffff"
          emissiveIntensity={0.15}
        />
      </mesh>

      {/* 5. Orbital Particle Dust Shell */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={positions.length / 3}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.045}
          color="#ffffff"
          transparent={true}
          opacity={hovered ? 0.8 : 0.45}
          sizeAttenuation={true}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Dynamic Point Lights on Core */}
      <pointLight position={[0, 0, 0]} intensity={hovered ? 2.5 : 1.5} color="#ffffff" distance={6} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 10, 5]} intensity={1.5} color="#ffffff" />
    </group>
  );
};

export default CyberModel3D;
