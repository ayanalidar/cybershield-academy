'use client';

import { useEffect, useRef } from 'react';

/* ═══════════════════════════════════════════════════════════════
   ANIMATED QUANTUM SUPERCOMPUTER HERO
   Full canvas-rendered scene: lightning, holographic grid,
   radar sweep, energy particles, node network, core glow
   ═══════════════════════════════════════════════════════════════ */

interface Bolt {
  points: { x: number; y: number }[];
  life: number;
  maxLife: number;
  color: string;
  glow: string;
  width: number;
  branchChance: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

interface Node {
  x: number;
  y: number;
  color: string;
  pulse: number;
  pulseSpeed: number;
  pulseOffset: number;
}

export function CinematicHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const boltsRef = useRef<Bolt[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = 0, H = 0;
    let mouseX = 0.5, mouseY = 0.5;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initNodes();
    };

    const handleMouse = (e: MouseEvent) => {
      mouseX = e.clientX / W;
      mouseY = e.clientY / H;
    };

    // ── Network nodes ──
    const nodes: Node[] = [];
    const initNodes = () => {
      nodes.length = 0;
      const count = 14 + Math.floor(W / 120);
      for (let i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * W,
          y: Math.random() * H,
          color: ['#fbbf24', '#00e5ff', '#a855f7', '#fbbf24', '#00e5ff'][i % 5],
          pulse: 0,
          pulseSpeed: 1.5 + Math.random() * 2.5,
          pulseOffset: Math.random() * Math.PI * 2,
        });
      }
    };

    // ── Lightning generation ──
    function generateBolt(x1: number, y1: number, x2: number, y2: number, color: string, glow: string, width: number, branchChance: number): Bolt {
      const points: { x: number; y: number }[] = [{ x: x1, y: y1 }];
      const segments = 12 + Math.floor(Math.random() * 10);
      const dx = (x2 - x1) / segments;
      const dy = (y2 - y1) / segments;
      for (let i = 1; i < segments; i++) {
        const jitter = (Math.random() - 0.5) * 60;
        points.push({
          x: x1 + dx * i + jitter,
          y: y1 + dy * i + (Math.random() - 0.5) * 30,
        });
      }
      points.push({ x: x2, y: y2 });
      return { points, life: 0, maxLife: 0.15 + Math.random() * 0.3, color, glow, width, branchChance };
    }

    function spawnLightningBolt() {
      const isViolet = Math.random() > 0.5;
      const color = isViolet ? '#a855f7' : '#00e5ff';
      const glow = isViolet ? 'rgba(168,85,247,' : 'rgba(0,229,255,';
      const side = Math.random();
      let x1: number, y1: number, x2: number, y2: number;
      if (side < 0.5) {
        x1 = Math.random() * W;
        y1 = -10;
        x2 = x1 + (Math.random() - 0.5) * 300;
        y2 = H * (0.4 + Math.random() * 0.5);
      } else {
        x1 = Math.random() < 0.5 ? -10 : W + 10;
        y1 = Math.random() * H * 0.5;
        x2 = W * (0.2 + Math.random() * 0.6);
        y2 = H * (0.3 + Math.random() * 0.6);
      }
      boltsRef.current.push(generateBolt(x1, y1, x2, y2, color, glow, 1 + Math.random() * 2, 0.25));
    }

    // ── Particle spawn ──
    function spawnParticle() {
      const colors = ['#00e5ff', '#a855f7', '#fbbf24', '#00ff88'];
      const c = colors[Math.floor(Math.random() * colors.length)];
      particlesRef.current.push({
        x: W * (0.2 + Math.random() * 0.6),
        y: H * (0.3 + Math.random() * 0.5),
        vx: (Math.random() - 0.5) * 0.5,
        vy: -0.3 - Math.random() * 1.2,
        size: 1.5 + Math.random() * 3,
        color: c,
        alpha: 0,
        life: 0,
        maxLife: 3 + Math.random() * 5,
      });
    }

    // ── Draw functions ──
    function drawCoreGlow(t: number) {
      const cx = W * (0.48 + Math.sin(t * 0.3) * 0.02);
      const cy = H * (0.48 + Math.cos(t * 0.25) * 0.02);
      const pulse = 0.5 + Math.sin(t * 1.2) * 0.3;
      const r = Math.min(W, H) * 0.22 * (1 + pulse * 0.15);

      // Outer glow
      const grad1 = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 2);
      grad1.addColorStop(0, `rgba(251,191,36,${0.08 * pulse})`);
      grad1.addColorStop(0.3, `rgba(0,229,255,${0.04 * pulse})`);
      grad1.addColorStop(1, 'transparent');
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, W, H);

      // Inner hot core
      const grad2 = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 0.5);
      grad2.addColorStop(0, `rgba(255,255,255,${0.12 * pulse})`);
      grad2.addColorStop(0.4, `rgba(251,191,36,${0.15 * pulse})`);
      grad2.addColorStop(1, 'transparent');
      ctx.fillStyle = grad2;
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    }

    function drawHoloGrid(t: number) {
      ctx.save();
      const cx = W / 2;
      const cy = H * 0.55;
      const gridW = W * 0.7;
      const gridH = H * 0.5;
      const spacing = 50;
      const rotX = 0.45 + Math.sin(t * 0.15) * 0.05;
      const pulse = 0.4 + Math.sin(t * 0.8) * 0.2;

      ctx.globalAlpha = 0.06 * pulse * 3;
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 0.8;

      // Horizontal lines with perspective
      for (let i = -8; i <= 8; i++) {
        const z = i * spacing;
        const scale = 1 / (1 + z * 0.002);
        const yOff = z * Math.sin(rotX) * 0.8;
        ctx.beginPath();
        for (let x = -gridW / 2; x <= gridW / 2; x += 10) {
          const px = cx + x * scale;
          const py = cy + yOff * scale + (x * x) * 0.00005;
          if (x === -gridW / 2) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }

      // Vertical lines
      for (let i = -12; i <= 12; i++) {
        const x = i * spacing;
        const scale = 1 / (1 + Math.abs(x) * 0.001);
        ctx.beginPath();
        for (let z = -gridH / 2; z <= gridH / 2; z += 10) {
          const xScale = 1 / (1 + z * 0.002);
          const px = cx + x * xScale;
          const py = cy + z * Math.sin(rotX) * xScale + (x * x) * 0.00004;
          if (z === -gridH / 2) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }

      ctx.restore();
    }

    function drawRadarSweep(t: number) {
      const cx = W / 2;
      const cy = H * 0.5;
      const maxR = Math.min(W, H) * 0.32;

      ctx.save();

      // Concentric rings
      for (let i = 1; i <= 4; i++) {
        const r = (maxR / 4) * i;
        const a = 0.06 + Math.sin(t * 0.5 + i) * 0.02;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(251,191,36,${a})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      // Sweep
      const angle = t * 1.0;
      const sweepGrad = ctx.createConicGradient(angle, cx, cy);
      sweepGrad.addColorStop(0, 'rgba(251,191,36,0.18)');
      sweepGrad.addColorStop(0.06, 'rgba(0,229,255,0.12)');
      sweepGrad.addColorStop(0.12, 'transparent');
      sweepGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = sweepGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, maxR, 0, Math.PI * 2);
      ctx.fill();

      // Cross hairs
      ctx.globalAlpha = 0.04;
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(cx - maxR, cy);
      ctx.lineTo(cx + maxR, cy);
      ctx.moveTo(cx, cy - maxR);
      ctx.lineTo(cx, cy + maxR);
      ctx.stroke();

      // Blips on the ring (threats)
      const blipCount = 6;
      for (let i = 0; i < blipCount; i++) {
        const bAngle = t * 0.3 + (i / blipCount) * Math.PI * 2;
        const bR = maxR * (0.4 + (i % 3) * 0.2);
        const bx = cx + Math.cos(bAngle) * bR;
        const by = cy + Math.sin(bAngle) * bR;
        const bPulse = 0.3 + Math.sin(t * 3 + i * 2) * 0.3;
        ctx.beginPath();
        ctx.arc(bx, by, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,0,64,${bPulse})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(bx, by, 6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,0,64,${bPulse * 0.2})`;
        ctx.fill();
      }

      ctx.restore();
    }

    function drawBolts(dt: number) {
      const bolts = boltsRef.current;
      for (let i = bolts.length - 1; i >= 0; i--) {
        const b = bolts[i];
        b.life += dt;
        if (b.life > b.maxLife) {
          bolts.splice(i, 1);
          continue;
        }
        const progress = b.life / b.maxLife;
        let alpha: number;
        if (progress < 0.05) alpha = progress / 0.05;
        else if (progress < 0.15) alpha = 0.3 + Math.random() * 0.7;
        else if (progress < 0.25) alpha = 0.2 + Math.random() * 0.5;
        else alpha = Math.max(0, 1 - (progress - 0.25) / 0.75);

        // Glow pass
        ctx.save();
        ctx.globalAlpha = alpha * 0.4;
        ctx.shadowColor = b.color;
        ctx.shadowBlur = 30;
        ctx.strokeStyle = b.color;
        ctx.lineWidth = b.width * 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(b.points[0].x, b.points[0].y);
        for (let j = 1; j < b.points.length; j++) {
          ctx.lineTo(b.points[j].x, b.points[j].y);
        }
        ctx.stroke();
        ctx.restore();

        // Core bright pass
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 8;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = b.width * 0.8;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(b.points[0].x, b.points[0].y);
        for (let j = 1; j < b.points.length; j++) {
          ctx.lineTo(b.points[j].x, b.points[j].y);
        }
        ctx.stroke();
        ctx.restore();

        // Branch lightning
        if (Math.random() < b.branchChance && b.points.length > 4) {
          const idx = 2 + Math.floor(Math.random() * (b.points.length - 4));
          const p = b.points[idx];
          const angle = Math.atan2(b.points[idx + 1].y - b.points[idx - 1].y, b.points[idx + 1].x - b.points[idx - 1].x) + (Math.random() - 0.5) * 1.5;
          const len = 30 + Math.random() * 80;
          const ex = p.x + Math.cos(angle) * len;
          const ey = p.y + Math.sin(angle) * len;
          const branch: { x: number; y: number }[] = [{ x: p.x, y: p.y }];
          const segs = 3 + Math.floor(Math.random() * 3);
          for (let s = 1; s <= segs; s++) {
            branch.push({
              x: p.x + (ex - p.x) * (s / segs) + (Math.random() - 0.5) * 25,
              y: p.y + (ey - p.y) * (s / segs) + (Math.random() - 0.5) * 15,
            });
          }
          ctx.save();
          ctx.globalAlpha = alpha * 0.5;
          ctx.shadowColor = b.color;
          ctx.shadowBlur = 15;
          ctx.strokeStyle = b.color;
          ctx.lineWidth = b.width * 0.5;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(branch[0].x, branch[0].y);
          for (let s = 1; s < branch.length; s++) ctx.lineTo(branch[s].x, branch[s].y);
          ctx.stroke();
          ctx.restore();
        }
      }
    }

    function drawParticles(dt: number) {
      const parts = particlesRef.current;
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.life += dt;
        if (p.life > p.maxLife) {
          parts.splice(i, 1);
          continue;
        }
        const progress = p.life / p.maxLife;
        p.x += p.vx;
        p.y += p.vy;
        p.vx += (Math.random() - 0.5) * 0.05;
        if (progress < 0.1) p.alpha = progress / 0.1;
        else if (progress > 0.7) p.alpha = (1 - progress) / 0.3;
        else p.alpha = 0.6 + Math.sin(p.life * 4) * 0.3;

        ctx.save();
        ctx.globalAlpha = p.alpha * 0.7;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    function drawNodeNetwork(t: number) {
      ctx.save();
      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x;
          const dy = nodes[j].y - nodes[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 250) {
            const a = (1 - dist / 250) * 0.12;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(0,229,255,${a})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      for (const n of nodes) {
        const p = 0.5 + Math.sin(t * n.pulseSpeed + n.pulseOffset) * 0.5;
        ctx.beginPath();
        ctx.arc(n.x, n.y, 2 + p * 2, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.globalAlpha = 0.3 + p * 0.7;
        ctx.shadowColor = n.color;
        ctx.shadowBlur = 8 + p * 10;
        ctx.fill();
      }
      ctx.restore();
    }

    function drawScanBeam(t: number) {
      const period = 8;
      const phase = (t % period) / period;
      let beamY: number;
      if (phase < 0.45) beamY = H * 0.08 + (H * 0.84) * (phase / 0.45);
      else if (phase < 0.5) beamY = -100;
      else beamY = H * 0.12 + (H * 0.76) * ((phase - 0.5) / 0.45);

      if (beamY > 0 && beamY < H) {
        const grad = ctx.createLinearGradient(0, 0, W, 0);
        grad.addColorStop(0, 'transparent');
        grad.addColorStop(0.3, 'rgba(0,229,255,0.25)');
        grad.addColorStop(0.5, 'rgba(251,191,36,0.4)');
        grad.addColorStop(0.7, 'rgba(0,229,255,0.25)');
        grad.addColorStop(1, 'transparent');

        ctx.save();
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = grad;
        ctx.fillRect(0, beamY - 1, W, 2);

        // Glow above and below
        ctx.globalAlpha = 0.15;
        ctx.fillRect(0, beamY - 50, W, 50);
        ctx.globalAlpha = 0.15;
        ctx.fillRect(0, beamY + 2, W, 50);
        ctx.restore();
      }
    }

    function drawFirewallShimmer(t: number) {
      const pos = (Math.sin(t * 0.4) * 0.5 + 0.5);
      const cx = W * pos;
      const grad = ctx.createLinearGradient(cx - 200, 0, cx + 200, 0);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(0.35, 'rgba(251,191,36,0.03)');
      grad.addColorStop(0.5, 'rgba(251,191,36,0.08)');
      grad.addColorStop(0.65, 'rgba(251,191,36,0.03)');
      grad.addColorStop(1, 'transparent');
      ctx.save();
      ctx.fillStyle = grad;
      ctx.fillRect(0, H * 0.1, W, H * 0.8);
      ctx.restore();
    }

    function drawHUDCorners(t: number) {
      const a = 0.25 + Math.sin(t * 0.8) * 0.15;
      const len = 50;
      const pad = 30;
      ctx.save();
      ctx.strokeStyle = `rgba(0,229,255,${a})`;
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'square';

      // Top-left
      ctx.beginPath();
      ctx.moveTo(pad, pad + len); ctx.lineTo(pad, pad); ctx.lineTo(pad + len, pad);
      ctx.stroke();
      // Top-right
      ctx.beginPath();
      ctx.moveTo(W - pad - len, pad); ctx.lineTo(W - pad, pad); ctx.lineTo(W - pad, pad + len);
      ctx.stroke();
      // Bottom-left
      ctx.beginPath();
      ctx.moveTo(pad, H - pad - len); ctx.lineTo(pad, H - pad); ctx.lineTo(pad + len, H - pad);
      ctx.stroke();
      // Bottom-right
      ctx.beginPath();
      ctx.moveTo(W - pad - len, H - pad); ctx.lineTo(W - pad, H - pad); ctx.lineTo(W - pad, H - pad - len);
      ctx.stroke();

      // Center reticle
      const cx = W / 2, cy = H / 2;
      ctx.globalAlpha = a * 0.4;
      ctx.strokeStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(cx, cy, 60 + Math.sin(t) * 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, 120 + Math.cos(t * 0.7) * 8, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();
    }

    // ── Ambient background ──
    function drawBackground(t: number) {
      // Deep dark base
      ctx.fillStyle = '#050810';
      ctx.fillRect(0, 0, W, H);

      // Subtle moving nebula blobs
      const blobs = [
        { x: W * 0.3, y: H * 0.4, r: 300, color: 'rgba(168,85,247,0.04)', speed: 0.2 },
        { x: W * 0.7, y: H * 0.6, r: 250, color: 'rgba(0,229,255,0.03)', speed: 0.15 },
        { x: W * 0.5, y: H * 0.3, r: 350, color: 'rgba(251,191,36,0.025)', speed: 0.25 },
      ];
      for (const b of blobs) {
        const bx = b.x + Math.sin(t * b.speed) * 40;
        const by = b.y + Math.cos(t * b.speed * 0.7) * 30;
        const grad = ctx.createRadialGradient(bx, by, 0, bx, by, b.r);
        grad.addColorStop(0, b.color);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
      }
    }

    // ── Vignette ──
    function drawVignette() {
      const grad = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.25, W / 2, H / 2, Math.max(W, H) * 0.75);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(1, 'rgba(0,0,0,0.7)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Side darkening for text readability
      const sideGrad = ctx.createLinearGradient(0, 0, W, 0);
      sideGrad.addColorStop(0, 'rgba(5,8,16,0.75)');
      sideGrad.addColorStop(0.2, 'rgba(5,8,16,0.25)');
      sideGrad.addColorStop(0.5, 'rgba(5,8,16,0.05)');
      sideGrad.addColorStop(0.8, 'rgba(5,8,16,0.25)');
      sideGrad.addColorStop(1, 'rgba(5,8,16,0.75)');
      ctx.fillStyle = sideGrad;
      ctx.fillRect(0, 0, W, H);
    }

    // ── Main loop ──
    let lastTime = performance.now();
    let boltTimer = 0;
    let particleTimer = 0;

    const frame = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      timeRef.current += dt;
      const t = timeRef.current;

      // Spawn lightning
      boltTimer += dt;
      if (boltTimer > 0.8 + Math.random() * 1.5) {
        boltTimer = 0;
        const count = 1 + Math.floor(Math.random() * 3);
        for (let i = 0; i < count; i++) spawnLightningBolt();
      }

      // Spawn particles
      particleTimer += dt;
      if (particleTimer > 0.15 && particlesRef.current.length < 50) {
        particleTimer = 0;
        spawnParticle();
      }

      // ── Draw all layers ──
      drawBackground(t);
      drawHoloGrid(t);
      drawRadarSweep(t);
      drawCoreGlow(t);
      drawNodeNetwork(t);
      drawBolts(dt);
      drawParticles(dt);
      drawScanBeam(t);
      drawFirewallShimmer(t);
      drawVignette();
      drawHUDCorners(t);

      animRef.current = requestAnimationFrame(frame);
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouse);
    animRef.current = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouse);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ zIndex: 0 }}
    />
  );
}
