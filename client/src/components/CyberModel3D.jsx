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
  const meridianRingRef = useRef();
  const innerNucleusRef = useRef();
  const innerCrystalRef = useRef();
  const innerCageRef = useRef();
  const outerCageRef = useRef();
  const satellitesGroupRef = useRef();
  const particlesRef = useRef();

  const isHero = variant === 'hero';

  // Structured volumetric halo & equatorial accretion cloud (1,400 points)
  const particleCount = 1400;
  const [positions] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      if (i < particleCount * 0.65) {
        // 1. Spherical orbital shell
        const u = Math.random();
        const v = Math.random();
        const theta = u * 2.0 * Math.PI;
        const phi = Math.acos(2.0 * v - 1.0);
        const r = 2.4 + Math.random() * 2.0;
        pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        pos[i * 3 + 2] = r * Math.cos(phi);
      } else {
        // 2. Equatorial accretion disc
        const angle = Math.random() * 2 * Math.PI;
        const radius = 1.9 + Math.random() * 1.8;
        const yJitter = (Math.random() - 0.5) * 0.45 * (1 / (radius * 0.5));
        pos[i * 3] = Math.cos(angle) * radius;
        pos[i * 3 + 1] = yJitter;
        pos[i * 3 + 2] = Math.sin(angle) * radius;
      }
    }
    return [pos];
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const speedMultiplier = isEntering ? 3.5 : (hovered ? 1.6 : 1.0);
    const scrollProgress = getScrollProgress();

    if (groupRef.current) {
      if (isHero) {
        // === HERO MODE (Login & Scrollytelling Showcase) ===
        // NEVER SHRINK! Maintain a commanding, majestic presence throughout scroll.
        // During stages 01, 02, 03: centered at y=0.
        // As auth card arrives (scrollProgress > 0.75): glide up to y=1.15 to crown the form!
        const authProgress = Math.min(1, Math.max(0, (scrollProgress - 0.75) / 0.22));
        const targetPosY = THREE.MathUtils.lerp(0.0, 1.15, authProgress);
        
        // Keep Z close to camera (0.1 to 0.25) so perspective projection never shrinks it into a speck
        const targetPosZ = THREE.MathUtils.lerp(0.15, 0.25, scrollProgress);
        
        groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetPosY, 0.05);
        groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetPosZ, 0.05);

        // Fluid organic mouse parallax + dynamic scroll tumble
        const targetRotX = (state.pointer.y * 0.35) + (scrollProgress * Math.PI * 1.4);
        const targetRotY = (time * 0.12 * speedMultiplier) + (state.pointer.x * 0.45) + (scrollProgress * Math.PI * 2.8);
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 0.04);
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.04);

        // Scale: Stays 1.40 - 1.65 (pulses and surges with energy on scroll instead of shrinking!)
        const scrollSurge = Math.sin(scrollProgress * Math.PI) * 0.18;
        const breathingPulse = Math.sin(time * 2.0) * 0.03;
        const baseScale = isEntering ? 1.75 : (1.45 + scrollSurge + breathingPulse);
        groupRef.current.scale.lerp(new THREE.Vector3(baseScale, baseScale, baseScale), 0.05);
      } else {
        // === WORKSPACE MODE (Dashboard background) ===
        // Ambient background element tucked unobtrusively behind UI cards
        const targetPosY = 0.6;
        const targetPosZ = -3.8;
        groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetPosY, 0.04);
        groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetPosZ, 0.04);

        const targetRotX = (state.pointer.y * 0.15);
        const targetRotY = (time * 0.08 * speedMultiplier) + (state.pointer.x * 0.2);
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 0.03);
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.03);

        const workspaceScale = 0.55;
        groupRef.current.scale.lerp(new THREE.Vector3(workspaceScale, workspaceScale, workspaceScale), 0.04);
      }
    }

    // Outer gyro ring: X & Z rotation with scroll boost
    if (outerRingRef.current) {
      outerRingRef.current.rotation.x = (time * 0.35 * speedMultiplier) + (scrollProgress * Math.PI * 3.0);
      outerRingRef.current.rotation.z = (time * 0.18 * speedMultiplier) + (scrollProgress * Math.PI * 1.5);
    }

    // Middle gimbal ring: Y & X counter-rotation
    if (middleRingRef.current) {
      middleRingRef.current.rotation.y = (-time * 0.42 * speedMultiplier) - (scrollProgress * Math.PI * 2.5);
      middleRingRef.current.rotation.x = (time * 0.22 * speedMultiplier) + (scrollProgress * Math.PI * 1.8);
    }

    // Inner meridian ring: fast precision orbit
    if (meridianRingRef.current) {
      meridianRingRef.current.rotation.z = (time * 0.5 * speedMultiplier) + (scrollProgress * Math.PI * 2.2);
      meridianRingRef.current.rotation.y = (time * 0.25 * speedMultiplier);
    }

    // Inner glowing nucleus pulse & spin
    if (innerNucleusRef.current) {
      innerNucleusRef.current.rotation.y = (time * 0.7) + (scrollProgress * Math.PI * 3.2);
      innerNucleusRef.current.rotation.x = (time * 0.35);
      const pulse = 1 + Math.sin(time * 3.2) * 0.06;
      innerNucleusRef.current.scale.set(pulse, pulse, pulse);
    }

    // Nested inner crystal core rapid counter-rotation
    if (innerCrystalRef.current) {
      innerCrystalRef.current.rotation.y = -time * 1.4;
      innerCrystalRef.current.rotation.z = time * 0.9;
    }

    // Dual wireframe cages rotate at differential speeds to create living moiré interference pattern
    if (innerCageRef.current) {
      innerCageRef.current.rotation.y = time * 0.2 + (scrollProgress * Math.PI);
      innerCageRef.current.rotation.x = time * 0.1;
    }
    if (outerCageRef.current) {
      outerCageRef.current.rotation.y = -time * 0.15 - (scrollProgress * Math.PI * 1.2);
      outerCageRef.current.rotation.z = time * 0.12;
    }

    // Orbiting quantum satellite nodes group
    if (satellitesGroupRef.current) {
      satellitesGroupRef.current.rotation.y = (time * 0.65 * speedMultiplier);
      satellitesGroupRef.current.rotation.x = Math.sin(time * 0.4) * 0.25;
    }

    // Cosmic accretion particle halo
    if (particlesRef.current) {
      particlesRef.current.rotation.y = (-time * 0.06) - (scrollProgress * Math.PI * 1.6);
      particlesRef.current.rotation.x = Math.cos(time * 0.04) * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* 1. Deep Core: High-Luminance Quantum Crystal */}
      <mesh ref={innerCrystalRef}>
        <octahedronGeometry args={[0.52, 0]} />
        <meshStandardMaterial
          color="#ffffff"
          roughness={0.08}
          metalness={0.95}
          emissive="#ffffff"
          emissiveIntensity={hovered ? 0.9 : 0.6}
        />
      </mesh>

      {/* 2. Faceted Quantum Nucleus (Translucent Sheen + Cyan Glow) */}
      <mesh ref={innerNucleusRef}>
        <octahedronGeometry args={[1.05, 0]} />
        <meshStandardMaterial
          color="#ffffff"
          roughness={0.12}
          metalness={0.92}
          transparent={true}
          opacity={0.32}
          emissive="#38bdf8"
          emissiveIntensity={hovered ? 0.65 : 0.35}
        />
      </mesh>

      {/* 3. Inner Geodesic Holographic Cage (Cyan wireframe) */}
      <mesh ref={innerCageRef}>
        <icosahedronGeometry args={[1.42, 1]} />
        <meshBasicMaterial
          color="#38bdf8"
          wireframe={true}
          transparent={true}
          opacity={0.32}
        />
      </mesh>

      {/* 4. Outer Geodesic Technical Lattice (White wireframe - Moiré pattern generator) */}
      <mesh ref={outerCageRef}>
        <icosahedronGeometry args={[1.68, 2]} />
        <meshBasicMaterial
          color="#ffffff"
          wireframe={true}
          transparent={true}
          opacity={0.18}
        />
      </mesh>

      {/* 5. Primary Gyroscope Ring (Equatorial Torus - Chrome Finish) */}
      <mesh ref={outerRingRef}>
        <torusGeometry args={[2.3, 0.024, 16, 120]} />
        <meshStandardMaterial
          color="#ffffff"
          metalness={1.0}
          roughness={0.15}
          emissive="#ffffff"
          emissiveIntensity={0.25}
        />
      </mesh>

      {/* 6. Secondary Gimbal Gyro Ring (Polar/Inclined Torus - Electric Cyan Glow) */}
      <mesh ref={middleRingRef}>
        <torusGeometry args={[2.65, 0.02, 16, 120]} />
        <meshStandardMaterial
          color="#ffffff"
          metalness={1.0}
          roughness={0.2}
          emissive="#38bdf8"
          emissiveIntensity={0.32}
        />
      </mesh>

      {/* 7. Inner Precision Meridian Ring (Tilted Torus) */}
      <mesh ref={meridianRingRef}>
        <torusGeometry args={[2.0, 0.014, 16, 100]} />
        <meshStandardMaterial
          color="#ffffff"
          metalness={1.0}
          roughness={0.1}
          emissive="#ffffff"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* 8. Orbiting Quantum Satellite Nodes (4 synchronized technical nodes) */}
      <group ref={satellitesGroupRef}>
        {[0, Math.PI * 0.5, Math.PI, Math.PI * 1.5].map((angle, idx) => (
          <mesh 
            key={idx} 
            position={[
              Math.cos(angle) * 2.3, 
              0, 
              Math.sin(angle) * 2.3
            ]}
          >
            <sphereGeometry args={[0.055, 16, 16]} />
            <meshStandardMaterial
              color="#00f0ff"
              emissive="#00f0ff"
              emissiveIntensity={1.4}
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>
        ))}
      </group>

      {/* 9. Celestial Accretion & Orbital Dust Halo */}
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
          color="#e0f2fe"
          transparent={true}
          opacity={hovered ? 0.7 : 0.45}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Central Core Luminescence & Dynamic Directional Lighting */}
      <pointLight 
        position={[0, 0, 0]} 
        intensity={hovered ? 3.0 : 2.0} 
        color="#38bdf8" 
        distance={7} 
        decay={2}
      />
      <ambientLight intensity={0.5} />
      <directionalLight 
        position={[4, 8, 5]} 
        intensity={1.8} 
        color="#ffffff" 
      />
      <directionalLight 
        position={[-4, -5, -3]} 
        intensity={0.8} 
        color="#38bdf8" 
      />
    </group>
  );
};

export default CyberModel3D;
