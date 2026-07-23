'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Shield, ArrowRight, Globe, Handshake, Award,
  Users, GraduationCap, Target, Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { Scene3D } from '@/components/scene3d';

const PARTNERS = [
  {
    name: 'CrowdStrike',
    tier: 'Strategic Partner',
    desc: 'Curriculum validation, threat intelligence integration, and exclusive internship pipeline for top CyberShield graduates. CrowdStrike Falcon datasets power our advanced detection labs.',
    color: '#ff0040',
    gradient: 'from-[#ff0040] to-[#ff6b00]',
    logo: 'CS',
    benefits: ['Threat intel data feeds', 'Curriculum review board', 'Graduate referral program', 'Co-branded certifications'],
  },
  {
    name: 'Mandiant (Google Cloud)',
    tier: 'Strategic Partner',
    desc: 'Incident response scenarios, APT simulation data, and advanced forensics modules developed jointly with Mandiant consultants. Real case studies from actual breaches.',
    color: '#00e5ff',
    gradient: 'from-[#00e5ff] to-[#0091ff]',
    logo: 'MB',
    benefits: ['APT simulation scenarios', 'Real IR case studies', 'Forensics module co-development', 'Guest lectures from consultants'],
  },
  {
    name: 'Microsoft Security',
    tier: 'Technology Partner',
    desc: 'Azure security lab environments, Microsoft 365 defense simulations, and integration with Microsoft Learn credentials. Learners earn both CyberShield and Microsoft badges.',
    color: '#a855f7',
    gradient: 'from-[#a855f7] to-[#6366f1]',
    logo: 'MS',
    benefits: ['Azure sandbox environments', 'M365 defense labs', 'Dual credential program', 'Enterprise security modules'],
  },
  {
    name: 'SANS Institute',
    tier: 'Education Partner',
    desc: 'Alignment of CyberShield courses with SANS/GIAC certification paths. Learners can seamlessly transition from CyberShield modules to SANS certifications like GSEC, GPEN, and GCIA.',
    color: '#fbbf24',
    gradient: 'from-[#fbbf24] to-[#f59e0b]',
    logo: 'SI',
    benefits: ['GIAC certification alignment', 'Shared course frameworks', 'Instructor exchange program', 'Discounted SANS exams'],
  },
  {
    name: 'AWS Security',
    tier: 'Cloud Partner',
    desc: 'Dedicated AWS security labs covering IAM, GuardDuty, Security Hub, and cloud penetration testing. Learners practice on real AWS accounts in isolated environments.',
    color: '#00ff88',
    gradient: 'from-[#00ff88] to-[#00cc6a]',
    logo: 'AW',
    benefits: ['AWS sandbox accounts', 'Cloud security labs', 'SAP certification prep', 'Well-Architected Security review'],
  },
  {
    name: 'Offensive Security',
    tier: 'Certification Partner',
    desc: 'OSCP and OSCE preparation tracks co-designed with Offensive Security. Our pen testing labs mirror OSCP exam environments, giving learners a competitive edge on exam day.',
    color: '#ff0040',
    gradient: 'from-[#ff0040] to-[#a855f7]',
    logo: 'OS',
    benefits: ['OSCP prep track', 'Exam-mirror lab environments', 'Co-developed challenges', 'Exam vouchers for top learners'],
  },
];

const PARTNER_STATS = [
  { value: '6', label: 'Strategic Partners', color: 'from-[#00ff88] to-[#00e5ff]' },
  { value: '12', label: 'Certification Pathways', color: 'from-[#a855f7] to-[#6366f1]' },
  { value: '50+', label: 'Co-Developed Labs', color: 'from-[#ff0040] to-[#ff6b00]' },
  { value: '200+', label: 'Graduate Referrals', color: 'from-[#fbbf24] to-[#f59e0b]' },
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

export default function PartnersPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <PageHeader />
      <main className="flex-1 pt-16">
        {/* Hero */}
        <section className="relative py-24 sm:py-32 overflow-hidden scanline-overlay thunderstorm">
          <Scene3D variant="medium" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none z-0" style={{ background: 'radial-gradient(ellipse at center, rgba(251,191,36,0.08) 0%, rgba(0,255,136,0.04) 30%, transparent 70%)' }} />
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#fbbf24]/20 bg-[#fbbf24]/5 text-xs font-semibold text-[#fbbf24] uppercase tracking-widest mb-6">
              <Handshake className="h-3.5 w-3.5" />
              Partners
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-6">
              Trusted by the{' '}<span className="color-shift-text">Best</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              We partner with industry leaders to ensure our curriculum reflects real-world threats, our labs use real tools, and our certifications carry real weight.
            </motion.p>
          </div>
        </section>

        {/* Stats */}
        <section className="relative py-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-[#00ff88]/40 to-transparent" />
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {PARTNER_STATS.map((s) => (
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

        {/* Partners Grid */}
        <section className="relative py-20">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-[#a855f7]/40 to-transparent" />
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">Our <span className="v-text-fire">Partner</span> Ecosystem</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">Each partnership is carefully chosen to add real value to your learning journey.</p>
            </motion.div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {PARTNERS.map((p, i) => (
                <motion.div key={p.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="holo-card rounded-xl p-6 hud-corners tilt-3d">
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold text-white bg-gradient-to-br shadow-lg" style={{ background: `linear-gradient(135deg, ${p.color}, ${p.color}99)`, boxShadow: `0 0 15px ${p.color}40` }}>
                        {p.logo}
                      </div>
                      <div>
                        <div className="font-bold">{p.name}</div>
                        <div className="text-xs font-medium" style={{ color: p.color }}>{p.tier}</div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">{p.desc}</p>
                    <ul className="space-y-1.5">
                      {p.benefits.map((b) => (
                        <li key={b} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: p.color }} />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Become a Partner CTA */}
        <section className="relative py-20">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-[#fbbf24]/40 to-transparent" />
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="relative p-10 sm:p-14 rounded-2xl neon-border bg-[#00ff88]/[0.02] dark:bg-[#00ff88]/[0.03] overflow-hidden">
              <div className="absolute inset-0 cyber-grid pointer-events-none" />
              <div className="relative z-10">
                <Award className="h-10 w-10 text-[#fbbf24] mx-auto mb-4" />
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">Become a <span className="color-shift-text">Partner</span></h2>
                <p className="text-muted-foreground max-w-lg mx-auto mb-8">
                  We are always looking for organizations that share our mission of closing the cybersecurity talent gap. Whether you are a security vendor, certification body, or educational institution, we would love to explore collaboration.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button size="lg" className="h-13 px-12 text-sm font-bold cyber-btn rounded-xl">
                    <Handshake className="mr-2 h-5 w-5" />Contact Partnerships
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <PageFooter />
    </div>
  );
}
