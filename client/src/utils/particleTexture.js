import * as THREE from 'three';

let cachedTexture = null;

/**
 * Generates a smooth, high-resolution radial gradient texture for WebGL particles.
 * Eliminates square OpenGL pixel artifacts and creates cinematic, glowing round starlight photons.
 */
export const getGlowParticleTexture = () => {
  if (cachedTexture) return cachedTexture;
  if (typeof document === 'undefined') return null;

  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.85)');
  gradient.addColorStop(0.45, 'rgba(225, 240, 255, 0.4)');
  gradient.addColorStop(0.75, 'rgba(180, 215, 255, 0.1)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);

  cachedTexture = new THREE.CanvasTexture(canvas);
  cachedTexture.generateMipmaps = true;
  cachedTexture.needsUpdate = true;
  return cachedTexture;
};
