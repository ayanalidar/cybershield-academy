'use client';

import Link from 'next/link';
import { CyberShieldLogo } from './CyberShieldLogo';

const FOOTER_SECTIONS = [
  {
    title: 'Platform',
    color: '#00e5ff',
    links: [
      { label: 'Academy', href: '/academy' },
      { label: 'Features', href: '/#features' },
      { label: 'Courses', href: '/#courses' },
      { label: 'Pricing', href: '/pricing' },
    ],
  },
  {
    title: 'Company',
    color: '#a855f7',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Partners', href: '/partners' },
      { label: 'Testimonials', href: '/testimonials' },
      { label: 'Careers', href: '/about#careers' },
    ],
  },
  {
    title: 'Resources',
    color: '#fbbf24',
    links: [
      { label: 'Documentation', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Community', href: '#' },
      { label: 'Contact', href: '#' },
    ],
  },
  {
    title: 'Legal',
    color: '#ff0040',
    links: [
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
      { label: 'Cookie Policy', href: '#' },
      { label: 'Security', href: '#' },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-[#00ff88]/10 bg-surface/30">
      <div className="h-[2px] data-stream-bar" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Logo + description */}
          <div className="sm:col-span-2 lg:col-span-1">
            <CyberShieldLogo size="md" />
            <p className="text-sm text-muted-foreground leading-relaxed mt-4">
              AI-powered cybersecurity training platform built for the next generation of security professionals.
            </p>
          </div>
          {/* Link columns */}
          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title}>
              <h4
                className="font-bold mb-4 text-xs uppercase tracking-widest"
                style={{ color: section.color }}
              >
                {section.title}
              </h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="hover:text-[#00ff88] transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-[#00ff88]/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <span className="font-mono text-xs">&copy; {new Date().getFullYear()} CyberShield Academy. All rights reserved.</span>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff88] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00ff88]" />
            </span>
            <span className="font-mono text-xs">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
