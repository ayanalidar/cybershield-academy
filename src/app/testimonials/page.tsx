'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Shield, ArrowRight, Star, GraduationCap,
  Users, Quote, Zap, Award,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { Scene3D } from '@/components/scene3d';

const ALL_TESTIMONIALS = [
  { name: 'Sarah Kim', role: 'Security Analyst at CrowdStrike', text: 'CyberShield\'s AI Professor helped me bridge the gap between theory and practice. The labs are incredibly realistic \u2014 I felt like I was in a real SOC environment. Within 3 months of completing the incident response track, I landed my current role at CrowdStrike.', avatar: 'SK', rating: 5, color: '#00ff88', badge: 'Hired at Partner' },
  { name: 'Marcus Johnson', role: 'Penetration Tester, Independent', text: 'The CTF arena and adaptive learning paths are game-changers. Went from a script kiddie to OSCP-certified in 8 months. The AI lab agent is insane \u2014 it gives you hints without giving away the answer, just like a real mentor would.', avatar: 'MJ', rating: 5, color: '#00e5ff', badge: 'OSCP Certified' },
  { name: 'Priya Mehta', role: 'SOC Lead at Mandiant', text: 'I recommend CyberShield to every junior analyst on my team. The incident response modules and real-time analytics are world-class. The curriculum aligns perfectly with what we see in actual breach investigations.', avatar: 'PM', rating: 5, color: '#ff0040', badge: 'SOC Lead' },
  { name: 'David Chen', role: 'Cloud Security Engineer at AWS', text: 'The AWS security labs were a game-changer for my career. Being able to practice IAM policies, GuardDuty configurations, and Security Hub setups in real sandboxed environments gave me the confidence to ace my AWS Security Specialty certification.', avatar: 'DC', rating: 5, color: '#a855f7', badge: 'AWS Certified' },
  { name: 'Elena Rodriguez', role: 'Security Researcher at Google', text: 'As someone who came from a non-traditional background, CyberShield made cybersecurity accessible. The adaptive learning path identified my weak areas in crypto and binary exploitation, then served targeted labs until I mastered them. Now I do security research at Google.', avatar: 'ER', rating: 5, color: '#fbbf24', badge: 'Google Security' },
  { name: 'James Wright', role: 'CISO at a Fortune 500', text: 'We enrolled our entire security team in CyberShield\'s Enterprise plan. The team CTF feature brought our analysts closer together, and the skill analytics dashboard helped me identify exactly where our team needed improvement. ROI was visible within the first quarter.', avatar: 'JW', rating: 5, color: '#00ff88', badge: 'Enterprise Client' },
  { name: 'Aisha Patel', role: 'Threat Intelligence Analyst', text: 'The threat intelligence modules use real data from CrowdStrike and Mandiant partnerships. Analyzing actual APT reports and TTPs gave me skills that textbooks simply cannot provide. I went from student to threat intel analyst in 6 months.', avatar: 'AP', rating: 5, color: '#00e5ff', badge: 'Career Switch' },
  { name: 'Tom Nakamura', role: 'DevSecOps Engineer', text: 'The web application security and DevSecOps tracks are exceptional. I was already a developer but knew little about security. CyberShield taught me how to think like an attacker while writing secure code. My team\'s vulnerability count dropped 70% after I applied what I learned.', avatar: 'TN', rating: 5, color: '#ff0040', badge: 'DevSecOps' },
  { name: 'Rachel O\'Brien', role: 'Freelance Security Consultant', text: 'CyberShield gave me the practical skills and portfolio of lab completions that convinced clients to trust me with their security assessments. The platform literally built my consulting business from scratch. The verified certificates carry real weight.', avatar: 'RO', rating: 5, color: '#a855f7', badge: 'Business Owner' },
];

const STATS = [
  { value: '4.9/5', label: 'Average Rating', color: 'from-[#fbbf24] to-[#f59e0b]' },
  { value: '2,800+', label: 'Written Reviews', color: 'from-[#00ff88] to-[#00e5ff]' },
  { value: '94%', label: 'Would Recommend', color: 'from-[#a855f7] to-[#6366f1]' },
  { value: '78%', label: 'Career Impact', color: 'from-[#ff0040] to-[#ff6b00]' },
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

export default function TestimonialsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <PageHeader />
      <main className="flex-1 pt-16">
        {/* Hero */}
        <section className="relative py-24 sm:py-32 overflow-hidden scanline-overlay thunderstorm">
          <Scene3D variant="medium" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none z-0" style={{ background: 'radial-gradient(ellipse at center, rgba(255,0,64,0.08) 0%, rgba(251,191,36,0.04) 30%, transparent 70%)' }} />
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#fbbf24]/20 bg-[#fbbf24]/5 text-xs font-semibold text-[#fbbf24] uppercase tracking-widest mb-6">
              <Star className="h-3.5 w-3.5" />
              Testimonials
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-6">
              Real People,{' '}<span className="color-shift-text">Real Results</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Hear from cybersecurity professionals who transformed their careers with CyberShield. These are real stories from real learners.
            </motion.p>
          </div>
        </section>

        {/* Stats */}
        <section className="relative py-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-[#fbbf24]/40 to-transparent" />
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {STATS.map((s) => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="holo-card rounded-xl p-5 text-center hud-corners tilt-3d">
                  <div className="relative z-10">
                    <div className={`text-2xl sm:text-3xl font-black bg-gradient-to-r ${s.color} bg-clip-text text-transparent`}>{s.value}</div>
                    <div className="text-xs text-muted-foreground mt-1 font-medium tracking-wide uppercase">{s.label}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Grid */}
        <section className="relative py-20">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-[#00ff88]/40 to-transparent" />
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">What Our <span className="v-text-fire">Learners</span> Say</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">From career switchers to CISOs, CyberShield has impacted professionals at every level.</p>
            </motion.div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {ALL_TESTIMONIALS.map((t, i) => (
                <motion.div key={t.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className="holo-card rounded-xl p-6 hud-corners tilt-3d">
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: t.rating }).map((_, j) => (
                          <Star key={j} className="h-3.5 w-3.5 fill-[#fbbf24] text-[#fbbf24]" />
                        ))}
                      </div>
                      {t.badge && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border" style={{ color: t.color, borderColor: `${t.color}40`, background: `${t.color}10` }}>{t.badge}</span>
                      )}
                    </div>
                    <Quote className="h-5 w-5 mb-2" style={{ color: `${t.color}40` }} />
                    <p className="text-sm text-muted-foreground leading-relaxed mb-5">&ldquo;{t.text}&rdquo;</p>
                    <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}99)`, boxShadow: `0 0 12px ${t.color}40` }}>
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

        {/* CTA */}
        <section className="relative py-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="relative p-10 sm:p-14 rounded-2xl neon-border bg-[#00ff88]/[0.02] dark:bg-[#00ff88]/[0.03] overflow-hidden">
              <div className="absolute inset-0 cyber-grid pointer-events-none" />
              <div className="relative z-10">
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">Write Your Own <span className="neon-text">Success Story</span></h2>
                <p className="text-muted-foreground max-w-lg mx-auto mb-8">Join 15,000+ learners who are mastering cybersecurity through hands-on practice and AI-powered guidance. Your career transformation starts here.</p>
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
