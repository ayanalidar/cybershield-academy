'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Shield, ArrowRight, Check, X, Zap, GraduationCap,
  Users, Crown, Rocket, Brain, Terminal, Trophy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { Scene3D } from '@/components/scene3d';

const PLANS = [
  {
    name: 'Explorer',
    price: 'Free',
    period: 'forever',
    desc: 'Perfect for getting started. Access core learning content and community features at zero cost.',
    color: '#00ff88',
    gradient: 'from-[#00ff88] to-[#00cc6a]',
    borderColor: 'border-[#00ff88]/20',
    tagBg: 'bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/20',
    features: [
      { text: '5 hands-on labs', included: true },
      { text: '2 beginner courses', included: true },
      { text: 'Community Discord access', included: true },
      { text: 'Basic AI Professor (text only)', included: true },
      { text: 'Public CTF challenges (3/month)', included: true },
      { text: 'Advanced labs', included: false },
      { text: 'Voice AI Professor', included: false },
      { text: 'Private team CTFs', included: false },
      { text: 'Certificate of completion', included: false },
      { text: 'Priority support', included: false },
    ],
    cta: 'Start Free',
    popular: false,
  },
  {
    name: 'Operator',
    price: '$29',
    period: '/month',
    desc: 'For serious learners ready to go deep. Full course library, AI voice mentor, and unlimited labs.',
    color: '#00e5ff',
    gradient: 'from-[#00e5ff] to-[#0091ff]',
    borderColor: 'border-[#00e5ff]/20',
    tagBg: 'bg-[#00e5ff]/10 text-[#00e5ff] border border-[#00e5ff]/20',
    features: [
      { text: '50+ hands-on labs', included: true },
      { text: 'Full course library (all levels)', included: true },
      { text: 'Community Discord access', included: true },
      { text: 'Voice-powered AI Professor', included: true },
      { text: 'Unlimited CTF challenges', included: true },
      { text: 'Advanced labs (pen testing, cloud)', included: true },
      { text: 'Skill analytics dashboard', included: true },
      { text: 'Private team CTFs', included: false },
      { text: 'Certificate of completion', included: true },
      { text: 'Priority support', included: false },
    ],
    cta: 'Go Operator',
    popular: true,
  },
  {
    name: 'Elite',
    price: '$79',
    period: '/month',
    desc: 'For professionals and teams. Everything in Operator plus enterprise features, team management, and 1-on-1 mentoring.',
    color: '#a855f7',
    gradient: 'from-[#a855f7] to-[#6366f1]',
    borderColor: 'border-[#a855f7]/20',
    tagBg: 'bg-[#a855f7]/10 text-[#a855f7] border border-[#a855f7]/20',
    features: [
      { text: '50+ hands-on labs', included: true },
      { text: 'Full course library + early access', included: true },
      { text: 'Community Discord access', included: true },
      { text: 'Voice-powered AI Professor', included: true },
      { text: 'Unlimited CTF challenges', included: true },
      { text: 'Advanced labs (pen testing, cloud)', included: true },
      { text: 'Skill analytics dashboard', included: true },
      { text: 'Private team CTFs (up to 10)', included: true },
      { text: 'Verified certificates', included: true },
      { text: 'Priority support + 1-on-1 mentoring', included: true },
    ],
    cta: 'Go Elite',
    popular: false,
  },
];

const FAQS = [
  { q: 'Can I switch plans at any time?', a: 'Yes. You can upgrade or downgrade your plan at any point. When upgrading, you get immediate access to new features and we prorate the billing. When downgrading, the change takes effect at the next billing cycle.' },
  { q: 'Is there a free trial for paid plans?', a: 'Both Operator and Elite come with a 14-day free trial. No credit card required. You get full access to all features during the trial period.' },
  { q: 'Do you offer team or enterprise pricing?', a: 'Yes. For teams of 10+, we offer custom enterprise pricing with volume discounts, dedicated account management, custom learning paths, SSO integration, and compliance reporting. Contact us at teams@cybershield.academy.' },
  { q: 'What payment methods do you accept?', a: 'We accept all major credit and debit cards (Visa, MasterCard, Amex), PayPal, and bank transfers for annual enterprise plans. All payments are processed securely through Stripe.' },
  { q: 'Can I get a refund?', a: 'We offer a 30-day money-back guarantee on all paid plans. If you are not satisfied for any reason, contact support within 30 days of purchase for a full refund.' },
  { q: 'Are the certificates recognized by employers?', a: 'CyberShield certificates are recognized by our partner organizations including CrowdStrike, Mandiant, and Microsoft Security. Our curriculum is aligned with industry frameworks (NIST, MITRE ATT&CK) and certification bodies (CompTIA, EC-Council).' },
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

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <PageHeader />
      <main className="flex-1 pt-16">
        {/* Hero */}
        <section className="relative py-24 sm:py-32 overflow-hidden scanline-overlay thunderstorm">
          <Scene3D variant="medium" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none z-0" style={{ background: 'radial-gradient(ellipse at center, rgba(168,85,247,0.08) 0%, rgba(0,255,136,0.04) 30%, transparent 70%)' }} />
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#a855f7]/20 bg-[#a855f7]/5 text-xs font-semibold text-[#a855f7] uppercase tracking-widest mb-6">
              <Crown className="h-3.5 w-3.5" />
              Pricing
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-6">
              Invest in Your{' '}<span className="color-shift-text">Defense</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
              Transparent pricing with no hidden fees. Start free, upgrade when you're ready to go deeper.
            </motion.p>
            {/* Toggle */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="inline-flex items-center gap-3 px-4 py-2 rounded-full neon-border bg-[#00ff88]/5">
              <span className={`text-sm font-medium transition-colors ${!annual ? 'text-[#00ff88]' : 'text-muted-foreground'}`}>Monthly</span>
              <button onClick={() => setAnnual(!annual)} className={`relative w-11 h-6 rounded-full transition-colors ${annual ? 'bg-[#a855f7]' : 'bg-[#00ff88]/30'}`}>
                <div className={`absolute top-0.5 ${annual ? 'left-[22px]' : 'left-0.5'} w-5 h-5 rounded-full bg-white shadow transition-all`} />
              </button>
              <span className={`text-sm font-medium transition-colors ${annual ? 'text-[#a855f7]' : 'text-muted-foreground'}`}>Annual <span className="text-xs opacity-70">(Save 20%)</span></span>
            </motion.div>
          </div>
        </section>

        {/* Plans */}
        <section className="relative py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid md:grid-cols-3 gap-6 items-start">
              {PLANS.map((plan, i) => (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12 }}
                  className={`relative holo-card rounded-2xl p-6 hud-corners tilt-3d ${plan.popular ? 'border-[#00e5ff]/50 shadow-lg shadow-[#00e5ff]/10' : ''}`}
                  style={plan.popular ? { boxShadow: `0 0 30px ${plan.color}20, 0 0 60px ${plan.color}10` } : {}}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-[#00e5ff] to-[#0091ff] text-xs font-bold text-white uppercase tracking-wider">
                      Most Popular
                    </div>
                  )}
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-sm font-bold px-2.5 py-0.5 rounded-full ${plan.tagBg}`}>{plan.name}</span>
                    </div>
                    <div className="mt-4 mb-2">
                      <span className="text-4xl font-black" style={{ color: plan.color }}>
                        {plan.price === 'Free' ? 'Free' : annual ? `$${Math.round(parseInt(plan.price.replace('$', '')) * 0.8)}` : plan.price}
                      </span>
                      {plan.price !== 'Free' && <span className="text-sm text-muted-foreground">{plan.period}</span>}
                    </div>
                    <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{plan.desc}</p>
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((f) => (
                        <li key={f.text} className="flex items-start gap-2.5 text-sm">
                          {f.included ? (
                            <Check className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: plan.color }} />
                          ) : (
                            <X className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground/40" />
                          )}
                          <span className={f.included ? 'text-foreground' : 'text-muted-foreground/40'}>{f.text}</span>
                        </li>
                      ))}
                    </ul>
                    <Button asChild size="lg" className={`w-full h-11 rounded-xl font-bold text-sm ${plan.popular ? 'cyber-btn' : ''}`} variant={plan.popular ? 'default' : 'outline'}>
                      <Link href="/academy">
                        {plan.cta}
                        <ArrowRight className="ml-1.5 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="relative py-20">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-[#fbbf24]/40 to-transparent" />
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">Frequently <span className="v-text-fire">Asked</span></h2>
            </motion.div>
            <div className="space-y-4">
              {FAQS.map((faq, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className="holo-card rounded-xl p-5 hud-corners tilt-3d">
                  <div className="relative z-10">
                    <h3 className="font-bold text-sm mb-2 text-[#00e5ff]">{faq.q}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
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
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">Still <span className="neon-text">Undecided</span>?</h2>
                <p className="text-muted-foreground max-w-lg mx-auto mb-8">Start with our free Explorer plan. No credit card, no commitment. Upgrade when you're ready.</p>
                <Button asChild size="lg" className="h-13 px-12 text-sm font-bold cyber-btn rounded-xl">
                  <Link href="/academy"><Rocket className="mr-2 h-5 w-5" />Start Free</Link>
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
