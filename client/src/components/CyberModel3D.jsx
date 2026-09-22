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
  const ring4Ref = useRef();
  
  // Core & holographic lattice refs
  const prismRef = useRef();
  const pulsarRef = useRef();
  const innerCageRef = useRef();
  const outerCageRef = useRef();
  const particlesRef = useRef();

  const isHero = variant === 'hero';

  // Glow particle map for round, anti-aliased celestial starlight (eliminates square pixel artifacts)
  const particleTexture = useMemo(() => getGlowParticleTexture(), []);

  // Structured volumetric halo & equatorial accretion cloud (1,200 fine points)
  const particleCount = 1200;
  const [positions] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      if (i < particleCount * 0.6) {
        // Spherical celestial envelope
        const u = Math.random();
        const v = Math.random();
        const theta = u * 2.0 * Math.PI;
        const phi = Math.acos(2.0 * v - 1.0);
        const r = 2.4 + Math.random() * 2.2;
        pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        pos[i * 3 + 2] = r * Math.cos(phi);
      } else {
        // Equatorial accretion disc
        const angle = Math.random() * 2 * Math.PI;
        const radius = 2.0 + Math.random() * 1.8;
        const yJitter = (Math.random() - 0.5) * 0.35 * (1 / (radius * 0.6));
        pos[i * 3] = Math.cos(angle) * radius;
        pos[i * 3 + 1] = yJitter;
        pos[i * 3 + 2] = Math.sin(angle) * radius;
      }
    }
    return [pos];
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const speedMultiplier = isEntering ? 3.0 : (hovered ? 1.5 : 1.0);
    const scrollProgress = getScrollProgress();

    if (groupRef.current) {
      if (isHero) {
        // === HERO MODE ===
        // Prominent, majestic scale (never collapses during scroll)
        const authProgress = Math.min(1, Math.max(0, (scrollProgress - 0.75) / 0.22));
        const targetPosY = THREE.MathUtils.lerp(0.0, 1.15, authProgress);
        const targetPosZ = THREE.MathUtils.lerp(0.15, 0.22, scrollProgress);

        groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetPosY, 0.05);
        groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetPosZ, 0.05);

        // Fluid organic mouse parallax + subtle scroll tumble
        const targetRotX = (state.pointer.y * 0.3) + (scrollProgress * Math.PI * 1.2);
        const targetRotY = (time * 0.1 * speedMultiplier) + (state.pointer.x * 0.4) + (scrollProgress * Math.PI * 2.4);
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 0.04);
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.04);

        // Stable scale with organic breathing and scroll surge (1.38 - 1.55)
        const scrollSurge = Math.sin(scrollProgress * Math.PI) * 0.15;
        const breathing = Math.sin(time * 2.0) * 0.025;
        const baseScale = isEntering ? 1.7 : (1.42 + scrollSurge + breathing);
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

        const workspaceScale = 0.52;
        groupRef.current.scale.lerp(new THREE.Vector3(workspaceScale, workspaceScale, workspaceScale), 0.04);
      }
    }

    // Precision mechanical rotation of concentric gimbal rings
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = (time * 0.28 * speedMultiplier) + (scrollProgress * Math.PI * 2.2);
      ring1Ref.current.rotation.z = (time * 0.14 * speedMultiplier) + (scrollProgress * Math.PI * 1.1);
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y = (-time * 0.35 * speedMultiplier) - (scrollProgress * Math.PI * 2.0);
      ring2Ref.current.rotation.x = (time * 0.18 * speedMultiplier) + (scrollProgress * Math.PI * 1.4);
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.z = (time * 0.42 * speedMultiplier) + (scrollProgress * Math.PI * 1.8);
      ring3Ref.current.rotation.y = (time * 0.2 * speedMultiplier);
    }
    if (ring4Ref.current) {
      ring4Ref.current.rotation.x = (-time * 0.32 * speedMultiplier) - (scrollProgress * Math.PI * 1.5);
      ring4Ref.current.rotation.z = (-time * 0.22 * speedMultiplier);
    }

    // Outer and inner holographic cages: counter-rotating moiré interference
    if (outerCageRef.current) {
      outerCageRef.current.rotation.y = -time * 0.12 - (scrollProgress * Math.PI * 0.8);
      outerCageRef.current.rotation.x = time * 0.08;
    }
    if (innerCageRef.current) {
      innerCageRef.current.rotation.y = time * 0.16 + (scrollProgress * Math.PI * 1.1);
      innerCageRef.current.rotation.z = time * 0.1;
    }

    // Faceted obsidian crystal hull & pulsar core
    if (prismRef.current) {
      prismRef.current.rotation.y = (time * 0.5) + (scrollProgress * Math.PI * 2.5);
      prismRef.current.rotation.x = time * 0.25;
      const pulse = 1 + Math.sin(time * 2.5) * 0.04;
      prismRef.current.scale.set(pulse, pulse, pulse);
    }
    if (pulsarRef.current) {
      pulsarRef.current.rotation.y = -time * 1.2;
      pulsarRef.current.rotation.z = time * 0.8;
      const corePulse = 1 + Math.sin(time * 4.0) * 0.08;
      pulsarRef.current.scale.set(corePulse, corePulse, corePulse);
    }

    // Accretion halo drift
    if (particlesRef.current) {
      particlesRef.current.rotation.y = (-time * 0.05) - (scrollProgress * Math.PI * 1.2);
      particlesRef.current.rotation.x = Math.cos(time * 0.03) * 0.08;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* 1. Deep Pulsar Spark (White-hot energy nucleus at the exact center) */}
      <mesh ref={pulsarRef}>
        <icosahedronGeometry args={[0.32, 1]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={hovered ? 1.8 : 1.2}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>

      {/* 2. Faceted Obsidian Prism (Smoky translucent diamond that catches specular glints) */}
      <mesh ref={prismRef}>
        <octahedronGeometry args={[0.95, 0]} />
        <meshPhysicalMaterial
          color="#0f172a"
          roughness={0.06}
          metalness={0.96}
          transparent={true}
          opacity={0.36}
          reflectivity={1.0}
          clearcoat={1.0}
          clearcoatRoughness={0.08}
        />
      </mesh>

      {/* 3. Inner Geodesic Holographic Forcefield (Delicate silver/slate lattice) */}
      <mesh ref={innerCageRef}>
        <icosahedronGeometry args={[1.42, 1]} />
        <meshBasicMaterial
          color="#cbd5e1"
          wireframe={true}
          transparent={true}
          opacity={0.18}
        />
      </mesh>

      {/* 4. Outer Geodesic Technical Lattice (Hairline platinum wireframe for moiré depth) */}
      <mesh ref={outerCageRef}>
        <icosahedronGeometry args={[1.65, 2]} />
        <meshBasicMaterial
          color="#ffffff"
          wireframe={true}
          transparent={true}
          opacity={0.12}
        />
      </mesh>

      {/* 5. Master Armillary Ring 1 (Equatorial Chrome Gimbal - Razor-thin 0.007 tube) */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[2.45, 0.007, 16, 160]} />
        <meshStandardMaterial
          color="#ffffff"
          metalness={0.98}
          roughness={0.1}
          emissive="#ffffff"
          emissiveIntensity={0.12}
        />
      </mesh>

      {/* 6. Secondary Gimbal Ring 2 (Polar Inclined Titanium Gimbal - Thin 0.006 tube) */}
      <mesh ref={ring2Ref}>
        <torusGeometry args={[2.25, 0.006, 16, 160]} />
        <meshStandardMaterial
          color="#f1f5f9"
          metalness={0.98}
          roughness={0.12}
          emissive="#ffffff"
          emissiveIntensity={0.15}
        />
      </mesh>

      {/* 7. Tertiary Precision Ring 3 (Interlocking Meridian Gimbal - Thin 0.005 tube) */}
      <mesh ref={ring3Ref}>
        <torusGeometry args={[2.05, 0.005, 16, 140]} />
        <meshStandardMaterial
          color="#e2e8f0"
          metalness={0.98}
          roughness={0.15}
          emissive="#ffffff"
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* 8. Inner Horizon Ring 4 (High-Speed Gyroscopic Core Stabilizer) */}
      <mesh ref={ring4Ref}>
        <torusGeometry args={[1.85, 0.005, 16, 140]} />
        <meshStandardMaterial
          color="#ffffff"
          metalness={1.0}
          roughness={0.08}
          emissive="#ffffff"
          emissiveIntensity={0.18}
        />
      </mesh>

      {/* 9. Celestial Accretion & Starlight Halo (Soft round photons, ZERO square pixel artifacts) */}
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
          size={0.024}
          color="#f8fafc"
          transparent={true}
          opacity={hovered ? 0.65 : 0.45}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          map={particleTexture}
        />
      </points>

      {/* High-End Studio Lighting: Central Radiance + Crisp Specular Rim Glints */}
      <pointLight 
        position={[0, 0, 0]} 
        intensity={hovered ? 2.5 : 1.6} 
        color="#ffffff" 
        distance={6} 
        decay={2}
      />
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[5, 8, 6]} 
        intensity={2.2} 
        color="#ffffff" 
      />
      <directionalLight 
        position={[-5, -4, -4]} 
        intensity={1.0} 
        color="#94a3b8" 
      />
    </group>
  );
};

export default CyberModel3D;
