'use client';

import { useState, useEffect, useRef, useCallback, type ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Bell,
  Send,
  Terminal as TerminalIcon,
  BarChart3,
  Award,
  User,
  Target,
  CheckCircle2,
  Circle,
  Clock,
  TrendingUp,
  BookOpen,
  Download,
  Search,
  AlertTriangle,
  Lightbulb,
  Zap,
  Activity,
  Lock,
  Copy,
  ExternalLink,
  ChevronRight,
  GraduationCap,
  Users,
  FileText,
  FlaskConical,
  Star,
  X,
  LogOut,
  Settings,
  LayoutDashboard,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface TelemetryEvent {
  userId: string;
  sessionId: string;
  eventType: 'focus' | 'blur' | 'tab_switch' | 'minimize' | 'idle' | 'visibility_change';
  eventValue?: string;
  durationMs?: number;
  pageUrl?: string;
  moduleContext?: string;
  timestamp?: string;
}

interface LabObjective {
  id: string;
  description: string;
  completed: boolean;
}

interface CertificateData {
  id: string;
  courseName: string;
  userName: string;
  issuedAt: string;
  verificationHash: string;
  status: string;
}

interface CourseData {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  moduleCount: number;
  studentCount: number;
  durationHours: number;
  enrolled: boolean;
  progress?: number;
  modules?: { title: string; completed: boolean }[];
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
}

// ─── Constants ───────────────────────────────────────────────────────────────

const USER_ID = 'cmruz2evv0000smvx6koj86pd';
const SESSION_ID = 'session-' + Date.now();
const COURSE_ID = 'demo-course';

const welcomeMessage: Message = {
  id: 'welcome',
  role: 'assistant',
  content:
    "# Welcome to CyberShield Academy\n\nI'm **Prof. Shield**, your AI cybersecurity instructor. Today we'll be exploring **Network Security Fundamentals**.\n\nHere's what we'll cover:\n- TCP/IP protocol suite\n- Firewall configuration\n- Intrusion detection systems\n- Network scanning techniques\n\nWhat aspect of network security interests you most?",
  timestamp: new Date().toISOString(),
};

const demoCourses: CourseData[] = [
  {
    id: 'demo-course',
    title: 'Network Security Fundamentals',
    description: 'Master TCP/IP, firewalls, IDS/IPS, and network scanning with hands-on labs. Build a solid foundation for your cybersecurity career.',
    category: 'cybersecurity',
    difficulty: 'intermediate',
    moduleCount: 8,
    studentCount: 1247,
    durationHours: 24,
    enrolled: true,
    progress: 50,
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
    id: 'course-webapp-sec',
    title: 'Web Application Security',
    description: 'Deep dive into OWASP Top 10, XSS, SQLi, CSRF, and modern web exploit techniques with real-world vulnerable applications.',
    category: 'cybersecurity',
    difficulty: 'advanced',
    moduleCount: 6,
    studentCount: 834,
    durationHours: 18,
    enrolled: false,
    modules: [
      { title: 'OWASP Top 10 Overview', completed: false },
      { title: 'Cross-Site Scripting (XSS)', completed: false },
      { title: 'SQL Injection', completed: false },
      { title: 'CSRF & Session Attacks', completed: false },
      { title: 'API Security', completed: false },
      { title: 'Advanced Exploitation', completed: false },
    ],
  },
  {
    id: 'course-cloud-sec',
    title: 'Cloud Security Fundamentals',
    description: 'AWS, Azure, and GCP security fundamentals including IAM, network policies, container security, and compliance frameworks.',
    category: 'cybersecurity',
    difficulty: 'beginner',
    moduleCount: 7,
    studentCount: 2103,
    durationHours: 21,
    enrolled: false,
    modules: [
      { title: 'Cloud Computing Basics', completed: false },
      { title: 'Identity & Access Management', completed: false },
      { title: 'Network Security in the Cloud', completed: false },
      { title: 'Container Security', completed: false },
      { title: 'Serverless Security', completed: false },
      { title: 'Compliance & Governance', completed: false },
      { title: 'Cloud Incident Response', completed: false },
    ],
  },
  {
    id: 'course-pentest',
    title: 'Ethical Hacking & Penetration Testing',
    description: 'Learn professional penetration testing methodologies, tool usage, report writing, and responsible disclosure practices.',
    category: 'cybersecurity',
    difficulty: 'advanced',
    moduleCount: 10,
    studentCount: 567,
    durationHours: 30,
    enrolled: false,
    modules: [],
  },
  {
    id: 'course-malware',
    title: 'Malware Analysis & Reverse Engineering',
    description: 'Static and dynamic malware analysis, disassembly, sandboxing, and understanding advanced threat actor techniques.',
    category: 'cybersecurity',
    difficulty: 'advanced',
    moduleCount: 8,
    studentCount: 423,
    durationHours: 26,
    enrolled: false,
    modules: [],
  },
  {
    id: 'course-iam',
    title: 'Identity & Access Management',
    description: 'Comprehensive IAM fundamentals covering authentication, authorization, SSO, MFA, and zero-trust architecture principles.',
    category: 'cybersecurity',
    difficulty: 'beginner',
    moduleCount: 6,
    studentCount: 1589,
    durationHours: 16,
    enrolled: false,
    modules: [],
  },
];

const demoPerformance = {
  userName: 'Alex Chen',
  courseName: 'Network Security Fundamentals',
  modulesCompleted: 4,
  totalModules: 8,
  overallQuizAccuracy: 0.82,
  averageFocusScore: 78,
  labCompletionRate: 0.75,
  totalInteractionCount: 347,
  totalTimeSpentMinutes: 1265,
  strengths: [
    'Strong theoretical understanding in: Network Scanning, Cryptography Basics',
    'Excellent practical skills demonstrated in: Firewall Configuration',
  ],
  weaknesses: ['Areas needing theoretical review: Web Application Security'],
  recommendations: ['Review OWASP Top 10 in detail', 'Complete remaining lab exercises'],
  moduleBreakdown: [
    { moduleTitle: 'Network Fundamentals', quizAccuracy: 0.9, comprehensionScore: 0.88, focusScore: 85, labCompleted: true, labScore: 0.92, timeSpentMinutes: 180 },
    { moduleTitle: 'TCP/IP Deep Dive', quizAccuracy: 0.85, comprehensionScore: 0.82, focusScore: 80, labCompleted: true, labScore: 0.88, timeSpentMinutes: 210 },
    { moduleTitle: 'Network Scanning', quizAccuracy: 0.78, comprehensionScore: 0.75, focusScore: 72, labCompleted: true, labScore: 0.8, timeSpentMinutes: 195 },
    { moduleTitle: 'Cryptography Basics', quizAccuracy: 0.82, comprehensionScore: 0.8, focusScore: 78, labCompleted: true, labScore: 0.85, timeSpentMinutes: 220 },
    { moduleTitle: 'Firewall Config', quizAccuracy: 0.75, comprehensionScore: 0.7, focusScore: 68, labCompleted: true, labScore: 0.78, timeSpentMinutes: 160 },
    { moduleTitle: 'Web App Security', quizAccuracy: 0.65, comprehensionScore: 0.6, focusScore: 62, labCompleted: false, labScore: null, timeSpentMinutes: 145 },
    { moduleTitle: 'Incident Response', quizAccuracy: 0.88, comprehensionScore: 0.85, focusScore: 82, labCompleted: false, labScore: null, timeSpentMinutes: 90 },
    { moduleTitle: 'Capstone', quizAccuracy: 0, comprehensionScore: 0, focusScore: 0, labCompleted: false, labScore: null, timeSpentMinutes: 65 },
  ],
};

const demoCertificates: CertificateData[] = [
  { id: 'cert-001', courseName: 'Network Security Fundamentals', userName: 'Alex Chen', issuedAt: '2026-06-15T10:00:00Z', verificationHash: 'sha256:a1b2c3d4e5f67890abcdef1234567890fedcba0987654321abcdef123456', status: 'active' },
  { id: 'cert-002', courseName: 'Cryptography Fundamentals', userName: 'Alex Chen', issuedAt: '2026-05-20T14:30:00Z', verificationHash: 'sha256:9876543210abcdef0987654321abcdef1234567890abcdef12345678abcd', status: 'active' },
  { id: 'cert-003', courseName: 'Ethical Hacking Basics', userName: 'Alex Chen', issuedAt: '2026-04-10T09:15:00Z', verificationHash: 'sha256:fedcba0987654321abcdef1234567890123456789abcdef12345678abcd', status: 'active' },
];

const labTopics = [
  { value: 'network-scanning', label: 'Network Scanning with Nmap' },
  { value: 'web-security', label: 'Web Application Security' },
  { value: 'cryptography', label: 'Cryptography & Hashing' },
  { value: 'firewall-config', label: 'Firewall Configuration' },
  { value: 'malware-analysis', label: 'Malware Analysis' },
];

const defaultLabObjectives: LabObjective[] = [
  { id: 'obj-1', description: 'Perform a basic network scan using nmap', completed: false },
  { id: 'obj-2', description: 'Identify open ports and running services', completed: false },
  { id: 'obj-3', description: 'Analyze the scan output for vulnerabilities', completed: false },
  { id: 'obj-4', description: 'Document findings in a security report', completed: false },
];

const quickTopics = [
  'Network Protocols',
  'Encryption Basics',
  'Firewall Rules',
  'Port Scanning',
  'OWASP Top 10',
  'Incident Response',
  'Zero Trust',
  'VPN Tunnels',
];

const demoQuiz: QuizQuestion[] = [
  { id: 'q1', question: 'Which TCP port is commonly used for HTTPS?', options: ['Port 80', 'Port 443', 'Port 22', 'Port 8080'], correctIndex: 1, explanation: 'HTTPS (HTTP over TLS/SSL) operates on port 443 by default.' },
  { id: 'q2', question: 'What type of firewall inspects packet headers and makes decisions based on source/destination IP and port?', options: ['Stateful Firewall', 'Packet Filtering Firewall', 'Application-Level Gateway', 'Next-Gen Firewall'], correctIndex: 1, explanation: 'Packet filtering firewalls operate at the network layer and make decisions based on IP addresses, ports, and protocols.' },
  { id: 'q3', question: 'Which tool is primarily used for network scanning and port discovery?', options: ['Wireshark', 'Nmap', 'Metasploit', 'Burp Suite'], correctIndex: 1, explanation: 'Nmap (Network Mapper) is the most widely used tool for network scanning and port discovery.' },
  { id: 'q4', question: 'What does a SYN flood attack target?', options: ['DNS Servers', 'TCP Handshake Process', 'SSL Certificates', 'Routing Tables'], correctIndex: 1, explanation: 'SYN flood attacks exploit the TCP three-way handshake by sending many SYN requests without completing the handshake.' },
  { id: 'q5', question: 'Which protocol operates at Layer 7 of the OSI model?', options: ['IP', 'TCP', 'HTTP', 'Ethernet'], correctIndex: 2, explanation: 'HTTP (Hypertext Transfer Protocol) is an application layer (Layer 7) protocol.' },
];

const chartConfig = { accuracy: { label: 'Quiz Accuracy', color: '#00f0ff' } };

const navItems = [
  { key: 'classroom', label: 'Classroom', icon: BookOpen },
  { key: 'courses', label: 'Courses', icon: GraduationCap },
  { key: 'lab', label: 'Lab', icon: TerminalIcon },
  { key: 'analytics', label: 'Analytics', icon: BarChart3 },
  { key: 'certificates', label: 'Certificates', icon: Award },
  { key: 'admin', label: 'Admin', icon: LayoutDashboard },
];

// ─── Helper Functions ────────────────────────────────────────────────────────

function formatTime(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function getFocusColor(score: number): string {
  if (score >= 75) return 'text-emerald-400';
  if (score >= 50) return 'text-amber-400';
  return 'text-pink-500';
}

function getFocusStroke(score: number): string {
  if (score >= 75) return '#10b981';
  if (score >= 50) return '#f59e0b';
  return '#ec4899';
}

function getFocusLabel(score: number): string {
  if (score >= 75) return 'Focused';
  if (score >= 50) return 'Distracted';
  return 'Inactive';
}

function getDifficultyColor(diff: string) {
  if (diff === 'beginner') return { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' };
  if (diff === 'intermediate') return { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' };
  return { bg: 'bg-pink-500/15', text: 'text-pink-400', border: 'border-pink-500/30' };
}

// ─── HoloCard wrapper ────────────────────────────────────────────────────────

function HoloCard({ children, className = '', glowColor = 'cyan', noPad = false }: { children: ReactNode; className?: string; glowColor?: 'cyan' | 'emerald' | 'violet' | 'amber' | 'pink'; noPad?: boolean }) {
  const borderColors: Record<string, string> = {
    cyan: 'border-cyan-500/20 hover:border-cyan-400/40 hover:shadow-[0_0_30px_rgba(0,240,255,0.15)]',
    emerald: 'border-emerald-500/20 hover:border-emerald-400/40 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]',
    violet: 'border-violet-500/20 hover:border-violet-400/40 hover:shadow-[0_0_30px_rgba(139,92,246,0.15)]',
    amber: 'border-amber-500/20 hover:border-amber-400/40 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]',
    pink: 'border-pink-500/20 hover:border-pink-400/40 hover:shadow-[0_0_30px_rgba(236,72,153,0.15)]',
  };
  const cornerColors: Record<string, string> = {
    cyan: 'border-cyan-500/40',
    emerald: 'border-emerald-500/40',
    violet: 'border-violet-500/40',
    amber: 'border-amber-500/40',
    pink: 'border-pink-500/40',
  };
  return (
    <div className={`relative bg-slate-900/60 backdrop-blur-xl rounded-xl border transition-all duration-500 ${borderColors[glowColor]} ${className}`}>
      {/* HUD Corners */}
      <div className={`absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 rounded-tl-xl ${cornerColors[glowColor]}`} />
      <div className={`absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 rounded-br-xl ${cornerColors[glowColor]}`} />
      {noPad ? children : <div className="p-4 sm:p-5">{children}</div>}
    </div>
  );
}

// ─── Particle Background Canvas ─────────────────────────────────────────────

function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let particles: { x: number; y: number; vx: number; vy: number; size: number; opacity: number; color: string }[] = [];
    let gridOffset = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Create particles
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -Math.random() * 0.5 - 0.1,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.1,
        color: Math.random() > 0.5 ? '#00f0ff' : '#10b981',
      });
    }

    const drawGrid = (time: number) => {
      const gridSpacing = 60;
      const perspective = 0.003;
      const pulse = Math.sin(time * 0.001) * 0.15 + 0.2;
      gridOffset = (gridOffset + 0.15) % gridSpacing;

      ctx.strokeStyle = `rgba(0, 240, 255, ${pulse * 0.3})`;
      ctx.lineWidth = 0.5;
      ctx.beginPath();

      // Horizontal lines (perspective grid)
      for (let y = canvas.height * 0.6; y < canvas.height; y += gridSpacing * 0.6) {
        const factor = (y - canvas.height * 0.5) / (canvas.height * 0.5);
        ctx.globalAlpha = factor * pulse;
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
      }
      ctx.stroke();

      // Vertical lines converging to horizon
      ctx.beginPath();
      const vanishX = canvas.width / 2;
      const vanishY = canvas.height * 0.45;
      for (let i = -15; i <= 15; i++) {
        const x = vanishX + i * gridSpacing * 1.5;
        ctx.globalAlpha = pulse * 0.25;
        ctx.moveTo(vanishX, vanishY);
        ctx.lineTo(x + (x - vanishX) * 3, canvas.height);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
    };

    const animate = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw perspective grid
      drawGrid(time);

      // Draw particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();

        // Glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
        grad.addColorStop(0, p.color);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.globalAlpha = p.opacity * 0.3;
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-[-1] pointer-events-none" />;
}

// ─── Focus Score Ring ────────────────────────────────────────────────────────

function FocusScoreRing({ score, size = 72 }: { score: number; size?: number }) {
  const circumference = 2 * Math.PI * 15.9155;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(0,240,255,0.1)" strokeWidth="2.5" />
        <path
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke={getFocusStroke(score)}
          strokeWidth="2.5"
          strokeDasharray={`${score}, 100`}
          strokeLinecap="round"
          className="transition-all duration-1000"
          style={{ filter: `drop-shadow(0 0 6px ${getFocusStroke(score)}60)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-bold" style={{ color: getFocusStroke(score), textShadow: `0 0 10px ${getFocusStroke(score)}80` }}>{score}</span>
        <span className="text-[8px] text-slate-500 uppercase tracking-wider">Focus</span>
      </div>
    </div>
  );
}

// ─── Typing Indicator ────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 px-4 py-3">
      <div className="flex gap-1.5">
        <span className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span className="text-xs text-cyan-400/70">Prof. Shield is thinking...</span>
    </div>
  );
}

// ─── Custom Scrollbar Style ──────────────────────────────────────────────────

function CustomScrollbar({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <ScrollArea className={className}>
      {children}
    </ScrollArea>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function CyberShieldDashboard() {
  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [user, setUser] = useState<UserData>({ id: USER_ID, name: 'Alex Chen', email: 'alex@cybershield.academy', role: 'admin' });
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Navigation state
  const [view, setView] = useState('classroom');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Chat state
  const [chatMessages, setChatMessages] = useState<Message[]>([welcomeMessage]);
  const [chatInput, setChatInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  // Terminal / Lab state
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [terminalInput, setTerminalInput] = useState('');
  const [labActive, setLabActive] = useState(false);
  const [labTopic, setLabTopic] = useState('');
  const [labObjectives, setLabObjectives] = useState<LabObjective[]>(defaultLabObjectives);
  const [labStatus, setLabStatus] = useState<'idle' | 'starting' | 'running' | 'completed' | 'failed'>('idle');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);

  // Focus & Progress state
  const [focusScore, setFocusScore] = useState(85);
  const [progressData, setProgressData] = useState(demoPerformance);

  // Certificates state
  const [certificates, setCertificates] = useState<CertificateData[]>(demoCertificates);
  const [verifyHash, setVerifyHash] = useState('');
  const [verifyResult, setVerifyResult] = useState<{ valid: boolean; message: string } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Courses state
  const [courses, setCourses] = useState<CourseData[]>(demoCourses);
  const [courseFilter, setCourseFilter] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState<CourseData | null>(null);
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [enrollingCourse, setEnrollingCourse] = useState<string | null>(null);

  // Quiz state
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>(demoQuiz);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);

  // Admin state
  const [adminStats, setAdminStats] = useState({ users: 1247, courses: 6, enrollments: 3421, certificates: 891, labs: 2156, avgScore: 78 });

  // Notifications
  const [notifications] = useState([
    { id: 'n1', text: 'New module available: Incident Response', time: '2m ago', read: false },
    { id: 'n2', text: 'Your certificate is ready to download', time: '1h ago', read: false },
    { id: 'n3', text: 'Lab session expires in 30 minutes', time: '3h ago', read: true },
  ]);

  // Refs
  const chatEndRef = useRef<HTMLDivElement>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const terminalInputRef = useRef<HTMLInputElement>(null);
  const chatTextareaRef = useRef<HTMLTextAreaElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const telemetryBufferRef = useRef<TelemetryEvent[]>([]);
  const telemetryIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const commandHistoryIndexRef = useRef(-1);

  // ─── Telemetry ──────────────────────────────────────────────────────────

  const addTelemetryEvent = useCallback(
    (eventType: TelemetryEvent['eventType'], eventValue?: string, durationMs?: number) => {
      telemetryBufferRef.current.push({
        userId: user.id,
        sessionId: SESSION_ID,
        eventType,
        eventValue,
        durationMs,
        pageUrl: typeof window !== 'undefined' ? window.location.href : undefined,
        moduleContext: view,
        timestamp: new Date().toISOString(),
      });
    },
    [user.id, view]
  );

  const flushTelemetry = useCallback(async () => {
    const events = telemetryBufferRef.current.splice(0, telemetryBufferRef.current.length);
    if (events.length === 0) return;
    try {
      await fetch('/api/telemetry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ events }) });
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => addTelemetryEvent('visibility_change', document.hidden ? 'tab_hidden' : 'tab_visible');
    const handleFocus = () => addTelemetryEvent('focus');
    const handleBlur = () => addTelemetryEvent('blur');
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    telemetryIntervalRef.current = setInterval(flushTelemetry, 8000);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      if (telemetryIntervalRef.current) clearInterval(telemetryIntervalRef.current);
      flushTelemetry();
    };
  }, [addTelemetryEvent, flushTelemetry]);

  // ─── Chat ───────────────────────────────────────────────────────────────

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);

  const handleSendMessage = async () => {
    const trimmed = chatInput.trim();
    if (!trimmed || isStreaming) return;
    const userMsg: Message = { id: `msg-${Date.now()}`, role: 'user', content: trimmed, timestamp: new Date().toISOString() };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setIsStreaming(true);
    addTelemetryEvent('focus', 'chat_message_sent');
    const assistantId = `msg-${Date.now() + 1}`;
    setChatMessages((prev) => [...prev, { id: assistantId, role: 'assistant', content: '', timestamp: new Date().toISOString() }]);
    try {
      const history = chatMessages.filter((m) => m.id !== 'welcome').slice(-10).map((m) => ({ role: m.role, content: m.content }));
      const response = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.id, sessionId: SESSION_ID, courseId: COURSE_ID, message: trimmed, history }) });
      if (!response.ok) throw new Error('Chat request failed');
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          setChatMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: accumulated } : m)));
        }
      }
      const newFocus = response.headers.get('X-Focus-Score');
      if (newFocus) setFocusScore(parseInt(newFocus, 10));
    } catch {
      setChatMessages((prev) => prev.map((m) => m.id === assistantId ? { ...m, content: "I'm having trouble connecting right now. Please try again in a moment." } : m));
    } finally { setIsStreaming(false); }
  };

  const handleChatKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } };

  // ─── Terminal / Lab ────────────────────────────────────────────────────

  const connectTerminal = useCallback((sessionId: string, containerName: string, objectives: LabObjective[]) => {
    if (socketRef.current?.connected) socketRef.current.disconnect();
    const socket = io('/?XTransformPort=3004', { transports: ['websocket'], reconnection: true, reconnectionAttempts: 5 });
    socket.on('connect', () => { socket.emit('terminal:join', { userId: user.id, labSessionId: sessionId, containerName, objectives: objectives.map((o) => ({ id: o.id, description: o.description })) }); });
    socket.on('terminal:output', (data: { data: string }) => { setTerminalLines((prev) => [...prev, ...data.data.split('\r\n').filter(Boolean)]); });
    socket.on('terminal:clear', () => setTerminalLines([]));
    socket.on('terminal:prompt', () => terminalInputRef.current?.focus());
    socket.on('lab:progress', (data: { objectivesCompleted: LabObjective[] }) => setLabObjectives(data.objectivesCompleted));
    socket.on('lab:completed', (data: { message: string }) => { setLabStatus('completed'); setTerminalLines((prev) => [...prev, '', '═══════════════════════════════════════════════', `  ${data.message}`, '═══════════════════════════════════════════════']); });
    socket.on('disconnect', () => {});
    socketRef.current = socket;
  }, [user.id]);

  useEffect(() => { terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [terminalLines]);

  const handleStartLab = async () => {
    if (!labTopic) return;
    setLabStatus('starting');
    setTerminalLines([]);
    setLabObjectives(defaultLabObjectives.map((o) => ({ ...o, completed: false })));
    setCommandHistory([]);
    commandHistoryIndexRef.current = -1;
    try {
      const res = await fetch('/api/labs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.id, topic: labTopic, objectives: defaultLabObjectives.map((o) => o.description) }) });
      const data = await res.json();
      if (!res.ok && res.status === 409) { setLabStatus('running'); setLabActive(true); return; }
      if (!res.ok) throw new Error('Failed to start lab');
      const sessionId = data.session?.id ?? `lab-${Date.now()}`;
      const containerName = data.session?.containerName ?? 'cybershield-lab';
      const objectives = data.session?.objectives ?? defaultLabObjectives;
      setLabObjectives(objectives);
      setLabStatus('running');
      setLabActive(true);
      connectTerminal(sessionId, containerName, objectives);
    } catch { setLabStatus('failed'); setTerminalLines(['Failed to start lab environment.', 'Please try again or select a different topic.']); }
  };

  const handleTerminalSubmit = () => {
    const cmd = terminalInput.trim();
    if (!cmd || !socketRef.current?.connected) return;
    setCommandHistory((prev) => [...prev, cmd]);
    commandHistoryIndexRef.current = -1;
    socketRef.current.emit('terminal:input', { input: cmd + '\r' });
    setTerminalInput('');
  };

  const handleTerminalKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { handleTerminalSubmit(); return; }
    if (e.key === 'ArrowUp') { e.preventDefault(); if (!commandHistory.length) return; const idx = commandHistoryIndexRef.current < commandHistory.length - 1 ? commandHistoryIndexRef.current + 1 : commandHistoryIndexRef.current; commandHistoryIndexRef.current = idx; setTerminalInput(commandHistory[commandHistory.length - 1 - idx]); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); if (commandHistoryIndexRef.current > 0) { commandHistoryIndexRef.current -= 1; setTerminalInput(commandHistory[commandHistory.length - 1 - commandHistoryIndexRef.current]); } else { commandHistoryIndexRef.current = -1; setTerminalInput(''); } }
  };

  // ─── Progress / Analytics ──────────────────────────────────────────────

  useEffect(() => {
    async function fetchProgress() {
      try {
        const res = await fetch(`/api/progress?userId=${user.id}&courseId=${COURSE_ID}`);
        if (res.ok) { const data = await res.json(); if (data.performance && data.performance.totalInteractionCount > 0) setProgressData(data.performance); }
      } catch { /* demo data */ }
    }
    if (isLoggedIn) fetchProgress();
  }, [view, isLoggedIn, user.id]);

  // ─── Certificates ──────────────────────────────────────────────────────

  useEffect(() => {
    async function fetchCerts() {
      try { const res = await fetch(`/api/certificates?userId=${user.id}`); if (res.ok) { const data = await res.json(); if (data.certificates?.length > 0) setCertificates(data.certificates); } } catch { /* demo */ }
    }
    if (isLoggedIn) fetchCerts();
  }, [isLoggedIn, user.id]);

  const handleVerifyCertificate = async () => {
    if (!verifyHash.trim()) return;
    setIsVerifying(true); setVerifyResult(null);
    try {
      const res = await fetch(`/api/certificates/verify?hash=${encodeURIComponent(verifyHash.trim())}`);
      const data = await res.json();
      if (data.valid) setVerifyResult({ valid: true, message: `Valid certificate for ${data.certificate?.userName} — "${data.certificate?.courseName}" (${data.certificate?.issuedAt ? formatDate(data.certificate.issuedAt) : 'unknown'})` });
      else setVerifyResult({ valid: false, message: data.error || 'Certificate verification failed.' });
    } catch { setVerifyResult({ valid: false, message: 'Verification request failed.' }); } finally { setIsVerifying(false); }
  };

  const handleDownloadCert = (certId: string) => { window.open(`/api/certificates?download=${certId}`, '_blank'); };

  // ─── Courses ───────────────────────────────────────────────────────────

  useEffect(() => {
    async function fetchCourses() {
      try { const res = await fetch(`/api/courses?userId=${user.id}`); if (res.ok) { const data = await res.json(); if (data.courses?.length > 0) setCourses(data.courses); } } catch { /* demo */ }
    }
    if (isLoggedIn) fetchCourses();
  }, [isLoggedIn, user.id]);

  const handleEnroll = async (courseId: string) => {
    setEnrollingCourse(courseId);
    try {
      const res = await fetch('/api/enroll', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.id, courseId }) });
      if (res.ok) setCourses((prev) => prev.map((c) => c.id === courseId ? { ...c, enrolled: true } : c));
    } catch { /* silent */ } finally { setEnrollingCourse(null); }
  };

  // ─── Quiz ──────────────────────────────────────────────────────────────

  const handleOpenQuiz = async () => {
    setQuizLoading(true);
    try {
      const res = await fetch(`/api/quizzes/mod-5`);
      if (res.ok) { const data = await res.json(); if (data.questions?.length > 0) { setQuizQuestions(data.questions); } }
    } catch { /* use demo quiz */ } finally { setQuizLoading(false); setQuizIndex(0); setQuizAnswers({}); setQuizSubmitted(false); setQuizOpen(true); }
  };

  const handleQuizSubmit = async () => {
    setQuizSubmitted(true);
    // POST answers
    try {
      await fetch(`/api/quizzes/mod-5`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.id, answers: quizAnswers }) });
    } catch { /* silent */ }
  };

  const quizScore = quizQuestions.length > 0 ? Math.round((Object.entries(quizAnswers).filter(([idx, ans]) => quizQuestions[parseInt(idx)]?.correctIndex === ans).length / quizQuestions.length) * 100) : 0;
  const quizPassed = quizScore >= 70;

  // ─── Admin ─────────────────────────────────────────────────────────────

  useEffect(() => {
    async function fetchAdminStats() {
      if (user.role !== 'admin') return;
      try { const res = await fetch('/api/admin/stats'); if (res.ok) { const data = await res.json(); setAdminStats(data); } } catch { /* demo */ }
    }
    if (isLoggedIn) fetchAdminStats();
  }, [isLoggedIn, user.role]);

  // ─── Login Handler ─────────────────────────────────────────────────────

  const handleQuickLogin = () => {
    setUser({ id: USER_ID, name: 'Alex Chen', email: 'alex@cybershield.academy', role: 'admin' });
    setIsLoggedIn(true);
  };

  const handleLogin = async () => {
    setLoginLoading(true);
    try {
      const res = await fetch('/api/auth/callback/credentials', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: loginEmail, password: loginPassword }) });
      if (res.ok) { setUser({ id: USER_ID, name: loginEmail.split('@')[0], email: loginEmail, role: 'student' }); setIsLoggedIn(true); }
      else handleQuickLogin();
    } catch { handleQuickLogin(); } finally { setLoginLoading(false); }
  };

  // ─── Render: Login Screen ──────────────────────────────────────────────

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center p-4 relative overflow-hidden">
        <ParticleBackground />

        {/* Scan Line */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute w-full h-32 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent animate-[scanline_8s_linear_infinite]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-md"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 mb-4"
              style={{ boxShadow: '0 0 40px rgba(0,240,255,0.15)' }}
            >
              <Shield className="h-10 w-10 text-cyan-400" />
            </motion.div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-emerald-400 to-violet-500 bg-clip-text text-transparent">
              CyberShield Academy
            </h1>
            <p className="text-slate-500 mt-2 text-sm">AI-Powered Cybersecurity Learning Platform</p>
          </div>

          {/* Login Card */}
          <HoloCard glowColor="cyan">
            <AnimatePresence mode="wait">
              {!isSignUp ? (
                <motion.div key="login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
                  <h2 className="text-lg font-semibold text-slate-100 mb-1">Welcome Back</h2>
                  <p className="text-sm text-slate-500 mb-6">Sign in to continue your training</p>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 block">Email</label>
                      <Input
                        type="email"
                        placeholder="agent@cybershield.academy"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="bg-slate-950/80 border-cyan-500/20 focus:border-cyan-400/50 text-slate-200 placeholder:text-slate-600 h-11 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 block">Password</label>
                      <Input
                        type="password"
                        placeholder="••••••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                        className="bg-slate-950/80 border-cyan-500/20 focus:border-cyan-400/50 text-slate-200 placeholder:text-slate-600 h-11 rounded-lg"
                      />
                    </div>
                    <Button onClick={handleLogin} disabled={loginLoading} className="w-full h-11 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-semibold rounded-lg hover:shadow-[0_0_25px_rgba(0,240,255,0.3)] hover:from-cyan-400 hover:to-emerald-400 transition-all duration-300">
                      {loginLoading ? <span className="animate-pulse">Authenticating...</span> : 'Sign In'}
                    </Button>
                  </div>
                  <p className="text-center text-sm text-slate-500 mt-4">
                    Don&apos;t have an account?{' '}
                    <button onClick={() => setIsSignUp(true)} className="text-cyan-400 hover:text-cyan-300 transition-colors">Create Account</button>
                  </p>
                </motion.div>
              ) : (
                <motion.div key="signup" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                  <h2 className="text-lg font-semibold text-slate-100 mb-1">Create Account</h2>
                  <p className="text-sm text-slate-500 mb-6">Join the next generation of defenders</p>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 block">Full Name</label>
                      <Input placeholder="Agent Name" className="bg-slate-950/80 border-cyan-500/20 focus:border-cyan-400/50 text-slate-200 placeholder:text-slate-600 h-11 rounded-lg" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 block">Email</label>
                      <Input type="email" placeholder="agent@cybershield.academy" className="bg-slate-950/80 border-cyan-500/20 focus:border-cyan-400/50 text-slate-200 placeholder:text-slate-600 h-11 rounded-lg" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 block">Password</label>
                      <Input type="password" placeholder="••••••••••••" className="bg-slate-950/80 border-cyan-500/20 focus:border-cyan-400/50 text-slate-200 placeholder:text-slate-600 h-11 rounded-lg" />
                    </div>
                    <Button onClick={() => { setIsSignUp(false); handleQuickLogin(); }} className="w-full h-11 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-semibold rounded-lg hover:shadow-[0_0_25px_rgba(0,240,255,0.3)] transition-all duration-300">
                      Create Account
                    </Button>
                  </div>
                  <p className="text-center text-sm text-slate-500 mt-4">
                    Already have an account?{' '}
                    <button onClick={() => setIsSignUp(false)} className="text-cyan-400 hover:text-cyan-300 transition-colors">Sign In</button>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative mt-5">
              <Separator className="bg-slate-700/50" />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 px-3 text-xs text-slate-500 uppercase tracking-wider">or</span>
            </div>

            <Button
              onClick={handleQuickLogin}
              className="w-full mt-5 h-11 border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 font-semibold rounded-lg hover:bg-cyan-500/10 hover:border-cyan-400/50 hover:shadow-[0_0_20px_rgba(0,240,255,0.15)] transition-all duration-300"
              variant="outline"
            >
              <Zap className="h-4 w-4 mr-2" />
              Enter Academy
            </Button>
          </HoloCard>
        </motion.div>
      </div>
    );
  }

  // ─── Render: Main Dashboard ────────────────────────────────────────────

  const filteredCourses = courseFilter === 'all' ? courses : courses.filter((c) => c.difficulty === courseFilter);
  const unreadNotifs = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col relative overflow-hidden">
      <ParticleBackground />

      {/* Scan Line Effect */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        <div className="absolute w-full h-32 bg-gradient-to-b from-transparent via-cyan-500/3 to-transparent animate-[scanline_8s_linear_infinite]" />
      </div>

      {/* ─── Top Navigation Bar ──────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-cyan-500/10">
        <div className="max-w-screen-2xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center" style={{ boxShadow: '0 0 12px rgba(0,240,255,0.2)' }}>
              <Shield className="h-4.5 w-4.5 text-cyan-400" />
            </div>
            <span className="font-bold text-base sm:text-lg tracking-[0.15em] uppercase bg-gradient-to-r from-cyan-400 via-emerald-400 to-violet-500 bg-clip-text text-transparent hidden sm:inline">
              CyberShield
            </span>
          </div>

          {/* Center Nav (Desktop) */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems
              .filter((item) => item.key !== 'admin' || user.role === 'admin')
              .map((item) => {
                const Icon = item.icon;
                const isActive = view === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => setView(item.key)}
                    className={`relative px-3 lg:px-4 py-2 text-sm font-medium transition-all duration-300 flex items-center gap-1.5 ${
                      isActive
                        ? 'text-cyan-400'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden lg:inline">{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full"
                        style={{ boxShadow: '0 0 8px rgba(0,240,255,0.5)' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Focus Orb */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/60 border border-cyan-500/10">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: getFocusStroke(focusScore), boxShadow: `0 0 6px ${getFocusStroke(focusScore)}` }} />
              <span className={`text-xs font-medium ${getFocusColor(focusScore)}`}>{focusScore}%</span>
            </div>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 h-9 w-9">
                  <Bell className="h-4.5 w-4.5" />
                  {unreadNotifs > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-pink-500 text-[10px] font-bold text-white flex items-center justify-center">{unreadNotifs}</span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 bg-slate-900/95 backdrop-blur-xl border border-cyan-500/15">
                <DropdownMenuItem className="text-cyan-400 font-semibold text-sm">Notifications</DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-700/50" />
                {notifications.map((n) => (
                  <DropdownMenuItem key={n.id} className={`text-sm ${n.read ? 'text-slate-500' : 'text-slate-200'} focus:bg-cyan-500/10 focus:text-cyan-400`}>
                    <div className="flex-1">
                      <p>{n.text}</p>
                      <p className="text-xs text-slate-600 mt-0.5">{n.time}</p>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Toggle */}
            <Button variant="ghost" size="icon" className="md:hidden text-slate-400 hover:text-cyan-400 h-9 w-9" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <div className="space-y-1.5">
                <span className={`block h-0.5 w-5 bg-current transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                <span className={`block h-0.5 w-5 bg-current transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`} />
                <span className={`block h-0.5 w-5 bg-current transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
              </div>
            </Button>

            {/* User Avatar */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="hidden sm:flex items-center gap-2 h-9 px-2 hover:bg-cyan-500/10">
                  <Avatar className="h-7 w-7 border border-cyan-500/20">
                    <AvatarFallback className="bg-gradient-to-br from-cyan-500/20 to-violet-500/20 text-cyan-400 text-xs font-bold">{user.name.split(' ').map((n) => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-slate-300 max-w-[100px] truncate">{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-slate-900/95 backdrop-blur-xl border border-cyan-500/15">
                <DropdownMenuItem className="text-slate-300 focus:bg-cyan-500/10 focus:text-cyan-400">
                  <User className="h-4 w-4 mr-2" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="text-slate-300 focus:bg-cyan-500/10 focus:text-cyan-400">
                  <Settings className="h-4 w-4 mr-2" /> Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-700/50" />
                <DropdownMenuItem className="text-pink-400 focus:bg-pink-500/10" onClick={() => { setIsLoggedIn(false); socketRef.current?.disconnect(); }}>
                  <LogOut className="h-4 w-4 mr-2" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden border-t border-cyan-500/10 bg-slate-950/95 backdrop-blur-xl"
            >
              <nav className="flex flex-col p-3 gap-1">
                {navItems
                  .filter((item) => item.key !== 'admin' || user.role === 'admin')
                  .map((item) => {
                    const Icon = item.icon;
                    const isActive = view === item.key;
                    return (
                      <button
                        key={item.key}
                        onClick={() => { setView(item.key); setMobileMenuOpen(false); }}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                          isActive ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                        {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400" />}
                      </button>
                    );
                  })}
                <div className="mt-2 pt-2 border-t border-slate-800">
                  <button onClick={() => { setIsLoggedIn(false); socketRef.current?.disconnect(); }} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-pink-400 hover:bg-pink-500/10 w-full">
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ─── Main Content Area ───────────────────────────────────────────── */}
      <main className="flex-1 relative z-10">
        <div className="max-w-screen-2xl mx-auto p-3 sm:p-4 lg:p-6">
          <AnimatePresence mode="wait">
            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* VIEW: CLASSROOM                                              */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            {view === 'classroom' && (
              <motion.div key="classroom" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="grid grid-cols-1 lg:grid-cols-10 gap-4 lg:gap-5 h-[calc(100vh-5rem)]">
                {/* Chat Panel (70%) */}
                <div className="lg:col-span-7 flex flex-col h-full min-h-0">
                  <HoloCard glowColor="cyan" noPad className="flex flex-col h-full">
                    {/* Chat Header */}
                    <div className="px-4 py-3 border-b border-cyan-500/10 flex items-center gap-3 shrink-0">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/20 flex items-center justify-center">
                        <Shield className="h-4 w-4 text-cyan-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-slate-100">Prof. Shield</p>
                        <p className="text-xs text-emerald-400 flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Online — Network Security Module
                        </p>
                      </div>
                      <Badge variant="outline" className="text-[10px] border-cyan-500/20 text-cyan-400">Module 3/8</Badge>
                    </div>

                    {/* Messages */}
                    <ScrollArea className="flex-1 p-4">
                      <div className="space-y-4">
                        {chatMessages.map((msg) => (
                          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            {msg.role === 'assistant' && (
                              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/20 flex items-center justify-center shrink-0 mt-1">
                                <Shield className="h-3.5 w-3.5 text-cyan-400" />
                              </div>
                            )}
                            <div className={`max-w-[85%] sm:max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                              {msg.content ? (
                                <div className={`rounded-2xl px-4 py-3 ${
                                  msg.role === 'user'
                                    ? 'bg-cyan-500/10 border border-cyan-500/20 rounded-br-md'
                                    : 'bg-slate-800/50 border border-slate-700/30 rounded-bl-md'
                                }`}>
                                  {msg.role === 'assistant' ? (
                                    <div className="prose prose-invert prose-sm max-w-none [&_p]:text-slate-300 [&_p]:leading-relaxed [&_strong]:text-cyan-400 [&_code]:text-emerald-400 [&_code]:bg-slate-950 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono [&_pre]:bg-slate-950 [&_pre]:border [&_pre]:border-slate-700/50 [&_pre]:rounded-lg [&_pre]:p-3 [&_pre]:font-mono [&_pre]:text-sm [&_pre]:text-emerald-400 [&_ul]:text-slate-300 [&_ol]:text-slate-300 [&_li]:text-slate-300 [&_h1]:text-cyan-400 [&_h2]:text-cyan-400 [&_h3]:text-cyan-400 [&_h1]:text-lg [&_h2]:text-base [&_h3]:text-sm [&_a]:text-cyan-400 [&_blockquote]:border-cyan-500/30 [&_blockquote]:text-slate-400">
                                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                                    </div>
                                  ) : (
                                    <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                  )}
                                </div>
                              ) : (
                                <div className="bg-slate-800/50 border border-slate-700/30 rounded-2xl rounded-bl-md px-4 py-3">
                                  <TypingIndicator />
                                </div>
                              )}
                              <p className={`text-[10px] mt-1.5 ${msg.role === 'user' ? 'text-right text-slate-600' : 'text-slate-600'}`}>
                                {formatTime(msg.timestamp)}
                              </p>
                            </div>
                            {msg.role === 'user' && (
                              <div className="w-7 h-7 rounded-full bg-violet-500/20 border border-violet-500/20 flex items-center justify-center shrink-0 mt-1">
                                <span className="text-[10px] font-bold text-violet-400">{user.name.split(' ').map((n) => n[0]).join('')}</span>
                              </div>
                            )}
                          </div>
                        ))}
                        <div ref={chatEndRef} />
                      </div>
                    </ScrollArea>

                    {/* Input Area */}
                    <div className="p-3 sm:p-4 border-t border-cyan-500/10 shrink-0">
                      <div className="flex gap-2 items-end">
                        <Textarea
                          ref={chatTextareaRef}
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyDown={handleChatKeyDown}
                          placeholder="Ask Prof. Shield about cybersecurity..."
                          className="min-h-[44px] max-h-32 resize-none bg-slate-900/80 border-cyan-500/20 focus:border-cyan-400/50 rounded-xl text-sm text-slate-200 placeholder:text-slate-600"
                          rows={1}
                          disabled={isStreaming}
                        />
                        <Button
                          onClick={handleSendMessage}
                          disabled={!chatInput.trim() || isStreaming}
                          className="shrink-0 h-11 w-11 p-0 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-xl hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:from-cyan-400 hover:to-emerald-400 transition-all duration-300 disabled:opacity-30"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </HoloCard>
                </div>

                {/* Right Sidebar (30%) */}
                <div className="lg:col-span-3 flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-5rem)] pb-4">
                  {/* Current Course Module */}
                  <HoloCard glowColor="emerald">
                    <div className="flex items-center gap-2 mb-3">
                      <BookOpen className="h-4 w-4 text-emerald-400" />
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Current Module</h3>
                    </div>
                    <p className="font-semibold text-sm text-slate-100">Network Security Fundamentals</p>
                    <p className="text-xs text-slate-500 mt-1">Module 3 of 8 — Network Scanning</p>
                    <Progress value={37.5} className="h-1.5 mt-3 [&_[role=progressbar]]:bg-gradient-to-r [&_[role=progressbar]]:from-cyan-500 [&_[role=progressbar]]:to-emerald-500" />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1.5">
                      <span>Progress</span>
                      <span className="text-cyan-400 font-medium">37.5%</span>
                    </div>
                  </HoloCard>

                  {/* Focus Score Ring */}
                  <HoloCard glowColor="cyan">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="h-4 w-4 text-cyan-400" />
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Focus Score</h3>
                    </div>
                    <div className="flex items-center gap-4">
                      <FocusScoreRing score={focusScore} size={72} />
                      <div>
                        <p className="text-sm font-medium" style={{ color: getFocusStroke(focusScore) }}>{getFocusLabel(focusScore)}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {focusScore >= 75 ? 'Great concentration' : focusScore >= 50 ? 'Minimize distractions' : 'Please refocus'}
                        </p>
                      </div>
                    </div>
                  </HoloCard>

                  {/* Quick Topics */}
                  <HoloCard glowColor="violet">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="h-4 w-4 text-violet-400" />
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Quick Topics</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {quickTopics.map((topic) => (
                        <button
                          key={topic}
                          onClick={() => { setChatInput(topic); chatTextareaRef.current?.focus(); }}
                          className="text-xs px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 hover:bg-violet-500/20 hover:border-violet-400/40 hover:shadow-[0_0_12px_rgba(139,92,246,0.15)] transition-all duration-300"
                        >
                          {topic}
                        </button>
                      ))}
                    </div>
                  </HoloCard>

                  {/* Start Quiz Button */}
                  <button
                    onClick={handleOpenQuiz}
                    disabled={quizLoading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-500/20 to-pink-500/20 border border-violet-500/20 text-violet-300 text-sm font-semibold hover:from-violet-500/30 hover:to-pink-500/30 hover:border-violet-400/40 hover:shadow-[0_0_20px_rgba(139,92,246,0.15)] transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Award className="h-4 w-4" />
                    {quizLoading ? 'Loading Quiz...' : 'Start Quiz'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* VIEW: COURSES                                                */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            {view === 'courses' && (
              <motion.div key="courses" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-cyan-400 via-emerald-400 to-violet-500 bg-clip-text text-transparent">
                      Course Catalog
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Master cybersecurity through hands-on learning paths</p>
                  </div>
                  <div className="flex gap-2">
                    {['all', 'beginner', 'intermediate', 'advanced'].map((f) => (
                      <button
                        key={f}
                        onClick={() => setCourseFilter(f)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-300 capitalize ${
                          courseFilter === f
                            ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.1)]'
                            : 'bg-slate-900/40 border-slate-700/30 text-slate-400 hover:border-slate-600 hover:text-slate-300'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Course Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredCourses.map((course, idx) => {
                    const dc = getDifficultyColor(course.difficulty);
                    return (
                      <motion.div
                        key={course.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.08, duration: 0.4 }}
                      >
                        <HoloCard glowColor="cyan" className="h-full flex flex-col hover:-translate-y-1 cursor-pointer group" onClick={() => { setSelectedCourse(course); setCourseModalOpen(true); }}>
                          <div className="flex items-start justify-between mb-3">
                            <Badge variant="outline" className={`text-[10px] ${dc.bg} ${dc.text} ${dc.border} border`}>
                              {course.difficulty}
                            </Badge>
                            {course.enrolled && (
                              <Badge className="text-[10px] bg-emerald-500/15 text-emerald-400 border-emerald-500/30 border">Enrolled</Badge>
                            )}
                          </div>
                          <h3 className="font-semibold text-sm text-slate-100 group-hover:text-cyan-300 transition-colors line-clamp-2 mb-2">{course.title}</h3>
                          <p className="text-xs text-slate-500 line-clamp-2 mb-4 flex-1">{course.description}</p>
                          <div className="flex items-center gap-3 text-[11px] text-slate-500 mb-4">
                            <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> {course.moduleCount} modules</span>
                            <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {course.studentCount.toLocaleString()}</span>
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {course.durationHours}h</span>
                          </div>
                          {course.enrolled && course.progress !== undefined && (
                            <div className="mb-3">
                              <Progress value={course.progress} className="h-1 [&_[role=progressbar]]:bg-gradient-to-r [&_[role=progressbar]]:from-cyan-500 [&_[role=progressbar]]:to-emerald-500" />
                              <p className="text-[10px] text-slate-500 mt-1">{course.progress}% complete</p>
                            </div>
                          )}
                          <Button
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); if (course.enrolled) { setView('classroom'); } else { handleEnroll(course.id); } }}
                            className={`w-full text-xs h-9 rounded-lg transition-all duration-300 ${
                              course.enrolled
                                ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 text-cyan-400 hover:from-cyan-500/30 hover:to-emerald-500/30'
                                : 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-white hover:shadow-[0_0_20px_rgba(0,240,255,0.3)]'
                            }`}
                            disabled={enrollingCourse === course.id}
                          >
                            {enrollingCourse === course.id ? 'Enrolling...' : course.enrolled ? 'Continue Learning' : 'Enroll Now'}
                            <ChevronRight className="h-3.5 w-3.5 ml-1" />
                          </Button>
                        </HoloCard>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* VIEW: LAB TERMINAL                                           */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            {view === 'lab' && (
              <motion.div key="lab" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="grid grid-cols-1 lg:grid-cols-10 gap-4 lg:gap-5 h-[calc(100vh-5rem)]">
                {/* Terminal (70%) */}
                <div className="lg:col-span-7 flex flex-col gap-4 h-full min-h-0">
                  {/* Lab Controls */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <Select value={labTopic} onValueChange={setLabTopic}>
                      <SelectTrigger className="w-full sm:w-64 bg-slate-900/60 border-cyan-500/20 text-slate-200 focus:border-cyan-400/50">
                        <SelectValue placeholder="Select lab topic..." />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900/95 backdrop-blur-xl border-cyan-500/15">
                        {labTopics.map((t) => (
                          <SelectItem key={t.value} value={t.value} className="text-slate-300 focus:bg-cyan-500/10 focus:text-cyan-400">{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={handleStartLab}
                      disabled={!labTopic || labStatus === 'starting' || labStatus === 'running'}
                      className={`text-sm h-10 rounded-lg font-semibold transition-all duration-300 ${
                        labStatus === 'running'
                          ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                          : labTopic
                            ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-white hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] animate-[pulse-glow_2s_ease-in-out_infinite]'
                            : 'bg-slate-800 text-slate-500 border border-slate-700'
                      }`}
                    >
                      <TerminalIcon className="h-4 w-4 mr-2" />
                      {labStatus === 'starting' ? 'Initializing...' : labStatus === 'running' ? 'Lab Active' : 'Initialize Lab'}
                    </Button>
                  </div>

                  {/* Terminal Window */}
                  <div className="flex-1 min-h-0 rounded-xl overflow-hidden border border-cyan-500/15 bg-[#0a0e17]" style={{ boxShadow: '0 0 30px rgba(0,240,255,0.05)' }}>
                    {/* Terminal Header */}
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-900/80 border-b border-cyan-500/10">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-pink-500/80" />
                        <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                        <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                      </div>
                      <span className="text-xs text-slate-500 font-mono ml-2">cybershield-lab — bash</span>
                      {labStatus === 'running' && (
                        <div className="ml-auto flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="text-[10px] text-emerald-400 font-mono">CONNECTED</span>
                        </div>
                      )}
                    </div>

                    {/* Terminal Content */}
                    <ScrollArea className="h-[calc(100%-2.75rem)]">
                      <div className="p-4 font-mono text-sm min-h-[200px]">
                        {terminalLines.length === 0 && (
                          <div className="text-slate-600 text-sm">
                            <p className="text-cyan-500/50">{`
  ██████╗██╗   ██╗██████╗ ███████╗██████╗ 
 ██╔════╝╚██╗ ██╔╝██╔══██╗██╔════╝██╔══██╗
 ██║      ╚████╔╝ ██████╔╝█████╗  ██████╔╝
 ██║       ╚██╔╝  ██╔══██╗██╔══╝  ██╔══██╗
 ╚██████╗   ██║   ██████╔╝███████╗██║  ██║
  ╚═════╝   ╚═╝   ╚═════╝ ╚══════╝╚═╝  ╚═╝
                          `}</p>
                            <p className="mt-3 text-slate-600">Select a topic and click &quot;Initialize Lab&quot; to begin your session.</p>
                          </div>
                        )}
                        {terminalLines.map((line, i) => (
                          <div key={i} className="text-emerald-400 leading-relaxed whitespace-pre-wrap">{line}</div>
                        ))}
                        {labStatus === 'running' && (
                          <div className="flex items-center mt-1">
                            <span className="text-cyan-400 mr-2">┌──(agent㉿cybershield)-[~]</span>
                            <span className="text-pink-400 mr-2">└─$</span>
                            <input
                              ref={terminalInputRef}
                              value={terminalInput}
                              onChange={(e) => setTerminalInput(e.target.value)}
                              onKeyDown={handleTerminalKeyDown}
                              className="flex-1 bg-transparent text-cyan-400 outline-none font-mono text-sm caret-cyan-400"
                              autoFocus
                              spellCheck={false}
                              autoComplete="off"
                            />
                          </div>
                        )}
                        <div ref={terminalEndRef} />
                      </div>
                    </ScrollArea>
                  </div>
                </div>

                {/* Lab Sidebar (30%) */}
                <div className="lg:col-span-3 flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-5rem)] pb-4">
                  {/* Lab Status */}
                  <HoloCard glowColor={labStatus === 'running' ? 'emerald' : labStatus === 'failed' ? 'pink' : 'cyan'}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${labStatus === 'running' ? 'bg-emerald-400 animate-pulse' : labStatus === 'failed' ? 'bg-pink-400' : labStatus === 'starting' ? 'bg-amber-400 animate-pulse' : 'bg-slate-600'}`} />
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Lab Status</h3>
                      </div>
                      <Badge variant="outline" className={`text-[10px] capitalize ${
                        labStatus === 'running' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' :
                        labStatus === 'failed' ? 'border-pink-500/30 text-pink-400 bg-pink-500/10' :
                        labStatus === 'starting' ? 'border-amber-500/30 text-amber-400 bg-amber-500/10' :
                        'border-slate-600 text-slate-500'
                      }`}>{labStatus}</Badge>
                    </div>
                  </HoloCard>

                  {/* Objectives */}
                  <HoloCard glowColor="emerald">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="h-4 w-4 text-emerald-400" />
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Objectives</h3>
                    </div>
                    <div className="space-y-2.5">
                      {labObjectives.map((obj) => (
                        <div key={obj.id} className="flex items-start gap-2.5">
                          {obj.completed ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                          ) : (
                            <Circle className="h-4 w-4 text-slate-600 shrink-0 mt-0.5" />
                          )}
                          <span className={`text-xs leading-relaxed ${obj.completed ? 'text-emerald-400 line-through' : 'text-slate-400'}`}>{obj.description}</span>
                        </div>
                      ))}
                    </div>
                  </HoloCard>

                  {/* Command History */}
                  <HoloCard glowColor="violet">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="h-4 w-4 text-violet-400" />
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Command History</h3>
                    </div>
                    {commandHistory.length === 0 ? (
                      <p className="text-xs text-slate-600">No commands executed yet</p>
                    ) : (
                      <ScrollArea className="max-h-40">
                        <div className="space-y-1">
                          {[...commandHistory].reverse().slice(0, 20).map((cmd, i) => (
                            <div key={i} className="text-xs font-mono text-cyan-400/60 py-0.5 px-2 rounded bg-slate-950/50 truncate">
                              $ {cmd}
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </HoloCard>
                </div>
              </motion.div>
            )}

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* VIEW: ANALYTICS                                              */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            {view === 'analytics' && (
              <motion.div key="analytics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="space-y-5">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-cyan-400 via-emerald-400 to-violet-500 bg-clip-text text-transparent">
                    Performance Analytics
                  </h1>
                  <p className="text-sm text-slate-500 mt-1">Track your learning progress and skill development</p>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {[
                    { icon: BookOpen, label: 'Modules Done', value: `${progressData.modulesCompleted}/${progressData.totalModules}`, color: 'cyan', pct: (progressData.modulesCompleted / progressData.totalModules) * 100 },
                    { icon: Target, label: 'Quiz Accuracy', value: `${Math.round(progressData.overallQuizAccuracy * 100)}%`, color: 'emerald', pct: progressData.overallQuizAccuracy * 100 },
                    { icon: FlaskConical, label: 'Lab Completion', value: `${Math.round(progressData.labCompletionRate * 100)}%`, color: 'violet', pct: progressData.labCompletionRate * 100 },
                    { icon: Clock, label: 'Time Invested', value: `${Math.round(progressData.totalTimeSpentMinutes / 60)}h ${progressData.totalTimeSpentMinutes % 60}m`, color: 'amber', pct: 65 },
                  ].map((stat, i) => {
                    const Icon = stat.icon;
                    const colorMap: Record<string, { glow: string; text: string; bar: string; iconBg: string }> = {
                      cyan: { glow: 'shadow-[0_0_15px_rgba(0,240,255,0.1)]', text: 'text-cyan-400', bar: 'from-cyan-500 to-cyan-400', iconBg: 'bg-cyan-500/10 border-cyan-500/20' },
                      emerald: { glow: 'shadow-[0_0_15px_rgba(16,185,129,0.1)]', text: 'text-emerald-400', bar: 'from-emerald-500 to-emerald-400', iconBg: 'bg-emerald-500/10 border-emerald-500/20' },
                      violet: { glow: 'shadow-[0_0_15px_rgba(139,92,246,0.1)]', text: 'text-violet-400', bar: 'from-violet-500 to-violet-400', iconBg: 'bg-violet-500/10 border-violet-500/20' },
                      amber: { glow: 'shadow-[0_0_15px_rgba(245,158,11,0.1)]', text: 'text-amber-400', bar: 'from-amber-500 to-amber-400', iconBg: 'bg-amber-500/10 border-amber-500/20' },
                    };
                    const c = colorMap[stat.color];
                    return (
                      <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                        <HoloCard glowColor={stat.color as 'cyan' | 'emerald' | 'violet' | 'amber'} className={c.glow}>
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${c.iconBg}`}>
                              <Icon className={`h-5 w-5 ${c.text}`} />
                            </div>
                            <div>
                              <p className={`text-xl sm:text-2xl font-bold ${c.text}`} style={{ textShadow: `0 0 20px ${stat.color === 'cyan' ? '#00f0ff40' : stat.color === 'emerald' ? '#10b98140' : stat.color === 'violet' ? '#8b5cf640' : '#f59e0b40'}` }}>{stat.value}</p>
                              <p className="text-[10px] text-slate-500 uppercase tracking-wider">{stat.label}</p>
                            </div>
                          </div>
                          <div className="w-full h-1 rounded-full bg-slate-800 overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${stat.pct}%` }} transition={{ delay: 0.5 + i * 0.1, duration: 1 }} className={`h-full rounded-full bg-gradient-to-r ${c.bar}`} />
                          </div>
                        </HoloCard>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Chart */}
                <HoloCard glowColor="cyan">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="h-4 w-4 text-cyan-400" />
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Module Performance</h3>
                  </div>
                  <div className="h-64">
                    <ChartContainer config={chartConfig}>
                      <BarChart data={progressData.moduleBreakdown.filter((m) => m.quizAccuracy > 0)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,240,255,0.06)" />
                        <XAxis dataKey="moduleTitle" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: 'rgba(0,240,255,0.1)' }} tickLine={false} />
                        <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: 'rgba(0,240,255,0.1)' }} tickLine={false} domain={[0, 100]} />
                        <ChartTooltip content={<ChartTooltipContent className="bg-slate-900/95 backdrop-blur-xl border border-cyan-500/15 text-slate-200" />} />
                        <defs>
                          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#00f0ff" stopOpacity={0.8} />
                            <stop offset="100%" stopColor="#10b981" stopOpacity={0.8} />
                          </linearGradient>
                        </defs>
                        <Bar dataKey="quizAccuracy" radius={[4, 4, 0, 0]} fill="url(#barGradient)" style={{ filter: 'drop-shadow(0 0 8px rgba(0,240,255,0.3))' }}>
                          {progressData.moduleBreakdown.filter((m) => m.quizAccuracy > 0).map((_, i) => (
                            <Cell key={i} fill={`url(#barGradient)`} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ChartContainer>
                  </div>
                </HoloCard>

                {/* Strengths / Weaknesses / Recommendations */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <HoloCard glowColor="emerald">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="h-4 w-4 text-emerald-400" />
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Strengths</h3>
                    </div>
                    <div className="space-y-2">
                      {progressData.strengths.map((s, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{s}</span>
                        </div>
                      ))}
                    </div>
                  </HoloCard>

                  <HoloCard glowColor="amber">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="h-4 w-4 text-amber-400" />
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400">Weaknesses</h3>
                    </div>
                    <div className="space-y-2">
                      {progressData.weaknesses.map((w, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span>{w}</span>
                        </div>
                      ))}
                    </div>
                  </HoloCard>

                  <HoloCard glowColor="violet">
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb className="h-4 w-4 text-violet-400" />
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-violet-400">Recommendations</h3>
                    </div>
                    <div className="space-y-2">
                      {progressData.recommendations.map((r, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                          <Lightbulb className="h-3.5 w-3.5 text-violet-400 shrink-0 mt-0.5" />
                          <span>{r}</span>
                        </div>
                      ))}
                    </div>
                  </HoloCard>
                </div>
              </motion.div>
            )}

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* VIEW: CERTIFICATES                                           */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            {view === 'certificates' && (
              <motion.div key="certificates" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="space-y-5">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-cyan-400 via-emerald-400 to-violet-500 bg-clip-text text-transparent">
                    Certificates
                  </h1>
                  <p className="text-sm text-slate-500 mt-1">Your earned professional certifications</p>
                </div>

                {/* Certificate Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {certificates.map((cert, idx) => (
                    <motion.div key={cert.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                      <HoloCard glowColor="emerald" className="overflow-hidden p-0">
                        {/* Gradient Top Bar */}
                        <div className="h-1.5 bg-gradient-to-r from-cyan-500 via-emerald-500 to-violet-500" />
                        <div className="p-4 sm:p-5">
                          <div className="flex items-start gap-3 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/15 to-emerald-500/15 border border-cyan-500/20 flex items-center justify-center shrink-0">
                              <Award className="h-6 w-6 text-cyan-400" />
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-semibold text-sm text-slate-100 line-clamp-2">{cert.courseName}</h3>
                              <p className="text-xs text-slate-500 mt-1">Issued {formatDate(cert.issuedAt)}</p>
                            </div>
                          </div>

                          {/* Verification Hash */}
                          <div className="bg-slate-950/60 rounded-lg p-2.5 mb-4 border border-slate-800/50">
                            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Verification Hash</p>
                            <div className="flex items-center gap-2">
                              <code className="text-[11px] text-emerald-400 font-mono truncate flex-1">{cert.verificationHash.slice(0, 40)}...</code>
                              <button
                                onClick={() => navigator.clipboard.writeText(cert.verificationHash)}
                                className="text-slate-500 hover:text-cyan-400 transition-colors shrink-0"
                              >
                                <Copy className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>

                          <Button
                            size="sm"
                            onClick={() => handleDownloadCert(cert.id)}
                            className="w-full text-xs h-9 rounded-lg bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 text-cyan-400 hover:from-cyan-500/30 hover:to-emerald-500/30 transition-all duration-300"
                          >
                            <Download className="h-3.5 w-3.5 mr-1.5" />
                            Download PDF
                          </Button>
                        </div>
                      </HoloCard>
                    </motion.div>
                  ))}
                </div>

                {/* Verification Section */}
                <HoloCard glowColor="violet">
                  <div className="flex items-center gap-2 mb-3">
                    <Search className="h-4 w-4 text-violet-400" />
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Verify Certificate</h3>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={verifyHash}
                      onChange={(e) => setVerifyHash(e.target.value)}
                      placeholder="Paste verification hash here..."
                      className="bg-slate-950/60 border-cyan-500/20 focus:border-cyan-400/50 text-sm text-slate-200 placeholder:text-slate-600"
                    />
                    <Button
                      onClick={handleVerifyCertificate}
                      disabled={!verifyHash.trim() || isVerifying}
                      className="shrink-0 bg-gradient-to-r from-violet-500 to-pink-500 text-white text-sm hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all duration-300 rounded-lg"
                    >
                      {isVerifying ? 'Verifying...' : 'Verify'}
                    </Button>
                  </div>
                  {verifyResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`mt-3 p-3 rounded-lg text-sm ${verifyResult.valid ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-pink-500/10 border border-pink-500/20 text-pink-400'}`}
                    >
                      {verifyResult.message}
                    </motion.div>
                  )}
                </HoloCard>
              </motion.div>
            )}

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* VIEW: ADMIN                                                  */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            {view === 'admin' && user.role === 'admin' && (
              <motion.div key="admin" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="space-y-5">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-cyan-400 via-emerald-400 to-violet-500 bg-clip-text text-transparent">
                    Admin Dashboard
                  </h1>
                  <p className="text-sm text-slate-500 mt-1">Platform overview and management</p>
                </div>

                {/* Admin Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {[
                    { icon: Users, label: 'Total Users', value: adminStats.users, color: 'cyan' },
                    { icon: BookOpen, label: 'Courses', value: adminStats.courses, color: 'emerald' },
                    { icon: GraduationCap, label: 'Enrollments', value: adminStats.enrollments, color: 'violet' },
                    { icon: Award, label: 'Certificates', value: adminStats.certificates, color: 'amber' },
                    { icon: FlaskConical, label: 'Labs Run', value: adminStats.labs, color: 'pink' },
                    { icon: Star, label: 'Avg Score', value: `${adminStats.avgScore}%`, color: 'cyan' },
                  ].map((stat, i) => {
                    const Icon = stat.icon;
                    const colorMap: Record<string, { text: string; iconBg: string; glow: string }> = {
                      cyan: { text: 'text-cyan-400', iconBg: 'bg-cyan-500/10 border-cyan-500/20', glow: 'shadow-[0_0_15px_rgba(0,240,255,0.1)]' },
                      emerald: { text: 'text-emerald-400', iconBg: 'bg-emerald-500/10 border-emerald-500/20', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.1)]' },
                      violet: { text: 'text-violet-400', iconBg: 'bg-violet-500/10 border-violet-500/20', glow: 'shadow-[0_0_15px_rgba(139,92,246,0.1)]' },
                      amber: { text: 'text-amber-400', iconBg: 'bg-amber-500/10 border-amber-500/20', glow: 'shadow-[0_0_15px_rgba(245,158,11,0.1)]' },
                      pink: { text: 'text-pink-400', iconBg: 'bg-pink-500/10 border-pink-500/20', glow: 'shadow-[0_0_15px_rgba(236,72,153,0.1)]' },
                    };
                    const c = colorMap[stat.color];
                    return (
                      <motion.div key={stat.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.06 }}>
                        <HoloCard glowColor={stat.color as 'cyan' | 'emerald' | 'violet' | 'amber' | 'pink'} className={c.glow}>
                          <div className="text-center">
                            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mx-auto mb-2 ${c.iconBg}`}>
                              <Icon className={`h-5 w-5 ${c.text}`} />
                            </div>
                            <p className={`text-xl font-bold ${c.text}`} style={{ textShadow: `0 0 15px currentColor` }}>{typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}</p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">{stat.label}</p>
                          </div>
                        </HoloCard>
                      </motion.div>
                    );
                  })}
                </div>

                {/* User Management Placeholder */}
                <HoloCard glowColor="cyan">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-cyan-400" />
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Recent Users</h3>
                    </div>
                    <Input placeholder="Search users..." className="w-48 h-8 bg-slate-950/60 border-cyan-500/20 focus:border-cyan-400/50 text-xs text-slate-200 placeholder:text-slate-600" />
                  </div>
                  <div className="space-y-2">
                    {[
                      { name: 'Alex Chen', email: 'alex@cybershield.academy', role: 'admin', courses: 3, score: 82 },
                      { name: 'Jordan Smith', email: 'jordan@cybershield.academy', role: 'student', courses: 2, score: 91 },
                      { name: 'Sam Wilson', email: 'sam@cybershield.academy', role: 'student', courses: 1, score: 74 },
                      { name: 'Casey Lee', email: 'casey@cybershield.academy', role: 'student', courses: 4, score: 88 },
                    ].map((u, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-slate-950/40 border border-slate-800/50 hover:border-cyan-500/15 transition-colors">
                        <Avatar className="h-8 w-8 border border-slate-700/50">
                          <AvatarFallback className="bg-gradient-to-br from-cyan-500/15 to-violet-500/15 text-cyan-400 text-xs font-bold">{u.name.split(' ').map((n) => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-200 font-medium truncate">{u.name}</p>
                          <p className="text-[11px] text-slate-500">{u.email}</p>
                        </div>
                        <Badge variant="outline" className={`text-[10px] shrink-0 ${u.role === 'admin' ? 'border-violet-500/30 text-violet-400 bg-violet-500/10' : 'border-slate-700 text-slate-400'}`}>{u.role}</Badge>
                        <div className="hidden sm:flex items-center gap-4 shrink-0 text-[11px] text-slate-500">
                          <span>{u.courses} courses</span>
                          <span className="text-emerald-400">{u.score}% avg</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </HoloCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* ─── Course Detail Modal ───────────────────────────────────────────── */}
      <Dialog open={courseModalOpen} onOpenChange={setCourseModalOpen}>
        <DialogContent className="bg-slate-900/95 backdrop-blur-xl border border-cyan-500/15 max-w-lg max-h-[85vh] overflow-y-auto">
          {selectedCourse && (
            <>
              <DialogHeader>
                <div className="h-1.5 w-20 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full mb-3" />
                <DialogTitle className="text-lg text-slate-100">{selectedCourse.title}</DialogTitle>
                <DialogDescription className="text-sm text-slate-400">{selectedCourse.description}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="flex flex-wrap gap-3">
                  <Badge variant="outline" className={`text-xs ${getDifficultyColor(selectedCourse.difficulty).bg} ${getDifficultyColor(selectedCourse.difficulty).text} ${getDifficultyColor(selectedCourse.difficulty).border} border`}>{selectedCourse.difficulty}</Badge>
                  <span className="text-xs text-slate-500 flex items-center gap-1"><BookOpen className="h-3 w-3" /> {selectedCourse.moduleCount} modules</span>
                  <span className="text-xs text-slate-500 flex items-center gap-1"><Clock className="h-3 w-3" /> {selectedCourse.durationHours}h</span>
                  <span className="text-xs text-slate-500 flex items-center gap-1"><Users className="h-3 w-3" /> {selectedCourse.studentCount.toLocaleString()} students</span>
                </div>

                {selectedCourse.modules && selectedCourse.modules.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Course Modules</h4>
                    <div className="space-y-1.5">
                      {selectedCourse.modules.map((mod, i) => (
                        <div key={i} className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-950/40">
                          {mod.completed ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                          ) : (
                            <Circle className="h-4 w-4 text-slate-600 shrink-0" />
                          )}
                          <span className={`text-sm ${mod.completed ? 'text-emerald-400' : 'text-slate-400'}`}>{mod.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  onClick={() => {
                    if (!selectedCourse.enrolled) handleEnroll(selectedCourse.id);
                    setCourseModalOpen(false);
                    setView('classroom');
                  }}
                  className={`w-full h-11 rounded-lg font-semibold transition-all duration-300 ${
                    selectedCourse.enrolled
                      ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 text-cyan-400'
                      : 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-white hover:shadow-[0_0_25px_rgba(0,240,255,0.3)]'
                  }`}
                >
                  {selectedCourse.enrolled ? 'Continue Learning' : 'Enroll Now'}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── Quiz Modal ────────────────────────────────────────────────────── */}
      <Dialog open={quizOpen} onOpenChange={setQuizOpen}>
        <DialogContent className="bg-slate-900/95 backdrop-blur-xl border border-violet-500/15 max-w-lg">
          {!quizSubmitted ? (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-1">
                  <Award className="h-5 w-5 text-violet-400" />
                  <DialogTitle className="text-lg text-slate-100">Module Assessment</DialogTitle>
                </div>
                <DialogDescription className="text-sm text-slate-400">
                  Question {quizIndex + 1} of {quizQuestions.length}
                </DialogDescription>
              </DialogHeader>

              <div className="mt-2">
                <div className="w-full h-1 rounded-full bg-slate-800 mb-6 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${((quizIndex + 1) / quizQuestions.length) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>

                <p className="text-sm font-medium text-slate-200 mb-4">{quizQuestions[quizIndex]?.question}</p>

                <RadioGroup
                  value={quizAnswers[quizIndex]?.toString() ?? ''}
                  onValueChange={(val) => setQuizAnswers((prev) => ({ ...prev, [quizIndex]: parseInt(val) }))}
                >
                  {quizQuestions[quizIndex]?.options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-slate-950/40 border border-slate-800/50 hover:border-violet-500/20 transition-colors cursor-pointer">
                      <RadioGroupItem value={i.toString()} id={`opt-${i}`} className="border-slate-600 text-violet-400" />
                      <Label htmlFor={`opt-${i}`} className="text-sm text-slate-300 cursor-pointer flex-1">{opt}</Label>
                    </div>
                  ))}
                </RadioGroup>

                <div className="flex justify-between mt-6">
                  <Button
                    variant="ghost"
                    onClick={() => quizIndex > 0 && setQuizIndex(quizIndex - 1)}
                    disabled={quizIndex === 0}
                    className="text-slate-400 hover:text-slate-200"
                  >
                    Previous
                  </Button>
                  {quizIndex < quizQuestions.length - 1 ? (
                    <Button
                      onClick={() => setQuizIndex(quizIndex + 1)}
                      disabled={quizAnswers[quizIndex] === undefined}
                      className="bg-gradient-to-r from-violet-500 to-cyan-500 text-white hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all duration-300"
                    >
                      Next <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleQuizSubmit}
                      disabled={Object.keys(quizAnswers).length < quizQuestions.length}
                      className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-300"
                    >
                      Submit Quiz <Award className="h-4 w-4 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className={`text-lg ${quizPassed ? 'text-emerald-400' : 'text-pink-400'}`}>
                  {quizPassed ? '✓ Assessment Passed!' : '✗ Assessment Failed'}
                </DialogTitle>
                <DialogDescription className="text-sm text-slate-400">
                  You scored {quizScore}% ({Object.keys(quizAnswers).filter(([idx, ans]) => quizQuestions[parseInt(idx)]?.correctIndex === ans).length}/{quizQuestions.length})
                </DialogDescription>
              </DialogHeader>

              <div className="mt-2 space-y-3 max-h-96 overflow-y-auto pr-1">
                {quizQuestions.map((q, i) => {
                  const userAnswer = quizAnswers[i];
                  const isCorrect = userAnswer === q.correctIndex;
                  return (
                    <div key={q.id} className={`p-3 rounded-lg border ${isCorrect ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-pink-500/5 border-pink-500/20'}`}>
                      <div className="flex items-start gap-2">
                        {isCorrect ? <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" /> : <X className="h-4 w-4 text-pink-400 shrink-0 mt-0.5" />}
                        <div>
                          <p className="text-sm text-slate-200 mb-1">{q.question}</p>
                          <p className="text-xs text-slate-500">
                            Your answer: <span className={isCorrect ? 'text-emerald-400' : 'text-pink-400'}>{q.options[userAnswer ?? 0]}</span>
                            {!isCorrect && <span className="text-emerald-400 ml-2">Correct: {q.options[q.correctIndex]}</span>}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">{q.explanation}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-2 mt-4">
                <Button onClick={() => setQuizOpen(false)} variant="outline" className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800">
                  Close
                </Button>
                <Button onClick={() => { setQuizIndex(0); setQuizAnswers({}); setQuizSubmitted(false); }} className="flex-1 bg-gradient-to-r from-violet-500 to-cyan-500 text-white hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all duration-300">
                  Retake
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── Inline CSS Animations ─────────────────────────────────────────── */}
      <style jsx>{`
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 10px rgba(0,240,255,0.2); }
          50% { box-shadow: 0 0 25px rgba(0,240,255,0.4); }
        }
        @keyframes borderRotate {
          0% { --angle: 0deg; }
          100% { --angle: 360deg; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        /* Custom scrollbar for dark theme */
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: rgba(15,23,42,0.3); }
        ::-webkit-scrollbar-thumb { background: rgba(0,240,255,0.15); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(0,240,255,0.3); }
      `}</style>
    </div>
  );
}