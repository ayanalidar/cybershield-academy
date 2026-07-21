'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Mic, MicOff, Volume2, VolumeX, Send, Terminal as TerminalIcon,
  BarChart3, Award, User, Target, CheckCircle2, Clock, TrendingUp,
  BookOpen, Download, Search, AlertTriangle, Lightbulb, Zap, Activity,
  Lock, Copy, ChevronRight, GraduationCap, Users, Trophy, Flame,
  X, LogOut, Settings, LayoutDashboard, Flag, Crown, Star, Eye,
  EyeOff, Play, Pause, SkipForward, Keyboard, MessageSquare, Hexagon,
  Swords, GitBranch, Fingerprint, Globe, Wifi, Database, Bug,
  ChevronDown, ChevronUp, RefreshCw, Sparkles, CircleDot, Brain,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  xp: number;
  level: number;
  streakDays: number;
}

interface CourseData {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  moduleCount: number;
  studentCount: number;
  durationHours: number;
  enrolled: boolean;
  progress?: number;
  modules?: { title: string; completed: boolean }[];
}

interface QuizQ {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface CtfChallenge {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  points: number;
  solveCount: number;
  solved: boolean;
}

interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  xp: number;
  level: number;
  title: string;
  badges: number;
  ctfSolves: number;
  streak: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const LEVEL_TITLES = [
  'Script Kiddie','Junior Analyst','Security Intern','Threat Scout',
  'Network Guardian','Security Engineer','Cyber Defender','Pen Tester',
  'Security Architect','Incident Commander','Threat Hunter','Red Team Lead',
  'Shield Master','Cyber Sentinel','Grandmaster',
];

const LEVEL_XP = [0,100,300,600,1000,1500,2200,3000,4000,5500,7500,10000,13000,17000,22000];

const DEMO_USER: UserData = {
  id: 'demo-user-001',
  name: 'Alex Chen',
  email: 'alex@cybershield.academy',
  role: 'student',
  xp: 1450,
  level: 6,
  streakDays: 7,
};

const SESSION_ID = 'session-' + Date.now();

const WELCOME_MSG: Message = {
  id: 'welcome',
  role: 'assistant',
  content: `# Welcome to CyberShield Academy\n\nI'm **Prof. Shield**, your AI cybersecurity instructor. Today we'll explore **Network Security Fundamentals**.\n\nHere's what we'll cover:\n- TCP/IP protocol suite\n- Firewall configuration\n- Intrusion detection systems\n- Network scanning techniques\n\nWhat aspect of network security interests you most?`,
  timestamp: new Date().toISOString(),
};

const DEMO_COURSES: CourseData[] = [
  {
    id: 'c1', title: 'Network Security Fundamentals',
    description: 'Master TCP/IP, firewalls, IDS/IPS, and network scanning with hands-on labs.',
    category: 'networking', difficulty: 'intermediate', moduleCount: 8, studentCount: 1247, durationHours: 24,
    enrolled: true, progress: 50,
    modules: [
      { title: 'Network Fundamentals', completed: true },
      { title: 'TCP/IP Deep Dive', completed: true },
      { title: 'Network Scanning', completed: true },
      { title: 'Cryptography Basics', completed: true },
      { title: 'Firewall Configuration', completed: false },
      { title: 'Web App Security', completed: false },
      { title: 'Incident Response', completed: false },
      { title: 'Capstone Challenge', completed: false },
    ],
  },
  {
    id: 'c2', title: 'Web Application Security',
    description: 'Deep dive into OWASP Top 10, XSS, SQLi, CSRF, and modern web exploits.',
    category: 'web', difficulty: 'advanced', moduleCount: 6, studentCount: 834, durationHours: 18,
    enrolled: false,
  },
  {
    id: 'c3', title: 'Ethical Hacking & Penetration Testing',
    description: 'Learn reconnaissance, exploitation, post-exploitation, and report writing.',
    category: 'pentesting', difficulty: 'advanced', moduleCount: 10, studentCount: 2103, durationHours: 40,
    enrolled: true, progress: 20,
  },
  {
    id: 'c4', title: 'Digital Forensics & Incident Response',
    description: 'Master disk forensics, memory analysis, network forensics, and IR procedures.',
    category: 'forensics', difficulty: 'intermediate', moduleCount: 7, studentCount: 567, durationHours: 28,
    enrolled: false,
  },
  {
    id: 'c5', title: 'Cloud Security Architecture',
    description: 'Secure AWS, Azure, GCP environments. IAM, encryption, network security in the cloud.',
    category: 'cloud', difficulty: 'advanced', moduleCount: 8, studentCount: 423, durationHours: 32,
    enrolled: false,
  },
  {
    id: 'c6', title: 'Malware Analysis & Reverse Engineering',
    description: 'Static & dynamic analysis, disassembly, debugging, and malware classification.',
    category: 'malware', difficulty: 'advanced', moduleCount: 9, studentCount: 312, durationHours: 36,
    enrolled: false,
  },
];

const DEMO_QUIZZES: Record<string, QuizQ[]> = {
  c1: [
    { id: 'q1', question: 'What layer of the OSI model does a firewall primarily operate at?', options: ['Layer 2 (Data Link)', 'Layer 3 (Network)', 'Layer 4 (Transport)', 'Layer 7 (Application)'], correctIndex: 1, explanation: 'Firewalls primarily operate at Layer 3 (Network layer), filtering packets based on IP addresses, ports, and protocols.' },
    { id: 'q2', question: 'Which tool is used for network scanning and service detection?', options: ['Wireshark', 'Nmap', 'Metasploit', 'Burp Suite'], correctIndex: 1, explanation: 'Nmap (Network Mapper) is the standard tool for network scanning and service/version detection.' },
    { id: 'q3', question: 'What does IDS stand for in cybersecurity?', options: ['Intrusion Detection System', 'Internal Data Security', 'Integrated Defense Shield', 'Intelligent Data Scanner'], correctIndex: 0, explanation: 'IDS stands for Intrusion Detection System, which monitors network traffic for suspicious activity and known threats.' },
    { id: 'q4', question: 'Which protocol operates at the Transport layer and provides reliable, connection-oriented communication?', options: ['UDP', 'ICMP', 'TCP', 'ARP'], correctIndex: 2, explanation: 'TCP (Transmission Control Protocol) provides reliable, connection-oriented communication at the Transport layer using a three-way handshake.' },
    { id: 'q5', question: 'What is the purpose of a DMZ in network security?', options: ['Encrypt all traffic', 'Provide wireless access', 'Isolate public-facing services from internal network', 'Block all inbound traffic'], correctIndex: 2, explanation: 'A DMZ (Demilitarized Zone) isolates public-facing services (web servers, mail servers) from the internal trusted network.' },
  ],
};

const DEMO_CTF: CtfChallenge[] = [
  { id: 'ctf1', title: 'Flag Hunter', description: 'The flag is hidden in plain sight. Sometimes the simplest answer is the right one.\n\nHint: Look at the challenge name carefully.', category: 'crypto', difficulty: 'easy', points: 50, solveCount: 342, solved: false },
  { id: 'ctf2', title: 'Caesar\'s Secret', description: 'A Roman general left this encrypted message behind:\n\n`PloreNerar{e0g3_f1a3_g0_c3a3e}`\n\nDecrypt it to find the flag. The shift value is 13.', category: 'crypto', difficulty: 'easy', points: 75, solveCount: 256, solved: false },
  { id: 'ctf3', title: 'SQL Injection 101', description: 'A vulnerable login form is running at `/api/login`. The flag is in the `flags` table.\n\nTry: `admin\' OR \'1\'=\'1\' --`\n\nFlag format: CYBERSHIELD{...}', category: 'web', difficulty: 'medium', points: 150, solveCount: 128, solved: false },
  { id: 'ctf4', title: 'Hash Cracker', description: 'Crack this SHA-256 hash to reveal the flag:\n\n`5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8`\n\nThe answer is a common password.', category: 'crypto', difficulty: 'medium', points: 200, solveCount: 89, solved: false },
  { id: 'ctf5', title: 'Buffer Overflow', description: 'Analyze this vulnerable C program:\n\n```c\nvoid vuln() {\n  char buf[64];\n  gets(buf);\n}\n```\n\nExploit it to call `win()` and get the flag.\n\nFlag: CYBERSHIELD{buff3r_0v3rfl0w_m4st3r}', category: 'pwn', difficulty: 'hard', points: 300, solveCount: 34, solved: false },
  { id: 'ctf6', title: 'Forensic Artifact', description: 'A disk image has been recovered from a suspect\'s machine. Find the deleted file containing the flag.\n\nThe flag is hidden in the MFT entry of a deleted file named `secret.txt`.\n\nFlag: CYBERSHIELD{d1g_d33p_1nt0_th3_b1ts}', category: 'forensics', difficulty: 'hard', points: 350, solveCount: 22, solved: false },
];

const DEMO_BADGES = [
  { name: 'First Blood', icon: '🎯', description: 'Complete your first challenge', rarity: 'common', earned: true, xpReward: 50 },
  { name: 'Quiz Master', icon: '🧠', description: 'Score 100% on a quiz', rarity: 'rare', earned: true, xpReward: 100 },
  { name: 'Lab Explorer', icon: '🔬', description: 'Complete a lab session', rarity: 'common', earned: true, xpReward: 75 },
  { name: 'Focus Champion', icon: '👁️', description: 'Maintain 90%+ focus for 5 sessions', rarity: 'rare', earned: false, xpReward: 150 },
  { name: 'CTF Winner', icon: '🚩', description: 'Capture 5 flags', rarity: 'epic', earned: false, xpReward: 200 },
  { name: 'Cipher Master', icon: '🔐', description: 'Solve 10 crypto challenges', rarity: 'legendary', earned: false, xpReward: 500 },
  { name: 'Night Owl', icon: '🦉', description: 'Study past midnight', rarity: 'common', earned: false, xpReward: 25 },
  { name: 'Eagle Eye', icon: '🦅', description: 'Accumulate 2000+ XP', rarity: 'epic', earned: false, xpReward: 300 },
  { name: 'Unbreakable', icon: '🛡️', description: 'Pass 3 quizzes on first attempt', rarity: 'rare', earned: false, xpReward: 200 },
  { name: 'Speed Demon', icon: '⚡', description: 'Complete a quiz in under 60 seconds', rarity: 'epic', earned: false, xpReward: 250 },
];

const DEMO_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, id: 'l1', name: 'Sarah K.', xp: 8750, level: 11, title: 'Threat Hunter', badges: 9, ctfSolves: 23, streak: 15 },
  { rank: 2, id: 'l2', name: 'James R.', xp: 7200, level: 10, title: 'Incident Commander', badges: 8, ctfSolves: 19, streak: 12 },
  { rank: 3, id: 'l3', name: 'Priya M.', xp: 5800, level: 9, title: 'Security Architect', badges: 7, ctfSolves: 15, streak: 8 },
  { rank: 4, id: 'l4', name: 'Alex C.', xp: 1450, level: 6, title: 'Security Engineer', badges: 3, ctfSolves: 4, streak: 7 },
  { rank: 5, id: 'l5', name: 'Lin W.', xp: 1200, level: 5, title: 'Network Guardian', badges: 3, ctfSolves: 3, streak: 5 },
  { rank: 6, id: 'l6', name: 'Omar H.', xp: 950, level: 5, title: 'Network Guardian', badges: 2, ctfSolves: 2, streak: 4 },
  { rank: 7, id: 'l7', name: 'Emma T.', xp: 800, level: 4, title: 'Threat Scout', badges: 2, ctfSolves: 2, streak: 3 },
  { rank: 8, id: 'l8', name: 'Raj P.', xp: 600, level: 4, title: 'Threat Scout', badges: 1, ctfSolves: 1, streak: 2 },
];

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'courses', label: 'Courses', icon: BookOpen },
  { id: 'classroom', label: 'AI Professor', icon: Brain },
  { id: 'quizzes', label: 'Quizzes', icon: Target },
  { id: 'labs', label: 'Lab Terminal', icon: TerminalIcon },
  { id: 'ctf', label: 'CTF Arena', icon: Flag },
  { id: 'gamification', label: 'Rank & Badges', icon: Trophy },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'certificates', label: 'Certificates', icon: Award },
];

const NAV_CATEGORIES = [
  { id: 'all', label: 'All Courses' },
  { id: 'networking', label: 'Networking' },
  { id: 'web', label: 'Web Security' },
  { id: 'pentesting', label: 'Pentesting' },
  { id: 'forensics', label: 'Forensics' },
  { id: 'cloud', label: 'Cloud' },
  { id: 'malware', label: 'Malware' },
];

const CTF_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'crypto', label: 'Crypto' },
  { id: 'web', label: 'Web' },
  { id: 'pwn', label: 'Pwn' },
  { id: 'forensics', label: 'Forensics' },
  { id: 'osint', label: 'OSINT' },
];

// ─── Particles Component ─────────────────────────────────────────────────────

function Particles() {
  const [particles, setParticles] = useState<Array<{id:number;left:string;delay:string;duration:string;size:string;color:string}>>([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 8}s`,
        duration: `${8 + Math.random() * 12}s`,
        size: `${1 + Math.random() * 2}px`,
        color: i % 3 === 0 ? 'rgba(0,240,255,0.4)' : i % 3 === 1 ? 'rgba(191,0,255,0.3)' : 'rgba(57,255,20,0.3)',
      }))
    );
  }, []);

  return (
    <div className="holo-bg">
      {particles.map(p => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            background: p.color,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────────────────────────

export default function CyberShieldApp() {
  // ── State ──
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [loginMode, setLoginMode] = useState<'login' | 'signup'>('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginName, setLoginName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [user, setUser] = useState<UserData>(DEMO_USER);

  // Chat
  const [messages, setMessages] = useState<Message[]>([WELCOME_MSG]);
  const [inputMsg, setInputMsg] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Voice
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Quiz
  const [quizCourse, setQuizCourse] = useState<string | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQ[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizTimeLeft, setQuizTimeLeft] = useState(300);
  const quizTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Lab
  const [labOutput, setLabOutput] = useState<string[]>([
    '\x1b[32m╔══════════════════════════════════════════════════════╗\x1b[0m',
    '\x1b[32m║        CyberShield Academy - Secure Lab Shell        ║\x1b[0m',
    '\x1b[32m║   Type "help" for available commands                ║\x1b[0m',
    '\x1b[32m╚══════════════════════════════════════════════════════╝\x1b[0m',
    '',
  ]);
  const [labInput, setLabInput] = useState('');
  const [labActive, setLabActive] = useState(false);
  const labEndRef = useRef<HTMLDivElement>(null);

  // Courses
  const [courseFilter, setCourseFilter] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState<CourseData | null>(null);

  // CTF
  const [ctfFilter, setCtfFilter] = useState('all');
  const [ctfFlag, setCtfFlag] = useState('');
  const [ctfResult, setCtfResult] = useState<{ correct: boolean; message: string; points: number } | null>(null);
  const [ctfChallenges, setCtfChallenges] = useState(DEMO_CTF);

  // Analytics
  const [focusScore, setFocusScore] = useState(87);

  // Notifications
  const [notifOpen, setNotifOpen] = useState(false);
  const notifications = [
    { id: 'n1', title: 'New CTF Challenge', message: 'Buffer Overflow is now live!', time: '2m ago', read: false },
    { id: 'n2', title: 'Quiz Score', message: 'You scored 90% on Network Fundamentals!', time: '1h ago', read: false },
    { id: 'n3', title: 'Badge Earned', message: 'You earned the Quiz Master badge!', time: '3h ago', read: true },
  ];

  // ── Computed ──
  const currentLevel = user.level;
  const currentXp = user.xp;
  const xpForNext = LEVEL_XP[Math.min(currentLevel, LEVEL_XP.length - 1)] || LEVEL_XP[LEVEL_XP.length - 1];
  const xpForPrev = LEVEL_XP[Math.min(currentLevel - 1, LEVEL_XP.length - 1)] || 0;
  const xpProgress = ((currentXp - xpForPrev) / (xpForNext - xpForPrev)) * 100;

  // ── Effects ──
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    labEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [labOutput]);

  useEffect(() => {
    if (!quizCourse || quizSubmitted) return;
    quizTimerRef.current = setInterval(() => {
      setQuizTimeLeft(p => {
        if (p <= 1) { clearInterval(quizTimerRef.current!); return 0; }
        return p - 1;
      });
    }, 1000);
    return () => { if (quizTimerRef.current) clearInterval(quizTimerRef.current); };
  }, [quizCourse, quizSubmitted]);

  // Focus tracking
  useEffect(() => {
    if (!isAuthenticated) return;
    let focusStart = Date.now();
    const onFocus = () => {
      focusStart = Date.now();
      setFocusScore(s => Math.min(100, s + 2));
    };
    const onBlur = () => {
      const elapsed = Date.now() - focusStart;
      if (elapsed > 5000) setFocusScore(s => Math.max(0, s - 5));
    };
    window.addEventListener('focus', onFocus);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('blur', onBlur);
    };
  }, [isAuthenticated]);

  // ── Handlers ──

  const handleLogin = () => {
    if (!loginEmail || !loginPassword) {
      setLoginError('Please fill in all fields');
      return;
    }
    if (loginMode === 'signup' && !loginName) {
      setLoginError('Please enter your name');
      return;
    }
    setLoginError('');
    setIsAuthenticated(true);
    setShowLogin(false);
    const u = loginMode === 'signup'
      ? { ...DEMO_USER, name: loginName, email: loginEmail }
      : DEMO_USER;
    setUser(u);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setShowLogin(true);
    setActiveTab('dashboard');
    setMessages([WELCOME_MSG]);
  };

  const sendMessage = async (text?: string) => {
    const msg = text || inputMsg;
    if (!msg.trim()) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: msg,
      timestamp: new Date().toISOString(),
    };
    setMessages(p => [...p, userMsg]);
    setInputMsg('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          sessionId: SESSION_ID,
          message: msg,
          history: messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) throw new Error('Failed to get response');

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      if (reader) {
        const aiMsg: Message = { id: `a-${Date.now()}`, role: 'assistant', content: '', timestamp: new Date().toISOString() };
        setMessages(p => [...p, aiMsg]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          fullText += chunk;
          setMessages(p => p.map(m => m.id === aiMsg.id ? { ...m, content: fullText } : m));
        }
      }

      // TTS
      if (voiceEnabled && fullText) {
        speakText(fullText);
      }
    } catch {
      setMessages(p => [...p, {
        id: `e-${Date.now()}`,
        role: 'assistant',
        content: "I'm having connectivity issues. Please try again. In the meantime, I can still help with any cybersecurity questions you have!",
        timestamp: new Date().toISOString(),
      }]);
    }
    setIsTyping(false);
  };

  const speakText = async (text: string) => {
    try {
      const clean = text.replace(/[#*`~>\[\]()]/g, '').slice(0, 1000);
      const res = await fetch('/api/voice/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: clean, voice: 'jam', speed: 1.0 }),
      });
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      currentAudioRef.current = audio;
      setIsSpeaking(true);
      audio.onended = () => { setIsSpeaking(false); URL.revokeObjectURL(url); };
      audio.play();
    } catch { /* silent fail */ }
  };

  const stopSpeaking = () => {
    currentAudioRef.current?.pause();
    currentAudioRef.current = null;
    setIsSpeaking(false);
  };

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const fd = new FormData();
        fd.append('audio', blob, 'recording.webm');
        try {
          const res = await fetch('/api/voice/asr', { method: 'POST', body: fd });
          const data = await res.json();
          if (data.success && data.text) {
            sendMessage(data.text);
          }
        } catch { /* silent */ }
      };
      mediaRecorderRef.current = mr;
      mr.start();
      setIsRecording(true);
    } catch {
      console.error('Microphone access denied');
    }
  };

  const handleLabCommand = (cmd: string) => {
    const newOutput = [...labOutput, `\x1b[32mcybershield@lab\x1b[0m:\x1b[34m~\x1b[0m$ ${cmd}`];
    let response: string[] = [];

    const c = cmd.trim().toLowerCase();
    if (c === 'help') {
      response = [
        'Available commands:',
        '  nmap <target>     - Scan target for open ports',
        '  ifconfig          - Show network interfaces',
        '  iptables -L       - List firewall rules',
        '  openssl enc       - Encrypt/decrypt data',
        '  hashcat <hash>    - Crack password hashes',
        '  whoami            - Show current user',
        '  ls                - List files',
        '  cat <file>        - Read file contents',
        '  pwd               - Print working directory',
        '  clear             - Clear terminal',
        '  help              - Show this help message',
      ];
    } else if (c === 'clear') {
      setLabOutput([]);
      setLabInput('');
      return;
    } else if (c === 'whoami') {
      response = ['root'];
    } else if (c === 'pwd') {
      response = ['/home/cybershield/lab'];
    } else if (c === 'ls') {
      response = ['drwxr-xr-x  targets/  vulnerable_webapp/', '-rw-r--r--  password_hashes.txt', '-rw-r--r--  network_diagram.png', '-rwx------  exploit.py'];
    } else if (c === 'ifconfig') {
      response = [
        'eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500',
        '        inet 192.168.1.100  netmask 255.255.255.0  broadcast 192.168.1.255',
        '        inet6 fe80::1  prefixlen 64  scopeid 0x20<link>',
        '        ether 02:42:ac:11:00:02  txqueuelen 0',
        '        RX packets 158432  bytes 142890234 (136.2 MiB)',
        '        TX packets 98321  bytes 82341209 (78.5 MiB)',
      ];
    } else if (c.startsWith('nmap')) {
      const target = c.split(' ')[1] || '192.168.1.1';
      response = [
        `Starting Nmap 7.94 ( https://nmap.org ) at ${new Date().toISOString()}`,
        `Nmap scan report for ${target}`,
        'Host is up (0.0034s latency).',
        'Not shown: 993 closed tcp ports',
        'PORT     STATE SERVICE       VERSION',
        '22/tcp   open  ssh           OpenSSH 8.9p1',
        '80/tcp   open  http          Apache/2.4.54',
        '443/tcp  open  ssl/https     Apache/2.4.54',
        '3306/tcp open  mysql         MySQL 8.0.32',
        '8080/tcp open  http-proxy    Squid 5.7',
        '',
        `Nmap done: 1 IP address (1 host up) scanned in 4.23 seconds`,
      ];
    } else if (c === 'iptables -l' || c === 'iptables -L') {
      response = [
        'Chain INPUT (policy DROP)',
        'target     prot opt source               destination',
        'ACCEPT     tcp  --  0.0.0.0/0            0.0.0.0/0            tcp dpt:22',
        'ACCEPT     tcp  --  0.0.0.0/0            0.0.0.0/0            tcp dpt:80',
        'ACCEPT     tcp  --  0.0.0.0/0            0.0.0.0/0            tcp dpt:443',
        'DROP       all  --  0.0.0.0/0            0.0.0.0/0            ctstate INVALID',
        '',
        'Chain FORWARD (policy DROP)',
        'Chain OUTPUT (policy ACCEPT)',
      ];
    } else if (c.startsWith('cat')) {
      const file = c.split(' ')[1] || '';
      if (file.includes('password')) {
        response = ['admin:$2b$12$LJ3m4ys3Lk0WQ0Y1R1b2XeiWZ3mLk3gH5pKx8MnTz1La0PkR4NJGm', 'user1:$2b$12$9Xj3K2LmN0oP1Q2R3S4T5U6V7W8X9Y0Z1a2B3c4D5e6F7g8H9', 'user2:$2b$12$a1B2c3D4e5F6g7H8i9J0k1L2m3N4o5P6q7R8s9T0u1V2w3X4y5Z6'];
      } else {
        response = [`cat: ${file || '??'}: No such file or directory`];
      }
    } else if (c.startsWith('hashcat')) {
      response = [
        'hashcat (v6.2.6) starting...',
        '',
        'Dictionary cache hit:',
        '...admin................... cracked',
        '...password123............. cracked',
        '',
        'Session..........: hashcat',
        'Status...........: Cracked',
        'Hash.Mode........: 1800 (sha512crypt $6$, SHA512 (Unix))',
        'Hash.Target......: password_hashes.txt',
        'Time.Estimated...: 0 secs',
        '',
        'admin:admin123',
        'user1:letmein',
      ];
    } else if (c.startsWith('openssl')) {
      response = [
        'enter AES-256-CBC encryption password: ********',
        'Verifying - enter AES-256-CBC encryption password: ********',
        '',
        'Data encrypted successfully.',
        'Output: encrypted_data.enc',
      ];
    } else if (c === '') {
      response = [];
    } else {
      response = [`bash: ${cmd}: command not found`];
    }

    setLabOutput(p => [...newOutput, ...response.map(l => l || '\x1b[0m'), '']);
    setLabInput('');
  };

  const startQuiz = (courseId: string) => {
    const qs = DEMO_QUIZZES[courseId];
    if (!qs) return;
    setQuizCourse(courseId);
    setQuizQuestions(qs);
    setQuizIndex(0);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
    setQuizTimeLeft(300);
  };

  const submitQuiz = () => {
    if (!quizCourse) return;
    let score = 0;
    quizQuestions.forEach((q, i) => {
      if (quizAnswers[q.id] === q.correctIndex) score += 20;
    });
    setQuizScore(score);
    setQuizSubmitted(true);
    if (quizTimerRef.current) clearInterval(quizTimerRef.current);
  };

  const submitCtfFlag = (challengeId: string) => {
    const challenge = ctfChallenges.find(c => c.id === challengeId);
    if (!challenge || !ctfFlag.trim()) return;

    const isCorrect = ctfFlag.trim().toLowerCase().includes('cybershield');
    if (isCorrect) {
      setCtfChallenges(p => p.map(c => c.id === challengeId ? { ...c, solved: true, solveCount: c.solveCount + 1 } : c));
      setUser(u => ({ ...u, xp: u.xp + challenge.points }));
    }
    setCtfResult({
      correct: isCorrect,
      message: isCorrect ? `Correct! +${challenge.points} XP` : 'Incorrect flag. Try again!',
      points: isCorrect ? challenge.points : 0,
    });
    setCtfFlag('');
    setTimeout(() => setCtfResult(null), 4000);
  };

  const filteredCourses = courseFilter === 'all'
    ? DEMO_COURSES
    : DEMO_COURSES.filter(c => c.category === courseFilter);

  const filteredCtf = ctfFilter === 'all'
    ? ctfChallenges
    : ctfChallenges.filter(c => c.category === ctfFilter);

  // ─── LOGIN SCREEN ──────────────────────────────────────────────────────────

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative">
        <Particles />
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="login-card w-full max-w-md p-8 relative z-10"
        >
          <div className="flex flex-col items-center mb-8">
            <motion.div
              className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4"
              style={{
                background: 'linear-gradient(135deg, rgba(0,240,255,0.2), rgba(191,0,255,0.2))',
                border: '1px solid rgba(0,240,255,0.3)',
                boxShadow: '0 0 30px rgba(0,240,255,0.15)',
              }}
              animate={{ rotateY: [0, 360] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            >
              <Shield className="w-10 h-10 text-[#00f0ff]" />
            </motion.div>
            <h1 className="text-3xl font-bold neon-text tracking-wider">CyberShield</h1>
            <p className="text-sm text-[#64748b] mt-1 tracking-widest uppercase">AI-Powered Academy</p>
          </div>

          <div className="space-y-4">
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => { setLoginMode('login'); setLoginError(''); }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${loginMode === 'login'
                  ? 'bg-[#00f0ff]/15 text-[#00f0ff] border border-[#00f0ff]/30'
                  : 'text-[#64748b] border border-transparent hover:text-[#cbd5e1]'}`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setLoginMode('signup'); setLoginError(''); }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${loginMode === 'signup'
                  ? 'bg-[#00f0ff]/15 text-[#00f0ff] border border-[#00f0ff]/30'
                  : 'text-[#64748b] border border-transparent hover:text-[#cbd5e1]'}`}
              >
                Sign Up
              </button>
            </div>

            {loginError && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#ff006e]/10 border border-[#ff006e]/30 rounded-xl p-3 text-[#ff006e] text-sm text-center">
                {loginError}
              </motion.div>
            )}

            {loginMode === 'signup' && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={loginName}
                  onChange={e => setLoginName(e.target.value)}
                  className="holo-input w-full pl-10"
                />
              </div>
            )}

            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
              <input
                type="email"
                placeholder="Email address"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                className="holo-input w-full pl-10"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                className="holo-input w-full pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#cbd5e1] transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button onClick={handleLogin} className="holo-btn holo-btn-primary w-full py-3 text-base rounded-xl mt-2">
              {loginMode === 'login' ? 'Sign In' : 'Create Account'}
            </button>

            <p className="text-center text-xs text-[#475569] mt-4">
              Enter any credentials to explore the demo
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── MAIN APP ──────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex flex-col relative">
      <Particles />

      {/* ── Top Navigation Bar ── */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#050810]/80 border-b border-[#1e293b]/50">
        <div className="max-w-[1400px] mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-[#00f0ff]" />
            <span className="text-lg font-bold neon-text tracking-wider hidden sm:block">CyberShield</span>
          </div>

          {/* XP Bar in Nav */}
          <div className="hidden md:flex items-center gap-3 flex-1 max-w-xs mx-8">
            <div className="text-xs text-[#64748b]">Lv.{user.level}</div>
            <div className="holo-progress flex-1">
              <div className="holo-progress-bar" style={{ width: `${Math.min(xpProgress, 100)}%` }} />
            </div>
            <div className="text-xs text-[#00f0ff] font-mono">{user.xp} XP</div>
          </div>

          <div className="flex items-center gap-2">
            {/* Voice Toggle */}
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className={`p-2 rounded-lg transition-all ${voiceEnabled ? 'text-[#00f0ff] bg-[#00f0ff]/10' : 'text-[#64748b]'}`}
              title={voiceEnabled ? 'Voice enabled' : 'Voice disabled'}
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Streak */}
            <div className="flex items-center gap-1 text-[#ff6b35] text-sm">
              <Flame className="w-4 h-4" />
              <span className="font-bold">{user.streakDays}</span>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="p-2 rounded-lg text-[#64748b] hover:text-[#e2e8f0] hover:bg-[#1a1f35] transition-all relative"
              >
                <Activity className="w-4 h-4" />
                {notifications.some(n => !n.read) && <div className="notif-dot absolute top-1 right-1" />}
              </button>
              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute right-0 top-12 w-80 holo-card p-0 z-50"
                  >
                    <div className="p-3 border-b border-[#1e293b] flex items-center justify-between">
                      <span className="text-sm font-semibold text-[#e2e8f0]">Notifications</span>
                      <span className="text-xs text-[#64748b]">{notifications.filter(n => !n.read).length} new</span>
                    </div>
                    <ScrollArea className="max-h-64">
                      {notifications.map(n => (
                        <div key={n.id} className="p-3 border-b border-[#1e293b]/50 hover:bg-[#1a1f35]/50 transition-colors">
                          <div className="flex items-start gap-2">
                            {!n.read && <div className="w-2 h-2 rounded-full bg-[#00f0ff] mt-1.5 shrink-0" />}
                            <div className={!n.read ? '' : 'pl-4'}>
                              <p className="text-sm font-medium text-[#e2e8f0]">{n.title}</p>
                              <p className="text-xs text-[#64748b] mt-0.5">{n.message}</p>
                              <p className="text-xs text-[#475569] mt-1">{n.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </ScrollArea>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-2 ml-1 pl-2 border-l border-[#1e293b]">
              <Avatar className="w-8 h-8 border border-[#00f0ff]/30">
                <AvatarFallback className="bg-[#0a0e1a] text-[#00f0ff] text-xs font-bold">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium hidden lg:block">{user.name}</span>
              <button onClick={handleLogout} className="p-1.5 rounded-lg text-[#64748b] hover:text-[#ff006e] hover:bg-[#ff006e]/10 transition-all" title="Sign out">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Tab Navigation ── */}
      <nav className="sticky top-14 z-40 backdrop-blur-xl bg-[#050810]/60 border-b border-[#1e293b]/30 overflow-x-auto">
        <div className="max-w-[1400px] mx-auto px-4 flex items-center gap-1 py-1.5">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSelectedCourse(null); }}
              className={`holo-tab flex items-center gap-1.5 whitespace-nowrap text-sm ${activeTab === tab.id ? 'holo-tab-active' : ''}`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* ── Main Content ── */}
      <main className="flex-1 relative z-10">
        <div className="max-w-[1400px] mx-auto p-4 md:p-6">

          {/* ════════════════════ DASHBOARD ════════════════════ */}
          {activeTab === 'dashboard' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Welcome + Level */}
              <div className="holo-card p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold">
                      Welcome back, <span className="neon-text">{user.name.split(' ')[0]}</span>
                    </h1>
                    <p className="text-[#64748b] mt-1">Continue your cybersecurity journey. You&apos;re on a <span className="text-[#ff6b35] font-semibold">{user.streakDays}-day streak</span>!</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-black neon-text">{user.level}</div>
                      <div className="text-xs text-[#64748b]">Level</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-[#bf00ff]">{LEVEL_TITLES[Math.min(user.level - 1, LEVEL_TITLES.length - 1)]}</div>
                      <div className="text-xs text-[#64748b]">Rank Title</div>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-[#64748b] mb-1">
                    <span>Level {user.level} Progress</span>
                    <span>{user.xp} / {xpForNext} XP</span>
                  </div>
                  <div className="holo-progress h-3">
                    <div className="holo-progress-bar" style={{ width: `${Math.min(xpProgress, 100)}%` }} />
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Courses Enrolled', value: '3', icon: BookOpen, color: '#00f0ff' },
                  { label: 'Quizzes Passed', value: '12', icon: Target, color: '#39ff14' },
                  { label: 'Lab Hours', value: '24.5', icon: TerminalIcon, color: '#bf00ff' },
                  { label: 'CTF Flags', value: '4', icon: Flag, color: '#ff006e' },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="holo-card p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
                        <div className="text-xs text-[#64748b] mt-0.5">{stat.label}</div>
                      </div>
                      <stat.icon className="w-8 h-8" style={{ color: `${stat.color}40` }} />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Focus Score + Quick Actions */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="holo-card p-5 scan-line">
                  <div className="text-sm text-[#64748b] mb-2">Focus Score</div>
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-black" style={{ color: focusScore > 70 ? '#39ff14' : focusScore > 40 ? '#ff6b35' : '#ff006e' }}>
                      {focusScore}%
                    </span>
                    <span className="text-sm text-[#64748b] mb-1">current session</span>
                  </div>
                  <div className="holo-progress mt-3">
                    <div className="holo-progress-bar" style={{ width: `${focusScore}%`, background: focusScore > 70 ? 'linear-gradient(90deg, #39ff14, #00f0ff)' : focusScore > 40 ? 'linear-gradient(90deg, #ff6b35, #ff006e)' : '#ff006e' }} />
                  </div>
                </div>

                <div className="holo-card p-5 flex flex-col justify-between">
                  <div className="text-sm text-[#64748b] mb-3">Quick Actions</div>
                  <div className="space-y-2">
                    <button onClick={() => { setActiveTab('classroom'); }} className="holo-btn w-full text-sm py-2 flex items-center gap-2">
                      <Brain className="w-4 h-4" /> Talk to AI Professor
                    </button>
                    <button onClick={() => { setActiveTab('ctf'); }} className="holo-btn w-full text-sm py-2 flex items-center gap-2">
                      <Swords className="w-4 h-4" /> Enter CTF Arena
                    </button>
                  </div>
                </div>

                <div className="holo-card p-5">
                  <div className="text-sm text-[#64748b] mb-3">Recent Badges</div>
                  <div className="flex gap-2 flex-wrap">
                    {DEMO_BADGES.filter(b => b.earned).map(b => (
                      <div key={b.name} className="hex-badge hex-badge-rare text-sm" title={b.description}>
                        {b.icon}
                      </div>
                    ))}
                    <div className="hex-badge hex-badge-rare text-sm opacity-30" title="Locked">🔒</div>
                  </div>
                </div>
              </div>

              {/* Active Course Progress */}
              <div className="holo-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Active Courses</h2>
                  <button onClick={() => setActiveTab('courses')} className="text-sm text-[#00f0ff] hover:underline flex items-center gap-1">
                    View All <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {DEMO_COURSES.filter(c => c.enrolled).map(course => (
                    <div key={course.id} className="bg-[#0a0e1a]/60 rounded-xl p-4 border border-[#1e293b]">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-sm">{course.title}</h3>
                        <span className={`holo-badge ${course.difficulty === 'advanced' ? 'holo-badge-pink' : 'holo-badge-cyan'}`}>
                          {course.difficulty}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-[#64748b] mb-2">
                        <span>{course.modules?.filter(m => m.completed).length || 0}/{course.moduleCount} modules</span>
                        <span>{course.progress || 0}%</span>
                      </div>
                      <div className="holo-progress">
                        <div className="holo-progress-bar" style={{ width: `${course.progress || 0}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ════════════════════ COURSES ════════════════════ */}
          {activeTab === 'courses' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {!selectedCourse ? (
                <>
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <h1 className="text-2xl font-bold neon-text">Course Catalog</h1>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
                      <input type="text" placeholder="Search courses..." className="holo-input pl-10 w-64 text-sm" />
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {NAV_CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setCourseFilter(cat.id)}
                        className={`holo-badge ${courseFilter === cat.id ? 'holo-badge-cyan' : 'bg-[#1a1f35] border-[#1e293b] text-[#64748b] hover:text-[#cbd5e1]'}`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCourses.map((course, i) => (
                      <motion.div
                        key={course.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="holo-card p-5 cursor-pointer group"
                        onClick={() => setSelectedCourse(course)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className={`hex-badge hex-badge-${course.difficulty === 'advanced' ? 'epic' : 'rare'} text-lg w-10 h-11`}>
                            {course.category === 'networking' ? <Wifi className="w-5 h-5 text-white" /> :
                             course.category === 'web' ? <Globe className="w-5 h-5 text-white" /> :
                             course.category === 'pentesting' ? <Swords className="w-5 h-5 text-white" /> :
                             course.category === 'forensics' ? <Fingerprint className="w-5 h-5 text-white" /> :
                             course.category === 'cloud' ? <Database className="w-5 h-5 text-white" /> :
                             <Bug className="w-5 h-5 text-white" />}
                          </div>
                          <span className={`holo-badge ${course.difficulty === 'advanced' ? 'holo-badge-pink' : course.difficulty === 'beginner' ? 'holo-badge-green' : 'holo-badge-cyan'}`}>
                            {course.difficulty}
                          </span>
                        </div>
                        <h3 className="font-semibold text-base mb-1 group-hover:text-[#00f0ff] transition-colors">{course.title}</h3>
                        <p className="text-sm text-[#64748b] mb-4 line-clamp-2">{course.description}</p>
                        <div className="flex items-center justify-between text-xs text-[#64748b]">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {course.moduleCount}</span>
                            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {course.studentCount}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {course.durationHours}h</span>
                          </div>
                          {course.enrolled && (
                            <span className="text-[#39ff14] flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Enrolled</span>
                          )}
                        </div>
                        {course.enrolled && course.progress !== undefined && (
                          <div className="mt-3">
                            <div className="holo-progress">
                              <div className="holo-progress-bar" style={{ width: `${course.progress}%` }} />
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <button onClick={() => setSelectedCourse(null)} className="text-sm text-[#00f0ff] hover:underline flex items-center gap-1">
                    <ChevronRight className="w-4 h-4 rotate-180" /> Back to Catalog
                  </button>
                  <div className="holo-card p-6">
                    <h1 className="text-2xl font-bold mb-2">{selectedCourse.title}</h1>
                    <p className="text-[#64748b] mb-6">{selectedCourse.description}</p>
                    {selectedCourse.modules ? (
                      <div className="space-y-2">
                        {selectedCourse.modules.map((mod, i) => (
                          <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${mod.completed ? 'bg-[#39ff14]/5 border border-[#39ff14]/20' : 'bg-[#0a0e1a]/60 border border-[#1e293b]'}`}>
                            {mod.completed
                              ? <CheckCircle2 className="w-5 h-5 text-[#39ff14] shrink-0" />
                              : <Circle className="w-5 h-5 text-[#475569] shrink-0" />}
                            <span className={`text-sm ${mod.completed ? 'text-[#cbd5e1]' : 'text-[#64748b]'}`}>{mod.title}</span>
                            {mod.completed && <span className="holo-badge holo-badge-green ml-auto text-xs">Completed</span>}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex gap-3">
                        <button className="holo-btn holo-btn-primary" onClick={() => { setSelectedCourse({ ...selectedCourse, enrolled: true, progress: 0, modules: [{ title: 'Getting Started', completed: false }] }); }}>
                          Enroll Now
                        </button>
                        <button className="holo-btn" onClick={() => setActiveTab('quizzes')}>
                          Take Quiz
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ════════════════════ AI CLASSROOM ════════════════════ */}
          {activeTab === 'classroom' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="h-[calc(100vh-10rem)] flex flex-col">
              <div className="holo-card flex-1 flex flex-col overflow-hidden">
                {/* Chat Header */}
                <div className="p-4 border-b border-[#1e293b] flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00f0ff]/20 to-[#bf00ff]/20 border border-[#00f0ff]/30 flex items-center justify-center">
                      <Brain className="w-5 h-5 text-[#00f0ff]" />
                    </div>
                    <div>
                      <h2 className="font-semibold">Prof. Shield</h2>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-[#39ff14] animate-pulse" />
                        <span className="text-xs text-[#39ff14]">Online</span>
                        {isTyping && <span className="text-xs text-[#bf00ff] typing-cursor">thinking</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 text-xs text-[#64748b]">
                      <span>Focus:</span>
                      <span className={`font-bold ${focusScore > 70 ? 'text-[#39ff14]' : focusScore > 40 ? 'text-[#ff6b35]' : 'text-[#ff006e]'}`}>{focusScore}%</span>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4 max-w-3xl mx-auto">
                    {messages.map(msg => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] ${msg.role === 'user'
                          ? 'bg-[#00f0ff]/10 border border-[#00f0ff]/20 rounded-2xl rounded-br-sm px-4 py-3'
                          : 'bg-[#1a1f35]/60 border border-[#1e293b] rounded-2xl rounded-bl-sm px-4 py-3'}`}>
                          {msg.role === 'assistant' && (
                            <div className="flex items-center gap-2 mb-2">
                              <Sparkles className="w-3.5 h-3.5 text-[#bf00ff]" />
                              <span className="text-xs text-[#bf00ff] font-semibold">Prof. Shield</span>
                            </div>
                          )}
                          <div className="text-sm leading-relaxed prose prose-invert prose-sm max-w-none
                            prose-headings:text-[#00f0ff] prose-h1:text-lg prose-h2:text-base prose-h3:text-sm
                            prose-strong:text-[#e2e8f0] prose-code:text-[#39ff14] prose-code:bg-[#0a0e1a] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                            prose-li:text-[#cbd5e1] prose-a:text-[#00f0ff]">
                            {msg.content}
                          </div>
                          {msg.role === 'assistant' && msg.content && (
                            <button
                              onClick={() => speakText(msg.content)}
                              className="mt-2 flex items-center gap-1 text-xs text-[#64748b] hover:text-[#00f0ff] transition-colors"
                            >
                              <Volume2 className="w-3 h-3" /> Read aloud
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-[#1a1f35]/60 border border-[#1e293b] rounded-2xl rounded-bl-sm px-4 py-3">
                          <div className="flex gap-1">
                            {[0, 1, 2].map(i => (
                              <motion.div
                                key={i}
                                className="w-2 h-2 rounded-full bg-[#00f0ff]"
                                animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
                                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                </ScrollArea>

                {/* Voice Indicator */}
                <AnimatePresence>
                  {isRecording && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-4 py-2 flex items-center gap-2"
                    >
                      <div className="pulse-ring w-3 h-3 rounded-full bg-[#ff006e]" />
                      <span className="text-sm text-[#ff006e] font-medium">Listening...</span>
                      <div className="flex gap-0.5">
                        {[0, 1, 2, 3, 4].map(i => (
                          <motion.div
                            key={i}
                            className="w-1 bg-[#ff006e] rounded-full"
                            animate={{ height: [8, 16 + Math.random() * 16, 8] }}
                            transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.1 }}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                  {isSpeaking && !isRecording && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-4 py-2 flex items-center gap-2"
                    >
                      <Volume2 className="w-4 h-4 text-[#00f0ff] animate-pulse" />
                      <span className="text-sm text-[#00f0ff]">Speaking...</span>
                      <button onClick={stopSpeaking} className="ml-2 p-1 rounded hover:bg-[#ff006e]/10 text-[#ff006e]">
                        <X className="w-3 h-3" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Input Bar */}
                <div className="p-4 border-t border-[#1e293b] shrink-0">
                  <div className="flex items-center gap-2 max-w-3xl mx-auto">
                    <button
                      onClick={toggleRecording}
                      className={`p-3 rounded-xl transition-all shrink-0 ${isRecording
                        ? 'bg-[#ff006e]/20 border border-[#ff006e]/40 text-[#ff006e]'
                        : 'bg-[#0a0e1a] border border-[#1e293b] text-[#64748b] hover:text-[#00f0ff] hover:border-[#00f0ff]/30'}`}
                      title={isRecording ? 'Stop recording' : 'Start voice input'}
                    >
                      {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>
                    <input
                      type="text"
                      value={inputMsg}
                      onChange={e => setInputMsg(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                      placeholder="Ask Prof. Shield anything about cybersecurity..."
                      className="holo-input flex-1 text-sm"
                    />
                    <button
                      onClick={() => sendMessage()}
                      disabled={!inputMsg.trim()}
                      className="p-3 rounded-xl bg-[#00f0ff]/15 border border-[#00f0ff]/30 text-[#00f0ff] hover:bg-[#00f0ff]/25 disabled:opacity-30 disabled:cursor-not-allowed transition-all shrink-0"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ════════════════════ QUIZZES ════════════════════ */}
          {activeTab === 'quizzes' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {!quizCourse ? (
                <>
                  <h1 className="text-2xl font-bold neon-text">Assessment Center</h1>
                  <p className="text-[#64748b]">Test your knowledge with module quizzes. Earn XP for high scores!</p>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {DEMO_COURSES.map((course, i) => (
                      <motion.div
                        key={course.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="holo-card p-5"
                      >
                        <h3 className="font-semibold mb-2">{course.title}</h3>
                        <p className="text-sm text-[#64748b] mb-4">{course.moduleCount} modules &middot; {DEMO_QUIZZES[course.id]?.length || 0} questions</p>
                        <button onClick={() => startQuiz(course.id)} className="holo-btn w-full text-sm">
                          <Target className="w-4 h-4 inline mr-2" />Start Quiz
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="max-w-2xl mx-auto">
                  {!quizSubmitted ? (
                    <div className="holo-card p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold">
                          {DEMO_COURSES.find(c => c.id === quizCourse)?.title} Quiz
                        </h2>
                        <div className="flex items-center gap-3">
                          <div className={`flex items-center gap-1 text-sm font-mono ${quizTimeLeft < 60 ? 'text-[#ff006e]' : 'text-[#00f0ff]'}`}>
                            <Clock className="w-4 h-4" />
                            {Math.floor(quizTimeLeft / 60)}:{String(quizTimeLeft % 60).padStart(2, '0')}
                          </div>
                          <span className="holo-badge holo-badge-cyan">
                            Q{quizIndex + 1}/{quizQuestions.length}
                          </span>
                        </div>
                      </div>

                      {/* Progress */}
                      <div className="holo-progress mb-6">
                        <div className="holo-progress-bar" style={{ width: `${((quizIndex + 1) / quizQuestions.length) * 100}%` }} />
                      </div>

                      {/* Question */}
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={quizQuestions[quizIndex].id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                        >
                          <h3 className="text-base font-medium mb-4">{quizQuestions[quizIndex].question}</h3>
                          <RadioGroup
                            value={quizAnswers[quizQuestions[quizIndex].id]?.toString() || ''}
                            onValueChange={v => setQuizAnswers(p => ({ ...p, [quizQuestions[quizIndex].id]: parseInt(v) }))}
                            className="space-y-2"
                          >
                            {quizQuestions[quizIndex].options.map((opt, i) => (
                              <label key={i} className="flex items-center gap-3 p-3 rounded-xl border border-[#1e293b] hover:border-[#00f0ff]/30 hover:bg-[#00f0ff]/5 cursor-pointer transition-all">
                                <RadioGroupItem value={i.toString()} className="border-[#00f0ff]/50 text-[#00f0ff]" />
                                <span className="text-sm">{opt}</span>
                              </label>
                            ))}
                          </RadioGroup>
                        </motion.div>
                      </AnimatePresence>

                      {/* Nav */}
                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#1e293b]">
                        <button
                          onClick={() => setQuizIndex(Math.max(0, quizIndex - 1))}
                          disabled={quizIndex === 0}
                          className="holo-btn text-sm disabled:opacity-30"
                        >
                          <ChevronRight className="w-4 h-4 rotate-180 inline mr-1" /> Previous
                        </button>
                        {quizIndex < quizQuestions.length - 1 ? (
                          <button onClick={() => setQuizIndex(quizIndex + 1)} className="holo-btn text-sm">
                            Next <ChevronRight className="w-4 h-4 inline ml-1" />
                          </button>
                        ) : (
                          <button onClick={submitQuiz} className="holo-btn holo-btn-primary text-sm">
                            Submit Quiz
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="holo-card p-6 text-center">
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }}>
                        <div className={`text-6xl font-black ${quizScore >= 80 ? 'neon-text-green' : quizScore >= 60 ? 'neon-text' : 'neon-text-purple'}`}>
                          {quizScore}%
                        </div>
                      </motion.div>
                      <p className="text-lg mt-3 font-semibold">
                        {quizScore >= 80 ? 'Excellent Work!' : quizScore >= 60 ? 'Good Effort!' : 'Keep Practicing!'}
                      </p>
                      <p className="text-sm text-[#64748b] mt-1">
                        You got {quizQuestions.filter((q, i) => quizAnswers[q.id] === q.correctIndex).length} out of {quizQuestions.length} correct
                      </p>

                      {/* Answer Review */}
                      <div className="mt-6 space-y-3 text-left">
                        {quizQuestions.map((q, i) => {
                          const userAnswer = quizAnswers[q.id];
                          const isCorrect = userAnswer === q.correctIndex;
                          return (
                            <div key={q.id} className={`p-3 rounded-xl border ${isCorrect ? 'bg-[#39ff14]/5 border-[#39ff14]/20' : 'bg-[#ff006e]/5 border-[#ff006e]/20'}`}>
                              <div className="flex items-start gap-2">
                                {isCorrect ? <CheckCircle2 className="w-4 h-4 text-[#39ff14] shrink-0 mt-0.5" /> : <X className="w-4 h-4 text-[#ff006e] shrink-0 mt-0.5" />}
                                <div>
                                  <p className="text-sm font-medium">{q.question}</p>
                                  {!isCorrect && <p className="text-xs text-[#ff006e] mt-1">Your answer: {q.options[userAnswer ?? 0]}</p>}
                                  <p className="text-xs text-[#39ff14] mt-1">Correct: {q.options[q.correctIndex]}</p>
                                  <p className="text-xs text-[#64748b] mt-1">{q.explanation}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <button onClick={() => setQuizCourse(null)} className="holo-btn mt-6">
                        Back to Quizzes
                      </button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* ════════════════════ LAB TERMINAL ════════════════════ */}
          {activeTab === 'labs' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="h-[calc(100vh-10rem)] flex flex-col">
              {!labActive ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-[#00f0ff]/10 to-[#bf00ff]/10 border border-[#00f0ff]/20 flex items-center justify-center mb-4">
                      <TerminalIcon className="w-10 h-10 text-[#00f0ff]" />
                    </div>
                    <h2 className="text-xl font-bold mb-2">Secure Lab Environment</h2>
                    <p className="text-sm text-[#64748b] mb-6 max-w-md">
                      Launch an isolated sandbox environment to practice cybersecurity tools and techniques safely.
                    </p>
                    <button onClick={() => setLabActive(true)} className="holo-btn holo-btn-primary text-base px-8 py-3">
                      <Play className="w-5 h-5 inline mr-2" />Launch Lab Terminal
                    </button>
                  </div>
                </div>
              ) : (
                <div className="holo-terminal flex-1 flex flex-col overflow-hidden">
                  <div className="holo-terminal-header">
                    <div className="holo-terminal-dot bg-[#ff5f57]" />
                    <div className="holo-terminal-dot bg-[#ffbd2e]" />
                    <div className="holo-terminal-dot bg-[#28ca42]" />
                    <span className="ml-3 text-xs text-[#64748b]">cybershield@lab:~</span>
                    <div className="ml-auto flex items-center gap-2">
                      <span className="holo-badge holo-badge-green text-xs">Connected</span>
                      <button onClick={() => { setLabActive(false); setLabOutput(['\x1b[32mLab session terminated.\x1b[0m', '']); }} className="p-1 rounded hover:bg-[#ff006e]/10 text-[#ff006e]">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <ScrollArea className="flex-1 p-4 font-mono text-sm">
                    <div className="space-y-0">
                      {labOutput.map((line, i) => (
                        <div key={i} className="whitespace-pre-wrap leading-6 text-[#39ff14]" style={{ color: undefined }}>
                          {line.includes('\x1b[32m') ? <span className="text-[#39ff14]">{line.replace(/\x1b\[\d+m/g, '')}</span> :
                           line.includes('\x1b[34m') ? <span className="text-[#00f0ff]">{line.replace(/\x1b\[\d+m/g, '')}</span> :
                           line.includes('\x1b[0m') ? <span className="text-[#e2e8f0]">{line.replace(/\x1b\[\d+m/g, '')}</span> :
                           <span className="text-[#e2e8f0]">{line}</span>}
                        </div>
                      ))}
                      <div ref={labEndRef} />
                    </div>
                  </ScrollArea>
                  <div className="p-3 border-t border-[#1e293b] flex items-center gap-2">
                    <span className="text-[#39ff14] font-mono text-sm shrink-0">cybershield@lab:~$</span>
                    <input
                      type="text"
                      value={labInput}
                      onChange={e => setLabInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleLabCommand(labInput); }}
                      className="flex-1 bg-transparent border-none outline-none text-[#e2e8f0] font-mono text-sm"
                      autoFocus
                      placeholder="Type a command..."
                    />
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ════════════════════ CTF ARENA ════════════════════ */}
          {activeTab === 'ctf' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h1 className="text-2xl font-bold neon-text flex items-center gap-2">
                    <Flag className="w-6 h-6" /> CTF Arena
                  </h1>
                  <p className="text-sm text-[#64748b] mt-1">Capture the flag challenges. Submit flags to earn XP!</p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Trophy className="w-4 h-4 text-[#ffd700]" />
                  <span className="text-[#64748b]">Total Points:</span>
                  <span className="font-bold text-[#00f0ff]">{ctfChallenges.filter(c => c.solved).reduce((a, c) => a + c.points, 0)}</span>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                {CTF_CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setCtfFilter(cat.id)}
                    className={`holo-badge ${ctfFilter === cat.id ? 'holo-badge-purple' : 'bg-[#1a1f35] border-[#1e293b] text-[#64748b] hover:text-[#cbd5e1]'}`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {filteredCtf.map((challenge, i) => (
                  <motion.div
                    key={challenge.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="holo-card p-5"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold flex items-center gap-2">
                          {challenge.title}
                          {challenge.solved && <CheckCircle2 className="w-4 h-4 text-[#39ff14]" />}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`holo-badge ${challenge.difficulty === 'easy' ? 'holo-badge-green' : challenge.difficulty === 'medium' ? 'holo-badge-orange' : 'holo-badge-pink'}`}>
                            {challenge.difficulty}
                          </span>
                          <span className="holo-badge holo-badge-purple">{challenge.category}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-[#00f0ff]">{challenge.points}</div>
                        <div className="text-xs text-[#64748b]">points</div>
                      </div>
                    </div>
                    <p className="text-sm text-[#64748b] mb-4 whitespace-pre-line font-mono">{challenge.description}</p>
                    <div className="flex items-center gap-2 text-xs text-[#64748b] mb-3">
                      <Users className="w-3 h-3" /> {challenge.solveCount} solves
                    </div>
                    {challenge.solved ? (
                      <div className="bg-[#39ff14]/10 border border-[#39ff14]/20 rounded-xl p-3 text-center">
                        <span className="text-sm text-[#39ff14] font-semibold flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Flag Captured!
                        </span>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={ctfFlag}
                          onChange={e => setCtfFlag(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') submitCtfFlag(challenge.id); }}
                          placeholder="Enter flag (e.g., CYBERSHIELD{...})"
                          className="holo-input flex-1 text-sm font-mono"
                        />
                        <button onClick={() => submitCtfFlag(challenge.id)} className="holo-btn holo-btn-primary text-sm px-4">
                          Submit
                        </button>
                      </div>
                    )}
                    {ctfResult && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mt-3 p-3 rounded-xl text-sm font-medium text-center ${ctfResult.correct
                          ? 'bg-[#39ff14]/10 border border-[#39ff14]/20 text-[#39ff14]'
                          : 'bg-[#ff006e]/10 border border-[#ff006e]/20 text-[#ff006e]'}`}
                      >
                        {ctfResult.message}
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ════════════════════ GAMIFICATION ════════════════════ */}
          {activeTab === 'gamification' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Profile Card */}
              <div className="holo-card p-6">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="relative">
                    <Avatar className="w-20 h-20 border-2 border-[#00f0ff]/40">
                      <AvatarFallback className="bg-gradient-to-br from-[#00f0ff]/20 to-[#bf00ff]/20 text-[#00f0ff] text-2xl font-bold">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-br from-[#00f0ff] to-[#0080ff] flex items-center justify-center text-xs font-bold text-[#050810] border-2 border-[#050810]">
                      {user.level}
                    </div>
                  </div>
                  <div className="text-center md:text-left flex-1">
                    <h1 className="text-2xl font-bold">{user.name}</h1>
                    <div className="flex items-center gap-2 justify-center md:justify-start mt-1">
                      <Crown className="w-4 h-4 text-[#ffd700]" />
                      <span className="text-[#bf00ff] font-semibold">{LEVEL_TITLES[Math.min(user.level - 1, LEVEL_TITLES.length - 1)]}</span>
                    </div>
                    <div className="mt-3 max-w-sm">
                      <div className="flex justify-between text-xs text-[#64748b] mb-1">
                        <span>Level {user.level}</span>
                        <span>{user.xp} / {xpForNext} XP</span>
                      </div>
                      <div className="holo-progress h-3">
                        <div className="holo-progress-bar" style={{ width: `${Math.min(xpProgress, 100)}%` }} />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-[#ff6b35] flex items-center justify-center gap-1"><Flame className="w-5 h-5" />{user.streakDays}</div>
                      <div className="text-xs text-[#64748b]">Day Streak</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-[#00f0ff]">{DEMO_BADGES.filter(b => b.earned).length}</div>
                      <div className="text-xs text-[#64748b]">Badges</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-[#39ff14]">{ctfChallenges.filter(c => c.solved).length}</div>
                      <div className="text-xs text-[#64748b]">CTF Flags</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Badges */}
              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Hexagon className="w-5 h-5 text-[#bf00ff]" /> Badges Collection
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {DEMO_BADGES.map((badge, i) => (
                    <motion.div
                      key={badge.name}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className={`holo-card p-4 text-center ${!badge.earned ? 'opacity-40 grayscale' : ''}`}
                    >
                      <div className={`hex-badge mx-auto mb-2 hex-badge-${badge.rarity === 'legendary' ? 'legendary' : badge.rarity === 'epic' ? 'epic' : badge.rarity === 'rare' ? 'rare' : 'common'}`}>
                        {badge.earned ? badge.icon : '🔒'}
                      </div>
                      <div className="text-xs font-semibold">{badge.name}</div>
                      <div className="text-[10px] text-[#64748b] mt-0.5">{badge.description}</div>
                      <div className={`holo-badge mt-2 text-[10px] ${badge.rarity === 'legendary' ? 'holo-badge-orange' : badge.rarity === 'epic' ? 'holo-badge-purple' : badge.rarity === 'rare' ? 'holo-badge-cyan' : 'holo-badge-green'}`}>
                        {badge.rarity}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Leaderboard */}
              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-[#ffd700]" /> Global Leaderboard
                </h2>
                <div className="holo-card overflow-hidden">
                  {DEMO_LEADERBOARD.map((entry, i) => (
                    <div key={entry.id} className={`flex items-center gap-4 px-5 py-3 ${i < DEMO_LEADERBOARD.length - 1 ? 'border-b border-[#1e293b]/50' : ''} ${entry.id === 'l4' ? 'bg-[#00f0ff]/5' : ''}`}>
                      <div className={`w-8 text-center font-bold ${entry.rank <= 3 ? `rank-${entry.rank}` : 'text-[#64748b]'}`}>
                        {entry.rank <= 3 ? <Crown className="w-5 h-5 mx-auto" /> : `#${entry.rank}`}
                      </div>
                      <Avatar className="w-8 h-8 border border-[#1e293b]">
                        <AvatarFallback className="bg-[#0a0e1a] text-xs text-[#64748b]">
                          {entry.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{entry.name} {entry.id === 'l4' && <span className="text-[#00f0ff] text-xs">(You)</span>}</div>
                        <div className="text-xs text-[#64748b]">{entry.title}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-bold text-[#00f0ff]">{entry.xp.toLocaleString()} XP</div>
                        <div className="text-xs text-[#64748b]">Lv.{entry.level} &middot; {entry.badges} badges</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ════════════════════ ANALYTICS ════════════════════ */}
          {activeTab === 'analytics' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <h1 className="text-2xl font-bold neon-text">Performance Analytics</h1>

              <div className="grid md:grid-cols-4 gap-4">
                {[
                  { label: 'Total XP Earned', value: user.xp.toLocaleString(), change: '+120 this week', color: '#00f0ff' },
                  { label: 'Avg Quiz Score', value: '82%', change: '+5% vs last month', color: '#39ff14' },
                  { label: 'Lab Completion', value: '68%', change: '12 of 18 labs', color: '#bf00ff' },
                  { label: 'Focus Score Avg', value: '84%', change: '+2% improving', color: '#ff6b35' },
                ].map((stat, i) => (
                  <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="holo-card p-4">
                    <div className="text-xs text-[#64748b] mb-1">{stat.label}</div>
                    <div className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
                    <div className="text-xs text-[#39ff14] mt-1">{stat.change}</div>
                  </motion.div>
                ))}
              </div>

              {/* Performance Chart Placeholder */}
              <div className="holo-card p-5">
                <h2 className="text-base font-semibold mb-4">Weekly Activity</h2>
                <div className="flex items-end gap-3 h-48">
                  {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((day, i) => {
                    const heights = [60, 80, 45, 90, 70, 30, 55];
                    const h = heights[i];
                    return (
                      <div key={day} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full relative" style={{ height: '100%' }}>
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${h}%` }}
                            transition={{ delay: i * 0.1, duration: 0.5 }}
                            className="absolute bottom-0 w-full rounded-t-lg"
                            style={{
                              background: `linear-gradient(to top, #00f0ff${Math.round(h * 1.5).toString(16).padStart(2, '0')}, #bf00ff${Math.round(h * 1.5).toString(16).padStart(2, '0')})`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-[#64748b]">{day}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Skills Radar */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="holo-card p-5">
                  <h2 className="text-base font-semibold mb-4">Skill Breakdown</h2>
                  <div className="space-y-3">
                    {[
                      { skill: 'Network Security', score: 85, color: '#00f0ff' },
                      { skill: 'Web Security', score: 72, color: '#bf00ff' },
                      { skill: 'Cryptography', score: 68, color: '#39ff14' },
                      { skill: 'Forensics', score: 55, color: '#ff6b35' },
                      { skill: 'Cloud Security', score: 42, color: '#ff006e' },
                      { skill: 'Malware Analysis', score: 38, color: '#ffd700' },
                    ].map(s => (
                      <div key={s.skill}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{s.skill}</span>
                          <span style={{ color: s.color }}>{s.score}%</span>
                        </div>
                        <div className="holo-progress">
                          <div className="holo-progress-bar" style={{ width: `${s.score}%`, background: s.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="holo-card p-5">
                  <h2 className="text-base font-semibold mb-4">Recent Activity</h2>
                  <div className="space-y-3">
                    {[
                      { icon: CheckCircle2, text: 'Completed Network Scanning module', time: '2h ago', color: '#39ff14' },
                      { icon: Target, text: 'Scored 90% on Cryptography Quiz', time: '5h ago', color: '#00f0ff' },
                      { icon: Flag, text: 'Captured flag: Caesar\'s Secret', time: '1d ago', color: '#bf00ff' },
                      { icon: TerminalIcon, text: 'Completed Firewall Lab (45 min)', time: '1d ago', color: '#ff6b35' },
                      { icon: Award, text: 'Earned "Quiz Master" badge', time: '2d ago', color: '#ffd700' },
                      { icon: Brain, text: 'AI session: IDS/IPS deep dive', time: '3d ago', color: '#ff006e' },
                    ].map((a, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <a.icon className="w-4 h-4 mt-0.5 shrink-0" style={{ color: a.color }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm">{a.text}</p>
                          <p className="text-xs text-[#64748b]">{a.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ════════════════════ CERTIFICATES ════════════════════ */}
          {activeTab === 'certificates' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <h1 className="text-2xl font-bold neon-text">Certificates</h1>
              <p className="text-[#64748b]">Earn certificates by completing courses. Each certificate includes a verification hash.</p>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Earned Certificate */}
                <div className="holo-card p-6 scan-line relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00f0ff] via-[#bf00ff] to-[#ff006e]" />
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00f0ff]/20 to-[#bf00ff]/20 border border-[#00f0ff]/30 flex items-center justify-center">
                      <Award className="w-6 h-6 text-[#00f0ff]" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Network Security Fundamentals</h3>
                      <p className="text-xs text-[#64748b]">Issued: June 15, 2026</p>
                    </div>
                  </div>
                  <p className="text-sm text-[#64748b] mb-4">This certifies that <span className="text-[#e2e8f0] font-medium">{user.name}</span> has successfully completed all modules and assessments.</p>
                  <div className="bg-[#0a0e1a] rounded-lg p-3 mb-4">
                    <div className="text-xs text-[#64748b] mb-1">Verification Hash</div>
                    <div className="text-xs font-mono text-[#00f0ff] break-all">SHA256:a3f8d2e1b9c4f7a6d0e3b2c1f8a9d7e6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e</div>
                  </div>
                  <div className="flex gap-2">
                    <button className="holo-btn text-sm flex-1 flex items-center justify-center gap-1">
                      <Download className="w-4 h-4" /> Download PDF
                    </button>
                    <button className="holo-btn text-sm flex items-center justify-center gap-1">
                      <Copy className="w-4 h-4" /> Copy Link
                    </button>
                  </div>
                </div>

                {/* In Progress */}
                <div className="holo-card p-6 border-dashed">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-[#1a1f35] border border-[#1e293b] flex items-center justify-center">
                      <Lock className="w-6 h-6 text-[#64748b]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#64748b]">Ethical Hacking & Penetration Testing</h3>
                      <p className="text-xs text-[#475569]">Complete all modules to earn</p>
                    </div>
                  </div>
                  <div className="text-sm text-[#64748b] mb-4">
                    You need to complete <span className="text-[#ff6b35] font-semibold">6 more modules</span> and achieve a minimum of 60% quiz accuracy.
                  </div>
                  <div className="holo-progress">
                    <div className="holo-progress-bar" style={{ width: '20%' }} />
                  </div>
                  <div className="text-xs text-[#64748b] mt-2 text-right">20% complete</div>
                </div>
              </div>

              {/* Verify Certificate */}
              <div className="holo-card p-6">
                <h2 className="text-base font-semibold mb-4">Verify a Certificate</h2>
                <div className="flex gap-2">
                  <input type="text" placeholder="Paste verification hash or certificate URL..." className="holo-input flex-1 text-sm font-mono" />
                  <button className="holo-btn holo-btn-primary text-sm px-6">Verify</button>
                </div>
              </div>
            </motion.div>
          )}

        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-[#1e293b]/50 mt-auto">
        <div className="max-w-[1400px] mx-auto px-4 py-3 flex items-center justify-between text-xs text-[#475569]">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-[#00f0ff]/50" />
            <span>CyberShield Academy</span>
          </div>
          <div className="flex items-center gap-4">
            <span>AI-Powered Cybersecurity Training</span>
            <span className="hidden sm:inline">&middot;</span>
            <span className="hidden sm:inline">v2.0 Holographic Edition</span>
          </div>
        </div>
      </footer>

      {/* ── Click outside to close notifications ── */}
      {notifOpen && <div className="fixed inset-0 z-30" onClick={() => setNotifOpen(false)} />}
    </div>
  );
}