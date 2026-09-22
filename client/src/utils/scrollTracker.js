// High-performance RAF scroll tracker shared across 3D components without circular dependencies
let cachedScrollProgress = 0;

if (typeof window !== 'undefined') {
  let ticking = false;
  const updateScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const docHeight = Math.max(
          document.body?.scrollHeight || 0,
          document.documentElement?.scrollHeight || 0
        );
        const scrollMax = Math.max(1, docHeight - window.innerHeight);
        cachedScrollProgress = Math.min(1, Math.max(0, window.scrollY / scrollMax));
        ticking = false;
      });
      ticking = true;
    }
  };

  window.addEventListener('scroll', updateScroll, { passive: true });
  window.addEventListener('resize', updateScroll, { passive: true });
  updateScroll();
}

export const getScrollProgress = () => cachedScrollProgress;
