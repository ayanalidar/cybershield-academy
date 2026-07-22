'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import {
  LayoutDashboard, BookOpen, Brain, HelpCircle, Terminal, Trophy,
  Gamepad2, BarChart3, Award, Shield, Users, Zap, Star,
  Send, ChevronRight, ChevronDown, X, Mic, MicOff, Volume2, VolumeX,
  Flag, Clock, Flame, TrendingUp, CheckCircle2,
  XCircle, Lightbulb, ArrowUpRight, Medal, Activity,
  RefreshCw, Play, Calendar, Download, Menu, Home,
  Pause, Square, Settings, MessageSquare, Eye, Target,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';

/* ═══════════════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════════════ */

const DEMO_USER = { id: 'cmrv7wr450001smurz4vmxl7h', name: 'Alex Chen', xp: 1450, level: 6, streakDays: 7 };

const SIDEBAR_TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'courses', label: 'Courses', icon: BookOpen },
  { id: 'professor', label: 'Professor', icon: Brain },
  { id: 'quizzes', label: 'Quizzes', icon: HelpCircle },
  { id: 'labs', label: 'Lab Terminal', icon: Terminal },
  { id: 'ctf', label: 'CTF Arena', icon: Trophy },
  { id: 'ranks', label: 'Ranks', icon: Gamepad2 },
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
  { id: 'ctf1', title: 'Caesar Cipher Cracker', category: 'crypto', difficulty: 'easy', points: 100, solveCount: 342, description: 'Decrypt the message encrypted with a simple Caesar cipher.', hint: 'The shift is 3 (classic Caesar).', flag: 'CSA{caesar_shift_revealed}', solved: false },
  { id: 'ctf2', title: 'XSS Reflected', category: 'web', difficulty: 'medium', points: 200, solveCount: 189, description: 'Find and exploit a reflected XSS vulnerability.', hint: 'Check the search?q= parameter.', flag: 'CSA{reflected_xss_pwned}', solved: false },
  { id: 'ctf3', title: 'Buffer Overflow 101', category: 'pwn', difficulty: 'medium', points: 250, solveCount: 156, description: 'Exploit a buffer overflow to redirect execution.', hint: 'Use GDB to find the offset.', flag: 'CSA{buff3r_0v3rfl0w_b4s1cs}', solved: false },
  { id: 'ctf4', title: 'Hidden in Plain Sight', category: 'forensics', difficulty: 'easy', points: 150, solveCount: 278, description: 'Analyze the network capture to find the flag.', hint: 'Check DNS queries for base64 subdomains.', flag: 'CSA{dns_exfil_detected}', solved: true },
  { id: 'ctf5', title: 'OSINT Profile Hunt', category: 'osint', difficulty: 'easy', points: 100, solveCount: 412, description: 'Find information using OSINT techniques.', hint: 'Start with the username across platforms.', flag: 'CSA{osint_master_2024}', solved: true },
  { id: 'ctf6', title: 'Crack Me If You Can', category: 'reverse', difficulty: 'hard', points: 300, solveCount: 87, description: 'Reverse engineer the binary to find the key.', hint: 'Use strings then Ghidra.', flag: 'CSA{r3v3rs3d_4nd_cr4ck3d}', solved: false },
];

const BADGES = [
  { id: 'b1', name: 'Shield Master', description: 'Complete Network Security course', icon: '🛡️', rarity: 'rare', xpReward: 200, earned: true },
  { id: 'b2', name: 'First Blood', description: 'Solve your first CTF challenge', icon: '🩸', rarity: 'common', xpReward: 50, earned: true },
  { id: 'b3', name: 'Quiz Ace', description: 'Score 100% on any quiz', icon: '🧠', rarity: 'epic', xpReward: 300, earned: false },
  { id: 'b4', name: 'Lab Rat', description: 'Complete 10 lab sessions', icon: '🐀', rarity: 'common', xpReward: 100, earned: true },
  { id: 'b5', name: 'CTF Champion', description: 'Solve 50 CTF challenges', icon: '🏆', rarity: 'legendary', xpReward: 500, earned: false },
  { id: 'b6', name: 'Streak Master', description: 'Maintain a 30-day streak', icon: '🔥', rarity: 'rare', xpReward: 200, earned: false },
  { id: 'b7', name: 'Network Ninja', description: 'Complete all network modules', icon: '🥷', rarity: 'epic', xpReward: 300, earned: false },
  { id: 'b8', name: 'Crypto Wizard', description: 'Master cryptography challenges', icon: '🧙', rarity: 'legendary', xpReward: 500, earned: false },
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
    { id: 'o1', description: 'Identify live hosts on 10.0.0.0/24', completed: false },
    { id: 'o2', description: 'Discover open ports on 10.0.0.50', completed: false },
    { id: 'o3', description: 'Identify services and versions', completed: false },
    { id: 'o4', description: 'Document findings', completed: false },
  ]},
  { id: 'lab2', title: 'SQL Injection Lab', category: 'Web Security', difficulty: 'intermediate', objectives: [
    { id: 'o1', description: 'Identify the vulnerable parameter', completed: false },
    { id: 'o2', description: 'Extract database version', completed: false },
    { id: 'o3', description: 'Enumerate table names', completed: false },
    { id: 'o4', description: 'Extract user credentials', completed: false },
  ]},
  { id: 'lab3', title: 'Privilege Escalation', category: 'System Security', difficulty: 'advanced', objectives: [
    { id: 'o1', description: 'Gain initial access', completed: false },
    { id: 'o2', description: 'Enumerate SUID binaries', completed: false },
    { id: 'o3', description: 'Exploit misconfigured SUID', completed: false },
    { id: 'o4', description: 'Escalate to root', completed: false },
  ]},
];

const ACTIVITY_TIMELINE = [
  { time: '2h ago', action: 'Completed Network Security module', type: 'module', xp: 50 },
  { time: '5h ago', action: 'Solved CTF: Hidden in Plain Sight', type: 'ctf', xp: 150 },
  { time: '1d ago', action: 'Finished Lab: SQL Injection', type: 'lab', xp: 100 },
  { time: '2d ago', action: 'Scored 95% on Cryptography Quiz', type: 'quiz', xp: 75 },
  { time: '3d ago', action: 'Enrolled in Web App Security', type: 'enrollment', xp: 10 },
  { time: '5d ago', action: 'Earned badge: First Blood', type: 'badge', xp: 50 },
];

/* ═══════════════════════════════════════════════════════════════════════
   VOICE PROFILES FOR PROFESSOR
   ═══════════════════════════════════════════════════════════════════════ */

const VOICE_PROFILES = [
  { id: 'alloy', name: 'Professor Shield', desc: 'Balanced, authoritative academic tone', accent: 'Neutral American', speed: 1.0 },
  { id: 'echo', name: 'Dr. Tech', desc: 'Clear, precise, slightly faster pace', accent: 'British English', speed: 1.1 },
  { id: 'fable', name: 'Mentor Sage', desc: 'Warm, storytelling, deliberate pace', accent: 'Warm American', speed: 0.9 },
  { id: 'onyx', name: 'Specialist Knox', desc: 'Deep, commanding, security expert', accent: 'Deep American', speed: 0.95 },
  { id: 'nova', name: 'Nova', desc: 'Energetic, modern, engaging', accent: 'Modern Neutral', speed: 1.05 },
  { id: 'shimmer', name: 'Shimmer', desc: 'Calm, patient, great for beginners', accent: 'Soft Neutral', speed: 0.85 },
];

/* ═══════════════════════════════════════════════════════════════════════
   ANALYTICS DEMO DATA
   ═══════════════════════════════════════════════════════════════════════ */

const WEEKLY_HOURS = [
  { day: 'Mon', hours: 2.5 },
  { day: 'Tue', hours: 3.2 },
  { day: 'Wed', hours: 1.8 },
  { day: 'Thu', hours: 4.0 },
  { day: 'Fri', hours: 3.5 },
  { day: 'Sat', hours: 5.2 },
  { day: 'Sun', hours: 2.0 },
];

const SKILL_RADAR = [
  { skill: 'Network Security', value: 78 },
  { skill: 'Web Security', value: 55 },
  { skill: 'Cryptography', value: 30 },
  { skill: 'Pen Testing', value: 15 },
  { skill: 'Incident Response', value: 45 },
  { skill: 'Cloud Security', value: 20 },
];

const TOPIC_BREAKDOWN = [
  { topic: 'TCP/IP & Networking', pct: 85 },
  { topic: 'Firewalls & IDS', pct: 72 },
  { topic: 'OWASP Top 10', pct: 60 },
  { topic: 'XSS & SQLi', pct: 45 },
  { topic: 'Symmetric Crypto', pct: 35 },
  { topic: 'Public Key Infrastructure', pct: 20 },
  { topic: 'Cloud IAM', pct: 10 },
];

/* ═══════════════════════════════════════════════════════════════════════
   UTILITY COMPONENTS
   ═══════════════════════════════════════════════════════════════════════ */

function StatCard({ label, value, icon: Icon, sub, color = 'text-emerald-500' }: { label: string; value: string | number; icon: React.ElementType; sub?: string; color?: string }) {
  return (
    <div className="p-4 rounded-xl border border-border bg-surface">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
        <Icon className={`h-4 w-4 ${color}`} />
      </div>
      <div className="text-2xl font-bold">{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}

function ProgressBar({ value, max = 100, className = '' }: { value: number; max?: number; className?: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className={`h-2 rounded-full bg-muted-bg overflow-hidden ${className}`}>
      <div className="h-full rounded-full bg-emerald-500 transition-all duration-700 ease-out" style={{ width: `${pct}%` }} />
    </div>
  );
}

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const styles: Record<string, string> = {
    beginner: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    intermediate: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    advanced: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles[difficulty] ?? 'bg-muted-bg text-muted-foreground'}`}>
      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   DASHBOARD TAB
   ═══════════════════════════════════════════════════════════════════════ */

function DashboardTab() {
  const currentRank = 'Threat Hunter';
  const nextRankXP = 1500;
  const xpToNext = nextRankXP - DEMO_USER.xp;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {DEMO_USER.name.split(' ')[0]}</h1>
          <p className="text-muted-foreground text-sm mt-1">Here's your learning overview</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Flame className="h-4 w-4 text-orange-500" />
          <span className="font-semibold">{DEMO_USER.streakDays} day streak</span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <StatCard label="Total XP" value={DEMO_USER.xp.toLocaleString()} icon={Zap} sub={`Level ${DEMO_USER.level}`} color="text-emerald-500" />
        <StatCard label="Courses" value="2" icon={BookOpen} sub="1 in progress" color="text-cyan-500" />
        <StatCard label="CTF Solved" value="2" icon={Trophy} sub="6 total" color="text-amber-500" />
        <StatCard label="Rank" value={currentRank} icon={Medal} sub={`${xpToNext} XP to next`} color="text-violet-500" />
      </div>

      {/* Rank progress */}
      <div className="p-5 rounded-xl border border-border bg-surface">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium">Progress to Pen Tester</span>
          <span className="text-xs text-muted-foreground">{DEMO_USER.xp} / {nextRankXP} XP</span>
        </div>
        <ProgressBar value={DEMO_USER.xp} max={nextRankXP} />
      </div>

      {/* Two columns */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Active courses */}
        <div className="rounded-xl border border-border bg-surface p-5">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-emerald-500" />
            Active Courses
          </h2>
          <div className="space-y-4">
            {COURSES.filter(c => c.enrolled).map(c => (
              <div key={c.id} className="flex items-center gap-4">
                <div className="text-2xl flex-shrink-0">{c.thumbnail}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{c.title}</div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex-1"><ProgressBar value={c.progress} /></div>
                    <span className="text-xs text-muted-foreground font-medium">{c.progress}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-xl border border-border bg-surface p-5">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-cyan-500" />
            Recent Activity
          </h2>
          <div className="space-y-3">
            {ACTIVITY_TIMELINE.map((a, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-foreground">{a.action}</span>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                    <span>{a.time}</span>
                    <span className="text-emerald-500 font-medium">+{a.xp} XP</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Trophy className="h-4 w-4 text-amber-500" />
          Leaderboard
        </h2>
        <div className="space-y-2">
          {LEADERBOARD.map(u => (
            <div key={u.rank} className={`flex items-center gap-3 p-2.5 rounded-lg text-sm ${u.name === 'Alex Chen' ? 'bg-emerald-500/10 border border-emerald-500/20' : 'hover:bg-muted-bg/50 transition-colors'}`}>
              <span className={`w-6 text-center font-bold ${u.rank <= 3 ? 'text-amber-500' : 'text-muted-foreground'}`}>#{u.rank}</span>
              <span className="flex-1 font-medium">{u.name}</span>
              <span className="text-muted-foreground">{u.xp.toLocaleString()} XP</span>
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
  const [selectedCourse, setSelectedCourse] = useState<typeof COURSES[0] | null>(null);
  const [courseModules, setCourseModules] = useState<Array<{ id: string; title: string; durationMinutes: number; isPublished: boolean }>>([]);
  const [loadingModules, setLoadingModules] = useState(false);

  const openCourse = async (course: typeof COURSES[0]) => {
    setSelectedCourse(course);
    setLoadingModules(true);
    try {
      const res = await fetch(`/api/courses/${course.id}?userId=${DEMO_USER.id}`);
      if (res.ok) {
        const data = await res.json();
        setCourseModules(data.modules || []);
      }
    } catch {
      setCourseModules([]);
    } finally {
      setLoadingModules(false);
    }
  };

  if (selectedCourse) {
    return (
      <div className="animate-fade-in">
        <button onClick={() => setSelectedCourse(null)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ChevronRight className="h-4 w-4 rotate-180" />
          Back to courses
        </button>
        <div className="rounded-xl border border-border bg-surface p-6">
          <div className="flex items-start gap-4 mb-6">
            <span className="text-4xl">{selectedCourse.thumbnail}</span>
            <div className="flex-1">
              <h1 className="text-xl font-bold mb-1">{selectedCourse.title}</h1>
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <DifficultyBadge difficulty={selectedCourse.difficulty} />
                <span>{selectedCourse.modules} modules</span>
                <span>{selectedCourse.durationHours}h</span>
                <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-amber-400 text-amber-400" />{selectedCourse.rating}</span>
              </div>
            </div>
          </div>
          {selectedCourse.enrolled && <ProgressBar value={selectedCourse.progress} className="mb-6" />}
          <h2 className="font-semibold mb-3">Modules</h2>
          {loadingModules ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-12 rounded-lg shimmer" />
              ))}
            </div>
          ) : courseModules.length > 0 ? (
            <div className="space-y-2">
              {courseModules.map((mod, i) => (
                <div key={mod.id} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted-bg/50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-xs font-bold text-emerald-600 dark:text-emerald-400">{i + 1}</div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{mod.title}</div>
                    <div className="text-xs text-muted-foreground">{mod.durationMinutes} min</div>
                  </div>
                  {mod.isPublished && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No modules available yet.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">Course Catalog</h1>
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 stagger-children">
        {COURSES.map(c => (
          <div key={c.id} className="group p-5 rounded-xl border border-border bg-surface card-hover cursor-pointer glow-border" onClick={() => openCourse(c)}>
            <div className="flex items-start justify-between mb-3">
              <span className="text-3xl">{c.thumbnail}</span>
              <DifficultyBadge difficulty={c.difficulty} />
            </div>
            <h3 className="font-semibold mb-1 group-hover:text-emerald-500 transition-colors">{c.title}</h3>
            <p className="text-xs text-muted-foreground mb-3">{c.category} &middot; {c.modules} modules &middot; {c.durationHours}h</p>
            {c.enrolled ? (
              <div>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                  <span>Progress</span><span className="font-medium">{c.progress}%</span>
                </div>
                <ProgressBar value={c.progress} />
              </div>
            ) : (
              <Button size="sm" variant="outline" className="w-full mt-1" onClick={e => { e.stopPropagation(); }}>
                Enroll Free
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   PROFESSOR TAB — COMPLETE REWRITE WITH MULTIPLE VOICES
   ═══════════════════════════════════════════════════════════════════════ */

interface ChatMsg {
  role: 'user' | 'assistant';
  content: string;
}

type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking';

function ProfessorTab() {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [selectedVoice, setSelectedVoice] = useState(VOICE_PROFILES[0]);
  const [voiceSettingsOpen, setVoiceSettingsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [streamingText, setStreamingText] = useState('');

  // Refs to avoid stale closures
  const messagesRef = useRef(messages);
  const voiceStateRef = useRef(voiceState);
  const isProcessingRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const stopSpeakingRef = useRef<(() => void) | null>(null);

  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { voiceStateRef.current = voiceState; }, [voiceState]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText]);

  // Stop speaking helper
  const stopSpeaking = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (stopSpeakingRef.current) {
      stopSpeakingRef.current();
      stopSpeakingRef.current = null;
    }
    if (voiceStateRef.current === 'speaking') {
      setVoiceState('idle');
    }
  }, []);

  // Speak text using TTS
  const speakText = useCallback(async (text: string) => {
    if (isMuted) return;
    try {
      setVoiceState('speaking');
      const res = await fetch('/api/voice/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.slice(0, 1024),
          voice: selectedVoice.id,
          speed: selectedVoice.speed,
        }),
      });

      if (!res.ok) {
        console.error('TTS failed:', res.status);
        setVoiceState('idle');
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;

      const onEnded = () => {
        URL.revokeObjectURL(url);
        audioRef.current = null;
        stopSpeakingRef.current = null;
        setVoiceState('idle');
      };

      const onError = () => {
        URL.revokeObjectURL(url);
        audioRef.current = null;
        stopSpeakingRef.current = null;
        setVoiceState('idle');
      };

      audio.addEventListener('ended', onEnded, { once: true });
      audio.addEventListener('error', onError, { once: true });
      stopSpeakingRef.current = () => {
        audio.removeEventListener('ended', onEnded);
        audio.removeEventListener('error', onError);
        onEnded();
      };

      await audio.play();
    } catch (err) {
      console.error('Speech error:', err);
      setVoiceState('idle');
    }
  }, [selectedVoice, isMuted]);

  // Send message to chat API
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isProcessingRef.current) return;
    isProcessingRef.current = true;

    const userMsg: ChatMsg = { role: 'user', content: text.trim() };
    const newMessages = [...messagesRef.current, userMsg];
    setMessages(newMessages);
    setInput('');
    setStreamingText('');

    try {
      const history = newMessages.slice(-10).map(m => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: DEMO_USER.id,
          sessionId: 'academy-session',
          message: text.trim(),
          history: history.slice(0, -1),
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        const errMsg = errData?.error || 'Something went wrong. Please try again.';
        setMessages(prev => [...prev, { role: 'assistant', content: errMsg }]);
        isProcessingRef.current = false;
        return;
      }

      // Stream the response
      const reader = res.body?.getReader();
      if (!reader) {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Failed to read response.' }]);
        isProcessingRef.current = false;
        return;
      }

      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        setStreamingText(fullText);
      }

      setStreamingText('');
      setMessages(prev => [...prev, { role: 'assistant', content: fullText }]);

      // Speak the response
      if (fullText && !isMuted) {
        speakText(fullText);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Network error. Please check your connection and try again.' }]);
    } finally {
      isProcessingRef.current = false;
    }
  }, [speakText, isMuted]);

  // Handle voice recording
  const startListening = useCallback(async () => {
    try {
      stopSpeaking();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
      mediaRecorderRef.current = mr;
      const chunks: BlobPart[] = [];

      mr.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

      mr.onstop = async () => {
        // Clean up stream
        stream.getTracks().forEach(t => t.stop());
        streamRef.current = null;

        if (voiceStateRef.current !== 'listening') return;
        if (chunks.length === 0) { setVoiceState('idle'); return; }

        setVoiceState('processing');

        try {
          const blob = new Blob(chunks, { type: 'audio/webm' });
          const formData = new FormData();
          formData.append('audio', blob, 'recording.webm');

          const res = await fetch('/api/voice/asr', {
            method: 'POST',
            body: formData,
          });

          if (!res.ok) { setVoiceState('idle'); return; }

          const data = await res.json();
          if (data.text && data.text.trim()) {
            await sendMessage(data.text.trim());
          } else {
            setVoiceState('idle');
          }
        } catch {
          setVoiceState('idle');
        }
      };

      mr.start();
      setVoiceState('listening');

      // Auto-stop after 15 seconds
      setTimeout(() => {
        if (mr.state === 'recording') {
          mr.stop();
        }
      }, 15000);
    } catch {
      setVoiceState('idle');
    }
  }, [sendMessage, stopSpeaking]);

  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  }, []);

  const toggleMic = useCallback(() => {
    if (voiceState === 'listening') {
      stopListening();
    } else if (voiceState === 'speaking') {
      stopSpeaking();
    } else {
      startListening();
    }
  }, [voiceState, startListening, stopListening, stopSpeaking]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isProcessingRef.current) {
      stopSpeaking();
      sendMessage(input);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
      stopListening();
    };
  }, [stopSpeaking, stopListening]);

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Brain className="h-5 w-5 text-emerald-500" />
            </div>
            {voiceState !== 'idle' && (
              <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-surface ${
                voiceState === 'listening' ? 'bg-red-500' :
                voiceState === 'processing' ? 'bg-amber-500' :
                'bg-emerald-500'
              }`} />
            )}
          </div>
          <div>
            <h1 className="text-lg font-bold">{selectedVoice.name}</h1>
            <p className="text-xs text-muted-foreground">{selectedVoice.accent} &middot; {selectedVoice.desc}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setVoiceSettingsOpen(!voiceSettingsOpen)} className="text-xs gap-1.5">
            <Settings className="h-3.5 w-3.5" />
            Voices
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsMuted(!isMuted)}>
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Voice selector panel */}
      <AnimatePresence>
        {voiceSettingsOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden flex-shrink-0 mb-4"
          >
            <div className="p-4 rounded-xl border border-border bg-surface">
              <h3 className="text-sm font-semibold mb-3">Choose a Voice Personality</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {VOICE_PROFILES.map(v => (
                  <button
                    key={v.id}
                    onClick={() => { setSelectedVoice(v); setVoiceSettingsOpen(false); }}
                    className={`text-left p-3 rounded-lg border transition-all ${
                      selectedVoice.id === v.id
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-border hover:bg-muted-bg/50'
                    }`}
                  >
                    <div className="text-sm font-medium">{v.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{v.desc}</div>
                    <div className="text-xs text-emerald-500 mt-1">{v.accent}</div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat messages */}
      <div className="flex-1 min-h-0 overflow-y-auto rounded-xl border border-border bg-surface p-4 mb-4 space-y-4">
        {messages.length === 0 && !streamingText && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
              <MessageSquare className="h-7 w-7 text-emerald-500" />
            </div>
            <h3 className="font-semibold mb-1">Ask me anything</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              I'm your AI cybersecurity professor. Ask about network security, web exploits, cryptography, or anything cyber-related.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {['Explain SQL Injection', 'What is zero trust?', 'How does TLS work?', 'What is a buffer overflow?'].map(q => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-xs px-3 py-1.5 rounded-full border border-border hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-500 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
              msg.role === 'user'
                ? 'bg-emerald-500 text-white rounded-br-md'
                : 'bg-muted-bg dark:bg-muted-bg rounded-bl-md'
            }`}>
              {msg.role === 'assistant' ? (
                <div className="chat-markdown prose-sm">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}

        {streamingText && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-2xl rounded-bl-md px-4 py-2.5 text-sm bg-muted-bg dark:bg-muted-bg">
              <div className="chat-markdown prose-sm">
                <ReactMarkdown>{streamingText}</ReactMarkdown>
              </div>
              <span className="inline-block w-1.5 h-4 bg-emerald-500 animate-pulse ml-0.5" />
            </div>
          </div>
        )}

        {voiceState === 'processing' && (
          <div className="flex justify-start">
            <div className="bg-muted-bg dark:bg-muted-bg rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input bar */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 flex-shrink-0">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask Professor Shield..."
          className="flex-1 h-11 px-4 rounded-xl border border-border bg-surface text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
          disabled={isProcessingRef.current}
        />
        <Button
          type="submit"
          size="icon"
          className="h-11 w-11 rounded-xl flex-shrink-0"
          disabled={!input.trim() || isProcessingRef.current}
        >
          <Send className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant={voiceState === 'listening' ? 'destructive' : voiceState === 'speaking' ? 'outline' : 'default'}
          className={`h-11 w-11 rounded-xl flex-shrink-0 ${voiceState === 'listening' ? 'animate-pulse' : ''}`}
          onClick={toggleMic}
          disabled={voiceState === 'processing'}
        >
          {voiceState === 'listening' ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </Button>
      </form>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   QUIZZES TAB
   ═══════════════════════════════════════════════════════════════════════ */

function QuizzesTab() {
  const quizData = [
    { title: 'Network Security Fundamentals', questions: 20, timeLimit: '30 min', bestScore: 85, attempts: 3, passed: true },
    { title: 'Web App Security Basics', questions: 15, timeLimit: '25 min', bestScore: 72, attempts: 1, passed: false },
    { title: 'Cryptography Essentials', questions: 18, timeLimit: '30 min', bestScore: null, attempts: 0, passed: false },
  ];

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">Quizzes</h1>
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 stagger-children">
        {quizData.map((q, i) => (
          <div key={i} className="p-5 rounded-xl border border-border bg-surface card-hover">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">{q.title}</h3>
              {q.passed && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground mb-4">
              <div>{q.questions} Qs</div>
              <div>{q.timeLimit}</div>
              <div>{q.attempts} tries</div>
            </div>
            {q.bestScore !== null ? (
              <div>
                <div className="flex justify-between text-xs mb-1"><span>Best Score</span><span className={q.passed ? 'text-emerald-500 font-medium' : 'text-amber-500 font-medium'}>{q.bestScore}%</span></div>
                <ProgressBar value={q.bestScore} />
              </div>
            ) : (
              <Button size="sm" className="w-full">Start Quiz</Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   LABS TAB
   ═══════════════════════════════════════════════════════════════════════ */


function LabsTab() {
  const [selectedLab, setSelectedLab] = useState<typeof LAB_SCENARIOS[0] | null>(null);
  const [terminalLines, setTerminalLines] = useState<string[]>(['\$ Welcome to CyberShield Lab Terminal', '\$ Type "help" for available commands.']);
  const [cmdInput, setCmdInput] = useState('');
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const terminalRef = useRef<HTMLDivElement>(null);
  useEffect(() => { terminalRef.current?.scrollTo(0, terminalRef.current.scrollHeight); }, [terminalLines]);
  const runCommand = useCallback((cmd: string) => {
    const t = cmd.trim(); if (!t) return;
    setCmdHistory(p => [...p, t]); setCmdInput('');
    setTerminalLines(p => [...p, '\$ ' + t]);
    if (t === 'help') setTerminalLines(p => [...p, 'Commands: help, clear, whoami, ifconfig, scan <ip>, nmap <ip>, ping <ip>']);
    else if (t === 'clear') setTerminalLines(['\$ Cleared']);
    else if (t === 'whoami') setTerminalLines(p => [...p, 'student@cybershield-lab:~\$']);
    else if (t === 'ifconfig') setTerminalLines(p => [...p, 'eth0: 10.0.0.15/24  UP', 'lo:   127.0.0.1/8   UP']);
    else if (t.startsWith('scan ') || t.startsWith('nmap ')) {
      const ip = t.split(' ')[1] || '10.0.0.50';
      setTerminalLines(p => [...p, 'Scanning ' + ip + '...']);
      setTimeout(() => setTerminalLines(p => [...p, '22/tcp  open  ssh', '80/tcp  open  http', '443/tcp open  https', '3306/tcp open mysql', 'Scan done: 4 ports']), 800);
    } else if (t.startsWith('ping ')) {
      const ip = t.split(' ')[1] || '10.0.0.1';
      setTerminalLines(p => [...p, 'PING ' + ip]);
      setTimeout(() => setTerminalLines(p => [...p, '64 bytes: time=2.3ms', '64 bytes: time=1.8ms', '2 sent, 2 received']), 600);
    } else setTerminalLines(p => [...p, 'bash: ' + t + ': not found']);
  }, []);
  if (!selectedLab) return (
    <div className="animate-fade-in"><h1 className="text-2xl font-bold mb-6">Lab Terminal</h1>
    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 stagger-children">
      {LAB_SCENARIOS.map(lab => (
        <div key={lab.id} className="p-5 rounded-xl border border-border bg-surface card-hover cursor-pointer"
          onClick={() => { setSelectedLab(lab); setTerminalLines(['\$ Lab: ' + lab.title, '\$ Ready.']); }}>
          <h3 className="font-semibold text-sm mb-1">{lab.title}</h3>
          <div className="flex items-center gap-2 mt-2"><DifficultyBadge difficulty={lab.difficulty} /><span className="text-xs text-muted-foreground">{lab.objectives.length} objectives</span></div>
        </div>))}
    </div></div>);
  return (<div className="animate-fade-in flex flex-col h-full">
    <div className="mb-4">
      <button onClick={() => setSelectedLab(null)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-1"><ChevronRight className="h-4 w-4 rotate-180" />Back</button>
      <h1 className="text-lg font-bold">{selectedLab.title}</h1>
    </div>
    <div className="grid lg:grid-cols-[1fr_260px] gap-4 flex-1 min-h-0">
      <div ref={terminalRef} className="flex-1 min-h-[300px] rounded-xl border border-border bg-[#0d1117] p-4 overflow-y-auto font-mono text-xs text-emerald-400 space-y-0.5">
        {terminalLines.map((l, i) => <div key={i} className="whitespace-pre-wrap">{l}</div>)}
        <div className="flex items-center gap-2 mt-1"><span className="text-emerald-500">\$</span>
        <input type="text" value={cmdInput} onChange={e => setCmdInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') runCommand(cmdInput); else if (e.key === 'ArrowUp') { e.preventDefault(); const h = [...cmdHistory].reverse(); if (h.length) setCmdInput(h[0]); }}}
          className="flex-1 bg-transparent outline-none text-emerald-400 placeholder:text-emerald-400/30" placeholder="type a command..." autoFocus /></div>
      </div>
      <div className="rounded-xl border border-border bg-surface p-4 overflow-y-auto">
        <h3 className="font-semibold text-sm mb-3">Objectives</h3>
        {selectedLab.objectives.map(o => (<div key={o.id} className="flex items-start gap-2 text-sm mb-2"><div className="w-4 h-4 rounded border border-border flex-shrink-0 mt-0.5" /><span>{o.description}</span></div>))}
      </div>
    </div></div>);
}

function CtfTab() {
  const [sel, setSel] = useState<typeof CTF_CHALLENGES[0] | null>(null);
  const [flag, setFlag] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const submit = () => {
    if (!sel) return;
    setResult(flag.trim() === sel.flag ? 'correct' : 'wrong');
    setTimeout(() => setResult(null), 3000); setFlag('');
  };
  if (sel) return (
    <div className="animate-fade-in">
      <button onClick={() => setSel(null)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"><ChevronRight className="h-4 w-4 rotate-180" />Back</button>
      <div className="p-6 rounded-xl border border-border bg-surface">
        <div className="flex items-center justify-between mb-4"><h1 className="text-xl font-bold">{sel.title}</h1><DifficultyBadge difficulty={sel.difficulty} /></div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <span className="flex items-center gap-1"><Flag className="h-3.5 w-3.5" />{sel.points} pts</span>
          <span>{sel.solveCount} solves</span><span className="uppercase text-xs font-medium">{sel.category}</span>
        </div>
        <p className="text-sm text-muted-foreground mb-6">{sel.description}</p>
        {result === 'correct' && <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm mb-4">Correct! +{sel.points} XP</div>}
        {result === 'wrong' && <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm mb-4">Incorrect flag. Try again!</div>}
        <div className="flex gap-2">
          <input type="text" value={flag} onChange={e => setFlag(e.target.value)} placeholder="CSA{...}"
            className="flex-1 h-10 px-4 rounded-lg border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            onKeyDown={e => { if (e.key === 'Enter') submit(); }} />
          <Button onClick={submit}>Submit</Button>
        </div>
        <details className="mt-6"><summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground">Show Hint</summary>
          <p className="mt-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-500/5 p-3 rounded-lg">{sel.hint}</p></details>
      </div>
    </div>);
  const pts = CTF_CHALLENGES.filter(c => c.solved).reduce((s, c) => s + c.points, 0);
  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6"><h1 className="text-2xl font-bold">CTF Arena</h1>
        <div className="text-sm text-muted-foreground">Total: <span className="text-emerald-500 font-semibold">{pts}</span> / {CTF_CHALLENGES.reduce((s, c) => s + c.points, 0)} pts</div></div>
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 stagger-children">
        {CTF_CHALLENGES.map(ch => (
          <div key={ch.id} className={"p-5 rounded-xl border bg-surface card-hover cursor-pointer " + (ch.solved ? "border-emerald-500/30" : "border-border")} onClick={() => setSel(ch)}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{ch.category}</span>
              {ch.solved ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <span className="text-xs font-medium text-amber-500">{ch.points} pts</span>}
            </div>
            <h3 className="font-semibold text-sm mb-1">{ch.title}</h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><DifficultyBadge difficulty={ch.difficulty} /><span>{ch.solveCount} solves</span></div>
          </div>))}
      </div>
    </div>);
}

function RanksTab() {
  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">Ranks & Badges</h1>
      <div className="p-6 rounded-xl border border-border bg-surface mb-6">
        <div className="flex items-center gap-4">
          <div className="text-5xl">🎯</div>
          <div className="flex-1">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Current Rank</div>
            <div className="text-2xl font-bold">Threat Hunter</div>
            <div className="text-sm text-muted-foreground mt-1">{DEMO_USER.xp} / 1,500 XP to Pen Tester</div>
            <ProgressBar value={DEMO_USER.xp} max={1500} className="mt-2" />
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-border bg-surface p-5 mb-6">
        <h2 className="font-semibold mb-4">Rank Progression</h2>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {[
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
          ].map(r => (
            <div key={r.name} className={"flex items-center gap-3 p-2.5 rounded-lg text-sm " + (DEMO_USER.xp >= r.min ? "opacity-100" : "opacity-40")}>
              <span className="text-lg">{r.icon}</span>
              <span className="flex-1 font-medium">{r.name}</span>
              <span className="text-xs text-muted-foreground">{r.min} XP</span>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-border bg-surface p-5">
        <h2 className="font-semibold mb-4">Badges ({BADGES.filter(b => b.earned).length}/{BADGES.length})</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {BADGES.map(b => (
            <div key={b.id} className={"p-4 rounded-xl border text-center card-hover " + (b.earned ? "border-border bg-surface" : "border-border/50 opacity-40 grayscale")}>
              <div className="text-3xl mb-2">{b.icon}</div>
              <div className="text-xs font-semibold">{b.name}</div>
              <div className={"text-[10px] mt-0.5 font-medium uppercase " + (b.rarity === 'legendary' ? 'text-amber-500' : b.rarity === 'epic' ? 'text-violet-500' : b.rarity === 'rare' ? 'text-cyan-500' : 'text-muted-foreground')}>{b.rarity}</div>
              {b.earned && <div className="text-[10px] text-emerald-500 mt-1">Earned</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AnalyticsTab() {
  const maxH = Math.max(...WEEKLY_HOURS.map(d => d.hours));
  const barColor = (pct: number) => pct >= 70 ? 'bg-emerald-500' : pct >= 40 ? 'bg-amber-500' : 'bg-rose-500';
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <Button variant="outline" size="sm" className="gap-1.5"><Download className="h-3.5 w-3.5" />Export</Button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <StatCard label="Total Hours" value="22.2" icon={Clock} sub="This week" color="text-emerald-500" />
        <StatCard label="Avg Focus" value="87%" icon={Eye} sub="+5% vs last week" color="text-cyan-500" />
        <StatCard label="Completion" value="68%" icon={CheckCircle2} sub="Course average" color="text-amber-500" />
        <StatCard label="Month XP" value="420" icon={Zap} sub="+120 vs last month" color="text-violet-500" />
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-surface p-5">
          <h2 className="font-semibold mb-4">Weekly Study Hours</h2>
          <div className="flex items-end gap-3 h-40">
            {WEEKLY_HOURS.map(d => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full rounded-t-md bg-emerald-500/80 transition-all duration-700 hover:bg-emerald-500"
                  style={{ height: `${(d.hours / maxH) * 100}%`, minHeight: '8px' }} />
                <span className="text-xs text-muted-foreground">{d.day}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
            <span>Avg: {(WEEKLY_HOURS.reduce((s, d) => s + d.hours, 0) / 7).toFixed(1)}h/day</span>
            <span className="text-emerald-500 font-medium">Peak: Sat ({WEEKLY_HOURS[5].hours}h)</span>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-surface p-5">
          <h2 className="font-semibold mb-4">Skill Radar</h2>
          <div className="space-y-3">
            {SKILL_RADAR.map(s => (
              <div key={s.skill}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>{s.skill}</span>
                  <span className={"font-medium " + (s.value >= 70 ? "text-emerald-500" : s.value >= 40 ? "text-amber-500" : "text-rose-500")}>{s.value}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted-bg overflow-hidden">
                  <div className={"h-full rounded-full transition-all duration-700 " + barColor(s.value)} style={{ width: s.value + '%' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-border bg-surface p-5">
        <h2 className="font-semibold mb-4">Topic Breakdown</h2>
        <div className="space-y-3">
          {TOPIC_BREAKDOWN.map(t => (
            <div key={t.topic} className="flex items-center gap-4">
              <div className="w-48 sm:w-64 text-sm truncate flex-shrink-0">{t.topic}</div>
              <div className="flex-1 h-2.5 rounded-full bg-muted-bg overflow-hidden">
                <div className={"h-full rounded-full transition-all duration-700 " + barColor(t.pct)} style={{ width: t.pct + '%' }} />
              </div>
              <span className={"text-xs font-medium w-10 text-right " + (t.pct >= 70 ? "text-emerald-500" : t.pct >= 40 ? "text-amber-500" : "text-rose-500")}>{t.pct}%</span>
            </div>
          ))}
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-surface p-5">
          <h2 className="font-semibold mb-3 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-emerald-500" />Strengths</h2>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" />TCP/IP &amp; Networking (85%)</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" />Firewalls &amp; IDS (72%)</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-amber-500" />OWASP Top 10 (60%)</li>
          </ul>
        </div>
        <div className="rounded-xl border border-border bg-surface p-5">
          <h2 className="font-semibold mb-3 flex items-center gap-2"><Lightbulb className="h-4 w-4 text-amber-500" />Needs Work</h2>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2"><XCircle className="h-4 w-4 text-rose-500" />Public Key Infrastructure (20%)</li>
            <li className="flex items-center gap-2"><XCircle className="h-4 w-4 text-rose-500" />Cloud IAM (10%)</li>
            <li className="flex items-center gap-2"><XCircle className="h-4 w-4 text-amber-500" />Penetration Testing (15%)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function CertificatesTab() {
  return (
    <div className="animate-fade-in flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-muted-bg flex items-center justify-center mb-4">
        <Award className="h-7 w-7 text-muted-foreground" />
      </div>
      <h2 className="text-xl font-semibold mb-2">No Certificates Yet</h2>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">Complete a course and pass the final assessment to earn your first professional certificate.</p>
      <Button variant="outline" onClick={() => {}}>Browse Courses</Button>
    </div>
  );
}

const TAB_COMPONENTS: Record<string, () => JSX.Element> = {
  dashboard: DashboardTab,
  courses: CoursesTab,
  professor: ProfessorTab,
  quizzes: QuizzesTab,
  labs: LabsTab,
  ctf: CtfTab,
  ranks: RanksTab,
  analytics: AnalyticsTab,
  certificates: CertificatesTab,
};

export default function AcademyPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const ActiveComponent = TAB_COMPONENTS[activeTab] || DashboardTab;
  const pageTitle = SIDEBAR_TABS.find(t => t.id === activeTab)?.label || 'Dashboard';

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar overlay (mobile) */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={"fixed md:static inset-y-0 left-0 z-50 w-64 flex flex-col border-r border-border bg-sidebar transition-transform duration-200 " + (sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0")}>
        <div className="flex items-center gap-2.5 px-5 h-16 border-b border-sidebar-border flex-shrink-0">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-emerald-500" />
            <span className="font-bold text-sidebar-foreground">Cyber<span className="text-emerald-500">Shield</span></span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
          {SIDEBAR_TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
                className={"w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors " + (isActive ? "bg-emerald-500/10 text-emerald-500" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground")}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border flex-shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-emerald-500/10 flex items-center justify-center text-sm font-bold text-emerald-600 dark:text-emerald-400">AC</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-sidebar-foreground truncate">{DEMO_USER.name}</div>
              <div className="text-xs text-muted-foreground">Level {DEMO_USER.level}</div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center gap-4 px-4 sm:px-6 border-b border-border bg-surface/50 backdrop-blur-sm flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 rounded-lg hover:bg-muted-bg transition-colors" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold">{pageTitle}</h1>
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 text-sm"><Flame className="h-4 w-4 text-orange-500" /><span className="font-medium">{DEMO_USER.streakDays}</span></div>
            <div className="hidden sm:flex items-center gap-1.5 text-sm"><Zap className="h-4 w-4 text-emerald-500" /><span className="font-medium">{DEMO_USER.xp} XP</span></div>
          </div>
        </header>
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              <ActiveComponent />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
