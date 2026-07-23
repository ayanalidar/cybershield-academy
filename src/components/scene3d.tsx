'use client';

import { useMemo } from 'react';

const CODE_SNIPPETS = [
  '#!/bin/bash\nnmap -sV -sC 10.0.0.0/24\nnikto -h https://target.com\ngobuster dir -w /usr/share/wordlists/dirb/big.txt -u http://target\nsqlmap -u "http://target/login?id=1" --dbs\nhydra -l admin -P rockyou.txt ssh://10.0.0.50\njohn --wordlist=/usr/share/wordlists/rockyou.txt hash.txt\nhashcat -m 0 -a 0 hash.txt rockyou.txt\nmsfconsole -x "use exploit/multi/handler"\nwireshark -i eth0 -k\ntcpdump -i eth0 -w capture.pcap\nmetasploit exploit -j -p windows/smb/ms17_010\naircrack-ng -w wordlist.txt capture-01.cap\nburpsuite &\nzap-cli quick-scan http://target\nferoxbuster -u http://target -w wordlist.txt\nnuclei -t cves/ -u http://target\nffuf -u http://target/FUZZ -w wordlist.txt\nrustscan -a 10.0.0.0/24 --ulimit 5000\nwpscan --url http://target --enumerate u\nenum4linux -a 10.0.0.50\nbloodhound-python -d domain.local -u user -p pass\nimpacket-secretsdump domain/admin@target\nresponder -I eth0 -wrf\ncrackmapexec smb 10.0.0.0/24 -u admin -p password\npython3 exploit.py --target 10.0.0.50 --payload rev_shell',
];

const LIGHTNING_PATHS = [
  'M12 0 L8 18 L14 16 L6 40 L16 22 L10 24 Z',
  'M10 0 L6 15 L12 13 L4 32 L14 18 L8 20 Z',
  'M15 0 L10 20 L17 17 L7 45 L18 24 L11 27 Z',
  'M8 0 L5 12 L9 10 L3 25 L11 15 L7 16 Z',
  'M20 0 L14 25 L22 21 L10 50 L24 28 L15 31 Z',
];

interface Scene3DProps {
  variant?: 'full' | 'medium' | 'subtle';
}

export function Scene3D({ variant = 'full' }: Scene3DProps) {
  const codeText = useMemo(() => {
    const lines = CODE_SNIPPETS[0].split('\n');
    const doubled = [...lines, ...lines];
    return doubled.join('\n');
  }, []);

  if (variant === 'subtle') {
    return (
      <>
        {/* Single code wall + 2 lightning bolts */}
        <div className="code-wall left-0 top-0 h-full w-64" style={{ '--wall-rotate': '-20deg', '--wall-speed': '40s', '--wall-color': '#00e5ff' } as React.CSSProperties}>
          {codeText}
        </div>
        <svg className="lightning-bolt" style={{ '--bolt-color': '#00e5ff', '--bolt-speed': '7s', top: '10%', right: '8%' } as React.CSSProperties} width="20" height="50" viewBox="0 0 20 50" fill="none">
          <path d={LIGHTNING_PATHS[1]} fill="currentColor" className="text-[#00e5ff]" />
        </svg>
        <svg className="lightning-bolt" style={{ '--bolt-color': '#a855f7', '--bolt-speed': '9s', top: '50%', right: '15%' } as React.CSSProperties} width="16" height="40" viewBox="0 0 20 50" fill="none">
          <path d={LIGHTNING_PATHS[3]} fill="currentColor" className="text-[#a855f7]" />
        </svg>
        {/* Floating ring */}
        <div className="ring-3d" style={{ '--ring-speed': '25s', width: '120px', height: '120px', top: '20%', right: '10%', borderColor: 'rgba(0,229,255,0.15)' } as React.CSSProperties} />
      </>
    );
  }

  if (variant === 'medium') {
    return (
      <>
        {/* 2 code walls */}
        <div className="code-wall left-0 top-0 h-full w-56" style={{ '--wall-rotate': '-22deg', '--wall-speed': '35s', '--wall-color': '#00ff88' } as React.CSSProperties}>
          {codeText}
        </div>
        <div className="code-wall right-0 top-0 h-full w-48" style={{ '--wall-rotate': '18deg', '--wall-speed': '45s', '--wall-color': '#a855f7', transformOrigin: 'right center' } as React.CSSProperties}>
          {codeText}
        </div>
        {/* 3D cubes */}
        <div className="cube-3d" style={{ '--cube-size': '45px', '--cube-speed': '25s', '--rx': '45deg', '--ry': '30deg', top: '15%', right: '12%' } as React.CSSProperties}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="cube-face" style={{ borderColor: 'rgba(0,229,255,0.25)', background: 'rgba(0,229,255,0.03)' }} />
          ))}
        </div>
        <div className="cube-3d" style={{ '--cube-size': '30px', '--cube-speed': '18s', '--rx': '20deg', '--ry': '60deg', bottom: '20%', left: '8%' } as React.CSSProperties}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="cube-face" style={{ borderColor: 'rgba(168,85,247,0.2)', background: 'rgba(168,85,247,0.02)' }} />
          ))}
        </div>
        {/* Lightning bolts */}
        <svg className="lightning-bolt" style={{ '--bolt-color': '#00e5ff', '--bolt-speed': '5s', top: '8%', right: '20%' } as React.CSSProperties} width="22" height="55" viewBox="0 0 20 50" fill="none">
          <path d={LIGHTNING_PATHS[0]} fill="currentColor" className="text-[#00e5ff]" />
        </svg>
        <svg className="lightning-bolt" style={{ '--bolt-color': '#ff0040', '--bolt-speed': '8s', bottom: '15%', right: '6%' } as React.CSSProperties} width="18" height="45" viewBox="0 0 20 50" fill="none">
          <path d={LIGHTNING_PATHS[2]} fill="currentColor" className="text-[#ff0040]" />
        </svg>
        {/* Ring */}
        <div className="ring-3d" style={{ '--ring-speed': '22s', width: '140px', height: '140px', top: '30%', right: '5%', borderColor: 'rgba(255,0,64,0.12)' } as React.CSSProperties} />
        <div className="ring-3d" style={{ '--ring-speed': '30s', width: '80px', height: '80px', bottom: '25%', left: '15%', borderColor: 'rgba(0,255,136,0.1)' } as React.CSSProperties} />
      </>
    );
  }

  // Full variant — the big dramatic hero scene
  return (
    <>
      {/* Code walls — 3D perspective transformed */}
      <div className="code-wall left-0 top-0 h-full w-72" style={{ '--wall-rotate': '-25deg', '--wall-speed': '30s', '--wall-color': '#00ff88' } as React.CSSProperties}>
        {codeText}
      </div>
      <div className="code-wall right-0 top-0 h-full w-64" style={{ '--wall-rotate': '22deg', '--wall-speed': '38s', '--wall-color': '#00e5ff', transformOrigin: 'right center' } as React.CSSProperties}>
        {codeText}
      </div>
      <div className="code-wall left-1/3 top-0 h-full w-48 opacity-[0.06]" style={{ '--wall-rotate': '-15deg', '--wall-speed': '50s', '--wall-color': '#a855f7' } as React.CSSProperties}>
        {codeText}
      </div>

      {/* 3D Rotating cubes — scattered */}
      <div className="cube-3d" style={{ '--cube-size': '70px', '--cube-speed': '20s', '--rx': '45deg', '--ry': '30deg', top: '8%', right: '15%' } as React.CSSProperties}>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="cube-face" style={{ borderColor: 'rgba(0,229,255,0.3)', background: 'rgba(0,229,255,0.04)' }} />
        ))}
      </div>
      <div className="cube-3d" style={{ '--cube-size': '45px', '--cube-speed': '15s', '--rx': '20deg', '--ry': '60deg', bottom: '18%', left: '5%' } as React.CSSProperties}>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="cube-face" style={{ borderColor: 'rgba(168,85,247,0.25)', background: 'rgba(168,85,247,0.03)' }} />
        ))}
      </div>
      <div className="cube-3d" style={{ '--cube-size': '30px', '--cube-speed': '25s', '--rx': '70deg', '--ry': '45deg', top: '55%', right: '8%' } as React.CSSProperties}>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="cube-face" style={{ borderColor: 'rgba(255,0,64,0.2)', background: 'rgba(255,0,64,0.02)' }} />
        ))}
      </div>
      <div className="cube-3d hidden lg:block" style={{ '--cube-size': '55px', '--cube-speed': '30s', '--rx': '35deg', '--ry': '80deg', top: '25%', left: '3%' } as React.CSSProperties}>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="cube-face" style={{ borderColor: 'rgba(251,191,36,0.2)', background: 'rgba(251,191,36,0.02)' }} />
        ))}
      </div>

      {/* Lightning bolts — electric arcs across the scene */}
      <svg className="lightning-bolt" style={{ '--bolt-color': '#00e5ff', '--bolt-speed': '5s', top: '5%', right: '18%' } as React.CSSProperties} width="24" height="60" viewBox="0 0 20 50" fill="none">
        <path d={LIGHTNING_PATHS[0]} fill="currentColor" className="text-[#00e5ff]" />
      </svg>
      <svg className="lightning-bolt" style={{ '--bolt-color': '#a855f7', '--bolt-speed': '7s', top: '12%', right: '30%' } as React.CSSProperties} width="18" height="45" viewBox="0 0 20 50" fill="none">
        <path d={LIGHTNING_PATHS[1]} fill="currentColor" className="text-[#a855f7]" />
      </svg>
      <svg className="lightning-bolt" style={{ '--bolt-color': '#ff0040', '--bolt-speed': '6s', bottom: '12%', right: '5%' } as React.CSSProperties} width="28" height="70" viewBox="0 0 20 50" fill="none">
        <path d={LIGHTNING_PATHS[4]} fill="currentColor" className="text-[#ff0040]" />
      </svg>
      <svg className="lightning-bolt hidden md:block" style={{ '--bolt-color': '#fbbf24', '--bolt-speed': '9s', bottom: '25%', left: '8%' } as React.CSSProperties} width="16" height="40" viewBox="0 0 20 50" fill="none">
        <path d={LIGHTNING_PATHS[3]} fill="currentColor" className="text-[#fbbf24]" />
      </svg>
      <svg className="lightning-bolt hidden lg:block" style={{ '--bolt-color': '#00ff88', '--bolt-speed': '11s', top: '40%', left: '20%' } as React.CSSProperties} width="20" height="50" viewBox="0 0 20 50" fill="none">
        <path d={LIGHTNING_PATHS[2]} fill="currentColor" className="text-[#00ff88]" />
      </svg>

      {/* 3D orbiting rings */}
      <div className="ring-3d" style={{ '--ring-speed': '20s', width: '200px', height: '200px', top: '10%', right: '5%', borderColor: 'rgba(0,229,255,0.12)' } as React.CSSProperties} />
      <div className="ring-3d" style={{ '--ring-speed': '28s', width: '140px', height: '140px', bottom: '10%', left: '10%', borderColor: 'rgba(168,85,247,0.1)' } as React.CSSProperties} />
      <div className="ring-3d hidden lg:block" style={{ '--ring-speed': '35s', width: '100px', height: '100px', top: '50%', right: '25%', borderColor: 'rgba(255,0,64,0.08)' } as React.CSSProperties} />
    </>
  );
}
