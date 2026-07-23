'use client';

import Link from 'next/link';
import { Shield } from 'lucide-react';

interface CyberShieldLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

const SIZES = {
  sm: { icon: 'h-5 w-5', text: 'text-sm', gap: 'gap-1.5' },
  md: { icon: 'h-6 w-6', text: 'text-base', gap: 'gap-2' },
  lg: { icon: 'h-8 w-8', text: 'text-xl', gap: 'gap-2.5' },
  xl: { icon: 'h-10 w-10', text: 'text-2xl', gap: 'gap-3' },
};

export function CyberShieldLogo({ size = 'md', showText = true, className = '' }: CyberShieldLogoProps) {
  const s = SIZES[size];
  return (
    <Link href="/" className={`flex items-center ${s.gap} group ${className}`}>
      <div className="relative flex-shrink-0">
        <div className="absolute inset-0 rounded-full bg-[#00ff88]/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <Shield className={`${s.icon} text-[#00ff88] transition-transform group-hover:scale-110 relative z-10 drop-shadow-[0_0_8px_rgba(0,255,136,0.5)]`} />
      </div>
      {showText && (
        <span className={`${s.text} font-bold tracking-tight whitespace-nowrap`}>
          Cyber<span className="v-text-mint">Shield</span>
        </span>
      )}
    </Link>
  );
}
