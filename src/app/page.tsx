'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  Shield, Brain, Terminal, Trophy, BarChart3, BookOpen,
  ArrowRight, Star, Zap, Users, Lock, Eye,
  ChevronDown, Sparkles, Target, GraduationCap, Globe, Cpu, Flame,
  Code2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';

/* ═══════════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════════ */

const FEATURES = [
  {
    icon: Brain,
    title: 'AI Professor Shield',
    desc: 'Voice-powered AI mentor with multiple personalities. Adapts to your level, answers questions, and guides you through complex concepts in real time.',
    gradient: 'from-[#00ff88] to-[#00cc6a]',
    glowColor: 'rgba(0, 255, 136, 0.3)',
    borderColor: 'border-[#00ff88]/20',
    tagColor: 'text-[#00ff88]',
  },
  {
    icon: Terminal,
    title: 'Hands-On Lab Terminal',
    desc: 'Sandboxed Linux environments with 50+ simulated commands. Network recon, SQL injection, privilege escalation — all from your browser.',
    gradient: 'from-[#00e5ff] to-[#0091ff]',
    glowColor: 'rgba(0, 229, 255, 0.3)',
    borderColor: 'border-[#00e5ff]/20',
    tagColor: 'text-[#00e5ff]',
  },
  {
    icon: Trophy,
    title: 'CTF Arena',
    desc: 'Compete in Capture The Flag challenges across crypto, web, forensics, reverse engineering, and pwn. Global leaderboard.',
    gradient: 'from-[#ff0040] to-[#ff6b00]',
    glowColor: 'rgba(255, 0, 64, 0.3)',
    borderColor: 'border-[#ff0040]/20',
    tagColor: 'text-[#ff0040]',
  },
  {
    icon: BarChart3,
    title: 'Deep Analytics',
    desc: 'Track focus scores, learning velocity, strength maps, skill radar, and compare against the community in real-time dashboards.',
    gradient: 'from-[#a855f7] to-[#6366f1]',
    glowColor: 'rgba(168, 85, 247, 0.3)',
    borderColor: 'border-[#a855f7]/20',
    tagColor: 'text-[#a855f7]',
  },
  {
    icon: Shield,
    title: 'Real-World Curriculum',
    desc: 'Built by veterans from CrowdStrike, Mandiant, and Microsoft. Network security, web app, cryptography, pen testing, cloud.',
    gradient: 'from-[#fbbf24] to-[#f59e0b]',
    glowColor: 'rgba(251, 191, 36, 0.3)',
    borderColor: 'border-[#fbbf24]/20',
    tagColor: 'text-[#fbbf24]',
  },
  {
    icon: Target,
    title: 'Adaptive Learning',
    desc: 'AI tracks your progress, identifies weak areas, and dynamically personalizes your learning path. Never waste time on what you already know.',
    gradient: 'from-[#ff0040] to-[#a855f7]',
    glowColor: 'rgba(255, 0, 64, 0.2)',
    borderColor: 'border-[#ff0040]/20',
    tagColor: 'text-[#c084fc]',
  },
];

const STATS = [
  { value: '50+', label: 'Hands-On Labs', color: 'from-[#00ff88] to-[#00e5ff]' },
  { value: '200+', label: 'CTF Challenges', color: 'from-[#ff0040] to-[#ff6b00]' },
  { value: '15K+', label: 'Active Learners', color: 'from-[#a855f7] to-[#6366f1]' },
  { value: '94%', label: 'Completion Rate', color: 'from-[#fbbf24] to-[#f59e0b]' },
];

const TESTIMONIALS = [
  {
    name: 'Sarah Kim',
    role: 'Security Analyst at CrowdStrike',
    text: "CyberShield's AI Professor helped me bridge the gap between theory and practice. The labs are incredibly realistic — I felt like I was in a real SOC environment.",
    avatar: 'SK',
    rating: 5,
    color: '#00ff88',
  },
  {
    name: 'Marcus Johnson',
    role: 'Pen Tester, Independent',
    text: 'The CTF arena and adaptive learning paths are game-changers. Went from script kiddie to OSCP in 8 months. The AI lab agent is insane.',
    avatar: 'MJ',
    rating: 5,
    color: '#00e5ff',
  },
  {
    name: 'Priya Mehta',
    role: 'SOC Lead at Mandiant',
    text: "I recommend CyberShield to every junior analyst on my team. The incident response modules and real-time analytics are world-class.",
    avatar: 'PM',
    rating: 5,
    color: '#ff0040',
  },
];

const COURSES_PREVIEW = [
  { title: 'Network Security Fundamentals', level: 'Beginner', modules: 6, icon: Lock, color: '#00ff88', gradient: 'from-[#00ff88] to-[#00cc6a]' },
  { title: 'Web Application Security', level: 'Intermediate', modules: 8, icon: Globe, color: '#00e5ff', gradient: 'from-[#00e5ff] to-[#0091ff]' },
  { title: 'Cryptography & PKI', level: 'Intermediate', modules: 7, icon: Eye, color: '#a855f7', gradient: 'from-[#a855f7] to-[#6366f1]' },
  { title: 'Penetration Testing', level: 'Advanced', modules: 10, icon: Cpu, color: '#ff0040', gradient: 'from-[#ff0040] to-[#ff6b00]' },
];

const TERMINAL_LINES = [
  { text: '$ nmap -sV -sC 10.0.0.50', color: 'text-[#00ff88]', delay: 0 },
  { text: 'PORT    STATE  SERVICE  VERSION', color: 'text-[#00e5ff]', delay: 400 },
  { text: '22/tcp  open   ssh      OpenSSH 8.9', color: 'text-foreground/70', delay: 700 },
  { text: '80/tcp  open   http     nginx 1.24.0', color: 'text-foreground/70', delay: 900 },
  { text: '443/tcp open   ssl      nginx 1.24.0', color: 'text-foreground/70', delay: 1100 },
  { text: '3306/tcp open  mysql    MySQL 8.0.35', color: 'text-[#ff0040]/80', delay: 1300 },
  { text: '', color: '', delay: 1600 },
  { text: '$ sqlmap -u "http://target/login" --dbs', color: 'text-[#fbbf24]', delay: 1800 },
  { text: '[*] starting @ 10:00:23 /2026-07-23/', color: 'text-[#fbbf24]/60', delay: 2100 },
  { text: '[+] found 3 databases', color: 'text-[#00ff88]', delay: 2500 },
  { text: '[+] SQL injection vulnerability confirmed', color: 'text-[#ff0040]', delay: 2800 },
];

const MATRIX_CHARS = '\u30A0\u30A1\u30A2\u30A3\u30A4\u30A5\u30A6\u30A7\u30A8\u30A9\u30AA\u30AB\u30AC\u30AD\u30AE\u30AF\u30B0\u30B1\u30B2\u30B3\u30B4\u30B5\u30B6\u30B7\u30B8\u30B9\u30BA\u30BB\u30BC\u30BD\u30BE\u30BF\u30C0\u30C10123456789ABCDEFabcdef<>{}[]|/\\$#@!%^&*';

/* ═══════════════════════════════════════════════════════════════
   MATRIX RAIN BACKGROUND
   ═══════════════════════════════════════════════════════════════ */

function MatrixRain() {
  const columns = useMemo(() => {
    const cols = [];
    const count = typeof window !== 'undefined' ? Math.floor(window.innerWidth / 28) : 35;
    for (let i = 0; i < count; i++) {
      const chars = [];
      const len = 15 + Math.floor(Math.random() * 25);
      for (let j = 0; j < len; j++) {
        chars.push(MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)]);
      }
      cols.push({
        left: `${(i / count) * 100}%`,
        chars: chars.join(''),
        duration: 8 + Math.random() * 15,
        delay: Math.random() * -20,
        opacity: 0.04 + Math.random() * 0.12,
        fontSize: 10 + Math.floor(Math.random() * 8),
      });
    }
    return cols;
  }, []);

  return (
    <div className="matrix-rain">
      {columns.map((col, i) => (
        <div
          key={i}
          className="matrix-column"
          style={{
            left: col.left,
            animationDuration: `${col.duration}s`,
            animationDelay: `${col.delay}s`,
            opacity: col.opacity,
            fontSize: `${col.fontSize}px`,
          }}
        >
          {col.chars}
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ANIMATED TERMINAL
   ═══════════════════════════════════════════════════════════════ */

function AnimatedTerminal() {
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    TERMINAL_LINES.forEach((line, i) => {
      timers.push(
        setTimeout(() => {
          setVisibleLines(i + 1);
        }, line.delay + 1500)
      );
    });
    // Loop: reset after all lines shown
    const totalDelay = TERMINAL_LINES[TERMINAL_LINES.length - 1].delay + 4000;
    const loopTimer = setInterval(() => {
      setVisibleLines(0);
      setTimeout(() => {
        TERMINAL_LINES.forEach((line, i) => {
          timers.push(
            setTimeout(() => setVisibleLines(i + 1), line.delay)
          );
        });
      }, 300);
    }, totalDelay);
    return () => {
      timers.forEach(clearTimeout);
      clearInterval(loopTimer);
    };
  }, []);

  return (
    <div className="rounded-xl overflow-hidden neon-border bg-[#0a0e17]/90 dark:bg-[#060a12]/95 backdrop-blur-md">
      {/* Terminal title bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#00ff88]/10 bg-[#00ff88]/5">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#ff0040]/80" />
          <div className="w-3 h-3 rounded-full bg-[#fbbf24]/80" />
          <div className="w-3 h-3 rounded-full bg-[#00ff88]/80" />
        </div>
        <span className="text-xs text-[#00ff88]/60 font-mono ml-2">student@cybershield-lab:~</span>
      </div>
      {/* Terminal body */}
      <div className="p-4 font-mono text-xs leading-relaxed min-h-[200px]">
        {TERMINAL_LINES.slice(0, visibleLines).map((line, i) => (
          <motion.div
            key={`${i}-${visibleLines}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.15 }}
            className={`${line.color} whitespace-pre`}
          >
            {line.text || '\u00A0'}
          </motion.div>
        ))}
        {visibleLines > 0 && (
          <span className="terminal-cursor" />
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HEADER
   ═══════════════════════════════════════════════════════════════ */

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Courses', href: '#courses' },
    { label: 'Testimonials', href: '#testimonials' },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'glass-strong shadow-lg shadow-black/10 dark:shadow-black/30 border-b border-[#00ff88]/10'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <Shield className="h-7 w-7 text-[#00ff88] transition-transform group-hover:scale-110 drop-shadow-[0_0_8px_rgba(0,255,136,0.5)]" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Cyber<span className="v-text-mint">Shield</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-3.5 py-2 text-sm font-medium text-muted-foreground hover:text-[#00ff88] rounded-lg hover:bg-[#00ff88]/5 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild className="hidden sm:flex cyber-btn rounded-lg h-9 px-5 text-xs">
              <Link href="/academy">
                Launch Academy
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-[#00ff88]/5 transition-colors"
              aria-label="Toggle menu"
            >
              <div className="w-5 h-4 flex flex-col justify-between">
                <span className={`block h-0.5 w-full bg-[#00ff88] rounded transition-transform ${mobileOpen ? 'rotate-45 translate-y-1.75' : ''}`} />
                <span className={`block h-0.5 w-full bg-[#00ff88] rounded transition-opacity ${mobileOpen ? 'opacity-0' : ''}`} />
                <span className={`block h-0.5 w-full bg-[#00ff88] rounded transition-transform ${mobileOpen ? '-rotate-45 -translate-y-1.75' : ''}`} />
              </div>
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden border-t border-[#00ff88]/10"
          >
            <div className="px-4 py-3 flex flex-col gap-1 bg-background/95 backdrop-blur-xl">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-[#00ff88] rounded-lg hover:bg-[#00ff88]/5 transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <Button asChild className="mt-2 w-full cyber-btn rounded-lg text-xs">
                <Link href="/academy">Launch Academy</Link>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HERO
   ═══════════════════════════════════════════════════════════════ */

function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 scanline-overlay">
      <MatrixRain />

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full pointer-events-none z-0" style={{ background: 'radial-gradient(ellipse at center, rgba(0,255,136,0.08) 0%, rgba(0,229,255,0.04) 30%, transparent 70%)' }} />

      <motion.div style={{ y, opacity }} className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left: Text */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full neon-border bg-[#00ff88]/5 text-sm font-medium text-[#00ff88] mb-6"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff88] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00ff88]" />
              </span>
              AI-Powered Cybersecurity Training
            </motion.div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] mb-6">
              <span className="glitch-text" data-text="Master">
                Master
              </span>
              {' '}
              <span className="v-text-cyber">Cyber</span>
              <br />
              <span className="glitch-text" data-text="Security">
                Security
              </span>
              {' '}Like{' '}
              <span className="neon-text">Never Before</span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
              Interactive labs, adaptive AI learning paths, CTF challenges, and a voice-powered
              professor that teaches like a real mentor — not a chatbot. Step into the future of cybersecurity training.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Button asChild size="lg" className="h-13 px-10 text-sm font-bold cyber-btn rounded-xl">
                <Link href="/academy">
                  <GraduationCap className="mr-2 h-5 w-5" />
                  Enter the Academy
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-13 px-8 text-sm rounded-xl border-[#00e5ff]/30 text-[#00e5ff] hover:bg-[#00e5ff]/5 hover:text-[#00e5ff] hover:border-[#00e5ff]/50 transition-all">
                <a href="#features">
                  Explore Features
                  <ChevronDown className="ml-1.5 h-4 w-4" />
                </a>
              </Button>
            </div>
          </motion.div>

          {/* Right: Terminal */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="hidden lg:block"
          >
            <div className="relative">
              {/* Orbiting dots around terminal */}
              <div className="orbit-container" style={{ top: '50%', left: '50%', marginTop: '-120px', marginLeft: '-120px' }}>
                <div className="orbit-dot orbit-dot-1" />
                <div className="orbit-dot orbit-dot-2" />
                <div className="orbit-dot orbit-dot-3" />
              </div>
              <AnimatedTerminal />
            </div>
          </motion.div>
        </div>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="mt-16 lg:mt-20 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className="holo-card rounded-xl p-5 text-center hud-corners"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className={`text-2xl sm:text-3xl font-black bg-gradient-to-r ${s.color} bg-clip-text text-transparent`}>
                {s.value}
              </div>
              <div className="text-xs text-muted-foreground mt-1 font-medium tracking-wide uppercase">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none z-10" />
      {/* Data stream bar at very bottom of hero */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] data-stream-bar" />
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FEATURES
   ═══════════════════════════════════════════════════════════════ */

function Features() {
  return (
    <section id="features" className="relative py-24 sm:py-32">
      {/* Section divider glow line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-[#00ff88]/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#00e5ff]/20 bg-[#00e5ff]/5 text-xs font-semibold text-[#00e5ff] uppercase tracking-widest mb-4">
            <Code2 className="h-3.5 w-3.5" />
            Capabilities
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-4">
            Everything You Need to{' '}
            <span className="v-text-mint">Level Up</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            A complete cybersecurity learning ecosystem — from fundamentals to advanced exploitation. Built for the next generation.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className={`group holo-card rounded-xl p-6 hud-corners cursor-default ${f.borderColor}`}
              >
                <div className={`relative z-10`}>
                  <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${f.gradient} mb-4 shadow-lg`} style={{ boxShadow: `0 0 20px ${f.glowColor}` }}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className={`text-lg font-bold mb-2 ${f.tagColor}`}>{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   COURSES PREVIEW
   ═══════════════════════════════════════════════════════════════ */

function CoursesPreview() {
  return (
    <section id="courses" className="relative py-24 sm:py-32">
      {/* Divider */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-[#a855f7]/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#a855f7]/20 bg-[#a855f7]/5 text-xs font-semibold text-[#a855f7] uppercase tracking-widest mb-4">
              <BookOpen className="h-3.5 w-3.5" />
              Curriculum
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-3">
              Industry-Grade{' '}
              <span className="v-text-fire">Courses</span>
            </h2>
            <p className="text-muted-foreground max-w-lg">
              Curated by professionals from CrowdStrike, Mandiant, and Microsoft Security.
            </p>
          </div>
          <Button asChild variant="outline" className="border-[#a855f7]/30 text-[#a855f7] hover:bg-[#a855f7]/5 hover:text-[#a855f7] hover:border-[#a855f7]/50 transition-all rounded-lg">
            <Link href="/academy">
              View All Courses
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {COURSES_PREVIEW.map((c, i) => {
            const Icon = c.icon;
            return (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`group holo-card rounded-xl p-5 cursor-pointer border ${c.color}/15`}
              >
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-2.5 rounded-lg bg-gradient-to-br ${c.gradient}`} style={{ boxShadow: `0 0 15px ${c.color}40` }}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      c.level === 'Beginner'
                        ? 'bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/20'
                        : c.level === 'Intermediate'
                          ? 'bg-[#fbbf24]/10 text-[#fbbf24] border border-[#fbbf24]/20'
                          : 'bg-[#ff0040]/10 text-[#ff0040] border border-[#ff0040]/20'
                    }`}>
                      {c.level}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm mb-1.5">{c.title}</h3>
                  <p className="text-xs text-muted-foreground">{c.modules} modules</p>
                  {/* Progress bar decoration */}
                  <div className="mt-4 h-1 rounded-full bg-muted-bg/50 overflow-hidden">
                    <div className={`h-full rounded-full bg-gradient-to-r ${c.gradient} transition-all duration-700 group-hover:w-full w-0`} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TESTIMONIALS
   ═══════════════════════════════════════════════════════════════ */

function Testimonials() {
  return (
    <section id="testimonials" className="relative py-24 sm:py-32">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-[#ff0040]/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#fbbf24]/20 bg-[#fbbf24]/5 text-xs font-semibold text-[#fbbf24] uppercase tracking-widest mb-4">
            <Star className="h-3.5 w-3.5" />
            Testimonials
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-4">
            Trusted by{' '}
            <span className="v-text-fire">Professionals</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Hear from cybersecurity professionals who leveled up their careers with CyberShield.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="holo-card rounded-xl p-6 hud-corners"
            >
              <div className="relative z-10">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-[#fbbf24] text-[#fbbf24]" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                    style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}99)`, boxShadow: `0 0 15px ${t.color}40` }}
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-bold">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CTA
   ═══════════════════════════════════════════════════════════════ */

function CTA() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-[#00e5ff]/40 to-transparent" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          className="relative p-12 sm:p-16 rounded-2xl neon-border bg-[#00ff88]/[0.02] dark:bg-[#00ff88]/[0.03] overflow-hidden"
        >
          {/* Background grid */}
          <div className="absolute inset-0 cyber-grid pointer-events-none" />
          <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-[#00ff88]/5 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-[#00e5ff]/5 blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff0040]/10 border border-[#ff0040]/20 text-[#ff0040] text-xs font-bold uppercase tracking-widest mb-6">
              <Flame className="h-3.5 w-3.5" />
              Start your journey today
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-4">
              Ready to Become a{' '}
              <span className="neon-text">Cyber Expert</span>?
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto mb-8">
              Join thousands of learners mastering cybersecurity through hands-on practice and AI-powered guidance.
            </p>
            <Button asChild size="lg" className="h-13 px-12 text-sm font-bold cyber-btn rounded-xl">
              <Link href="/academy">
                <Zap className="mr-2 h-5 w-5" />
                Enter the Academy
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FOOTER
   ═══════════════════════════════════════════════════════════════ */

function Footer() {
  return (
    <footer className="border-t border-[#00ff88]/10 bg-surface/30">
      {/* Top data stream bar */}
      <div className="h-[2px] data-stream-bar" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-6 w-6 text-[#00ff88] drop-shadow-[0_0_6px_rgba(0,255,136,0.4)]" />
              <span className="font-bold">
                Cyber<span className="v-text-mint">Shield</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AI-powered cybersecurity training platform built for the next generation of security professionals.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-3 text-sm text-[#00e5ff] uppercase tracking-wider text-xs">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/academy" className="hover:text-[#00ff88] transition-colors">Academy</Link></li>
              <li><a href="#features" className="hover:text-[#00ff88] transition-colors">Features</a></li>
              <li><a href="#courses" className="hover:text-[#00ff88] transition-colors">Courses</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-3 text-sm text-[#a855f7] uppercase tracking-wider text-xs">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><span className="hover:text-[#00ff88] transition-colors cursor-default">Documentation</span></li>
              <li><span className="hover:text-[#00ff88] transition-colors cursor-default">Blog</span></li>
              <li><span className="hover:text-[#00ff88] transition-colors cursor-default">Community</span></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-3 text-sm text-[#fbbf24] uppercase tracking-wider text-xs">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><span className="hover:text-[#00ff88] transition-colors cursor-default">About</span></li>
              <li><span className="hover:text-[#00ff88] transition-colors cursor-default">Careers</span></li>
              <li><span className="hover:text-[#00ff88] transition-colors cursor-default">Contact</span></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-[#00ff88]/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <span className="font-mono text-xs">&copy; 2026 CyberShield Academy. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Users className="h-4 w-4 text-[#00ff88]/50" />
            <span className="font-mono text-xs">15K+ learners worldwide</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════ */

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <Features />
        <CoursesPreview />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
