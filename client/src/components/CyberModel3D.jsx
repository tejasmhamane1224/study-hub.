import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getScrollProgress } from '../utils/scrollTracker';
import { getGlowParticleTexture } from '../utils/particleTexture';

/**
 * High-End Luminous Quantum Singularity (Torus Knot Continuum + Laser Gimbals + Hyper-Core)
 * Designed for STUDY HUB: Spatial AI Cognitive Environment
 */
export const CyberModel3D = ({ 
  isEntering = false, 
  hovered = false, 
  showIntro = true, 
  variant = 'hero' 
}) => {
  const groupRef = useRef();
  
  // Ribbon & Core refs
  const knotMeshRef = useRef();
  const knotWireRef = useRef();
  const singularityRef = useRef();
  const innerPlasmaRef = useRef();
  
  // Laser rings refs
  const laserRing1Ref = useRef();
  const laserRing2Ref = useRef();
  const haloPointsRef = useRef();

  const isHero = variant === 'hero';

  // Crisp radial gradient particle texture
  const particleTexture = useMemo(() => getGlowParticleTexture(), []);

  // Swirling quantum halo (1,200 luminous starlight particles)
  const haloCount = 1200;
  const [positions] = useMemo(() => {
    const pos = new Float32Array(haloCount * 3);
    for (let i = 0; i < haloCount; i++) {
      if (i < haloCount * 0.6) {
        // Spherical orbital swarm
        const u = Math.random();
        const v = Math.random();
        const theta = u * 2.0 * Math.PI;
        const phi = Math.acos(2.0 * v - 1.0);
        const r = 2.1 + Math.random() * 2.0;
        pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        pos[i * 3 + 2] = r * Math.cos(phi);
      } else {
        // Equatorial vortex disc
        const angle = Math.random() * 2 * Math.PI;
        const radius = 1.8 + Math.random() * 1.7;
        const yJitter = (Math.random() - 0.5) * 0.4 * (1 / (radius * 0.5));
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
        // Never shrinks into a speck. Retains commanding presence throughout scroll.
        const authProgress = Math.min(1, Math.max(0, (scrollProgress - 0.75) / 0.22));
        const targetPosY = THREE.MathUtils.lerp(0.0, 1.15, authProgress);
        const targetPosZ = THREE.MathUtils.lerp(0.2, 0.3, scrollProgress);

        groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetPosY, 0.05);
        groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetPosZ, 0.05);

        // Fluid organic mouse parallax + dynamic scroll tumble
        const targetRotX = (state.pointer.y * 0.35) + (scrollProgress * Math.PI * 1.2);
        const targetRotY = (time * 0.12 * speedMultiplier) + (state.pointer.x * 0.45) + (scrollProgress * Math.PI * 2.4);
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 0.04);
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.04);

        // Scale: Stays 1.40 - 1.60 with gentle breathing pulse
        const scrollSurge = Math.sin(scrollProgress * Math.PI) * 0.15;
        const breathing = Math.sin(time * 2.0) * 0.025;
        const baseScale = isEntering ? 1.75 : (1.42 + scrollSurge + breathing);
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

    // Dynamic rotation of the Quantum Torus Knot
    if (knotMeshRef.current) {
      knotMeshRef.current.rotation.x = (time * 0.3 * speedMultiplier) + (scrollProgress * Math.PI * 2.0);
      knotMeshRef.current.rotation.y = (time * 0.4 * speedMultiplier) + (scrollProgress * Math.PI * 2.5);
      knotMeshRef.current.rotation.z = (time * 0.15 * speedMultiplier);
    }
    if (knotWireRef.current) {
      knotWireRef.current.rotation.x = (time * 0.3 * speedMultiplier) + (scrollProgress * Math.PI * 2.0);
      knotWireRef.current.rotation.y = (time * 0.4 * speedMultiplier) + (scrollProgress * Math.PI * 2.5);
      knotWireRef.current.rotation.z = (time * 0.15 * speedMultiplier);
    }

    // Inner Singularity Pulsar Pulse & Counter-Rotation
    if (singularityRef.current) {
      singularityRef.current.rotation.y = -time * 0.8;
      singularityRef.current.rotation.x = time * 0.5;
      const pulse = 1 + Math.sin(time * 3.0) * 0.08;
      singularityRef.current.scale.set(pulse, pulse, pulse);
    }
    if (innerPlasmaRef.current) {
      const spark = 1 + Math.sin(time * 5.0) * 0.12;
      innerPlasmaRef.current.scale.set(spark, spark, spark);
    }

    // Laser Gyro Rings
    if (laserRing1Ref.current) {
      laserRing1Ref.current.rotation.x = (time * 0.25 * speedMultiplier) + (scrollProgress * Math.PI * 1.8);
      laserRing1Ref.current.rotation.y = (time * 0.15 * speedMultiplier);
    }
    if (laserRing2Ref.current) {
      laserRing2Ref.current.rotation.y = (-time * 0.32 * speedMultiplier) - (scrollProgress * Math.PI * 2.0);
      laserRing2Ref.current.rotation.z = (time * 0.2 * speedMultiplier);
    }

    // Halo drift
    if (haloPointsRef.current) {
      haloPointsRef.current.rotation.y = (-time * 0.06) - (scrollProgress * Math.PI * 1.5);
      haloPointsRef.current.rotation.x = Math.cos(time * 0.03) * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* 1. Luminous Quantum Torus Knot (Liquid Platinum Ribbon with Ice Cyan Glow) */}
      <mesh ref={knotMeshRef}>
        <torusKnotGeometry args={[1.48, 0.3, 220, 36, 2, 3]} />
        <meshPhysicalMaterial
          color="#f8fafc"
          roughness={0.08}
          metalness={0.94}
          clearcoat={1.0}
          clearcoatRoughness={0.05}
          emissive="#38bdf8"
          emissiveIntensity={hovered ? 0.7 : 0.45}
          reflectivity={1.0}
        />
      </mesh>

      {/* 2. Holographic Cyber-Wireframe Overlay (Geometric Matrix Lattice) */}
      <mesh ref={knotWireRef}>
        <torusKnotGeometry args={[1.49, 0.304, 110, 16, 2, 3]} />
        <meshBasicMaterial
          color="#ffffff"
          wireframe={true}
          transparent={true}
          opacity={0.3}
        />
      </mesh>

      {/* 3. Central Luminous Singularity (Radiant Geometric Polyhedron) */}
      <mesh ref={singularityRef}>
        <dodecahedronGeometry args={[0.7, 0]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={hovered ? 2.5 : 1.8}
          roughness={0.06}
          metalness={0.92}
        />
      </mesh>

      {/* 4. White-Hot Plasma Heart (High-Intensity Spark at the Center) */}
      <mesh ref={innerPlasmaRef}>
        <sphereGeometry args={[0.38, 32, 32]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* 5. Primary Laser Precision Ring (Equatorial Diamond White Gimbal) */}
      <mesh ref={laserRing1Ref}>
        <torusGeometry args={[2.55, 0.012, 16, 180]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.65}
          metalness={1.0}
          roughness={0.1}
        />
      </mesh>

      {/* 6. Secondary Laser Precision Ring (Inclined 55deg Interlocking Gimbal) */}
      <mesh ref={laserRing2Ref} rotation={[Math.PI / 3, 0, Math.PI / 4]}>
        <torusGeometry args={[2.8, 0.01, 16, 180]} />
        <meshStandardMaterial
          color="#e0f2fe"
          emissive="#38bdf8"
          emissiveIntensity={0.55}
          metalness={1.0}
          roughness={0.1}
        />
      </mesh>

      {/* 7. Orbiting Quantum Halo Particles (Brilliant Round Starlight Photons) */}
      <points ref={haloPointsRef}>
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
          opacity={hovered ? 0.95 : 0.8}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          map={particleTexture}
        />
      </points>

      {/* Dynamic Lighting: Intense Central Core Glow + Specular Rim Lights */}
      <pointLight 
        position={[0, 0, 0]} 
        intensity={hovered ? 5.5 : 4.0} 
        color="#38bdf8" 
        distance={8} 
        decay={2}
      />
      <ambientLight intensity={0.55} />
      <directionalLight 
        position={[6, 9, 7]} 
        intensity={2.8} 
        color="#ffffff" 
      />
      <directionalLight 
        position={[-6, -5, -4]} 
        intensity={1.5} 
        color="#38bdf8" 
      />
    </group>
  );
};

export default CyberModel3D;
