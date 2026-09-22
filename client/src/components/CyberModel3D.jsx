import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getScrollProgress } from '../utils/scrollTracker';
import { getGlowParticleTexture } from '../utils/particleTexture';

export const CyberModel3D = ({ 
  isEntering = false, 
  hovered = false, 
  showIntro = true, 
  variant = 'hero' 
}) => {
  const groupRef = useRef();
  
  // Gimbal ring refs for multi-axis precision mechanics
  const ring1Ref = useRef();
  const ring2Ref = useRef();
  const ring3Ref = useRef();
  
  // Core & holographic lattice refs
  const crystalCoreRef = useRef();
  const innerPulsarRef = useRef();
  const innerCageRef = useRef();
  const outerCageRef = useRef();
  const haloParticlesRef = useRef();

  const isHero = variant === 'hero';

  // Smooth round photon texture for halo particles
  const particleTexture = useMemo(() => getGlowParticleTexture(), []);

  // Volumetric stardust halo (1,000 fine starlight particles)
  const particleCount = 1000;
  const [positions] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      if (i < particleCount * 0.65) {
        // Spherical orbital stardust envelope
        const u = Math.random();
        const v = Math.random();
        const theta = u * 2.0 * Math.PI;
        const phi = Math.acos(2.0 * v - 1.0);
        const r = 2.2 + Math.random() * 1.8;
        pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        pos[i * 3 + 2] = r * Math.cos(phi);
      } else {
        // Subtle equatorial stardust disc
        const angle = Math.random() * 2 * Math.PI;
        const radius = 1.9 + Math.random() * 1.6;
        const yJitter = (Math.random() - 0.5) * 0.3 * (1 / (radius * 0.5));
        pos[i * 3] = Math.cos(angle) * radius;
        pos[i * 3 + 1] = yJitter;
        pos[i * 3 + 2] = Math.sin(angle) * radius;
      }
    }
    return [pos];
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const speedMultiplier = isEntering ? 3.0 : (hovered ? 1.6 : 1.0);
    const scrollProgress = getScrollProgress();

    if (groupRef.current) {
      if (isHero) {
        // === HERO MODE ===
        // Prominent, commanding scale that never shrinks or vanishes
        const authProgress = Math.min(1, Math.max(0, (scrollProgress - 0.75) / 0.22));
        const targetPosY = THREE.MathUtils.lerp(0.0, 1.15, authProgress);
        const targetPosZ = THREE.MathUtils.lerp(0.18, 0.28, scrollProgress);

        groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetPosY, 0.05);
        groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetPosZ, 0.05);

        // Fluid organic mouse parallax + subtle scroll tumble
        const targetRotX = (state.pointer.y * 0.35) + (scrollProgress * Math.PI * 1.2);
        const targetRotY = (time * 0.12 * speedMultiplier) + (state.pointer.x * 0.45) + (scrollProgress * Math.PI * 2.5);
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 0.04);
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.04);

        // Majestic scale: 1.55 base, surges up to 1.72 on scroll, breathing pulse
        const scrollSurge = Math.sin(scrollProgress * Math.PI) * 0.16;
        const breathing = Math.sin(time * 2.2) * 0.03;
        const baseScale = isEntering ? 1.85 : (1.55 + scrollSurge + breathing);
        groupRef.current.scale.lerp(new THREE.Vector3(baseScale, baseScale, baseScale), 0.05);
      } else {
        // === WORKSPACE AMBIENT MODE ===
        const targetPosY = 0.6;
        const targetPosZ = -3.8;
        groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetPosY, 0.04);
        groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetPosZ, 0.04);

        const targetRotX = state.pointer.y * 0.12;
        const targetRotY = (time * 0.06 * speedMultiplier) + (state.pointer.x * 0.15);
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 0.03);
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.03);

        const workspaceScale = 0.55;
        groupRef.current.scale.lerp(new THREE.Vector3(workspaceScale, workspaceScale, workspaceScale), 0.04);
      }
    }

    // Precision mechanical rotation of concentric platinum gimbal rings
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = (time * 0.32 * speedMultiplier) + (scrollProgress * Math.PI * 2.4);
      ring1Ref.current.rotation.z = (time * 0.16 * speedMultiplier) + (scrollProgress * Math.PI * 1.2);
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y = (-time * 0.38 * speedMultiplier) - (scrollProgress * Math.PI * 2.2);
      ring2Ref.current.rotation.x = (time * 0.2 * speedMultiplier) + (scrollProgress * Math.PI * 1.5);
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.z = (time * 0.45 * speedMultiplier) + (scrollProgress * Math.PI * 1.8);
      ring3Ref.current.rotation.y = (time * 0.22 * speedMultiplier);
    }

    // Outer and inner holographic cages: counter-rotating moiré interference
    if (outerCageRef.current) {
      outerCageRef.current.rotation.y = -time * 0.14 - (scrollProgress * Math.PI * 0.9);
      outerCageRef.current.rotation.x = time * 0.09;
    }
    if (innerCageRef.current) {
      innerCageRef.current.rotation.y = time * 0.18 + (scrollProgress * Math.PI * 1.2);
      innerCageRef.current.rotation.z = time * 0.12;
    }

    // Luminous faceted crystal core & inner pulsar spark
    if (crystalCoreRef.current) {
      crystalCoreRef.current.rotation.y = (time * 0.6) + (scrollProgress * Math.PI * 2.8);
      crystalCoreRef.current.rotation.x = time * 0.3;
      const pulse = 1 + Math.sin(time * 2.6) * 0.05;
      crystalCoreRef.current.scale.set(pulse, pulse, pulse);
    }
    if (innerPulsarRef.current) {
      innerPulsarRef.current.rotation.y = -time * 1.4;
      innerPulsarRef.current.rotation.z = time * 0.9;
      const sparkPulse = 1 + Math.sin(time * 4.2) * 0.08;
      innerPulsarRef.current.scale.set(sparkPulse, sparkPulse, sparkPulse);
    }

    // Halo drift
    if (haloParticlesRef.current) {
      haloParticlesRef.current.rotation.y = (-time * 0.06) - (scrollProgress * Math.PI * 1.3);
      haloParticlesRef.current.rotation.x = Math.cos(time * 0.03) * 0.08;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* 1. White-Hot Nuclear Pulsar Spark (Internal Energy Core) */}
      <mesh ref={innerPulsarRef}>
        <icosahedronGeometry args={[0.38, 1]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={hovered ? 2.5 : 1.8}
          roughness={0.05}
          metalness={0.95}
        />
      </mesh>

      {/* 2. Luminous Faceted Quantum Crystal (Translucent Sheen + Specular Highlights) */}
      <mesh ref={crystalCoreRef}>
        <octahedronGeometry args={[0.92, 0]} />
        <meshStandardMaterial
          color="#ffffff"
          roughness={0.08}
          metalness={0.92}
          transparent={true}
          opacity={0.42}
          emissive="#ffffff"
          emissiveIntensity={hovered ? 0.6 : 0.35}
        />
      </mesh>

      {/* 3. Inner Geodesic Holographic Cage (Crisp Silver Lattice) */}
      <mesh ref={innerCageRef}>
        <icosahedronGeometry args={[1.42, 1]} />
        <meshBasicMaterial
          color="#e2e8f0"
          wireframe={true}
          transparent={true}
          opacity={0.35}
        />
      </mesh>

      {/* 4. Outer Geodesic Technical Lattice (Platinum Moiré Forcefield) */}
      <mesh ref={outerCageRef}>
        <icosahedronGeometry args={[1.65, 2]} />
        <meshBasicMaterial
          color="#ffffff"
          wireframe={true}
          transparent={true}
          opacity={0.22}
        />
      </mesh>

      {/* 5. Master Gimbal Ring 1 (Equatorial Polished Platinum - Precision 0.015 Tube) */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[2.35, 0.015, 20, 160]} />
        <meshStandardMaterial
          color="#ffffff"
          metalness={1.0}
          roughness={0.1}
          emissive="#ffffff"
          emissiveIntensity={0.28}
        />
      </mesh>

      {/* 6. Secondary Gimbal Ring 2 (Polar Inclined Chrome Gimbal - Precision 0.013 Tube) */}
      <mesh ref={ring2Ref}>
        <torusGeometry args={[2.15, 0.013, 20, 160]} />
        <meshStandardMaterial
          color="#f8fafc"
          metalness={1.0}
          roughness={0.12}
          emissive="#ffffff"
          emissiveIntensity={0.25}
        />
      </mesh>

      {/* 7. Precision Meridian Ring 3 (Interlocking Gyro Gimbal - Precision 0.011 Tube) */}
      <mesh ref={ring3Ref}>
        <torusGeometry args={[1.92, 0.011, 20, 140]} />
        <meshStandardMaterial
          color="#e2e8f0"
          metalness={1.0}
          roughness={0.14}
          emissive="#ffffff"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* 8. Orbiting Stardust Halo (Soft Round Starlight Photons) */}
      <points ref={haloParticlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={positions.length / 3}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.03}
          color="#ffffff"
          transparent={true}
          opacity={hovered ? 0.75 : 0.5}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          map={particleTexture}
        />
      </points>

      {/* Radiant Studio Lighting */}
      <pointLight 
        position={[0, 0, 0]} 
        intensity={hovered ? 3.5 : 2.5} 
        color="#ffffff" 
        distance={7} 
        decay={2}
      />
      <ambientLight intensity={0.45} />
      <directionalLight 
        position={[6, 9, 7]} 
        intensity={2.5} 
        color="#ffffff" 
      />
      <directionalLight 
        position={[-6, -5, -4]} 
        intensity={1.2} 
        color="#cbd5e1" 
      />
    </group>
  );
};

export default CyberModel3D;
