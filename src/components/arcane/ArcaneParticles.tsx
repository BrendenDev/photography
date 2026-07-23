import { useEffect, useRef } from 'react';

interface Mote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  opacityDir: number;
  hue: number;
  drift: number;
  phase: number;
}

interface Twinkle {
  x: number;
  y: number;
  life: number;
  maxLife: number;
  size: number;
  hue: number;
}

interface ArcaneParticlesProps {
  count?: number;
  className?: string;
}

/**
 * Layered magical particle system:
 * 1. Luminous motes — soft purple/violet drifting upward
 * 2. Constellation threads — faint lines connecting nearby motes
 * 3. Star twinkles — tiny points that flash in and fade away
 */
export default function ArcaneParticles({ count = 25, className = '' }: ArcaneParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const motesRef = useRef<Mote[]>([]);
  const twinklesRef = useRef<Twinkle[]>([]);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let cw = 0, ch = 0;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      cw = canvas.offsetWidth;
      ch = canvas.offsetHeight;
      canvas.width = cw * dpr;
      canvas.height = ch * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    // Initialize motes — mostly purple/violet spectrum with some warm accents
    motesRef.current = Array.from({ length: count }, () => {
      const r = Math.random();
      // 50% purple/violet, 25% blue-violet, 15% cyan-blue, 10% warm gold
      const hue = r < 0.50 ? 265 + Math.random() * 30   // purple-violet
               : r < 0.75 ? 230 + Math.random() * 35     // blue-violet  
               : r < 0.90 ? 195 + Math.random() * 30     // cyan-blue
               :             35 + Math.random() * 15;     // warm gold accent
      return {
        x: Math.random() * (cw || 1200),
        y: Math.random() * (ch || 800),
        vx: (Math.random() - 0.5) * 0.12,
        vy: -(Math.random() * 0.18 + 0.03),
        size: Math.random() * 2.5 + 0.5,
        opacity: Math.random() * 0.35,
        opacityDir: Math.random() > 0.5 ? 1 : -1,
        hue,
        drift: Math.random() * 0.25 + 0.08,
        phase: Math.random() * Math.PI * 2,
      };
    });

    twinklesRef.current = [];

    let time = 0;
    const animate = () => {
      ctx.clearRect(0, 0, cw, ch);
      time += 0.006;

      const motes = motesRef.current;

      // ── Update & draw motes ──
      for (const p of motes) {
        p.x += p.vx + Math.sin(time * 1.5 + p.phase) * p.drift * 0.25;
        p.y += p.vy;

        p.opacity += p.opacityDir * 0.0015;
        if (p.opacity > 0.45) { p.opacity = 0.45; p.opacityDir = -1; }
        if (p.opacity < 0.02) { p.opacity = 0.02; p.opacityDir = 1; }

        if (p.y < -10) { p.y = ch + 10; p.x = Math.random() * cw; }
        if (p.x < -10) p.x = cw + 10;
        if (p.x > cw + 10) p.x = -10;

        // Outer glow
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
        g.addColorStop(0, `hsla(${p.hue}, 65%, 72%, ${p.opacity})`);
        g.addColorStop(0.3, `hsla(${p.hue}, 55%, 62%, ${p.opacity * 0.35})`);
        g.addColorStop(1, `hsla(${p.hue}, 45%, 50%, 0)`);
        ctx.beginPath();
        ctx.fillStyle = g;
        ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
        ctx.fill();

        // Bright core
        ctx.beginPath();
        ctx.fillStyle = `hsla(${p.hue}, 75%, 88%, ${p.opacity * 0.7})`;
        ctx.arc(p.x, p.y, p.size * 0.4, 0, Math.PI * 2);
        ctx.fill();
      }

      // ── Star twinkles ── (simplified: plain dots, no save/restore)
      if (Math.random() < 0.025) {
        twinklesRef.current.push({
          x: Math.random() * cw,
          y: Math.random() * ch,
          life: 0,
          maxLife: 60 + Math.random() * 80,
          size: Math.random() * 1.5 + 0.5,
          hue: 260 + Math.random() * 40,
        });
      }

      twinklesRef.current = twinklesRef.current.filter(t => {
        t.life++;
        if (t.life > t.maxLife) return false;

        const progress = t.life / t.maxLife;
        const alpha = progress < 0.3
          ? (progress / 0.3) * 0.6
          : (1 - (progress - 0.3) / 0.7) * 0.6;

        ctx.beginPath();
        ctx.fillStyle = `hsla(${t.hue}, 70%, 90%, ${alpha})`;
        ctx.arc(t.x, t.y, t.size, 0, Math.PI * 2);
        ctx.fill();
        return true;
      });

      animRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
