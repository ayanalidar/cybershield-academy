'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  Shield, Brain, Terminal, Trophy, BarChart3, BookOpen,
  ArrowRight, Check, Star, Zap, Users, Lock, Eye,
  ChevronDown, Sparkles, Target, GraduationCap, Globe, Cpu, Flame,
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
    desc: 'Always-on voice assistant with multiple voice personalities. Ask anything — it listens, teaches, and adapts to your level.',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Terminal,
    title: 'Hands-On Lab Terminal',
    desc: 'Real sandboxed environments for network recon, SQL injection, privilege escalation, and more.',
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: Trophy,
    title: 'CTF Arena',
    desc: 'Compete in Capture The Flag challenges across crypto, web, forensics, reverse engineering, and pwn.',
    color: 'from-rose-500 to-pink-500',
  },
  {
    icon: BarChart3,
    title: 'Deep Analytics',
    desc: 'Track your focus scores, learning velocity, strength maps, and compare against the community.',
    color: 'from-cyan-500 to-blue-500',
  },
  {
    icon: Shield,
    title: 'Real-World Curriculum',
    desc: 'Network security, web app security, cryptography, pen testing, cloud security — built by industry veterans.',
    color: 'from-violet-500 to-purple-500',
  },
  {
    icon: Target,
    title: 'Adaptive Learning',
    desc: 'AI tracks your progress, identifies weak areas, and personalizes your learning path in real time.',
    color: 'from-lime-500 to-green-500',
  },
];

const STATS = [
  { value: '50+', label: 'Hands-On Labs' },
  { value: '200+', label: 'CTF Challenges' },
  { value: '15K+', label: 'Active Learners' },
  { value: '94%', label: 'Completion Rate' },
];

const TESTIMONIALS = [
  {
    name: 'Sarah Kim',
    role: 'Security Analyst at CrowdStrike',
    text: "CyberShield's AI Professor helped me bridge the gap between theory and practice. The labs are incredibly realistic.",
    avatar: 'SK',
    rating: 5,
  },
  {
    name: 'Marcus Johnson',
    role: 'Pen Tester, Independent',
    text: 'The CTF arena and adaptive learning paths are game-changers. Went from script kiddie to OSCP in 8 months.',
    avatar: 'MJ',
    rating: 5,
  },
  {
    name: 'Priya Mehta',
    role: 'SOC Lead at Mandiant',
    text: "I recommend CyberShield to every junior analyst on my team. The incident response modules are world-class.",
    avatar: 'PM',
    rating: 5,
  },
];

const COURSES_PREVIEW = [
  { title: 'Network Security Fundamentals', level: 'Beginner', modules: 6, icon: Lock, color: 'text-emerald-500' },
  { title: 'Web Application Security', level: 'Intermediate', modules: 8, icon: Globe, color: 'text-amber-500' },
  { title: 'Cryptography & PKI', level: 'Intermediate', modules: 7, icon: Eye, color: 'text-violet-500' },
  { title: 'Penetration Testing', level: 'Advanced', modules: 10, icon: Cpu, color: 'text-rose-500' },
];

/* ═══════════════════════════════════════════════════════════════
   ANIMATED BACKGROUND
   ═══════════════════════════════════════════════════════════════ */

function AnimatedGrid() {
  return (
    <div className="absolute inset-0 grid-pattern opacity-30 dark:opacity-50 pointer-events-none" />
  );
}

function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-emerald-500/10 dark:bg-emerald-500/5 blur-3xl animate-float" />
      <div className="absolute top-1/3 -left-20 w-60 h-60 rounded-full bg-cyan-500/10 dark:bg-cyan-500/5 blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-20 right-1/4 w-72 h-72 rounded-full bg-violet-500/8 dark:bg-violet-500/4 blur-3xl animate-float" style={{ animationDelay: '4s' }} />
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
          ? 'glass-strong shadow-lg shadow-black/5 dark:shadow-black/20'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <Shield className="h-7 w-7 text-emerald-500 transition-transform group-hover:scale-110" />
              <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Cyber<span className="text-emerald-500">Shield</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-3.5 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent/10 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild className="hidden sm:flex">
              <Link href="/academy">
                Launch Academy
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-accent/10 transition-colors"
              aria-label="Toggle menu"
            >
              <div className="w-5 h-4 flex flex-col justify-between">
                <span className={`block h-0.5 w-full bg-foreground rounded transition-transform ${mobileOpen ? 'rotate-45 translate-y-1.75' : ''}`} />
                <span className={`block h-0.5 w-full bg-foreground rounded transition-opacity ${mobileOpen ? 'opacity-0' : ''}`} />
                <span className={`block h-0.5 w-full bg-foreground rounded transition-transform ${mobileOpen ? '-rotate-45 -translate-y-1.75' : ''}`} />
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
            className="md:hidden overflow-hidden border-t border-border"
          >
            <div className="px-4 py-3 flex flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent/10 transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <Button asChild className="mt-2 w-full">
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
    <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      <AnimatedGrid />
      <FloatingOrbs />

      <motion.div style={{ y, opacity }} className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="stagger-children"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-surface/50 backdrop-blur-sm text-sm font-medium text-muted-foreground mb-8">
            <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
            AI-Powered Cybersecurity Training
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
            Master{' '}
            <span className="gradient-text">Cybersecurity</span>
            <br />
            With an AI Professor
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Interactive labs, adaptive learning paths, CTF challenges, and a voice-powered AI
            professor that teaches like a real mentor — not a chatbot.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="h-12 px-8 text-base font-semibold animate-pulse-glow">
              <Link href="/academy">
                <GraduationCap className="mr-2 h-5 w-5" />
                Start Learning Free
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base">
              <a href="#features">
                Explore Features
                <ChevronDown className="ml-1.5 h-4 w-4" />
              </a>
            </Button>
          </div>
        </motion.div>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8"
        >
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl sm:text-4xl font-extrabold gradient-text">{s.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FEATURES
   ═══════════════════════════════════════════════════════════════ */

function Features() {
  return (
    <section id="features" className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Everything You Need to{' '}
            <span className="gradient-text">Level Up</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A complete cybersecurity learning ecosystem — from fundamentals to advanced exploitation.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="group relative p-6 rounded-xl border border-border bg-surface card-hover glow-border"
              >
                <div className={`inline-flex p-2.5 rounded-lg bg-gradient-to-br ${f.color} mb-4`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
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
    <section id="courses" className="relative py-24 sm:py-32 bg-muted-bg/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4"
        >
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
              Industry-Grade{' '}
              <span className="gradient-text">Courses</span>
            </h2>
            <p className="text-muted-foreground max-w-lg">
              Curated by professionals from CrowdStrike, Mandiant, and Microsoft Security.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/academy">
              View All Courses
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 stagger-children">
          {COURSES_PREVIEW.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.title}
                className="group p-5 rounded-xl border border-border bg-surface card-hover"
              >
                <div className="flex items-start justify-between mb-4">
                  <Icon className={`h-8 w-8 ${c.color}`} />
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    c.level === 'Beginner'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : c.level === 'Intermediate'
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                  }`}>
                    {c.level}
                  </span>
                </div>
                <h3 className="font-semibold mb-1.5">{c.title}</h3>
                <p className="text-sm text-muted-foreground">{c.modules} modules</p>
              </div>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Trusted by{' '}
            <span className="gradient-text">Professionals</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Hear from cybersecurity professionals who leveled up their careers with CyberShield.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5 stagger-children">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="p-6 rounded-xl border border-border bg-surface card-hover"
            >
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  {t.avatar}
                </div>
                <div>
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </div>
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          className="relative p-12 sm:p-16 rounded-2xl border border-border bg-surface overflow-hidden"
        >
          <div className="absolute inset-0 grid-pattern opacity-20 pointer-events-none" />
          <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-medium mb-6">
              <Flame className="h-3.5 w-3.5" />
              Start your journey today
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Ready to Become a{' '}
              <span className="gradient-text">Cyber Expert</span>?
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto mb-8">
              Join thousands of learners mastering cybersecurity through hands-on practice and AI-powered guidance.
            </p>
            <Button asChild size="lg" className="h-12 px-10 text-base font-semibold">
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
    <footer className="border-t border-border bg-surface/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-6 w-6 text-emerald-500" />
              <span className="font-bold">CyberShield</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AI-powered cybersecurity training platform built for the next generation of security professionals.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/academy" className="hover:text-foreground transition-colors">Academy</Link></li>
              <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
              <li><a href="#courses" className="hover:text-foreground transition-colors">Courses</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><span className="hover:text-foreground transition-colors cursor-default">Documentation</span></li>
              <li><span className="hover:text-foreground transition-colors cursor-default">Blog</span></li>
              <li><span className="hover:text-foreground transition-colors cursor-default">Community</span></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><span className="hover:text-foreground transition-colors cursor-default">About</span></li>
              <li><span className="hover:text-foreground transition-colors cursor-default">Careers</span></li>
              <li><span className="hover:text-foreground transition-colors cursor-default">Contact</span></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <span>&copy; 2026 CyberShield Academy. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Users className="h-4 w-4" />
            <span>15K+ learners worldwide</span>
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
