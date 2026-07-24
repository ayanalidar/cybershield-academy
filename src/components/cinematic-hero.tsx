'use client';

import { useMemo } from 'react';

/* ═══════════════════════════════════════════════════════════════
   CINEMATIC QUANTUM SUPERCOMPUTER HERO BACKGROUND
   Multi-layered animated scene: lightning, radar, holographic grid,
   energy particles, volumetric rays, scan beam, firewall shimmer
   ═══════════════════════════════════════════════════════════════ */

// Lightning bolt SVG paths (jagged electric streaks)
const LIGHTNING_PATHS = [
  'M0,0 L12,-18 L6,-20 L22,-50 L14,-52 L30,-85 L18,-88 L38,-120 L24,-125 L42,-160 L28,-168 L48,-200',
  'M0,0 L-8,-22 L-2,-24 L-18,-55 L-10,-58 L-28,-90 L-16,-95 L-35,-128 L-20,-135 L-40,-170 L-25,-178 L-42,-210',
  'M0,0 L15,-12 L10,-15 L25,-40 L18,-42 L35,-70 L26,-74 L45,-105 L34,-110 L52,-145 L40,-150 L55,-180',
  'M0,0 L-10,-15 L-5,-18 L-20,-45 L-12,-48 L-30,-80 L-22,-85 L-42,-115 L-30,-120 L-48,-155 L-35,-162',
  'M0,0 L8,-20 L14,-22 L5,-48 L12,-50 L2,-78 L10,-82 L-5,-112 L5,-116 L-12,-148 L-2,-155 L-18,-190',
];

// Network nodes with connections
const NETWORK_NODES = [
  { x: 20, y: 30, color: '#fbbf24', speed: 2.5, delay: 0 },
  { x: 75, y: 25, color: '#00e5ff', speed: 3.2, delay: 0.5 },
  { x: 45, y: 60, color: '#fbbf24', speed: 2.8, delay: 1.0 },
  { x: 85, y: 55, color: '#a855f7', speed: 3.5, delay: 0.3 },
  { x: 15, y: 70, color: '#00e5ff', speed: 2.2, delay: 1.5 },
  { x: 60, y: 80, color: '#fbbf24', speed: 3.0, delay: 0.8 },
  { x: 35, y: 15, color: '#a855f7', speed: 2.6, delay: 1.2 },
  { x: 90, y: 40, color: '#00e5ff', speed: 3.3, delay: 0.2 },
  { x: 55, y: 45, color: '#fbbf24', speed: 2.4, delay: 0.7 },
  { x: 70, y: 70, color: '#a855f7', speed: 2.9, delay: 1.8 },
  { x: 25, y: 50, color: '#00e5ff', speed: 3.1, delay: 0.4 },
  { x: 80, y: 15, color: '#fbbf24', speed: 2.7, delay: 1.1 },
];

const NETWORK_LINES = [
  { x1: 20, y1: 30, x2: 45, y2: 60, color: '#fbbf24', speed: 4, delay: 0 },
  { x1: 75, y1: 25, x2: 90, y2: 40, color: '#00e5ff', speed: 3.5, delay: 0.5 },
  { x1: 45, y1: 60, x2: 70, y2: 70, color: '#fbbf24', speed: 4.5, delay: 1.0 },
  { x1: 85, y1: 55, x2: 70, y2: 70, color: '#a855f7', speed: 3.8, delay: 0.3 },
  { x1: 15, y1: 70, x2: 25, y2: 50, color: '#00e5ff', speed: 4.2, delay: 1.5 },
  { x1: 60, y1: 80, x2: 45, y2: 60, color: '#fbbf24', speed: 3.6, delay: 0.8 },
  { x1: 35, y1: 15, x2: 20, y2: 30, color: '#a855f7', speed: 4.0, delay: 1.2 },
  { x1: 55, y1: 45, x2: 45, y2: 60, color: '#fbbf24', speed: 3.4, delay: 0.7 },
  { x1: 55, y1: 45, x2: 75, y2: 25, color: '#00e5ff', speed: 4.3, delay: 0.2 },
  { x1: 25, y1: 50, x2: 35, y2: 15, color: '#00e5ff', speed: 3.9, delay: 1.1 },
  { x1: 80, y1: 15, x2: 75, y2: 25, color: '#fbbf24', speed: 3.2, delay: 0.4 },
  { x1: 60, y1: 80, x2: 85, y2: 55, color: '#a855f7', speed: 4.1, delay: 0.9 },
];

// Energy particles
const PARTICLES = Array.from({ length: 40 }, (_, i) => ({
  left: `${Math.random() * 100}%`,
  bottom: `${Math.random() * 20}%`,
  color: ['#00e5ff', '#a855f7', '#fbbf24', '#00ff88'][i % 4],
  size: 2 + Math.random() * 4,
  speed: 6 + Math.random() * 10,
  delay: Math.random() * 8,
  drift: -40 + Math.random() * 80,
}));

export function CinematicHero() {
  const lightningStreaks = useMemo(() => [
    { path: LIGHTNING_PATHS[0], x: '18%', y: '10%', rotation: -15, color: '#00e5ff', anim: 'streak-flash-1', w: 55, h: 200 },
    { path: LIGHTNING_PATHS[1], x: '72%', y: '5%', rotation: 20, color: '#a855f7', anim: 'streak-flash-2', w: 50, h: 210 },
    { path: LIGHTNING_PATHS[2], x: '40%', y: '8%', rotation: -8, color: '#00e5ff', anim: 'streak-flash-3', w: 60, h: 180 },
    { path: LIGHTNING_PATHS[3], x: '82%', y: '15%', rotation: 12, color: '#a855f7', anim: 'streak-flash-4', w: 52, h: 165 },
    { path: LIGHTNING_PATHS[4], x: '30%', y: '12%', rotation: -20, color: '#7c3aed', anim: 'streak-flash-5', w: 58, h: 195 },
    // Additional diagonal streaks across conduits
    { path: LIGHTNING_PATHS[0], x: '55%', y: '3%', rotation: -25, color: '#00e5ff', anim: 'streak-flash-4', w: 45, h: 170 },
    { path: LIGHTNING_PATHS[1], x: '8%', y: '20%', rotation: 30, color: '#a855f7', anim: 'streak-flash-1', w: 48, h: 185 },
    { path: LIGHTNING_PATHS[2], x: '65%', y: '18%', rotation: -10, color: '#7c3aed', anim: 'streak-flash-2', w: 55, h: 175 },
    { path: LIGHTNING_PATHS[3], x: '25%', y: '5%', rotation: 15, color: '#00e5ff', anim: 'streak-flash-5', w: 42, h: 160 },
    { path: LIGHTNING_PATHS[4], x: '88%', y: '8%', rotation: -18, color: '#a855f7', anim: 'streak-flash-3', w: 50, h: 190 },
  ], []);

  return (
    <div className="cinematic-hero">
      {/* Layer 0: Drifting cinematic background image */}
      <div className="cinematic-bg">
        <img
          src="/hero-bg.png"
          alt=""
          className="w-full h-full object-cover"
          style={{ minHeight: '100vh' }}
        />
      </div>

      {/* Layer 0.5: Deep vignette + dark gradient for text readability */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background:
            'radial-gradient(ellipse 80% 70% at 50% 50%, transparent 20%, rgba(0,0,0,0.5) 70%, rgba(0,0,0,0.85) 100%)',
        }}
      />
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background:
            'linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.15) 35%, rgba(0,0,0,0.15) 65%, rgba(0,0,0,0.7) 100%)',
        }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-48 z-[1]"
        style={{ background: 'linear-gradient(to top, var(--bg) 0%, transparent 100%)' }}
      />

      {/* Layer 1: Volumetric light rays */}
      <div className="volumetric-rays" />

      {/* Layer 2: Core glow (supercomputer heart) */}
      <div
        className="core-glow"
        style={{
          top: '50%',
          left: '50%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(251,191,36,0.2) 0%, rgba(0,229,255,0.08) 40%, transparent 70%)',
        }}
      />
      <div
        className="core-glow"
        style={{
          top: '48%',
          left: '52%',
          width: '150px',
          height: '150px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(251,191,36,0.1) 30%, transparent 70%)',
          animationDelay: '-2.5s',
        }}
      />

      {/* Layer 2: Animated lightning streaks */}
      {lightningStreaks.map((s, i) => (
        <div
          key={i}
          className="lightning-streak"
          style={{
            left: s.x,
            top: s.y,
            width: s.w,
            height: s.h,
            '--streak-color': s.color,
            animation: `${s.anim} ${6 + (i % 3) * 2}s ease-in-out infinite`,
            animationDelay: `${i * 0.4}s`,
            transform: `rotate(${s.rotation}deg)`,
          } as React.CSSProperties}
        >
          <svg width={s.w} height={s.h} viewBox={`0 0 ${s.w} ${s.h}`} fill="none">
            <path
              d={s.path.replace(/L/g, `L`).replace(/\d+,-\d+/g, (match) => {
                const [x, y] = match.split(',').map(Number);
                return `${x},${y}`;
              })}
              stroke={s.color}
              strokeWidth={1.5 + (i % 2)}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Glow halo around bolt */}
            <path
              d={s.path}
              stroke={s.color}
              strokeWidth={4 + (i % 3) * 2}
              strokeLinecap="round"
              opacity={0.15}
            />
          </svg>
        </div>
      ))}

      {/* Layer 3: Holographic golden grid projection */}
      <div className="holo-grid" />

      {/* Layer 3: Node network connections */}
      <div className="node-network">
        {NETWORK_LINES.map((l, i) => {
          const dx = l.x2 - l.x1;
          const dy = l.y2 - l.y1;
          const length = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx) * (180 / Math.PI);
          return (
            <div
              key={`line-${i}`}
              className="node-line"
              style={{
                left: `${l.x1}%`,
                top: `${l.y1}%`,
                width: `${length}%`,
                background: l.color,
                '--line-speed': `${l.speed}s`,
                '--line-delay': `${l.delay}s`,
                transform: `rotate(${angle}deg)`,
              } as React.CSSProperties}
            />
          );
        })}
        {NETWORK_NODES.map((n, i) => (
          <div
            key={`node-${i}`}
            className="node"
            style={{
              left: `${n.x}%`,
              top: `${n.y}%`,
              color: n.color,
              background: n.color,
              '--node-speed': `${n.speed}s`,
              '--node-delay': `${n.delay}s`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Layer 4: Radar sweep (threat detection) */}
      <div className="radar-sweep" />

      {/* Layer 4: Floating energy particles */}
      {PARTICLES.map((p, i) => (
        <div
          key={`particle-${i}`}
          className="energy-particle"
          style={{
            left: p.left,
            bottom: p.bottom,
            background: p.color,
            boxShadow: `0 0 6px ${p.color}, 0 0 12px ${p.color}40`,
            '--p-size': `${p.size}px`,
            '--p-speed': `${p.speed}s`,
            '--p-delay': `${p.delay}s`,
            '--p-drift': `${p.drift}px`,
          } as React.CSSProperties}
        />
      ))}

      {/* Layer 5: Scan beam */}
      <div className="scan-beam" />

      {/* Layer 3: Firewall shimmer */}
      <div className="firewall-shimmer" />

      {/* Layer 6: HUD frame corners */}
      <div className="hud-frame inset-0">
        <div className="corner corner-tl" />
        <div className="corner corner-tr" />
        <div className="corner corner-bl" />
        <div className="corner corner-br" />
      </div>
    </div>
  );
}
