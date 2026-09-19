import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const CyberModel3D = ({ isEntering, hovered, showIntro = true }) => {
  const groupRef = useRef();
  const outerRingRef = useRef();
  const middleRingRef = useRef();
  const innerCoreRef = useRef();
  const particlesRef = useRef();

  // Create floating particle points around the model
  const particleCount = 800;
  const [positions] = React.useMemo(() => {
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

    // Fast scroll calculation without double layout query
    const scrollProgress = showIntro 
      ? Math.min(1, Math.max(0, window.scrollY / Math.max(1, window.innerHeight * 2)))
      : 0;

    // Dynamic rotation and position based on mouse and scroll
    if (groupRef.current) {
      // In workspace, push model deeper into background so it doesn't obstruct dashboard text & Pomodoro
      const targetPosY = !showIntro ? 0.8 : THREE.MathUtils.lerp(0, 1.8, scrollProgress);
      const targetPosZ = !showIntro ? -5.0 : THREE.MathUtils.lerp(0, -2.5, scrollProgress);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetPosY, 0.03);
      groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetPosZ, 0.03);

      const targetRotX = (state.pointer.y * 0.4) + (scrollProgress * Math.PI * 1.5);
      const targetRotY = (time * 0.15 * speedMultiplier) + (state.pointer.x * 0.5) + (scrollProgress * Math.PI * 3);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 0.03);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.03);

      // Scale dynamically: compact in workspace, expansive in intro
      let targetScale = 1.0;
      if (!showIntro) {
        targetScale = 0.48;
      } else if (isEntering) {
        targetScale = 1.4;
      } else if (scrollProgress > 0.05 && scrollProgress < 0.75) {
        targetScale = 1.25 + Math.sin(scrollProgress * Math.PI) * 0.4;
      } else if (scrollProgress >= 0.75) {
        targetScale = 0.85;
      }
      groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.03);
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
          opacity={0.25}
          emissive="#ffffff"
          emissiveIntensity={hovered ? 0.4 : 0.15}
        />
      </mesh>

      {/* 2. Core Wireframe Cage */}
      <mesh>
        <icosahedronGeometry args={[1.5, 1]} />
        <meshBasicMaterial
          color="#ffffff"
          wireframe
          transparent
          opacity={0.25}
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
          emissiveIntensity={0.15}
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
          emissiveIntensity={0.1}
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
          size={0.04}
          color="#ffffff"
          transparent
          opacity={hovered ? 0.7 : 0.35}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Dynamic Point Lights on Core */}
      <pointLight position={[0, 0, 0]} intensity={hovered ? 2.5 : 1.2} color="#ffffff" distance={6} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 10, 5]} intensity={1.5} color="#ffffff" />
    </group>
  );
};

export default CyberModel3D;
