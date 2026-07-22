'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, BookOpen, Brain, HelpCircle, Terminal, Trophy,
  Gamepad2, BarChart3, Award, Shield, Lock, Eye, Users, Zap, Star,
  Send, ChevronRight, ChevronDown, X, Mic, MicOff, Volume2, VolumeX,
  Flag, Clock, Target, Flame, TrendingUp, AlertTriangle, CheckCircle2,
  XCircle, Lightbulb, ArrowUpRight, Crown, Medal, Hexagon, Activity,
  Search, Globe, Cpu, RefreshCw, Play, Pause, SkipForward,
  Calendar, Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

/* ═══════════════════════════════════════════════════════════════════════
   CONSTANTS & DEMO DATA
   ═══════════════════════════════════════════════════════════════════════ */

const RANKS = [
  { name: 'Script Kiddie', min: 0, icon: '🥉' },
  { name: 'Junior Analyst', min: 100, icon: '📋' },
  { name: 'Network Scout', min: 300, icon: '🔍' },
  { name: 'Threat Hunter', min: 600, icon: '🎯' },
  { name: 'Security Analyst', min: 1000, icon: '🛡️' },
  { name: 'Pen Tester', min: 1500, icon: '⚔️' },
  { name: 'Incident Responder', min: 2200, icon: '🚨' },
  { name: 'Malware Analyst', min: 3000, icon: '🦠' },
  { name: 'Security Engineer', min: 4000, icon: '🔧' },
  { name: 'Red Team Lead', min: 5500, icon: '🔴' },
  { name: 'Blue Team Lead', min: 7000, icon: '🔵' },
  { name: 'Security Architect', min: 9000, icon: '🏛️' },
  { name: 'Cyber Strategist', min: 12000, icon: '♟️' },
  { name: 'Zero Day Hunter', min: 16000, icon: '💀' },
  { name: 'Cyber Legend', min: 20000, icon: '👑' },
];

const DEMO_USER = { id: 'demo-user-1', name: 'Alex Chen', email: 'alex@cybershield.academy', xp: 1450, level: 6, streakDays: 7, role: 'student' };

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'courses', label: 'Courses', icon: BookOpen },
  { id: 'professor', label: 'Professor', icon: Brain },
  { id: 'quizzes', label: 'Quizzes', icon: HelpCircle },
  { id: 'labs', label: 'Lab Terminal', icon: Terminal },
  { id: 'ctf', label: 'CTF Arena', icon: Trophy },
  { id: 'ranks', label: 'Rank & Badges', icon: Gamepad2 },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'certificates', label: 'Certificates', icon: Award },
];

const COURSES = [
  { id: 'c1', title: 'Network Security Fundamentals', category: 'Network Security', difficulty: 'beginner', durationHours: 12, modules: 6, thumbnail: '🔐', progress: 65, enrolled: true, rating: 4.8 },
  { id: 'c2', title: 'Web Application Security', category: 'Web Security', difficulty: 'intermediate', durationHours: 18, modules: 8, thumbnail: '🌐', progress: 30, enrolled: true, rating: 4.9 },
  { id: 'c3', title: 'Cryptography & PKI', category: 'Cryptography', difficulty: 'intermediate', durationHours: 15, modules: 7, thumbnail: '🔑', progress: 0, enrolled: false, rating: 4.7 },
  { id: 'c4', title: 'Penetration Testing', category: 'Offensive Security', difficulty: 'advanced', durationHours: 25, modules: 10, thumbnail: '⚔️', progress: 0, enrolled: false, rating: 4.9 },
  { id: 'c5', title: 'Incident Response', category: 'Defensive Security', difficulty: 'intermediate', durationHours: 20, modules: 8, thumbnail: '🚨', progress: 0, enrolled: false, rating: 4.6 },
  { id: 'c6', title: 'Cloud Security', category: 'Cloud', difficulty: 'advanced', durationHours: 22, modules: 9, thumbnail: '☁️', progress: 0, enrolled: false, rating: 4.8 },
];

const CTF_CHALLENGES = [
  { id: 'ctf1', title: 'Caesar Cipher Cracker', category: 'crypto', difficulty: 'easy', points: 100, solveCount: 342, description: 'Decrypt the message encrypted with a simple Caesar cipher. The shift value is hidden in the challenge name.', hint: 'The shift is 3 (classic Caesar). ROT13 is a common variant.', flag: 'CSA{caesar_shift_revealed}', solved: false },
  { id: 'ctf2', title: 'XSS Reflected', category: 'web', difficulty: 'medium', points: 200, solveCount: 189, description: 'Find and exploit a reflected XSS vulnerability in the search parameter of the target application.', hint: 'Check the search?q= parameter. Try injecting <script> tags with event handlers.', flag: 'CSA{reflected_xss_pwned}', solved: false },
  { id: 'ctf3', title: 'Buffer Overflow 101', category: 'pwn', difficulty: 'medium', points: 250, solveCount: 156, description: 'Exploit a simple buffer overflow in a C program to redirect execution to a hidden function.', hint: 'Use GDB to find the offset to the return address. The hidden function is at 0x080491d6.', flag: 'CSA{buff3r_0v3rfl0w_b4s1cs}', solved: false },
  { id: 'ctf4', title: 'Hidden in Plain Sight', category: 'forensics', difficulty: 'easy', points: 150, solveCount: 278, description: 'An employee was suspected of data exfiltration. Analyze the provided network capture to find the flag.', hint: 'Check DNS queries for unusual patterns. Look for base64 encoded subdomains.', flag: 'CSA{dns_exfil_detected}', solved: true },
  { id: 'ctf5', title: 'OSINT Profile Hunt', category: 'osint', difficulty: 'easy', points: 100, solveCount: 412, description: 'Find information about the target persona using only open-source intelligence techniques.', hint: 'Start with the username across multiple platforms. Check GitHub, LinkedIn, and Twitter.', flag: 'CSA{osint_master_2024}', solved: true },
  { id: 'ctf6', title: 'Crack Me If You Can', category: 'reverse', difficulty: 'hard', points: 300, solveCount: 87, description: 'Reverse engineer the provided binary to find the correct license key that unlocks the flag.', hint: 'Use strings command first, then try Ghidra or IDA for deeper analysis. The validation function XORs with 0x42.', flag: 'CSA{r3v3rs3d_4nd_cr4ck3d}', solved: false },
];

const BADGES = [
  { id: 'b1', name: 'Shield Master', description: 'Complete the Network Security course', icon: '🛡️', rarity: 'rare', xpReward: 200, earned: true },
  { id: 'b2', name: 'First Blood', description: 'Solve your first CTF challenge', icon: '🩸', rarity: 'common', xpReward: 50, earned: true },
  { id: 'b3', name: 'Quiz Ace', description: 'Score 100% on any quiz', icon: '🧠', rarity: 'epic', xpReward: 300, earned: false },
  { id: 'b4', name: 'Lab Rat', description: 'Complete 10 lab sessions', icon: '🐀', rarity: 'common', xpReward: 100, earned: true },
  { id: 'b5', name: 'CTF Champion', description: 'Solve 50 CTF challenges', icon: '🏆', rarity: 'legendary', xpReward: 500, earned: false },
  { id: 'b6', name: 'Streak Master', description: 'Maintain a 30-day streak', icon: '🔥', rarity: 'rare', xpReward: 200, earned: false },
  { id: 'b7', name: 'Network Ninja', description: 'Complete all network modules', icon: '🥷', rarity: 'epic', xpReward: 300, earned: false },
  { id: 'b8', name: 'Crypto Wizard', description: 'Master all cryptography challenges', icon: '🧙', rarity: 'legendary', xpReward: 500, earned: false },
];

const LEADERBOARD = [
  { rank: 1, name: 'Sarah Kim', xp: 8750, level: 11 },
  { rank: 2, name: 'James Rodriguez', xp: 7200, level: 10 },
  { rank: 3, name: 'Priya Mehta', xp: 5800, level: 9 },
  { rank: 4, name: 'Marcus Johnson', xp: 4200, level: 8 },
  { rank: 5, name: 'Yuki Tanaka', xp: 3100, level: 7 },
  { rank: 6, name: 'Alex Chen', xp: 1450, level: 6 },
  { rank: 7, name: 'Emma Davis', xp: 980, level: 5 },
  { rank: 8, name: 'Raj Patel', xp: 650, level: 4 },
];

const LAB_SCENARIOS = [
  { id: 'lab1', title: 'Network Reconnaissance', category: 'Network Security', difficulty: 'beginner', objectives: [
    { id: 'o1', description: 'Identify live hosts on the 10.0.0.0/24 network', completed: false },
    { id: 'o2', description: 'Discover open ports on target 10.0.0.50', completed: false },
    { id: 'o3', description: 'Identify running services and versions', completed: false },
    { id: 'o4', description: 'Document findings in a structured report', completed: false },
  ]},
  { id: 'lab2', title: 'SQL Injection Lab', category: 'Web Security', difficulty: 'intermediate', objectives: [
    { id: 'o1', description: 'Identify the vulnerable input parameter', completed: false },
    { id: 'o2', description: 'Extract database version information', completed: false },
    { id: 'o3', description: 'Enumerate table names from the database', completed: false },
    { id: 'o4', description: 'Extract user credentials from the users table', completed: false },
  ]},
  { id: 'lab3', title: 'Privilege Escalation', category: 'System Security', difficulty: 'advanced', objectives: [
    { id: 'o1', description: 'Gain initial access as low-privilege user', completed: false },
    { id: 'o2', description: 'Enumerate SUID binaries', completed: false },
    { id: 'o3', description: 'Exploit misconfigured SUID binary', completed: false },
    { id: 'o4', description: 'Escalate to root and read /root/flag.txt', completed: false },
  ]},
  { id: 'lab4', title: 'Cryptographic Analysis', category: 'Cryptography', difficulty: 'intermediate', objectives: [
    { id: 'o1', description: 'Identify the encryption algorithm used', completed: false },
    { id: 'o2', description: 'Analyze the key generation weakness', completed: false },
    { id: 'o3', description: 'Develop a decryption strategy', completed: false },
  ]},
  { id: 'lab5', title: 'Web Shell Upload', category: 'Web Security', difficulty: 'advanced', objectives: [
    { id: 'o1', description: 'Identify the file upload endpoint', completed: false },
    { id: 'o2', description: 'Bypass the file type validation', completed: false },
    { id: 'o3', description: 'Upload and execute a web shell', completed: false },
    { id: 'o4', description: 'Maintain persistence and cover tracks', completed: false },
  ]},
];

const ACTIVITY_TIMELINE = [
  { time: '2 hours ago', action: 'Completed Network Security module', type: 'module', xp: 50 },
  { time: '5 hours ago', action: 'Solved CTF: Hidden in Plain Sight', type: 'ctf', xp: 150 },
  { time: '1 day ago', action: 'Earned badge: Lab Rat', type: 'badge', xp: 100 },
  { time: '1 day ago', action: 'Quiz: Web Security — Score 85%', type: 'quiz', xp: 75 },
  { time: '2 days ago', action: 'Lab Session: Network Recon (completed)', type: 'lab', xp: 100 },
  { time: '3 days ago', action: 'Enrolled in Web Application Security', type: 'enroll', xp: 0 },
  { time: '4 days ago', action: 'Solved CTF: OSINT Profile Hunt', type: 'ctf', xp: 100 },
];

const DEMO_QUIZ = {
  id: 'q1', title: 'Network Security Fundamentals Quiz', timeLimit: 300, questions: [
    { id: 'qq1', text: 'What does the TCP three-way handshake consist of?', options: ['SYN, SYN-ACK, ACK', 'ACK, SYN, FIN', 'SYN, ACK, RST', 'HELLO, AUTH, START'], correct: 'SYN, SYN-ACK, ACK', explanation: 'The TCP three-way handshake: client sends SYN, server responds with SYN-ACK, client completes with ACK.', points: 20 },
    { id: 'qq2', text: 'Which protocol operates at Layer 4 of the OSI model?', options: ['HTTP', 'IP', 'TCP', 'Ethernet'], correct: 'TCP', explanation: 'TCP (Transmission Control Protocol) operates at the Transport Layer (Layer 4) of the OSI model.', points: 20 },
    { id: 'qq3', text: 'What is the primary purpose of a firewall?', options: ['Encrypt data', 'Filter network traffic', 'Manage passwords', 'Compress packets'], correct: 'Filter network traffic', explanation: 'A firewall monitors and filters incoming and outgoing network traffic based on predetermined security rules.', points: 20 },
    { id: 'qq4', text: 'Which port does HTTPS typically use?', options: ['80', '443', '8080', '22'], correct: '443', explanation: 'HTTPS (HTTP Secure) uses port 443 by default for encrypted web communication.', points: 20 },
    { id: 'qq5', text: 'What is a DDoS attack?', options: ['Data theft via DNS', 'Overwhelming a service with traffic', 'Decrypting intercepted data', 'Exploiting buffer overflows'], correct: 'Overwhelming a service with traffic', explanation: 'DDoS (Distributed Denial of Service) floods a target with traffic from multiple sources to make it unavailable.', points: 20 },
  ],
};

const NETWORK_NODES = [
  { id: 'n1', label: 'Attacker', x: 10, y: 50, type: 'normal' as const },
  { id: 'n2', label: 'Firewall', x: 30, y: 30, type: 'normal' as const },
  { id: 'n3', label: 'Web Server', x: 50, y: 20, type: 'normal' as const },
  { id: 'n4', label: 'DB Server', x: 70, y: 40, type: 'discovered' as const },
  { id: 'n5', label: 'Admin Panel', x: 60, y: 70, type: 'threat' as const },
  { id: 'n6', label: 'Backup', x: 85, y: 60, type: 'normal' as const },
];

/* ═══════════════════════════════════════════════════════════════════════
   PARTICLES (reuse from landing)
   ═══════════════════════════════════════════════════════════════════════ */

function Particles() {
  const particles = useMemo(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 10}s`,
      duration: `${10 + Math.random() * 15}s`,
      size: `${1 + Math.random() * 2}px`,
      color: ['rgba(0,240,255,0.4)', 'rgba(191,0,255,0.3)', 'rgba(57,255,20,0.3)', 'rgba(255,0,110,0.2)'][i % 4],
    })), []);
  return (
    <div className="holo-bg">
      {particles.map((p) => (
        <div key={p.id} className="particle particle-glow" style={{ left: p.left, width: p.size, height: p.size, background: p.color, animationDelay: p.delay, animationDuration: p.duration }} />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   DASHBOARD TAB
   ═══════════════════════════════════════════════════════════════════════ */

function DashboardTab() {
  const user = DEMO_USER;
  const currentRank = RANKS.filter(r => r.min <= user.xp).pop()!;
  const nextRank = RANKS[RANKS.indexOf(currentRank) + 1];
  const xpProgress = nextRank ? ((user.xp - currentRank.min) / (nextRank.min - currentRank.min)) * 100 : 100;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="holo-card holo-shimmer rounded-2xl p-6 sm:p-8">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[#e2e8f0] mb-1">Welcome back, <span className="text-gradient-holo">{user.name}</span></h2>
            <p className="text-[#64748b]">{currentRank.icon} {currentRank.name} — Level {user.level} — {user.streakDays}-day streak 🔥</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="holo-badge holo-badge-cyan"><Zap className="h-3 w-3 mr-1" />{user.xp} XP</div>
            <div className="holo-badge holo-badge-green"><Flame className="h-3 w-3 mr-1" />{user.streakDays}d</div>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total XP', value: user.xp.toLocaleString(), icon: Zap, color: '#00f0ff' },
          { label: 'Courses', value: '2/6', icon: BookOpen, color: '#bf00ff' },
          { label: 'CTF Solved', value: '2/6', icon: Trophy, color: '#39ff14' },
          { label: 'Badges', value: '3/8', icon: Medal, color: '#ff6b35' },
        ].map(s => (
          <div key={s.label} className="stat-card-3d rounded-xl p-4" style={{ '--stat-color': s.color } as React.CSSProperties}>
            <div className="flex items-center gap-2 mb-2"><s.icon className="h-4 w-4" style={{ color: s.color }} /><span className="text-xs text-[#64748b]">{s.label}</span></div>
            <div className="text-xl font-bold text-[#e2e8f0]">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Rank Progress */}
        <div className="lg:col-span-2 holo-card rounded-2xl p-6">
          <h3 className="neon-text text-sm font-bold mb-4">RANK PROGRESSION</h3>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-4xl">{currentRank.icon}</div>
            <div>
              <div className="text-lg font-bold text-[#e2e8f0]">{currentRank.name}</div>
              <div className="text-xs text-[#64748b]">{nextRank ? `Next: ${nextRank.name} (${nextRank.min - user.xp} XP needed)` : 'Max rank!'}</div>
            </div>
          </div>
          <div className="holo-progress"><div className="holo-progress-bar" style={{ width: `${xpProgress}%` }} /></div>
          <div className="text-xs text-[#64748b] mt-1">{user.xp} / {nextRank?.min ?? user.xp} XP</div>
        </div>

        {/* Activity Timeline */}
        <div className="lg:col-span-3 holo-card rounded-2xl p-6">
          <h3 className="neon-text text-sm font-bold mb-4">RECENT ACTIVITY</h3>
          <div className="space-y-3">
            {ACTIVITY_TIMELINE.map((a, i) => (
              <div key={i} className="flex items-start gap-3 data-stream pl-4 py-1">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: 'rgba(0,240,255,0.08)' }}>
                  {a.type === 'module' && <BookOpen className="h-3.5 w-3.5 text-[#00f0ff]" />}
                  {a.type === 'ctf' && <Flag className="h-3.5 w-3.5 text-[#39ff14]" />}
                  {a.type === 'badge' && <Award className="h-3.5 w-3.5 text-[#ff6b35]" />}
                  {a.type === 'quiz' && <HelpCircle className="h-3.5 w-3.5 text-[#bf00ff]" />}
                  {a.type === 'lab' && <Terminal className="h-3.5 w-3.5 text-[#00f0ff]" />}
                  {a.type === 'enroll' && <CheckCircle2 className="h-3.5 w-3.5 text-[#39ff14]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#e2e8f0] truncate">{a.action}</p>
                  <p className="text-xs text-[#64748b]">{a.time}</p>
                </div>
                {a.xp > 0 && <span className="text-xs font-semibold text-[#39ff14]">+{a.xp} XP</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enrolled Courses Progress */}
      <div className="holo-card rounded-2xl p-6">
        <h3 className="neon-text text-sm font-bold mb-4">ENROLLED COURSES</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {COURSES.filter(c => c.enrolled).map(c => (
            <div key={c.id} className="flex items-center gap-4 p-3 rounded-xl" style={{ background: 'rgba(10,14,26,0.6)', border: '1px solid rgba(0,240,255,0.06)' }}>
              <div className="text-2xl">{c.thumbnail}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-[#e2e8f0] truncate">{c.title}</div>
                <div className="text-xs text-[#64748b] mb-2">{c.modules} modules • {c.durationHours}h</div>
                <div className="holo-progress"><div className="holo-progress-bar" style={{ width: `${c.progress}%` }} /></div>
                <div className="text-xs text-[#64748b] mt-1">{c.progress}% complete</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   COURSES TAB
   ═══════════════════════════════════════════════════════════════════════ */

function CoursesTab() {
  const [courses, setCourses] = useState(COURSES);

  const handleEnroll = useCallback((id: string) => {
    setCourses(prev => prev.map(c => c.id === id ? { ...c, enrolled: true, progress: 0 } : c));
  }, []);

  const diffColor = (d: string) => d === 'beginner' ? '#39ff14' : d === 'intermediate' ? '#ff6b35' : '#ff006e';

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map(c => (
        <motion.div key={c.id} whileHover={{ y: -4 }} className="holo-card holo-card-3d rounded-2xl p-6 flex flex-col">
          <div className="flex items-start justify-between mb-3">
            <span className="text-3xl">{c.thumbnail}</span>
            <div className="flex items-center gap-1"><Star className="h-3 w-3 text-yellow-400" /><span className="text-xs text-[#94a3b8]">{c.rating}</span></div>
          </div>
          <h3 className="text-base font-bold text-[#e2e8f0] mb-1">{c.title}</h3>
          <p className="text-xs text-[#64748b] mb-3">{c.modules} modules • {c.durationHours}h</p>
          <div className="flex gap-2 mb-4">
            <span className="holo-badge text-xs" style={{ background: 'rgba(0,240,255,0.08)', borderColor: 'rgba(0,240,255,0.2)', color: '#00f0ff' }}>{c.category}</span>
            <span className="holo-badge text-xs" style={{ background: `${diffColor(c.difficulty)}15`, borderColor: `${diffColor(c.difficulty)}30`, color: diffColor(c.difficulty) }}>{c.difficulty}</span>
          </div>
          {c.enrolled ? (
            <div className="mt-auto">
              <div className="flex justify-between text-xs text-[#64748b] mb-1"><span>Progress</span><span>{c.progress}%</span></div>
              <div className="holo-progress"><div className="holo-progress-bar" style={{ width: `${c.progress}%` }} /></div>
              <Button className="holo-btn holo-btn-primary w-full mt-3 holo-btn-sm">Continue <ArrowUpRight className="h-3 w-3 ml-1" /></Button>
            </div>
          ) : (
            <Button className="holo-btn mt-auto w-full holo-btn-sm" onClick={() => handleEnroll(c.id)}>Enroll Now</Button>
          )}
        </motion.div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   PROFESSOR TAB — ALWAYS-LISTENING
   ═══════════════════════════════════════════════════════════════════════ */

type VoiceState = 'listening' | 'standby' | 'speaking' | 'muted';

function ProfessorTab() {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: 'Hey there! I\'m Professor Shield, your cybersecurity mentor. I\'m always listening — just say **"Professor"** before your question and I\'ll respond. You can also type below. Try asking me about network security, or say **"standby"** to pause me.' },
  ]);
  const [input, setInput] = useState('');
  const [voiceState, setVoiceState] = useState<VoiceState>('standby');
  const [isProcessing, setIsProcessing] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const monitoringRef = useRef(false);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const scrollToBottom = useCallback(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, []);
  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  const speak = useCallback(async (text: string) => {
    try {
      setVoiceState('speaking');
      const res = await fetch('/api/voice/tts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        if (audioRef.current) { audioRef.current.pause(); URL.revokeObjectURL(audioRef.current.src); }
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onended = () => { setVoiceState('listening'); URL.revokeObjectURL(url); };
        audio.onerror = () => setVoiceState('listening');
        audio.play().catch(() => setVoiceState('listening'));
      } else { setVoiceState('listening'); }
    } catch { setVoiceState('listening'); }
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isProcessing) return;
    const userMsg = text.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsProcessing(true);

    if (userMsg.toLowerCase() === 'standby' || userMsg.toLowerCase() === 'mute') {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Standing by. Say **"Professor"** when you need me.' }]);
      setVoiceState('muted');
      setIsProcessing(false);
      return;
    }

    try {
      const history = messages.slice(-10).map(m => ({ role: m.role, content: m.content }));
      const res = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: DEMO_USER.id, sessionId: 'academy-session', message: userMsg, history }),
      });
      if (res.ok) {
        const reader = res.body?.getReader();
        if (reader) {
          const decoder = new TextDecoder();
          let fullText = '';
          setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            fullText += decoder.decode(value, { stream: true });
            setMessages(prev => { const copy = [...prev]; copy[copy.length - 1] = { role: 'assistant', content: fullText }; return copy; });
          }
          speak(fullText);
        }
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    }
    setIsProcessing(false);
  }, [messages, isProcessing, speak]);

  const startVoiceMonitoring = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      analyserRef.current = analyser;
      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);
      setVoiceState('listening');
      monitoringRef.current = true;

      const dataArray = new Uint8Array(analyser.fftSize);
      const THRESHOLD = 15;
      const monitor = () => {
        if (!monitoringRef.current) return;
        analyser.getByteTimeDomainData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) { const v = (dataArray[i] - 128) / 128; sum += v * v; }
        const rms = Math.sqrt(sum / dataArray.length) * 100;
        if (rms > THRESHOLD && !mediaRecorderRef.current?.state?.includes('activ') && voiceState !== 'speaking' && voiceState !== 'muted') {
          if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
            chunksRef.current = [];
            const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            mediaRecorderRef.current = mr;
            mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
            mr.onstop = async () => {
              if (chunksRef.current.length > 0 && voiceState !== 'muted') {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                const fd = new FormData(); fd.append('audio', blob);
                try {
                  const asrRes = await fetch('/api/voice/asr', { method: 'POST', body: fd });
                  const asrData = await asrRes.json();
                  if (asrData.text) {
                    let text = asrData.text;
                    if (text.toLowerCase().includes('professor')) {
                      text = text.replace(/professor/gi, '').trim();
                      if (text) sendMessage(text);
                      else setVoiceState('listening');
                    }
                  }
                } catch { /* silently fail */ }
              }
            };
            mr.start();
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          }
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => { if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop(); }, 1500);
        }
        requestAnimationFrame(monitor);
      };
      monitor();
    } catch { setVoiceState('muted'); }
  }, [voiceState, sendMessage]);

  useEffect(() => { startVoiceMonitoring(); return () => { monitoringRef.current = false; streamRef.current?.getTracks().forEach(t => t.stop()); audioCtxRef.current?.close(); if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current); }; }, []);

  const toggleMute = useCallback(() => {
    if (voiceState === 'muted') { startVoiceMonitoring(); }
    else { monitoringRef.current = false; streamRef.current?.getTracks().forEach(t => t.stop()); setVoiceState('muted'); }
  }, [voiceState, startVoiceMonitoring]);

  const stateConfig = {
    listening: { label: 'Listening', color: '#39ff14', orbClass: 'professor-orb-listening' },
    standby: { label: 'Standby', color: '#ff6b35', orbClass: 'professor-orb-standby' },
    speaking: { label: 'Speaking', color: '#bf00ff', orbClass: 'professor-orb-speaking' },
    muted: { label: 'Muted', color: '#64748b', orbClass: 'professor-orb-muted' },
  };
  const st = stateConfig[voiceState];

  return (
    <div className="flex flex-col h-[calc(100vh-180px)]">
      <div className="holo-card rounded-2xl flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <Brain className="h-5 w-5 text-[var(--color-holo)]" />
            <h3 className="font-bold text-[#e2e8f0]">Professor Shield</h3>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${st.color}20`, color: st.color, border: `1px solid ${st.color}40` }}>{st.label}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleMute} className="flex h-8 w-8 items-center justify-center rounded-lg transition-all hover:scale-110" style={{ background: 'rgba(0,240,255,0.08)' }} aria-label="Toggle mic">
              {voiceState === 'muted' ? <MicOff className="h-4 w-4 text-[#64748b]" /> : <Mic className="h-4 w-4 text-[var(--color-holo)]" />}
            </button>
            {voiceState === 'speaking' && <button onClick={() => { audioRef.current?.pause(); setVoiceState('listening'); }} className="flex h-8 w-8 items-center justify-center rounded-lg transition-all hover:scale-110" style={{ background: 'rgba(191,0,255,0.08)' }} aria-label="Stop speaking"><VolumeX className="h-4 w-4 text-[#bf00ff]" /></button>}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence>
            {messages.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`chat-msg-enter flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${m.role === 'user' ? 'rounded-br-md' : 'rounded-bl-md'}`} style={{ background: m.role === 'user' ? 'rgba(191,0,255,0.12)' : 'rgba(0,240,255,0.06)', border: m.role === 'user' ? '1px solid rgba(191,0,255,0.15)' : '1px solid rgba(0,240,255,0.08)' }}>
                  {m.role === 'assistant' && <div className="text-xs font-bold text-[var(--color-holo)] mb-1">Professor</div>}
                  <div className="text-[#e2e8f0]" style={{ whiteSpace: 'pre-wrap' }}>{m.content || <span className="animate-pulse">▊</span>}</div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/5">
          <form onSubmit={e => { e.preventDefault(); sendMessage(input); }} className="flex gap-2">
            <input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask Professor anything... or say 'Professor' to use voice" className="holo-input flex-1 rounded-lg px-4 py-2.5 text-sm text-[#e2e8f0] placeholder:text-[#475569]" />
            <Button type="submit" disabled={isProcessing || !input.trim()} className="holo-btn holo-btn-primary holo-btn-sm"><Send className="h-4 w-4" /></Button>
          </form>
        </div>
      </div>

      {/* Floating Orb */}
      <div className={`professor-orb ${st.orbClass}`} onClick={toggleMute}>
        {voiceState === 'listening' && <div className="voice-waveform"><span /><span /><span /><span /><span /></div>}
        {voiceState === 'speaking' && <Volume2 className="h-5 w-5 text-white" />}
        {voiceState === 'standby' && <Mic className="h-5 w-5 text-[#64748b]" />}
        {voiceState === 'muted' && <MicOff className="h-5 w-5 text-[#475569]" />}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   QUIZZES TAB
   ═══════════════════════════════════════════════════════════════════════ */

function QuizzesTab() {
  const [started, setStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [timeLeft, setTimeLeft] = useState(DEMO_QUIZ.timeLimit);
  const [finished, setFinished] = useState(false);
  const quiz = DEMO_QUIZ;
  const q = quiz.questions[currentQ];

  useEffect(() => {
    if (!started || finished) return;
    const timer = setInterval(() => { setTimeLeft(t => { if (t <= 1) { clearInterval(timer); setFinished(true); return 0; } return t - 1; }); }, 1000);
    return () => clearInterval(timer);
  }, [started, finished]);

  const handleAnswer = useCallback((option: string) => {
    if (answered) return;
    setSelected(option);
    setAnswered(true);
    if (option === q.correct) setScore(s => s + q.points);
  }, [answered, q]);

  const nextQuestion = useCallback(() => {
    if (currentQ < quiz.questions.length - 1) { setCurrentQ(c => c + 1); setSelected(null); setAnswered(false); setShowHint(false); }
    else setFinished(true);
  }, [currentQ, quiz.questions.length]);

  if (!started) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="holo-card rounded-2xl p-8 text-center">
          <HelpCircle className="h-12 w-12 text-[var(--color-holo)] mx-auto mb-4" />
          <h3 className="text-xl font-bold text-[#e2e8f0] mb-2">{quiz.title}</h3>
          <p className="text-[#64748b] mb-1">{quiz.questions.length} questions • {quiz.timeLimit / 60} minutes</p>
          <p className="text-xs text-[#64748b] mb-6">Hints cost -25 XP each</p>
          <Button onClick={() => setStarted(true)} className="holo-btn holo-btn-primary"><Play className="h-4 w-4 mr-2" />Start Quiz</Button>
        </div>
      </div>
    );
  }

  if (finished) {
    const pct = Math.round((score / (quiz.questions.reduce((a, q) => a + q.points, 0))) * 100);
    return (
      <div className="max-w-lg mx-auto">
        <div className="holo-card rounded-2xl p-8 text-center neon-border-animated">
          <div className="text-5xl mb-4">{pct >= 70 ? '🎉' : '💪'}</div>
          <h3 className="text-2xl font-bold text-[#e2e8f0] mb-2">{pct >= 70 ? 'Passed!' : 'Keep Practicing!'}</h3>
          <div className="text-3xl font-bold text-gradient-holo mb-1">{score} / {quiz.questions.reduce((a, q) => a + q.points, 0)}</div>
          <p className="text-[#64748b] mb-6">{pct}% accuracy</p>
          <Button onClick={() => { setStarted(false); setCurrentQ(0); setScore(0); setFinished(false); setTimeLeft(quiz.timeLimit); }} className="holo-btn holo-btn-primary"><RefreshCw className="h-4 w-4 mr-2" />Retake</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="holo-card rounded-2xl p-6">
        {/* Progress bar */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-[#64748b]">Question {currentQ + 1}/{quiz.questions.length}</span>
          <div className="flex items-center gap-2"><Clock className="h-3.5 w-3.5 text-[#ff6b35]" /><span className={`text-sm font-mono ${timeLeft < 60 ? 'text-[#ff006e]' : 'text-[#e2e8f0]'}`}>{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</span></div>
        </div>
        <div className="holo-progress mb-6"><div className="holo-progress-bar" style={{ width: `${((currentQ + 1) / quiz.questions.length) * 100}%` }} /></div>

        {/* Question */}
        <h3 className="text-lg font-semibold text-[#e2e8f0] mb-6">{q.text}</h3>

        {/* Options */}
        <div className="space-y-3 mb-4">
          {q.options.map(opt => {
            let cls = 'holo-card rounded-xl p-4 cursor-pointer transition-all ';
            if (answered) {
              if (opt === q.correct) cls += 'border-[#39ff14] ';
              else if (opt === selected) cls += 'border-[#ff006e] ';
            } else if (opt === selected) cls += 'border-[var(--color-holo)] ';
            return (
              <div key={opt} onClick={() => handleAnswer(opt)} className={cls}>
                <div className="flex items-center gap-3">
                  <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${answered && opt === q.correct ? 'border-[#39ff14] bg-[#39ff14]' : answered && opt === selected ? 'border-[#ff006e] bg-[#ff006e]' : 'border-[#64748b]'}`}>
                    {answered && opt === q.correct && <CheckCircle2 className="h-3 w-3 text-[#050810]" />}
                    {answered && opt === selected && opt !== q.correct && <XCircle className="h-3 w-3 text-[#050810]" />}
                  </div>
                  <span className="text-sm text-[#e2e8f0]">{opt}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Hint */}
        {!showHint && !answered && <button onClick={() => setShowHint(true)} className="flex items-center gap-1 text-xs text-[#ff6b35] hover:text-[#ff6b35]/80 mb-3"><Lightbulb className="h-3 w-3" />Reveal hint <span className="hint-cost-badge">-25 XP</span></button>}
        {showHint && <div className="text-sm text-[#ff6b35] bg-[rgba(255,107,53,0.08)] border border-[rgba(255,107,53,0.15)] rounded-lg p-3 mb-4">💡 {q.explanation}</div>}

        {/* Explanation after answer */}
        {answered && <div className={`text-sm rounded-lg p-3 mb-4 ${selected === q.correct ? 'bg-[rgba(57,255,20,0.08)] border border-[rgba(57,255,20,0.15)] text-[#39ff14]' : 'bg-[rgba(255,0,110,0.08)] border border-[rgba(255,0,110,0.15)] text-[#ff006e]'}`}>
          {selected === q.correct ? '✓ Correct! ' : '✗ Incorrect. '}{q.explanation}
        </div>}

        {/* Next button */}
        {answered && <Button onClick={nextQuestion} className="holo-btn holo-btn-primary w-full">{currentQ < quiz.questions.length - 1 ? 'Next Question' : 'See Results'} <ChevronRight className="h-4 w-4 ml-1" /></Button>}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   LAB TERMINAL TAB — FUTURISTIC HACKING ENVIRONMENT
   ═══════════════════════════════════════════════════════════════════════ */

function LabsTab() {
  const [selectedLab, setSelectedLab] = useState<typeof LAB_SCENARIOS[0] | null>(null);
  const [termLines, setTermLines] = useState<string[]>(['<span class="text-[#39ff14]">CyberShield Lab Terminal v3.0</span>', '<span class="text-[#64748b]">Type \'help\' for available commands. Select a lab scenario to begin.</span>', '']);
  const [cmdInput, setCmdInput] = useState('');
  const [objectives, setObjectives] = useState(selectedLab?.objectives ?? []);
  const [labDone, setLabDone] = useState(false);
  const [agentMsg, setAgentMsg] = useState('Select a lab scenario and start typing commands. The AI Lab Agent will assist you.');
  const [gauges, setGauges] = useState({ cpu: 23, mem: 41, net: 67 });
  const [typing, setTyping] = useState(false);
  const termRef = useRef<HTMLDivElement>(null);
  const [termRipple, setTermRipple] = useState(false);

  useEffect(() => { if (selectedLab) { setObjectives(selectedLab.objectives.map(o => ({ ...o, completed: false }))); setLabDone(false); setAgentMsg('Lab started! Begin by running reconnaissance commands.'); setTermLines(['<span class="text-[#39ff14]">CyberShield Lab Terminal v3.0</span>', `<span class="text-[var(--color-holo)]">╔════════════════════════════════════════════════════╗</span>`, `<span class="text-[var(--color-holo)]">║  LAB: ${selectedLab.title}</span>`, `<span class="text-[var(--color-holo)]">║  DIFFICULTY: ${selectedLab.difficulty.toUpperCase()}</span>`, `<span class="text-[var(--color-holo)]">╚════════════════════════════════════════════════════╝</span>`, '']); } }, [selectedLab]);
  useEffect(() => { termRef.current?.scrollTo(0, termRef.current.scrollHeight); }, [termLines]);
  useEffect(() => { const iv = setInterval(() => { setGauges(g => ({ cpu: Math.max(5, Math.min(95, g.cpu + (Math.random() - 0.5) * 10)), mem: Math.max(10, Math.min(90, g.mem + (Math.random() - 0.5) * 6)), net: Math.max(5, Math.min(99, g.net + (Math.random() - 0.5) * 15)) })); }, 2000); return () => clearInterval(iv); }, []);

  const handleCmd = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!cmdInput.trim()) return;
    const cmd = cmdInput.trim();
    setCmdInput('');
    setTyping(false);
    setTermRipple(true);
    setTimeout(() => setTermRipple(false), 600);
    const prompt = '<span class="text-[#39ff14]">root@cybershield</span>:<span class="text-[#0080ff]">~</span># ';
    let output = '';
    if (cmd === 'help') { output = 'Available: ls, cd, cat, pwd, whoami, id, ifconfig, nmap, ping, curl, netstat, ss, ps, uname, clear, help'; }
    else if (cmd === 'clear') { setTermLines([]); return; }
    else if (cmd === 'whoami' || cmd === 'id') { output = cmd === 'whoami' ? 'root' : 'uid=0(root) gid=0(root) groups=0(root)'; }
    else if (cmd === 'pwd') { output = '/root'; }
    else if (cmd === 'uname -a') { output = 'Linux cybershield-lab 5.15.0-csa #1 SMP x86_64 GNU/Linux'; }
    else if (cmd === 'ifconfig' || cmd === 'ip addr') { output = 'eth0: 10.0.0.1/24  <span class="text-[#39ff14]">UP</span>\nlo: 127.0.0.1/8  <span class="text-[#39ff14]">UP</span>'; }
    else if (cmd.startsWith('nmap')) { output = '<span class="text-[#ff6b35]">Starting Nmap 7.94...</span>\nDiscovered open port 22/tcp on 10.0.0.50\nDiscovered open port 80/tcp on 10.0.0.50\nDiscovered open port 3306/tcp on 10.0.0.50\n<span class="text-[#39ff14]">Nmap done: 1 IP address (1 host up) scanned</span>'; if (objectives.length > 0) { setObjectives(prev => { const n = [...prev]; if (n[0]) n[0] = { ...n[0], completed: true }; return n; }); } }
    else if (cmd.startsWith('ping')) { output = 'PING 10.0.0.50 (10.0.0.50): 56 data bytes\n64 bytes from 10.0.0.50: icmp_seq=0 ttl=64 time=0.5ms\n64 bytes from 10.0.0.50: icmp_seq=1 ttl=64 time=0.3ms'; }
    else if (cmd === 'ls') { output = 'desktop.txt  notes.md  targets.conf  exploits/  tools/  flag.txt'; }
    else if (cmd === 'cat flag.txt') { output = '<span class="text-[#39ff14]">CSA{lab_objective_complete}</span>'; }
    else { output = `<span class="text-[#ff006e]">bash: ${cmd}: command not found (simulated environment)</span>`; }
    setTermLines(prev => [...prev, prompt + escapeHtml(cmd), ...output.split('\n')]);
    // Check all objectives
    setTimeout(() => {
      setObjectives(prev => {
        if (prev.every(o => o.completed) && !labDone) { setLabDone(true); return prev; }
        return prev;
      });
    }, 100);
  }, [cmdInput, objectives, labDone]);

  const askAgent = useCallback(async () => {
    if (!selectedLab) return;
    try {
      const res = await fetch('/api/labs/agent', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ labTitle: selectedLab.title, labCategory: selectedLab.category, labDifficulty: selectedLab.difficulty, currentObjectives: objectives, terminalHistory: termLines.slice(-10), labSteps: selectedLab.objectives.map(o => o.description), userLevel: DEMO_USER.level, userXp: DEMO_USER.xp }),
      });
      if (res.ok) { const data = await res.json(); setAgentMsg(data.guidance || data.hint || 'Analyze your terminal output and try different approaches.'); }
    } catch { setAgentMsg('Lab agent encountered an error. Try again.'); }
  }, [selectedLab, objectives, termLines]);

  const Gauge = ({ value, label, color }: { value: number; label: string; color: string }) => {
    const r = 24; const c = 2 * Math.PI * r; const offset = c - (value / 100) * c;
    return (
      <div className="lab-gauge flex flex-col items-center">
        <svg viewBox="0 0 60 60" className="w-full h-full -rotate-90">
          <circle cx="30" cy="30" r={r} className="lab-gauge-ring" /><circle cx="30" cy="30" r={r} className="lab-gauge-fill" style={{ strokeDasharray: c, strokeDashoffset: offset, stroke: color }} />
        </svg>
        <span className="absolute text-xs font-bold text-[#e2e8f0]" style={{ top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}>{Math.round(value)}%</span>
      </div>
    );
  };

  return (
    <div className="grid lg:grid-cols-3 gap-4 h-[calc(100vh-180px)]">
      {/* Terminal (2/3) */}
      <div className="lg:col-span-2 flex flex-col">
        <div className={`holo-terminal flex-1 flex flex-col ${termRipple ? 'terminal-ripple-active' : ''} ${typing ? 'typing-glow' : ''}`}>
          <div className="holo-terminal-header">
            <div className="holo-terminal-dot" style={{ background: '#ff5f57' }} /><div className="holo-terminal-dot" style={{ background: '#ffbd2e' }} /><div className="holo-terminal-dot" style={{ background: '#28c840' }} />
            <span className="ml-3 text-xs text-[#64748b]">root@cybershield-lab</span>
            <div className="flex-1" />
            <div className="matrix-rain w-32 h-5 rounded overflow-hidden relative"><div className="matrix-column" style={{ left: '10%', animationDuration: '3s', fontSize: '8px', opacity: 0.6 }}>01A0F</div><div className="matrix-column" style={{ left: '40%', animationDuration: '4s', fontSize: '8px', opacity: 0.4, animationDelay: '1s' }}>FF00</div></div>
          </div>
          <div ref={termRef} className="holo-terminal-body matrix-bg flex-1 relative">
            {termLines.map((line, i) => <div key={i} className="leading-relaxed" dangerouslySetInnerHTML={{ __html: line || '&nbsp;' }} />)}
            {/* Input line */}
            <form onSubmit={handleCmd} className="flex items-center gap-2 mt-1">
              <span><span className="text-[#39ff14]">root@cybershield</span>:<span className="text-[#0080ff]">~</span># </span>
              <input value={cmdInput} onChange={e => { setCmdInput(e.target.value); setTyping(true); }} onKeyDown={() => setTyping(false)} className="flex-1 bg-transparent border-none outline-none text-[#e2e8f0] text-sm font-mono caret-[#00f0ff]" autoFocus spellCheck={false} />
            </form>
            {/* Mission complete overlay */}
            <AnimatePresence>{labDone && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mission-complete-overlay"><div className="text-center"><div className="mission-complete-text">MISSION COMPLETE</div><p className="text-[#94a3b8] mt-3">All objectives completed! +200 XP earned</p><Button onClick={() => setLabDone(false)} className="holo-btn holo-btn-primary mt-4 holo-btn-sm">Continue</Button></div></motion.div>)}</AnimatePresence>
          </div>
        </div>
      </div>

      {/* HUD Panel (1/3) */}
      <div className="flex flex-col gap-4 overflow-y-auto">
        {/* Scenario Selector */}
        <div className="lab-hud">
          <div className="lab-hud-header">SELECT SCENARIO</div>
          <div className="p-3">
            <select value={selectedLab?.id ?? ''} onChange={e => setSelectedLab(LAB_SCENARIOS.find(l => l.id === e.target.value) ?? null)} className="holo-input w-full rounded-lg px-3 py-2 text-xs text-[#e2e8f0] appearance-none" style={{ background: 'rgba(5,8,16,0.8)' }}>
              <option value="">-- Choose Lab --</option>
              {LAB_SCENARIOS.map(l => <option key={l.id} value={l.id}>{l.title} ({l.difficulty})</option>)}
            </select>
          </div>
        </div>

        {/* System Monitors */}
        <div className="lab-hud">
          <div className="lab-hud-header">SYSTEM MONITORS</div>
          <div className="p-3 grid grid-cols-3 gap-2">
            <div className="relative"><Gauge value={gauges.cpu} label="CPU" color="#00f0ff" /><div className="text-center text-[10px] text-[#64748b] mt-1">CPU</div></div>
            <div className="relative"><Gauge value={gauges.mem} label="MEM" color="#bf00ff" /><div className="text-center text-[10px] text-[#64748b] mt-1">MEM</div></div>
            <div className="relative"><Gauge value={gauges.net} label="NET" color="#39ff14" /><div className="text-center text-[10px] text-[#64748b] mt-1">NET</div></div>
          </div>
        </div>

        {/* Objectives */}
        {selectedLab && (
          <div className="lab-hud">
            <div className="lab-hud-header">OBJECTIVES ({objectives.filter(o => o.completed).length}/{objectives.length})</div>
            <div className="p-2 space-y-1">
              {objectives.map((o, i) => (
                <div key={o.id} className={`lab-hud-objective ${o.completed ? 'lab-hud-objective-completed' : i === objectives.findIndex(x => !x.completed) ? 'lab-hud-objective-active' : ''} text-xs text-[#94a3b8]`}>                {o.completed ? '✓ ' : '○ '}{o.description}</div>
              ))}
            </div>
          </div>
        )}

        {/* Network Map */}
        <div className="lab-hud">
          <div className="lab-hud-header">NETWORK MAP</div>
          <div className="p-3 relative" style={{ height: '160px' }}>
            {/* Connection lines (SVG) */}
            <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
              <line x1="10%" y1="50%" x2="30%" y2="30%" stroke="rgba(0,240,255,0.15)" strokeWidth="1" />
              <line x1="30%" y1="30%" x2="50%" y2="20%" stroke="rgba(0,240,255,0.15)" strokeWidth="1" />
              <line x1="50%" y1="20%" x2="70%" y2="40%" stroke="rgba(0,240,255,0.15)" strokeWidth="1" />
              <line x1="50%" y1="20%" x2="60%" y2="70%" stroke="rgba(255,0,110,0.2)" strokeWidth="1" strokeDasharray="4" />
              <line x1="70%" y1="40%" x2="85%" y2="60%" stroke="rgba(0,240,255,0.15)" strokeWidth="1" />
            </svg>
            {NETWORK_NODES.map(n => (
              <div key={n.id} className={`network-node network-node-${n.type}`} style={{ left: `${n.x}%`, top: `${n.y}%`, transform: 'translate(-50%,-50%)' }}>
                <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] text-[#64748b] whitespace-nowrap">{n.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Agent */}
        <div className="lab-hud">
          <div className="lab-hud-header">AI LAB AGENT</div>
          <div className="p-3">
            <p className="text-xs text-[#94a3b8] leading-relaxed mb-3">{agentMsg}</p>
            <Button onClick={askAgent} className="holo-btn holo-btn-sm w-full"><Brain className="h-3 w-3 mr-1" />Ask Lab Agent</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function escapeHtml(s: string) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

/* ═══════════════════════════════════════════════════════════════════════
   CTF ARENA TAB
   ═══════════════════════════════════════════════════════════════════════ */

function CtfTab() {
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [flagInput, setFlagInput] = useState('');
  const [hintShown, setHintShown] = useState<Set<string>>(new Set());
  const [results, setResults] = useState<Record<string, 'correct' | 'wrong' | null>>({});

  const categories = ['all', 'crypto', 'web', 'pwn', 'forensics', 'osint', 'reverse'];
  const filtered = filter === 'all' ? CTF_CHALLENGES : CTF_CHALLENGES.filter(c => c.category === filter);
  const catIcons: Record<string, string> = { crypto: 'cat-crypto', web: 'cat-web', pwn: 'cat-pwn', forensics: 'cat-forensics', osint: 'cat-osint', reverse: 'cat-reverse' };

  const submitFlag = useCallback((challenge: typeof CTF_CHALLENGES[0]) => {
    if (!flagInput.trim()) return;
    setResults(prev => ({ ...prev, [challenge.id]: flagInput.trim() === challenge.flag ? 'correct' : 'wrong' }));
  }, [flagInput]);

  return (
    <div className="space-y-4">
      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map(cat => (
          <button key={cat} onClick={() => setFilter(cat)} className={`holo-btn holo-btn-sm ${filter === cat ? 'holo-btn-primary' : ''}`}>{cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}</button>
        ))}
      </div>

      {/* Challenge grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(ch => {
          const isOpen = expanded === ch.id;
          const result = results[ch.id];
          return (
            <motion.div key={ch.id} layout className={`challenge-card holo-card rounded-2xl p-5 ${ch.solved ? 'border-[rgba(57,255,20,0.2)]' : ''}`}>
              <div className="flex items-start justify-between mb-3">
                <div className={`text-xs font-bold uppercase ${catIcons[ch.category] || ''}`}>{ch.category}</div>
                <span className={`holo-badge text-[10px] ctf-difficulty-${ch.difficulty}`}>{ch.difficulty}</span>
              </div>
              <h4 className={`font-bold text-[#e2e8f0] mb-2 ${ch.solved ? 'line-through opacity-60' : ''}`}>{ch.title}</h4>
              <div className="flex items-center gap-3 text-xs text-[#64748b] mb-3">
                <span className="flex items-center gap-1"><Flag className="h-3 w-3" />{ch.points} pts</span>
                <span className="flex items-center gap-1"><Users className="h-3 w-3" />{ch.solveCount} solves</span>
              </div>

              <button onClick={() => setExpanded(isOpen ? null : ch.id)} className="text-xs text-[var(--color-holo)] hover:underline flex items-center gap-1">
                {isOpen ? 'Hide' : 'View Details'} <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="pt-3 mt-3 border-t border-white/5">
                      <p className="text-xs text-[#94a3b8] leading-relaxed mb-3">{ch.description}</p>

                      {/* Hint */}
                      {!hintShown.has(ch.id) && <button onClick={() => setHintShown(prev => new Set(prev).add(ch.id))} className="flex items-center gap-1 text-xs text-[#ff6b35] hover:text-[#ff6b35]/80 mb-3"><Lightbulb className="h-3 w-3" />Show Hint <span className="hint-cost-badge">-50 XP</span></button>}
                      {hintShown.has(ch.id) && <div className="text-xs text-[#ff6b35] bg-[rgba(255,107,53,0.08)] border border-[rgba(255,107,53,0.15)] rounded-lg p-2 mb-3">💡 {ch.hint}</div>}

                      {/* Flag submission */}
                      {result === 'correct' ? (
                        <div className="text-sm font-bold text-[#39ff14] flex items-center gap-2"><CheckCircle2 className="h-4 w-4" />Correct! +{ch.points} XP</div>
                      ) : (
                        <div className="flex gap-2">
                          <input value={flagInput} onChange={e => setFlagInput(e.target.value)} placeholder="CSA{...}" className="holo-input flex-1 rounded-lg px-3 py-1.5 text-xs text-[#e2e8f0] font-mono placeholder:text-[#475569]" onKeyDown={e => { if (e.key === 'Enter') submitFlag(ch); }} />
                          <Button onClick={() => submitFlag(ch)} className="holo-btn holo-btn-primary holo-btn-sm">Submit</Button>
                        </div>
                      )}
                      {result === 'wrong' && <p className="text-xs text-[#ff006e] mt-2">Incorrect flag. Try again!</p>}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {ch.solved && <div className="absolute top-3 right-3 holo-badge holo-badge-green text-[10px]">Solved ✓</div>}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   RANK & BADGES TAB
   ═══════════════════════════════════════════════════════════════════════ */

function RanksTab() {
  const user = DEMO_USER;
  const currentRank = RANKS.filter(r => r.min <= user.xp).pop()!;
  const nextRank = RANKS[RANKS.indexOf(currentRank) + 1];
  const xpProgress = nextRank ? ((user.xp - currentRank.min) / (nextRank.min - currentRank.min)) * 100 : 100;

  return (
    <div className="space-y-6">
      {/* Current Rank Card */}
      <div className="holo-card holo-shimmer rounded-2xl p-6 sm:p-8 neon-border-animated">
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
          <div className="text-6xl">{currentRank.icon}</div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-2xl font-bold text-[#e2e8f0] mb-1">{currentRank.name}</h3>
            <p className="text-[#64748b] mb-3">Level {user.level} • {user.xp.toLocaleString()} XP • {user.streakDays}-day streak</p>
            <div className="max-w-md">
              <div className="flex justify-between text-xs text-[#64748b] mb-1"><span>{user.xp} XP</span><span>{nextRank ? `${nextRank.min} XP — ${nextRank.name}` : 'MAX RANK'}</span></div>
              <div className="holo-progress"><div className="holo-progress-bar" style={{ width: `${xpProgress}%` }} /></div>
            </div>
          </div>
        </div>
      </div>

      {/* Badges */}
      <div>
        <h3 className="neon-text text-sm font-bold mb-4">BADGE COLLECTION ({BADGES.filter(b => b.earned).length}/{BADGES.length})</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {BADGES.map(b => {
            const rarityClass = b.rarity === 'legendary' ? 'hex-badge-legendary' : b.rarity === 'epic' ? 'hex-badge-epic' : b.rarity === 'rare' ? 'hex-badge-rare' : 'hex-badge-common';
            return (
              <div key={b.id} className={`flex flex-col items-center gap-2 ${!b.earned ? 'opacity-40' : ''}`}>
                <div className={`hex-badge ${rarityClass} ${b.earned ? '' : 'grayscale'}`}>{b.icon}</div>
                <div className="text-center">
                  <div className="text-xs font-semibold text-[#e2e8f0]">{b.name}</div>
                  <div className="text-[10px] text-[#64748b]">{b.rarity} • +{b.xpReward} XP</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="holo-card rounded-2xl p-6">
        <h3 className="neon-text text-sm font-bold mb-4">LEADERBOARD</h3>
        <div className="space-y-1">
          {LEADERBOARD.map(entry => (
            <div key={entry.rank} className={`leaderboard-row flex items-center gap-4 px-4 py-3 rounded-lg ${entry.name === user.name ? 'bg-[rgba(0,240,255,0.05)]' : ''}`}>
              <div className={`w-8 text-center font-bold text-sm ${entry.rank <= 3 ? `rank-${entry.rank}` : 'text-[#64748b]'}`}>{entry.rank}</div>
              <div className="flex-1 text-sm text-[#e2e8f0]">{entry.name} {entry.name === user.name && <span className="text-xs text-[var(--color-holo)]">(you)</span>}</div>
              <div className="text-xs text-[#64748b]">Lv.{entry.level}</div>
              <div className="text-sm font-semibold text-[var(--color-holo)]">{entry.xp.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   ANALYTICS TAB
   ═══════════════════════════════════════════════════════════════════════ */

function AnalyticsTab() {
  const skills = [
    { name: 'Network', value: 75 }, { name: 'Crypto', value: 45 },
    { name: 'Web Sec', value: 60 }, { name: 'Pen Test', value: 30 },
    { name: 'Forensics', value: 55 }, { name: 'Cloud', value: 20 },
  ];

  // Heatmap data: 7 days × 6 time slots
  const heatmap = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const slots = ['Morning', 'Afternoon', 'Evening', 'Night', 'Late Night', 'Dawn'];
    return days.map(day => ({ day, slots: slots.map(() => Math.random()) }));
  }, []);

  const xpData = useMemo(() => [120, 85, 200, 150, 300, 175, 250], []);
  const maxXP = Math.max(...xpData);

  // SVG radar chart
  const radarSize = 220;
  const radarCx = radarSize / 2;
  const radarCy = radarSize / 2;
  const radarR = 90;
  const angleStep = (2 * Math.PI) / skills.length;
  const radarPoints = skills.map((s, i) => {
    const angle = angleStep * i - Math.PI / 2;
    const r = (s.value / 100) * radarR;
    return { x: radarCx + r * Math.cos(angle), y: radarCy + r * Math.sin(angle) };
  });
  const radarPath = radarPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + ' Z';

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Skill Radar */}
        <div className="holo-card rounded-2xl p-6">
          <h3 className="neon-text text-sm font-bold mb-4">SKILL RADAR</h3>
          <div className="flex justify-center">
            <svg width={radarSize} height={radarSize} viewBox={`0 0 ${radarSize} ${radarSize}`}>
              {/* Grid rings */}
              {[0.25, 0.5, 0.75, 1].map(r => {
                const pts = skills.map((_, i) => {
                  const a = angleStep * i - Math.PI / 2;
                  return { x: radarCx + radarR * r * Math.cos(a), y: radarCy + radarR * r * Math.sin(a) };
                });
                return <polygon key={r} points={pts.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke="rgba(0,240,255,0.08)" strokeWidth="1" />;
              })}
              {/* Axes */}
              {skills.map((_, i) => {
                const a = angleStep * i - Math.PI / 2;
                return <line key={i} x1={radarCx} y1={radarCy} x2={radarCx + radarR * Math.cos(a)} y2={radarCy + radarR * Math.sin(a)} stroke="rgba(0,240,255,0.06)" strokeWidth="1" />;
              })}
              {/* Data polygon */}
              <polygon points={radarPath} fill="rgba(0,240,255,0.1)" stroke="#00f0ff" strokeWidth="2" />
              {/* Data points & labels */}
              {skills.map((s, i) => {
                const a = angleStep * i - Math.PI / 2;
                const lx = radarCx + (radarR + 18) * Math.cos(a);
                const ly = radarCy + (radarR + 18) * Math.sin(a);
                return (<g key={i}><circle cx={radarPoints[i].x} cy={radarPoints[i].y} r="4" fill="#00f0ff" filter="url(#glow)" /><text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fill="#94a3b8" fontSize="10">{s.name} {s.value}%</text></g>);
              })}
              <defs><filter id="glow"><feGaussianBlur stdDeviation="3" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
            </svg>
          </div>
        </div>

        {/* XP Over Time */}
        <div className="holo-card rounded-2xl p-6">
          <h3 className="neon-text text-sm font-bold mb-4">XP EARNED (LAST 7 DAYS)</h3>
          <div className="flex items-end gap-3 h-48">
            {xpData.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="text-xs font-bold text-[var(--color-holo)]">{v}</div>
                <div className="w-full rounded-t-md transition-all duration-500" style={{ height: `${(v / maxXP) * 160}px`, background: 'linear-gradient(180deg, #00f0ff, #0080ff)', borderRadius: '4px 4px 0 0', boxShadow: '0 0 15px rgba(0,240,255,0.2)' }} />
                <div className="text-[10px] text-[#64748b]">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Study Heatmap */}
      <div className="holo-card rounded-2xl p-6">
        <h3 className="neon-text text-sm font-bold mb-4">STUDY HEATMAP</h3>
        <div className="overflow-x-auto">
          <div className="grid gap-1" style={{ gridTemplateColumns: '60px repeat(6, 1fr)' }}>
            <div /> {/* header spacer */}
            {['Morning', 'Afternoon', 'Evening', 'Night', 'Late', 'Dawn'].map(s => <div key={s} className="text-[10px] text-[#64748b] text-center">{s}</div>)}
            {heatmap.map(row => (
              <React.Fragment key={row.day}>
                <div className="text-xs text-[#94a3b8] flex items-center">{row.day}</div>
                {row.slots.map((v, si) => (
                  <div key={si} className="h-8 rounded" style={{ background: `rgba(0,240,255,${v * 0.8 + 0.05})`, border: '1px solid rgba(0,240,255,0.05)' }} title={`${Math.round(v * 100)}% activity`} />
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3 text-[10px] text-[#64748b]"><span>Less</span><div className="flex gap-1">{[0.05, 0.25, 0.45, 0.65, 0.85].map(v => <div key={v} className="w-4 h-4 rounded" style={{ background: `rgba(0,240,255,${v})` }} />)}</div><span>More</span></div>
      </div>

      {/* Quick Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="stat-card-3d rounded-xl p-4" style={{ '--stat-color': '#39ff14' } as React.CSSProperties}><div className="text-xs text-[#64748b] mb-1">Quiz Accuracy</div><div className="text-2xl font-bold text-[#39ff14]">85%</div><TrendingUp className="h-4 w-4 text-[#39ff14] mt-1" /></div>
        <div className="stat-card-3d rounded-xl p-4" style={{ '--stat-color': '#00f0ff' } as React.CSSProperties}><div className="text-xs text-[#64748b] mb-1">Time Spent</div><div className="text-2xl font-bold text-[var(--color-holo)]">42h</div><Clock className="h-4 w-4 text-[var(--color-holo)] mt-1" /></div>
        <div className="stat-card-3d rounded-xl p-4" style={{ '--stat-color': '#ff6b35' } as React.CSSProperties}><div className="text-xs text-[#64748b] mb-1">Focus Score</div><div className="text-2xl font-bold text-[#ff6b35]">78%</div><Activity className="h-4 w-4 text-[#ff6b35] mt-1" /></div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   CERTIFICATES TAB
   ═══════════════════════════════════════════════════════════════════════ */

function CertificatesTab() {
  const certs = [
    { id: 'cert1', courseName: 'Network Security Fundamentals', issuedAt: '2026-06-15', hash: 'SHA256:a4f3b2c1...', status: 'active' as const },
  ];
  const completedCourses = COURSES.filter(c => c.enrolled && c.progress >= 100);

  return (
    <div className="space-y-6">
      {certs.length > 0 && (
        <div>
          <h3 className="neon-text text-sm font-bold mb-4">YOUR CERTIFICATES</h3>
          <div className="grid sm:grid-cols-2 gap-6">
            {certs.map(cert => (
              <div key={cert.id} className="certificate-card p-6">
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4"><Award className="h-5 w-5 text-[var(--color-holo)]" /><span className="text-xs holo-badge holo-badge-cyan">Verified</span></div>
                  <h4 className="text-lg font-bold text-[#e2e8f0] mb-2">{cert.courseName}</h4>
                  <div className="space-y-1 text-xs text-[#64748b]">
                    <div className="flex items-center gap-2"><Calendar className="h-3 w-3" />Issued: {cert.issuedAt}</div>
                    <div className="flex items-center gap-2"><Shield className="h-3 w-3" />Hash: <code className="text-[#94a3b8] font-mono text-[10px]">{cert.hash}</code></div>
                  </div>
                  <Button className="holo-btn holo-btn-sm mt-4"><Download className="h-3 w-3 mr-1" />Download PDF</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="neon-text text-sm font-bold mb-4">AVAILABLE CERTIFICATES</h3>
        {completedCourses.length === 0 ? (
          <div className="holo-card rounded-2xl p-8 text-center">
            <Award className="h-10 w-10 text-[#64748b] mx-auto mb-3" />
            <p className="text-[#64748b] text-sm">Complete a course to earn your certificate. Keep learning!</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {completedCourses.map(c => (
              <div key={c.id} className="holo-card rounded-xl p-4 flex items-center justify-between">
                <div><div className="text-sm font-semibold text-[#e2e8f0]">{c.title}</div><div className="text-xs text-[#64748b]">Course completed</div></div>
                <Button className="holo-btn holo-btn-primary holo-btn-sm">Generate</Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   MAIN ACADEMY PAGE
   ═══════════════════════════════════════════════════════════════════════ */

export default function AcademyPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const tabsRef = useRef<HTMLDivElement>(null);

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardTab />;
      case 'courses': return <CoursesTab />;
      case 'professor': return <ProfessorTab />;
      case 'quizzes': return <QuizzesTab />;
      case 'labs': return <LabsTab />;
      case 'ctf': return <CtfTab />;
      case 'ranks': return <RanksTab />;
      case 'analytics': return <AnalyticsTab />;
      case 'certificates': return <CertificatesTab />;
      default: return <DashboardTab />;
    }
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden" style={{ background: '#050810', color: '#e2e8f0' }}>
      <Particles />
      <div className="scan-line pointer-events-none fixed inset-0 z-40" />

      {/* Top Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-panel">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6">
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="holo-shield flex h-7 w-7 items-center justify-center rounded-full"><Shield className="h-4 w-4 text-[var(--color-holo)]" /></div>
              <span className="text-gradient-holo text-sm font-bold hidden sm:inline">CyberShield</span>
            </a>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2 holo-badge holo-badge-cyan text-[10px] py-0.5">
              <Zap className="h-2.5 w-2.5" />{DEMO_USER.xp} XP
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-[#94a3b8] hidden sm:inline">{DEMO_USER.name}</span>
            <div className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'linear-gradient(135deg, #00f0ff, #bf00ff)' }}>
              {DEMO_USER.name.charAt(0)}
            </div>
          </div>
        </div>
      </nav>

      {/* Tab Navigation */}
      <div className="fixed top-12 left-0 right-0 z-40 glass-panel border-t border-white/5">
        <div ref={tabsRef} className="mx-auto max-w-7xl flex gap-1 px-4 overflow-x-auto py-1.5 no-scrollbar" style={{ scrollbarWidth: 'none' }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`holo-tab flex items-center gap-1.5 ${activeTab === tab.id ? 'holo-tab-active' : ''}`}>
              <tab.icon className="h-3.5 w-3.5" /><span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="pt-28 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            {renderTab()}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}