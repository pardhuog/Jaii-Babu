import { useEffect, useRef } from 'react';

const SKILLS = ['Python', 'React', 'SQL', 'ML', 'DSA', 'Node', 'Java', 'CSS', 'AWS', 'Git', 'TypeScript', 'Docker', 'API', 'Vue', 'Rust'];

function useReducedMotion() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function randomBetween(a, b) { return a + Math.random() * (b - a); }

function initBubbles(W, H) {
  return SKILLS.map(skill => ({
    label: skill,
    x: randomBetween(60, W - 60),
    y: randomBetween(60, H - 60),
    vx: randomBetween(-0.18, 0.18),
    vy: randomBetween(-0.35, -0.1),
    r: randomBetween(28, 44),
    rotation: randomBetween(-6, 6),
    alpha: randomBetween(0.55, 0.9),
    color: Math.random() > 0.5 ? 'rgba(26,115,232,' : 'rgba(0,137,123,',
  }));
}

export default function SketchBackground() {
  const canvasRef = useRef(null);
  const bubblesRef = useRef(null);
  const mouseRef = useRef({ x: -999, y: -999 });
  const rafRef = useRef(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      bubblesRef.current = initBubbles(canvas.width, canvas.height);
    }
    resize();
    window.addEventListener('resize', resize);

    const onMove = e => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener('mousemove', onMove);

    function drawSketchRect(ctx, x, y, w, h, r, rotation) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.beginPath();
      const wobble = 1.2;
      ctx.moveTo(-w / 2 + r, -h / 2 + randomBetween(-wobble, wobble));
      ctx.lineTo(w / 2 - r, -h / 2 + randomBetween(-wobble, wobble));
      ctx.quadraticCurveTo(w / 2, -h / 2, w / 2 + randomBetween(-wobble, wobble), -h / 2 + r);
      ctx.lineTo(w / 2 + randomBetween(-wobble, wobble), h / 2 - r);
      ctx.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2 + randomBetween(-wobble, wobble));
      ctx.lineTo(-w / 2 + r, h / 2 + randomBetween(-wobble, wobble));
      ctx.quadraticCurveTo(-w / 2, h / 2, -w / 2 + randomBetween(-wobble, wobble), h / 2 - r);
      ctx.lineTo(-w / 2 + randomBetween(-wobble, wobble), -h / 2 + r);
      ctx.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2 + randomBetween(-wobble, wobble));
      ctx.closePath();
      ctx.restore();
    }

    function draw() {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      const bubbles = bubblesRef.current;
      if (!bubbles) return;
      const mouse = mouseRef.current;

      // Update positions
      if (!reducedMotion) {
        for (const b of bubbles) {
          // Mouse repulsion
          const dx = b.x - mouse.x, dy = b.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            const force = (100 - dist) / 100;
            b.vx += (dx / dist) * force * 0.4;
            b.vy += (dy / dist) * force * 0.4;
          }
          // Damping
          b.vx *= 0.98;
          b.vy *= 0.98;
          // Clamp speed
          const spd = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
          if (spd > 0.5) { b.vx = (b.vx / spd) * 0.5; b.vy = (b.vy / spd) * 0.5; }
          // Ensure upward drift
          if (b.vy > -0.05) b.vy -= 0.005;
          b.x += b.vx;
          b.y += b.vy;
          // Wrap
          if (b.y < -60) b.y = H + 60;
          if (b.x < -80) b.x = W + 80;
          if (b.x > W + 80) b.x = -80;
        }
      }

      // Draw connection lines
      for (let i = 0; i < bubbles.length; i++) {
        for (let j = i + 1; j < bubbles.length; j++) {
          const a = bubbles[i], b = bubbles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            const alpha = (1 - dist / 120) * 0.06;
            ctx.beginPath();
            ctx.moveTo(a.x + randomBetween(-1, 1), a.y + randomBetween(-1, 1));
            ctx.lineTo(b.x + randomBetween(-1, 1), b.y + randomBetween(-1, 1));
            ctx.strokeStyle = `rgba(26,115,232,${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.shadowBlur = 2;
            ctx.shadowColor = 'rgba(26,115,232,0.1)';
            ctx.stroke();
            ctx.shadowBlur = 0;
          }
        }
      }

      // Draw bubbles
      for (const b of bubbles) {
        ctx.font = `500 11px 'Inter', sans-serif`;
        const textW = ctx.measureText(b.label).width;
        const padX = 12, padY = 7;
        const bW = textW + padX * 2, bH = 24 + padY;

        ctx.save();
        ctx.shadowBlur = 2;
        ctx.shadowColor = b.color + '0.12)';

        // Fill
        ctx.fillStyle = b.color + '0.06)';
        drawSketchRect(ctx, b.x, b.y, bW, bH, 8, b.rotation);
        ctx.fill();

        // Border
        ctx.strokeStyle = b.color + `${(b.alpha * 0.15).toFixed(2)})`;
        ctx.lineWidth = 1;
        drawSketchRect(ctx, b.x, b.y, bW, bH, 8, b.rotation);
        ctx.stroke();

        ctx.restore();

        // Text
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate((b.rotation * Math.PI) / 180);
        ctx.font = `500 11px 'Inter', sans-serif`;
        ctx.fillStyle = b.color + `${(b.alpha * 0.5).toFixed(2)})`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(b.label, 0, 0);
        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
    };
  }, [reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        width: '100%',
        height: '100%',
      }}
      aria-hidden="true"
    />
  );
}
