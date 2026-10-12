import { useEffect, useRef } from 'react';

export function ConfettiCelebration({ active = true, duration = 3500, onComplete }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let startTime = performance.now();

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Particle colors
    const colors = [
      '#10B981', // Emerald
      '#059669', // Dark Emerald
      '#3B82F6', // Blue
      '#F59E0B', // Amber / Gold
      '#EC4899', // Pink
      '#8B5CF6', // Purple
      '#EF4444', // Red
      '#14B8A6', // Teal
      '#FBBF24', // Yellow Gold
    ];

    const particleCount = 130;
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: canvas.width * (0.2 + Math.random() * 0.6), // Launch from central area
        y: canvas.height * (0.35 + Math.random() * 0.3),
        vx: (Math.random() - 0.5) * 16,
        vy: -Math.random() * 14 - 4, // Upward initial velocity
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        wobble: Math.random() * 10,
        wobbleSpeed: Math.random() * 0.1 + 0.05,
        shape: Math.random() > 0.4 ? 'rect' : Math.random() > 0.5 ? 'circle' : 'ribbon',
        opacity: 1,
        gravity: 0.35 + Math.random() * 0.15,
        drag: 0.98,
      });
    }

    const render = (currentTime) => {
      const elapsed = currentTime - startTime;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let anyAlive = false;

      particles.forEach((p) => {
        p.vx *= p.drag;
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.wobble += p.wobbleSpeed;

        if (elapsed > duration - 1000) {
          p.opacity = Math.max(0, (duration - elapsed) / 1000);
        }

        if (p.y < canvas.height + 50 && p.opacity > 0) {
          anyAlive = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = p.opacity;
          ctx.fillStyle = p.color;

          if (p.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
          } else if (p.shape === 'ribbon') {
            ctx.fillRect(-p.size / 2, -p.size * 1.5, p.size, p.size * 3);
          } else {
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.8);
          }

          ctx.restore();
        }
      });

      if (elapsed < duration && anyAlive) {
        animationFrameId = requestAnimationFrame(render);
      } else {
        if (onComplete) onComplete();
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [active, duration, onComplete]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 99999,
      }}
    />
  );
}

export default ConfettiCelebration;
