import * as THREE from 'three';

let cachedTexture = null;

/**
 * Generates a brilliant, high-luminance radial gradient texture for WebGL particles.
 * Produces crisp, glowing round starlight photons with radiant cores.
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
  gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.95)');
  gradient.addColorStop(0.5, 'rgba(220, 245, 255, 0.65)');
  gradient.addColorStop(0.8, 'rgba(180, 220, 255, 0.25)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);

  cachedTexture = new THREE.CanvasTexture(canvas);
  cachedTexture.generateMipmaps = true;
  cachedTexture.needsUpdate = true;
  return cachedTexture;
};
