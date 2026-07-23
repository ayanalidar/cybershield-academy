'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Shield, Brain, Terminal, Trophy, GraduationCap,
  ArrowRight, Users, Target, Globe, Cpu, Zap, Eye, Lock,
  Code2, ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { Scene3D } from '@/components/scene3d';

const TEAM = [
  { name: 'Alex Rivera', role: 'CEO & Co-Founder', bio: 'Former Red Team lead at CrowdStrike. 15+ years in offensive security. Built the initial vision for CyberShield after seeing the gap between academia and real-world cyber ops.', avatar: 'AR', color: '#00ff88' },
  { name: 'Dr. Priya Sharma', role: 'Chief Learning Officer', bio: 'PhD in Information Security from MIT. Previously designed training programs for Mandiant and the NSA. Passionate about making advanced security concepts accessible to everyone.', avatar: 'PS', color: '#00e5ff' },
  { name: 'Marcus Chen', role: 'CTO', bio: 'Ex-Google security engineer and CTF world champion. Architected the lab terminal system and the AI professor engine that powers adaptive learning at CyberShield.', avatar: 'MC', color: '#a855f7' },
  { name: 'Sarah O\'Brien', role: 'Head of Curriculum', bio: 'OSCP, OSCE, and CRTO certified. 10 years as a pen testing consultant. She ensures every module reflects current threat landscapes and real-world attack techniques.', avatar: 'SO', color: '#ff0040' },
  { name: 'James Wu', role: 'VP of Engineering', bio: 'Built scalable platforms at Microsoft Azure Security. Leads the engineering team behind the real-time analytics engine and sandboxed lab infrastructure.', avatar: 'JW', color: '#fbbf24' },
  { name: 'Elena Kowalski', role: 'Community Lead', bio: 'Former DEF CON goon and Bsides organizer. Grew multiple cybersecurity communities from zero to 50K+ members. Champions learner-first design.', avatar: 'EK', color: '#00ff88' },
];

const VALUES = [
  { icon: Target, title: 'Mission-Driven', desc: 'Every feature, every lab, every challenge exists to close the cybersecurity talent gap. We measure success by careers launched, not revenue generated.', color: '#00ff88', gradient: 'from-[#00ff88] to-[#00cc6a]' },
  { icon: Brain, title: 'AI-Augmented, Not AI-Replaced', desc: 'Our AI professor enhances human learning — it doesn\'t replace instructors. We believe the best training combines machine intelligence with human mentorship.', color: '#00e5ff', gradient: 'from-[#00e5ff] to-[#0091ff]' },
  { icon: Shield, title: 'Real-World Focus', desc: 'No toy examples. Our labs simulate actual enterprise environments, real CVEs, and current attack chains. If it matters in the field, it matters in our curriculum.', color: '#ff0040', gradient: 'from-[#ff0040] to-[#ff6b00]' },
  { icon: Users, title: 'Community First', desc: 'Cybersecurity is a team sport. Our platform fosters collaboration through team CTFs, shared write-ups, mentorship matching, and an active Discord community.', color: '#a855f7', gradient: 'from-[#a855f7] to-[#6366f1]' },
];

const MILESTONES = [
  { year: '2023', event: 'CyberShield founded by Alex Rivera and Marcus Chen in a San Francisco garage.', color: '#00ff88' },
  { year: '2023 Q3', event: 'Launched alpha with 12 hands-on labs and the first AI professor prototype.', color: '#00e5ff' },
  { year: '2024 Q1', event: 'Secured seed funding. Expanded to 50+ labs across network security and web app security.', color: '#a855f7' },
  { year: '2024 Q3', event: 'Launched CTF Arena with global leaderboard. Hit 5,000 active learners.', color: '#ff0040' },
  { year: '2025 Q1', event: 'Partnership with CrowdStrike and Mandiant for curriculum validation. Voice-powered AI professor launched.', color: '#fbbf24' },
  { year: '2025 Q4', event: 'Reached 15,000+ learners across 80+ countries. 94% course completion rate.', color: '#00ff88' },
  { year: '2026', event: 'Series A closed. Launching advanced pen testing track, cloud security modules, and enterprise team features.', color: '#00e5ff' },
];

const NAV_LINKS = [
  { label: 'Features', href: '/#features' },
  { label: 'Courses', href: '/#courses' },
  { label: 'About', href: '/about' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Partners', href: '/partners' },
  { label: 'Testimonials', href: '/testimonials' },
];

function PageHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass-strong shadow-lg shadow-black/10 dark:shadow-black/30 border-b border-[#00ff88]/10' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5 group">
            <img src="/logo.png" alt="CyberShield" className="h-8 w-8 object-contain transition-transform group-hover:scale-110" />
            <span className="text-lg font-bold tracking-tight">Cyber<span className="v-text-mint">Shield</span></span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((l) => (
              <Link key={l.label} href={l.href} className="px-3.5 py-2 text-sm font-medium text-muted-foreground hover:text-[#00ff88] rounded-lg hover:bg-[#00ff88]/5 transition-colors">{l.label}</Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild className="hidden sm:flex cyber-btn rounded-lg h-9 px-5 text-xs">
              <Link href="/academy">Launch Academy <ArrowRight className="ml-1.5 h-3.5 w-3.5" /></Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

function PageFooter() {
  return (
    <footer className="border-t border-[#00ff88]/10 bg-surface/30">
      <div className="h-[2px] data-stream-bar" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src="/logo.png" alt="CyberShield" className="h-6 w-6 object-contain" />
              <span className="font-bold">Cyber<span className="v-text-mint">Shield</span></span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">AI-powered cybersecurity training platform built for the next generation of security professionals.</p>
          </div>
          <div>
            <h4 className="font-bold mb-3 text-sm text-[#00e5ff] uppercase tracking-wider text-xs">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/academy" className="hover:text-[#00ff88] transition-colors">Academy</Link></li>
              <li><Link href="/pricing" className="hover:text-[#00ff88] transition-colors">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-3 text-sm text-[#a855f7] uppercase tracking-wider text-xs">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><span className="hover:text-[#00ff88] transition-colors cursor-default">Documentation</span></li>
              <li><span className="hover:text-[#00ff88] transition-colors cursor-default">Blog</span></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-3 text-sm text-[#fbbf24] uppercase tracking-wider text-xs">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-[#00ff88] transition-colors">About</Link></li>
              <li><Link href="/partners" className="hover:text-[#00ff88] transition-colors">Partners</Link></li>
              <li><Link href="/testimonials" className="hover:text-[#00ff88] transition-colors">Testimonials</Link></li>
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

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <PageHeader />
      <main className="flex-1 pt-16">
        {/* Hero */}
        <section className="relative py-24 sm:py-32 overflow-hidden scanline-overlay thunderstorm">
          <Scene3D variant="medium" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none z-0" style={{ background: 'radial-gradient(ellipse at center, rgba(0,229,255,0.08) 0%, rgba(168,85,247,0.04) 30%, transparent 70%)' }} />
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#00e5ff]/20 bg-[#00e5ff]/5 text-xs font-semibold text-[#00e5ff] uppercase tracking-widest mb-6">
              <Globe className="h-3.5 w-3.5" />
              About Us
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-6">
              The Team Behind{' '}<span className="color-shift-text">CyberShield</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              We are a team of security veterans, AI researchers, and educators united by one mission: making world-class cybersecurity training accessible, immersive, and effective for everyone.
            </motion.p>
          </div>
        </section>

        {/* Mission */}
        <section className="relative py-20">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-[#00ff88]/40 to-transparent" />
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-6">Our <span className="v-text-mint">Mission</span></h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  The cybersecurity industry faces a critical talent shortage — 3.5 million unfilled positions globally. Traditional education produces graduates who understand theory but freeze when facing a real intrusion, a live CVE, or an active phishing campaign.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  CyberShield was built to bridge that gap. We created a platform where learners don't just read about attacks — they execute them in sandboxed environments, get real-time AI guidance, and develop the muscle memory that only hands-on practice can build.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Our AI Professor doesn't hand you answers. It asks the right questions, drops hints when you're stuck, and celebrates when you figure it out yourself. That's how real security professionals learn.
                </p>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative">
                <div className="holo-card rounded-2xl p-8 hud-corners">
                  <div className="relative z-10 space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl font-black v-text-mint">3.5M</div>
                      <div className="text-sm text-muted-foreground">Unfilled cybersecurity jobs worldwide (ISC2 2025)</div>
                    </div>
                    <div className="h-px bg-gradient-to-r from-[#00ff88]/20 via-[#00ff88]/40 to-[#00ff88]/20" />
                    <div className="flex items-center gap-4">
                      <div className="text-4xl font-black v-text-cyber">94%</div>
                      <div className="text-sm text-muted-foreground">Course completion rate (industry average: 15%)</div>
                    </div>
                    <div className="h-px bg-gradient-to-r from-[#00e5ff]/20 via-[#00e5ff]/40 to-[#00e5ff]/20" />
                    <div className="flex items-center gap-4">
                      <div className="text-4xl font-black v-text-fire">80+</div>
                      <div className="text-sm text-muted-foreground">Countries with active CyberShield learners</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="relative py-20">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-[#a855f7]/40 to-transparent" />
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">Our <span className="v-text-fire">Values</span></h2>
              <p className="text-muted-foreground max-w-xl mx-auto">The principles that guide every decision we make, from curriculum design to platform engineering.</p>
            </motion.div>
            <div className="grid sm:grid-cols-2 gap-5">
              {VALUES.map((v, i) => {
                const Icon = v.icon;
                return (
                  <motion.div key={v.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="holo-card rounded-xl p-6 hud-corners tilt-3d">
                    <div className="relative z-10">
                      <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${v.gradient} mb-4 shadow-lg`} style={{ boxShadow: `0 0 20px ${v.color}40` }}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <h3 className={`text-lg font-bold mb-2`} style={{ color: v.color }}>{v.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="relative py-20">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-[#fbbf24]/40 to-transparent" />
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">Meet the <span className="color-shift-text">Team</span></h2>
              <p className="text-muted-foreground max-w-xl mx-auto">Security veterans, AI researchers, and educators building the future of cyber training.</p>
            </motion.div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {TEAM.map((m, i) => (
                <motion.div key={m.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="holo-card rounded-xl p-6 hud-corners tilt-3d">
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background: `linear-gradient(135deg, ${m.color}, ${m.color}99)`, boxShadow: `0 0 15px ${m.color}40` }}>
                        {m.avatar}
                      </div>
                      <div>
                        <div className="font-bold">{m.name}</div>
                        <div className="text-xs text-muted-foreground">{m.role}</div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{m.bio}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="relative py-20">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-[#00ff88]/40 to-transparent" />
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">Our <span className="v-text-mint">Journey</span></h2>
            </motion.div>
            <div className="relative">
              <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#00ff88]/40 via-[#00e5ff]/30 to-[#a855f7]/40" />
              {MILESTONES.map((m, i) => (
                <motion.div key={m.year} initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className={`relative flex items-start gap-6 mb-10 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} pl-10 md:pl-0`}>
                  <div className="absolute left-2 md:left-1/2 md:-translate-x-1/2 w-5 h-5 rounded-full border-2 z-10" style={{ borderColor: m.color, background: `${m.color}20`, boxShadow: `0 0 10px ${m.color}40` }} />
                  <div className={`flex-1 ${i % 2 === 0 ? 'md:text-right md:pr-10' : 'md:text-left md:pl-10'}`}>
                    <div className="text-sm font-bold font-mono" style={{ color: m.color }}>{m.year}</div>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{m.event}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative py-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="relative p-10 sm:p-14 rounded-2xl neon-border bg-[#00ff88]/[0.02] dark:bg-[#00ff88]/[0.03] overflow-hidden">
              <div className="absolute inset-0 cyber-grid pointer-events-none" />
              <div className="relative z-10">
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">Ready to Join <span className="neon-text">Us</span>?</h2>
                <p className="text-muted-foreground max-w-lg mx-auto mb-8">Whether you're a beginner or a seasoned professional, CyberShield has a path for you. Start learning today.</p>
                <Button asChild size="lg" className="h-13 px-12 text-sm font-bold cyber-btn rounded-xl">
                  <Link href="/academy"><GraduationCap className="mr-2 h-5 w-5" />Enter the Academy</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <PageFooter />
    </div>
  );
}
