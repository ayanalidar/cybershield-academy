'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Brain, Terminal, Trophy, Gamepad2, BarChart3,
  Cpu, Activity, Layers, Search, Target, Mail, MapPin,
  Github, Twitter, Linkedin, Youtube, ChevronDown, X,
  Send, Globe, Zap, Sparkles, Lock, Eye, Users, BookOpen,
  Menu, ArrowRight, Check, Star, Mic,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

/* ═══════════════════════════════════════════════════════════════════════
   PARTICLES COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */

function Particles() {
  const particles = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 10}s`,
        duration: `${10 + Math.random() * 15}s`,
        size: `${1 + Math.random() * 2.5}px`,
        color: [
          'rgba(0,240,255,0.5)',
          'rgba(191,0,255,0.35)',
          'rgba(57,255,20,0.35)',
          'rgba(255,0,110,0.25)',
        ][i % 4],
      })),
    [],
  );

  return (
    <div className="holo-bg">
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle particle-glow"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            background: p.color,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   TYPING EFFECT HOOK
   ═══════════════════════════════════════════════════════════════════════ */

function useTypingEffect(phrases: string[], typingSpeed = 80, deletingSpeed = 40, pauseTime = 2000) {
  const [displayText, setDisplayText] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentPhrase = phrases[phraseIndex];
    let timeout: NodeJS.Timeout;

    if (!isDeleting && displayText === currentPhrase) {
      timeout = setTimeout(() => setIsDeleting(true), pauseTime);
    } else if (isDeleting && displayText === '') {
      timeout = setTimeout(() => {
        setIsDeleting(false);
        setPhraseIndex((prev) => (prev + 1) % phrases.length);
      }, 0);
    } else {
      timeout = setTimeout(
        () => {
          setDisplayText(
            isDeleting
              ? currentPhrase.substring(0, displayText.length - 1)
              : currentPhrase.substring(0, displayText.length + 1),
          );
        },
        isDeleting ? deletingSpeed : typingSpeed,
      );
    }

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, phraseIndex, phrases, typingSpeed, deletingSpeed, pauseTime]);

  return displayText;
}

/* ═══════════════════════════════════════════════════════════════════════
   COUNTER ANIMATION HOOK
   ═══════════════════════════════════════════════════════════════════════ */

function useCountUp(end: number, duration = 2000, startOnView = true) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(!startOnView);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!startOnView) return;
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [startOnView]);

  useEffect(() => {
    if (!started) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, end, duration]);

  return { count, ref };
}

/* ═══════════════════════════════════════════════════════════════════════
   SECTION ANIMATION VARIANTS
   ═══════════════════════════════════════════════════════════════════════ */

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

/* ═══════════════════════════════════════════════════════════════════════
   NAVBAR
   ═══════════════════════════════════════════════════════════════════════ */

function Navbar({ onLoginOpen }: { onLoginOpen: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Technology', href: '#tech' },
    { label: 'Mission', href: '#mission' },
    { label: 'Partners', href: '#partners' },
    { label: 'Contact', href: '#contact' },
  ];

  const scrollTo = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass-panel shadow-lg shadow-black/20' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="holo-shield flex h-9 w-9 items-center justify-center rounded-full">
            <Shield className="h-5 w-5 text-[var(--color-holo)]" />
          </div>
          <span className="text-gradient-holo text-lg font-bold">CyberShield</span>
        </div>

        {/* Desktop links */}
        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => scrollTo(link.href)}
              className="text-sm text-[var(--muted,#64748b)] transition-colors hover:text-[var(--color-holo)]"
            >
              {link.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={onLoginOpen}
            className="holo-btn holo-btn-primary text-xs sm:text-sm"
          >
            Enter Academy
          </Button>
          <button
            className="md:hidden text-[#e2e8f0]"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-panel overflow-hidden md:hidden"
          >
            <div className="flex flex-col gap-3 px-6 py-4">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => scrollTo(link.href)}
                  className="text-left text-sm text-[#e2e8f0] transition-colors hover:text-[var(--color-holo)]"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   HERO SECTION
   ═══════════════════════════════════════════════════════════════════════ */

function HeroSection({ onLoginOpen }: { onLoginOpen: () => void }) {
  const typed = useTypingEffect(
    ['AI-Powered Learning', 'Real-World Labs', 'Adaptive Training', 'Always-On Professor'],
  );
  const stat1 = useCountUp(10000, 2500);
  const stat2 = useCountUp(500, 2000);
  const stat3 = useCountUp(200, 2000);
  const stat4 = useCountUp(98, 2200);

  const stats = [
    { ref: stat1.ref, value: stat1.count, suffix: '+', label: 'Students' },
    { ref: stat2.ref, value: stat2.count, suffix: '+', label: 'Labs' },
    { ref: stat3.ref, value: stat3.count, suffix: '+', label: 'CTF Challenges' },
    { ref: stat4.ref, value: stat4.count, suffix: '%', label: 'Satisfaction' },
  ];

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 pt-20">
      {/* Orbital rings */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div
          className="absolute h-[340px] w-[340px] rounded-full border border-[var(--color-holo)]/10"
          style={{ animation: 'spin 20s linear infinite' }}
        />
        <div
          className="absolute h-[440px] w-[440px] rounded-full border border-[var(--color-neon-purple)]/10"
          style={{ animation: 'spin 30s linear infinite reverse' }}
        />
        <div
          className="absolute h-[560px] w-[560px] rounded-full border border-[var(--color-neon-green)]/8"
          style={{ animation: 'spin 40s linear infinite' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-10 mb-6"
      >
        <div className="holo-shield mx-auto flex h-24 w-24 items-center justify-center rounded-full sm:h-28 sm:w-28">
          <Shield className="h-12 w-12 text-[var(--color-holo)] sm:h-14 sm:w-14" />
        </div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.7 }}
        className="text-gradient-holo mb-4 text-center text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
      >
        CyberShield Academy
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="neon-text mb-3 text-center text-lg font-medium sm:text-xl md:text-2xl"
      >
        The Future of Cybersecurity Education
      </motion.p>

      {/* Typing effect */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="mb-8 flex h-8 items-center"
      >
        <span className="text-base text-[var(--color-neon-green)] sm:text-lg">
          {typed}
          <span className="animate-pulse text-[var(--color-holo)]">|</span>
        </span>
      </motion.div>

      {/* CTA buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.6 }}
        className="mb-14 flex flex-col items-center gap-4 sm:flex-row"
      >
        <Button
          onClick={onLoginOpen}
          className="holo-btn holo-btn-primary holo-btn-lg flex items-center gap-2"
        >
          Enter Academy <ArrowRight className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => document.querySelector('#features')?.scrollIntoView({ behavior: 'smooth' })}
          className="holo-btn flex items-center gap-2"
        >
          Explore <ChevronDown className="h-4 w-4 animate-bounce" />
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid w-full max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6"
      >
        {stats.map((s) => (
          <motion.div
            key={s.label}
            ref={s.ref}
            variants={fadeInUp}
            className="stat-card-3d rounded-xl p-4 text-center"
          >
            <div className="text-gradient-holo text-2xl font-bold sm:text-3xl">
              {s.value.toLocaleString()}
              {s.suffix}
            </div>
            <div className="mt-1 text-xs text-[#64748b] sm:text-sm">{s.label}</div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   FEATURES SECTION
   ═══════════════════════════════════════════════════════════════════════ */

const features = [
  {
    icon: Brain,
    title: 'AI-Adaptive Labs',
    description: 'Labs that evolve with your skill level in real-time, adjusting difficulty and content as you progress.',
    color: 'var(--color-holo)',
    badge: 'Core',
  },
  {
    icon: Mic,
    title: 'Always-Listening Professor',
    description: 'Voice-activated AI mentor available 24/7 to answer questions, explain concepts, and guide your learning.',
    color: 'var(--color-neon-purple)',
    badge: 'AI',
  },
  {
    icon: Trophy,
    title: 'Real-World CTF Arena',
    description: '200+ capture-the-flag challenges across 6 categories, from beginner to expert difficulty.',
    color: 'var(--color-neon-orange)',
    badge: 'Challenge',
  },
  {
    icon: Gamepad2,
    title: 'Gamified Learning Path',
    description: '15-rank progression system with XP, badges, streaks, and leaderboards to keep you motivated.',
    color: 'var(--color-neon-green)',
    badge: 'Gamification',
  },
  {
    icon: Terminal,
    title: 'Hands-On Terminal Labs',
    description: 'Real Linux terminal environment — not simulations. Practice on actual systems with real tools.',
    color: 'var(--color-neon-pink)',
    badge: 'Hands-On',
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'AI-driven study recommendations and skill gap analysis to optimize your learning trajectory.',
    color: 'var(--color-holo)',
    badge: 'Analytics',
  },
];

function FeaturesSection() {
  return (
    <section id="features" className="relative px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
          className="mb-16 text-center"
        >
          <motion.h2
            variants={fadeInUp}
            className="text-gradient-holo mb-3 text-3xl font-bold sm:text-4xl"
          >
            What Makes Us Different
          </motion.h2>
          <motion.div variants={fadeInUp} className="glow-separator mx-auto mb-4" />
          <motion.p variants={fadeInUp} className="text-[#64748b] max-w-2xl mx-auto">
            Six pillars that redefine cybersecurity education through technology, personalization, and real-world practice.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={staggerContainer}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={fadeInUp}
              className="holo-card holo-card-3d group relative overflow-hidden rounded-2xl p-6 transition-all duration-300"
            >
              {/* Shimmer overlay */}
              <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background: 'linear-gradient(105deg, transparent 40%, rgba(0,240,255,0.06) 45%, rgba(191,0,255,0.04) 50%, transparent 54%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 2s infinite linear',
                }}
              />
              <div className="relative z-10">
                <div className="mb-4 flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{ background: `${f.color}15`, border: `1px solid ${f.color}30` }}
                  >
                    <f.icon className="h-5 w-5" style={{ color: f.color }} />
                  </div>
                  <span
                    className="holo-badge rounded-full px-2.5 py-0.5 text-xs font-medium"
                    style={{ background: `${f.color}15`, color: f.color, borderColor: `${f.color}30` }}
                  >
                    {f.badge}
                  </span>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-[#e2e8f0]">{f.title}</h3>
                <p className="text-sm leading-relaxed text-[#64748b]">{f.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   TECH SHOWCASE SECTION
   ═══════════════════════════════════════════════════════════════════════ */

const techItems = [
  {
    icon: Brain,
    title: 'AI & LLM',
    description: 'Large language models power adaptive learning, code review, and intelligent tutoring systems.',
    color: 'var(--color-holo)',
  },
  {
    icon: Activity,
    title: 'Real-Time Telemetry',
    description: 'Live metrics on every lab session, tracking progress, errors, and skill development in real-time.',
    color: 'var(--color-neon-green)',
  },
  {
    icon: Layers,
    title: 'Holographic UI',
    description: 'Next-generation interface with 3D depth, glassmorphism, and spatial design principles.',
    color: 'var(--color-neon-purple)',
  },
  {
    icon: Search,
    title: 'RAG Engine',
    description: 'Retrieval-Augmented Generation delivers contextually relevant answers from our knowledge base.',
    color: 'var(--color-neon-pink)',
  },
];

function TechShowcaseSection() {
  return (
    <section id="tech" className="relative px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
          className="mb-16 text-center"
        >
          <motion.h2
            variants={fadeInUp}
            className="text-gradient-holo mb-3 text-3xl font-bold sm:text-4xl"
          >
            Powered by Cutting-Edge Technology
          </motion.h2>
          <motion.div variants={fadeInUp} className="glow-separator mx-auto" />
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={staggerContainer}
          className="perspective-container grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {techItems.map((t) => (
            <motion.div
              key={t.title}
              variants={fadeInUp}
              className="group relative overflow-hidden rounded-2xl p-6 transition-all duration-500"
              style={{
                background: 'rgba(10, 14, 26, 0.7)',
                border: `1px solid ${t.color}20`,
                backdropFilter: 'blur(12px)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = `${t.color}50`;
                (e.currentTarget as HTMLElement).style.boxShadow = `0 0 30px ${t.color}15, inset 0 0 30px ${t.color}05`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = `${t.color}20`;
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              }}
            >
              {/* Animated border glow */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background: `linear-gradient(135deg, ${t.color}10, transparent, ${t.color}05)`,
                }}
              />
              <div className="relative z-10">
                <t.icon className="mb-4 h-8 w-8" style={{ color: t.color }} />
                <h3 className="mb-2 text-lg font-semibold text-[#e2e8f0]">{t.title}</h3>
                <p className="text-sm leading-relaxed text-[#64748b]">{t.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   3D GLOBE SECTION (CSS-only)
   ═══════════════════════════════════════════════════════════════════════ */

function GlobeSection() {
  const dots = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        id: i,
        top: `${15 + Math.random() * 70}%`,
        left: `${15 + Math.random() * 70}%`,
        delay: `${Math.random() * 3}s`,
        size: `${3 + Math.random() * 4}px`,
      })),
    [],
  );

  return (
    <section className="relative px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
          className="flex flex-col items-center gap-10 lg:flex-row lg:gap-16"
        >
          {/* Globe */}
          <motion.div variants={fadeInUp} className="relative flex shrink-0 items-center justify-center">
            <div
              className="relative h-72 w-72 rounded-full sm:h-80 sm:w-80 lg:h-96 lg:w-96"
              style={{
                background: 'radial-gradient(circle at 35% 35%, rgba(0,240,255,0.15), rgba(10,14,26,0.9) 70%)',
                border: '1px solid rgba(0,240,255,0.2)',
                boxShadow: '0 0 60px rgba(0,240,255,0.08), inset 0 0 60px rgba(0,240,255,0.05)',
              }}
            >
              {/* Rotating highlight */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'conic-gradient(from 0deg, transparent, rgba(0,240,255,0.1) 20%, transparent 40%, rgba(191,0,255,0.08) 60%, transparent 80%)',
                  animation: 'spin 8s linear infinite',
                }}
              />
              {/* Grid lines */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `repeating-conic-gradient(from 0deg, transparent 0deg 11.25deg, rgba(0,240,255,0.04) 11.25deg 11.5deg)`,
                }}
              />
              {/* Horizontal rings */}
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute left-0 right-0"
                  style={{
                    top: `${20 + i * 15}%`,
                    height: '1px',
                    background: 'linear-gradient(90deg, transparent 5%, rgba(0,240,255,0.12) 30%, rgba(0,240,255,0.12) 70%, transparent 95%)',
                    transform: 'rotateX(0deg)',
                  }}
                />
              ))}
              {/* Animated dots (cyber attacks) */}
              {dots.map((d) => (
                <div
                  key={d.id}
                  className="absolute rounded-full"
                  style={{
                    top: d.top,
                    left: d.left,
                    width: d.size,
                    height: d.size,
                    background: ['var(--color-neon-pink)', 'var(--color-neon-orange)', 'var(--color-neon-green)', 'var(--color-holo)'][d.id % 4],
                    animation: `pulse 2s ease-in-out ${d.delay} infinite`,
                    boxShadow: `0 0 8px currentColor`,
                  }}
                />
              ))}
            </div>
            {/* Orbit ring */}
            <div
              className="absolute h-[110%] w-[110%] rounded-full border border-dashed"
              style={{ borderColor: 'rgba(0,240,255,0.08)', animation: 'spin 30s linear infinite reverse' }}
            />
          </motion.div>

          {/* Text */}
          <motion.div variants={staggerContainer} className="text-center lg:text-left">
            <motion.h2
              variants={fadeInUp}
              className="text-gradient-holo mb-4 text-3xl font-bold sm:text-4xl lg:text-5xl"
            >
              Join 10,000+ Defenders Worldwide
            </motion.h2>
            <motion.p variants={fadeInUp} className="mb-6 max-w-lg text-[#64748b] text-base sm:text-lg">
              Our global network of cybersecurity professionals grows every day. Real-time attacks visualized on the globe represent the ever-evolving threat landscape we prepare you for.
            </motion.p>
            <motion.div variants={fadeInUp} className="flex flex-wrap justify-center gap-3 lg:justify-start">
              <span className="holo-badge holo-badge-cyan">Real-Time Threats</span>
              <span className="holo-badge holo-badge-purple">Global Network</span>
              <span className="holo-badge holo-badge-green">24/7 Active</span>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   MISSION & VISION SECTION
   ═══════════════════════════════════════════════════════════════════════ */

function MissionVisionSection() {
  return (
    <section id="mission" className="relative px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
          className="mb-16 text-center"
        >
          <motion.h2
            variants={fadeInUp}
            className="text-gradient-holo mb-3 text-3xl font-bold sm:text-4xl"
          >
            Mission & Vision
          </motion.h2>
          <motion.div variants={fadeInUp} className="glow-separator mx-auto" />
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
          className="grid gap-8 md:grid-cols-2"
        >
          {/* Mission */}
          <motion.div
            variants={fadeInUp}
            className="holo-card group relative overflow-hidden rounded-2xl p-8"
          >
            <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-20 transition-opacity group-hover:opacity-30"
              style={{ background: 'radial-gradient(circle, var(--color-holo), transparent)' }}
            />
            <div className="relative z-10">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: 'rgba(0,240,255,0.1)', border: '1px solid rgba(0,240,255,0.2)' }}>
                <Target className="h-6 w-6 text-[var(--color-holo)]" />
              </div>
              <h3 className="neon-text mb-4 text-xl font-bold">Our Mission</h3>
              <p className="leading-relaxed text-[#94a3b8]">
                To democratize cybersecurity education through AI-powered, adaptive learning experiences that produce industry-ready professionals.
              </p>
            </div>
          </motion.div>

          {/* Vision */}
          <motion.div
            variants={fadeInUp}
            className="holo-card group relative overflow-hidden rounded-2xl p-8"
          >
            <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-20 transition-opacity group-hover:opacity-30"
              style={{ background: 'radial-gradient(circle, var(--color-neon-purple), transparent)' }}
            />
            <div className="relative z-10">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: 'rgba(191,0,255,0.1)', border: '1px solid rgba(191,0,255,0.2)' }}>
                <Eye className="h-6 w-6 text-[var(--color-neon-purple)]" />
              </div>
              <h3 className="neon-text-purple mb-4 text-xl font-bold">Our Vision</h3>
              <p className="leading-relaxed text-[#94a3b8]">
                A world where every organization has access to skilled cybersecurity professionals, and every individual can protect themselves in the digital age.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   PARTNERS SECTION
   ═══════════════════════════════════════════════════════════════════════ */

const partners = [
  'CloudSecure', 'NetDefend', 'CipherTech', 'ThreatZero',
  'DataVault', 'CyberOps', 'ShieldCorp', 'HackLabs',
];

function PartnersSection() {
  return (
    <section id="partners" className="relative px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
          className="mb-16 text-center"
        >
          <motion.h2
            variants={fadeInUp}
            className="text-gradient-holo mb-3 text-3xl font-bold sm:text-4xl"
          >
            Trusted By Industry Leaders
          </motion.h2>
          <motion.div variants={fadeInUp} className="glow-separator mx-auto" />
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={staggerContainer}
          className="grid grid-cols-2 gap-4 sm:grid-cols-4"
        >
          {partners.map((name) => (
            <motion.div
              key={name}
              variants={fadeInUp}
              className="holo-card flex items-center justify-center rounded-xl p-6 transition-all duration-300 hover:border-[rgba(0,240,255,0.2)]"
            >
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-[#64748b]" />
                <span className="text-sm font-medium text-[#94a3b8]">{name}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   CONTACT SECTION
   ═══════════════════════════════════════════════════════════════════════ */

function ContactSection() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: 'General', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setFormData({ name: '', email: '', subject: 'General', message: '' });
  }, []);

  const contactInfo = [
    { icon: Mail, label: 'Email', value: 'hello@cybershield.academy' },
    { icon: MapPin, label: 'Location', value: 'San Francisco, CA' },
    { icon: Globe, label: 'Platform', value: 'Available Worldwide' },
  ];

  const socials = [
    { icon: Github, label: 'GitHub' },
    { icon: Twitter, label: 'Twitter' },
    { icon: Linkedin, label: 'LinkedIn' },
    { icon: Youtube, label: 'YouTube' },
  ];

  return (
    <section id="contact" className="relative px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
          className="mb-16 text-center"
        >
          <motion.h2
            variants={fadeInUp}
            className="text-gradient-holo mb-3 text-3xl font-bold sm:text-4xl"
          >
            Contact Us
          </motion.h2>
          <motion.div variants={fadeInUp} className="glow-separator mx-auto" />
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={staggerContainer}
          className="grid gap-10 lg:grid-cols-5"
        >
          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            variants={staggerContainer}
            className="holo-card space-y-5 rounded-2xl p-6 sm:p-8 lg:col-span-3"
          >
            <motion.div variants={fadeInUp}>
              <label className="mb-1.5 block text-sm font-medium text-[#94a3b8]">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="holo-input w-full rounded-lg px-4 py-2.5 text-sm text-[#e2e8f0] placeholder:text-[#475569]"
                placeholder="Your name"
                required
              />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <label className="mb-1.5 block text-sm font-medium text-[#94a3b8]">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="holo-input w-full rounded-lg px-4 py-2.5 text-sm text-[#e2e8f0] placeholder:text-[#475569]"
                placeholder="you@example.com"
                required
              />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <label className="mb-1.5 block text-sm font-medium text-[#94a3b8]">Subject</label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="holo-input w-full rounded-lg px-4 py-2.5 text-sm text-[#e2e8f0] appearance-none"
                style={{ background: 'rgba(10,14,26,0.8)' }}
              >
                <option value="General">General Inquiry</option>
                <option value="Partnership">Partnership</option>
                <option value="Support">Technical Support</option>
                <option value="Bug Report">Bug Report</option>
              </select>
            </motion.div>
            <motion.div variants={fadeInUp}>
              <label className="mb-1.5 block text-sm font-medium text-[#94a3b8]">Message</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="holo-input w-full rounded-lg px-4 py-2.5 text-sm text-[#e2e8f0] placeholder:text-[#475569] min-h-[120px] resize-none"
                placeholder="Tell us how we can help..."
                required
              />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <Button type="submit" className="holo-btn holo-btn-primary w-full flex items-center justify-center gap-2">
                {submitted ? (
                  <>
                    <Check className="h-4 w-4" /> Message Sent!
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" /> Send Message
                  </>
                )}
              </Button>
            </motion.div>
          </motion.form>

          {/* Contact info */}
          <motion.div
            variants={staggerContainer}
            className="space-y-6 lg:col-span-2"
          >
            <motion.div variants={fadeInUp} className="holo-card rounded-2xl p-6">
              <h3 className="neon-text mb-6 text-lg font-bold">Get In Touch</h3>
              <div className="space-y-5">
                {contactInfo.map((info) => (
                  <div key={info.label} className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" style={{ background: 'rgba(0,240,255,0.1)' }}>
                      <info.icon className="h-5 w-5 text-[var(--color-holo)]" />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-[#64748b]">{info.label}</div>
                      <div className="text-sm text-[#e2e8f0]">{info.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="holo-card rounded-2xl p-6">
              <h3 className="neon-text mb-4 text-lg font-bold">Follow Us</h3>
              <div className="flex gap-3">
                {socials.map((s) => (
                  <button
                    key={s.label}
                    className="flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-300 hover:scale-110"
                    style={{ background: 'rgba(0,240,255,0.08)', border: '1px solid rgba(0,240,255,0.15)' }}
                    aria-label={s.label}
                  >
                    <s.icon className="h-4 w-4 text-[var(--color-holo)]" />
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   FOOTER
   ═══════════════════════════════════════════════════════════════════════ */

function Footer() {
  const links = [
    { label: 'Academy', href: '/academy' },
    { label: 'Courses', href: '#' },
    { label: 'CTF Arena', href: '#' },
    { label: 'Professor', href: '#' },
    { label: 'Contact', href: '#contact' },
    { label: 'Privacy', href: '#' },
    { label: 'Terms', href: '#' },
  ];

  const socials = [
    { icon: Github, label: 'GitHub' },
    { icon: Twitter, label: 'Twitter' },
    { icon: Linkedin, label: 'LinkedIn' },
    { icon: Youtube, label: 'YouTube' },
  ];

  return (
    <footer className="border-t border-white/5 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="mb-4 flex items-center gap-2">
              <div className="holo-shield flex h-8 w-8 items-center justify-center rounded-full">
                <Shield className="h-4 w-4 text-[var(--color-holo)]" />
              </div>
              <span className="text-gradient-holo text-base font-bold">CyberShield Academy</span>
            </div>
            <p className="text-sm text-[#64748b] leading-relaxed">
              The future of cybersecurity education. AI-powered, hands-on, and always evolving.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-[#e2e8f0]">Quick Links</h4>
            <ul className="space-y-2">
              {links.slice(0, 4).map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-[#64748b] transition-colors hover:text-[var(--color-holo)]">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-[#e2e8f0]">Legal</h4>
            <ul className="space-y-2">
              {links.slice(4).map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-[#64748b] transition-colors hover:text-[var(--color-holo)]">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-[#e2e8f0]">Connect</h4>
            <div className="flex gap-3">
              {socials.map((s) => (
                <button
                  key={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-300 hover:scale-110"
                  style={{ background: 'rgba(0,240,255,0.08)', border: '1px solid rgba(0,240,255,0.12)' }}
                  aria-label={s.label}
                >
                  <s.icon className="h-4 w-4 text-[#64748b] hover:text-[var(--color-holo)]" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="glow-separator my-8" />

        <p className="text-center text-xs text-[#475569]">
          © 2026 CyberShield Academy. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   LOGIN MODAL
   ═══════════════════════════════════════════════════════════════════════ */

function LoginModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setLoading(true);

      try {
        const endpoint = isLogin ? '/api/auth/callback/credentials' : '/api/auth/signup';
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(
            isLogin
              ? { email, password }
              : { name, email, password },
          ),
        });

        if (res.ok) {
          window.location.href = '/academy';
        } else {
          const data = await res.json().catch(() => ({}));
          setError(data.error || 'Authentication failed. Please try again.');
        }
      } catch {
        // For demo purposes, allow any login to proceed
        window.location.href = '/academy';
      } finally {
        setLoading(false);
      }
    },
    [isLogin, email, password, name],
  );

  const handleDemoLogin = useCallback(() => {
    setLoading(true);
    // Simulate demo login
    setTimeout(() => {
      window.location.href = '/academy';
    }, 500);
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="holo-card relative z-10 w-full max-w-md rounded-2xl p-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-[#64748b] transition-colors hover:text-[#e2e8f0]"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Logo */}
            <div className="mb-6 flex flex-col items-center">
              <div className="holo-shield mb-3 flex h-14 w-14 items-center justify-center rounded-full">
                <Shield className="h-7 w-7 text-[var(--color-holo)]" />
              </div>
              <h2 className="text-gradient-holo text-xl font-bold">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="mt-1 text-sm text-[#64748b]">
                {isLogin ? 'Sign in to continue to the Academy' : 'Start your cybersecurity journey'}
              </p>
            </div>

            {/* Tab toggle */}
            <div className="mb-6 flex rounded-lg p-1" style={{ background: 'rgba(10,14,26,0.8)' }}>
              <button
                onClick={() => { setIsLogin(true); setError(''); }}
                className={`holo-tab flex-1 rounded-md py-2 text-sm font-medium transition-all ${
                  isLogin ? 'holo-tab-active' : 'text-[#64748b]'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setIsLogin(false); setError(''); }}
                className={`holo-tab flex-1 rounded-md py-2 text-sm font-medium transition-all ${
                  !isLogin ? 'holo-tab-active' : 'text-[#64748b]'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    key="name"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <label className="mb-1.5 block text-sm font-medium text-[#94a3b8]">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="holo-input w-full rounded-lg px-4 py-2.5 text-sm text-[#e2e8f0] placeholder:text-[#475569]"
                      placeholder="John Doe"
                      required={!isLogin}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#94a3b8]">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="holo-input w-full rounded-lg px-4 py-2.5 text-sm text-[#e2e8f0] placeholder:text-[#475569]"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#94a3b8]">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="holo-input w-full rounded-lg px-4 py-2.5 text-sm text-[#e2e8f0] placeholder:text-[#475569]"
                  placeholder="••••••••"
                  required
                />
              </div>

              {error && (
                <p className="text-sm text-[var(--color-neon-pink)]">{error}</p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="holo-btn holo-btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-transparent border-t-[var(--color-holo)]" />
                ) : isLogin ? (
                  'Sign In'
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="glow-separator my-5" />

            {/* Demo credentials */}
            <div className="text-center">
              <p className="mb-3 text-xs text-[#64748b]">Or try the demo</p>
              <Button
                onClick={handleDemoLogin}
                variant="outline"
                className="holo-btn w-full flex items-center justify-center gap-2 text-sm"
                style={{ borderColor: 'rgba(0,240,255,0.2)', color: 'var(--color-holo)' }}
              >
                <Zap className="h-4 w-4" /> Quick Demo Access
              </Button>
              <p className="mt-3 text-xs text-[#475569]">
                Demo: <span className="text-[#64748b]">demo@cybershield.academy</span> / <span className="text-[#64748b]">demo1234</span>
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════════ */

export default function LandingPage() {
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <main className="relative min-h-screen overflow-x-hidden" style={{ background: '#050810', color: '#e2e8f0' }}>
      <Particles />
      <div className="scan-line pointer-events-none fixed inset-0 z-40" />

      <Navbar onLoginOpen={() => setLoginOpen(true)} />
      <HeroSection onLoginOpen={() => setLoginOpen(true)} />
      <FeaturesSection />
      <TechShowcaseSection />
      <GlobeSection />
      <MissionVisionSection />
      <PartnersSection />
      <ContactSection />
      <Footer />

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </main>
  );
}