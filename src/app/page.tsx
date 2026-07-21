'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
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
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

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

// ─── Constants ───────────────────────────────────────────────────────────────

const USER_ID = 'cmruz2evv0000smvx6koj86pd';
const SESSION_ID = 'session-' + Date.now();
const COURSE_ID = 'demo-course';

const welcomeMessage: Message = {
  id: 'welcome',
  role: 'assistant',
  content:
    "Welcome to CyberShield Academy. I'm Prof. Shield, and I'll be guiding you through the fascinating world of cybersecurity.\n\nToday we'll be exploring network security fundamentals. Before we dive in, let me ask: What do you think is the most critical aspect of securing a modern enterprise network?",
  timestamp: new Date().toISOString(),
};

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
    {
      moduleTitle: 'Network Fundamentals',
      quizAccuracy: 0.9,
      comprehensionScore: 0.88,
      focusScore: 85,
      labCompleted: true,
      labScore: 0.92,
      timeSpentMinutes: 180,
    },
    {
      moduleTitle: 'TCP/IP Deep Dive',
      quizAccuracy: 0.85,
      comprehensionScore: 0.82,
      focusScore: 80,
      labCompleted: true,
      labScore: 0.88,
      timeSpentMinutes: 210,
    },
    {
      moduleTitle: 'Network Scanning',
      quizAccuracy: 0.78,
      comprehensionScore: 0.75,
      focusScore: 72,
      labCompleted: true,
      labScore: 0.8,
      timeSpentMinutes: 195,
    },
    {
      moduleTitle: 'Cryptography Basics',
      quizAccuracy: 0.82,
      comprehensionScore: 0.8,
      focusScore: 78,
      labCompleted: true,
      labScore: 0.85,
      timeSpentMinutes: 220,
    },
    {
      moduleTitle: 'Firewall Configuration',
      quizAccuracy: 0.75,
      comprehensionScore: 0.7,
      focusScore: 68,
      labCompleted: true,
      labScore: 0.78,
      timeSpentMinutes: 160,
    },
    {
      moduleTitle: 'Web App Security',
      quizAccuracy: 0.65,
      comprehensionScore: 0.6,
      focusScore: 62,
      labCompleted: false,
      labScore: null,
      timeSpentMinutes: 145,
    },
    {
      moduleTitle: 'Incident Response',
      quizAccuracy: 0.88,
      comprehensionScore: 0.85,
      focusScore: 82,
      labCompleted: false,
      labScore: null,
      timeSpentMinutes: 90,
    },
    {
      moduleTitle: 'Capstone Challenge',
      quizAccuracy: 0,
      comprehensionScore: 0,
      focusScore: 0,
      labCompleted: false,
      labScore: null,
      timeSpentMinutes: 65,
    },
  ],
};

const demoCertificates: CertificateData[] = [
  {
    id: 'cert-001',
    courseName: 'Network Security Fundamentals',
    userName: 'Alex Chen',
    issuedAt: '2026-06-15T10:00:00Z',
    verificationHash: 'sha256:a1b2c3d4e5f67890abcdef1234567890fedcba0987654321abcdef123456',
    status: 'active',
  },
  {
    id: 'cert-002',
    courseName: 'Cryptography Fundamentals',
    userName: 'Alex Chen',
    issuedAt: '2026-05-20T14:30:00Z',
    verificationHash: 'sha256:9876543210abcdef0987654321abcdef1234567890abcdef12345678abcd',
    status: 'active',
  },
  {
    id: 'cert-003',
    courseName: 'Ethical Hacking Basics',
    userName: 'Alex Chen',
    issuedAt: '2026-04-10T09:15:00Z',
    verificationHash: 'sha256:fedcba0987654321abcdef1234567890123456789abcdef12345678abcd',
    status: 'active',
  },
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
  'OWASP Top 10',
  'Incident Response',
  'Penetration Testing',
];

const chartConfig = {
  accuracy: {
    label: 'Quiz Accuracy',
    color: 'hsl(var(--chart-1))',
  },
};

// ─── Helper Functions ────────────────────────────────────────────────────────

function formatTime(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function getFocusColor(score: number): string {
  if (score >= 75) return 'bg-emerald-500 text-white';
  if (score >= 50) return 'bg-yellow-500 text-white';
  return 'bg-red-500 text-white';
}

function getFocusLabel(score: number): string {
  if (score >= 75) return 'Focused';
  if (score >= 50) return 'Distracted';
  return 'Inactive';
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function CyberShieldDashboard() {
  // Core state
  const [activeTab, setActiveTab] = useState('classroom');
  const [chatMessages, setChatMessages] = useState<Message[]>([welcomeMessage]);
  const [chatInput, setChatInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [terminalInput, setTerminalInput] = useState('');
  const [labActive, setLabActive] = useState(false);
  const [labTopic, setLabTopic] = useState('');
  const [labObjectives, setLabObjectives] = useState<LabObjective[]>(defaultLabObjectives);
  const [labStatus, setLabStatus] = useState<'idle' | 'starting' | 'running' | 'completed' | 'failed'>('idle');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [focusScore, setFocusScore] = useState(85);
  const [progressData, setProgressData] = useState(demoPerformance);
  const [certificates, setCertificates] = useState<CertificateData[]>(demoCertificates);
  const [verifyHash, setVerifyHash] = useState('');
  const [verifyResult, setVerifyResult] = useState<{
    valid: boolean;
    message: string;
  } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

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
        userId: USER_ID,
        sessionId: SESSION_ID,
        eventType,
        eventValue,
        durationMs,
        pageUrl: typeof window !== 'undefined' ? window.location.href : undefined,
        moduleContext: activeTab,
        timestamp: new Date().toISOString(),
      });
    },
    [activeTab]
  );

  const flushTelemetry = useCallback(async () => {
    const events = telemetryBufferRef.current.splice(0, telemetryBufferRef.current.length);
    if (events.length === 0) return;
    try {
      await fetch('/api/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events }),
      });
    } catch {
      // Silently fail telemetry
    }
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        addTelemetryEvent('visibility_change', 'tab_hidden');
      } else {
        addTelemetryEvent('visibility_change', 'tab_visible');
      }
    };

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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendMessage = async () => {
    const trimmed = chatInput.trim();
    if (!trimmed || isStreaming) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString(),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setIsStreaming(true);

    addTelemetryEvent('focus', 'chat_message_sent');

    const assistantId = `msg-${Date.now() + 1}`;
    setChatMessages((prev) => [
      ...prev,
      { id: assistantId, role: 'assistant', content: '', timestamp: new Date().toISOString() },
    ]);

    try {
      const history = chatMessages
        .filter((m) => m.id !== 'welcome')
        .slice(-10)
        .map((m) => ({ role: m.role, content: m.content }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: USER_ID,
          sessionId: SESSION_ID,
          courseId: COURSE_ID,
          message: trimmed,
          history,
        }),
      });

      if (!response.ok) throw new Error('Chat request failed');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          accumulated += chunk;
          const currentText = accumulated;
          setChatMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content: currentText } : m))
          );
        }
      }

      // Update focus score from response header
      const newFocus = response.headers.get('X-Focus-Score');
      if (newFocus) {
        setFocusScore(parseInt(newFocus, 10));
      }
    } catch {
      setChatMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: "I'm having trouble connecting right now. Please try again in a moment." }
            : m
        )
      );
    } finally {
      setIsStreaming(false);
    }
  };

  const handleChatKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // ─── Terminal / Lab ────────────────────────────────────────────────────

  const connectTerminal = useCallback(
    (sessionId: string, containerName: string, objectives: LabObjective[]) => {
      if (socketRef.current?.connected) {
        socketRef.current.disconnect();
      }

      const socket = io('/?XTransformPort=3004', {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
      });

      socket.on('connect', () => {
        socket.emit('terminal:join', {
          userId: USER_ID,
          labSessionId: sessionId,
          containerName,
          objectives: objectives.map((o) => ({
            id: o.id,
            description: o.description,
          })),
        });
      });

      socket.on('terminal:output', (data: { data: string }) => {
        setTerminalLines((prev) => {
          const lines = data.data.split('\r\n').filter(Boolean);
          return [...prev, ...lines];
        });
      });

      socket.on('terminal:clear', () => {
        setTerminalLines([]);
      });

      socket.on('terminal:prompt', () => {
        terminalInputRef.current?.focus();
      });

      socket.on('lab:progress', (data: { objectivesCompleted: LabObjective[] }) => {
        setLabObjectives(data.objectivesCompleted);
      });

      socket.on('lab:completed', (data: { message: string }) => {
        setLabStatus('completed');
        setTerminalLines((prev) => [
          ...prev,
          '',
          '═══════════════════════════════════════════════',
          `  ${data.message}`,
          '═══════════════════════════════════════════════',
        ]);
      });

      socket.on('disconnect', () => {
        // silently handle
      });

      socketRef.current = socket;
    },
    []
  );

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLines]);

  const handleStartLab = async () => {
    if (!labTopic) return;

    setLabStatus('starting');
    setTerminalLines([]);
    setLabObjectives(defaultLabObjectives.map((o) => ({ ...o, completed: false })));
    setCommandHistory([]);
    commandHistoryIndexRef.current = -1;

    try {
      const res = await fetch('/api/labs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: USER_ID,
          topic: labTopic,
          objectives: defaultLabObjectives.map((o) => o.description),
        }),
      });

      const data = await res.json();

      if (!res.ok && res.status === 409) {
        setLabStatus('running');
        setLabActive(true);
        return;
      }

      if (!res.ok) throw new Error('Failed to start lab');

      const sessionId = data.session?.id ?? `lab-${Date.now()}`;
      const containerName = data.session?.containerName ?? 'cybershield-lab';
      const objectives = data.session?.objectives ?? defaultLabObjectives;

      setLabObjectives(objectives);
      setLabStatus('running');
      setLabActive(true);
      connectTerminal(sessionId, containerName, objectives);
    } catch {
      setLabStatus('failed');
      setTerminalLines([
        'Failed to start lab environment.',
        'Please try again or select a different topic.',
      ]);
    }
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
    if (e.key === 'Enter') {
      handleTerminalSubmit();
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      const newIndex = commandHistoryIndexRef.current < commandHistory.length - 1 ? commandHistoryIndexRef.current + 1 : commandHistoryIndexRef.current;
      commandHistoryIndexRef.current = newIndex;
      setTerminalInput(commandHistory[commandHistory.length - 1 - newIndex]);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (commandHistoryIndexRef.current > 0) {
        commandHistoryIndexRef.current -= 1;
        setTerminalInput(commandHistory[commandHistory.length - 1 - commandHistoryIndexRef.current]);
      } else {
        commandHistoryIndexRef.current = -1;
        setTerminalInput('');
      }
    }
  };

  // ─── Progress / Analytics ──────────────────────────────────────────────

  useEffect(() => {
    async function fetchProgress() {
      try {
        const res = await fetch(`/api/progress?userId=${USER_ID}&courseId=${COURSE_ID}`);
        if (res.ok) {
          const data = await res.json();
          if (data.performance && data.performance.totalInteractionCount > 0) {
            setProgressData(data.performance);
          }
        }
      } catch {
        // Use demo data on error
      }
    }
    fetchProgress();
  }, [activeTab]);

  // ─── Certificates ──────────────────────────────────────────────────────

  useEffect(() => {
    async function fetchCerts() {
      try {
        const res = await fetch(`/api/certificates?userId=${USER_ID}`);
        if (res.ok) {
          const data = await res.json();
          if (data.certificates && data.certificates.length > 0) {
            setCertificates(data.certificates);
          }
        }
      } catch {
        // Use demo data
      }
    }
    fetchCerts();
  }, []);

  const handleVerifyCertificate = async () => {
    if (!verifyHash.trim()) return;
    setIsVerifying(true);
    setVerifyResult(null);

    try {
      const res = await fetch(`/api/certificates/verify?hash=${encodeURIComponent(verifyHash.trim())}`);
      const data = await res.json();
      if (data.valid) {
        setVerifyResult({
          valid: true,
          message: `Valid certificate for ${data.certificate?.userName} - "${data.certificate?.courseName}" (issued ${data.certificate?.issuedAt ? formatDate(data.certificate.issuedAt) : 'unknown date'})`,
        });
      } else {
        setVerifyResult({
          valid: false,
          message: data.error || 'Certificate verification failed. No matching certificate found.',
        });
      }
    } catch {
      setVerifyResult({ valid: false, message: 'Verification request failed. Please try again.' });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDownloadCert = (certId: string) => {
    window.open(`/api/certificates?download=${certId}`, '_blank');
  };

  // ─── Render ────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* ─── Top Navigation Bar ─────────────────────────────────────── */}
      <header className="bg-slate-900 text-white sticky top-0 z-50">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-emerald-400" />
            <span className="font-bold text-lg tracking-tight">CyberShield Academy</span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Focus Score Badge */}
            <Badge className={`${getFocusColor(focusScore)} text-xs px-2 py-0.5 font-medium`}>
              <Activity className="h-3 w-3 mr-1" />
              {getFocusLabel(focusScore)}: {focusScore}%
            </Badge>

            {/* Notification Bell */}
            <Button variant="ghost" size="icon" className="text-slate-300 hover:text-white hover:bg-slate-800 h-8 w-8">
              <Bell className="h-4 w-4" />
            </Button>

            {/* User */}
            <div className="hidden sm:flex items-center gap-2">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-emerald-600 text-white text-xs font-medium">AC</AvatarFallback>
              </Avatar>
              <span className="text-sm text-slate-300">Alex Chen</span>
            </div>
          </div>
        </div>
      </header>

      {/* ─── Main Content ────────────────────────────────────────────── */}
      <main className="flex-1 max-w-screen-2xl mx-auto w-full px-4 sm:px-6 py-4 sm:py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
          <TabsList className="w-full sm:w-auto mb-4 sm:mb-6">
            <TabsTrigger value="classroom" className="gap-1.5 text-xs sm:text-sm">
              <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Classroom</span>
              <span className="sm:hidden">Chat</span>
            </TabsTrigger>
            <TabsTrigger value="lab" className="gap-1.5 text-xs sm:text-sm">
              <TerminalIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Lab Terminal</span>
              <span className="sm:hidden">Lab</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-1.5 text-xs sm:text-sm">
              <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Analytics</span>
              <span className="sm:hidden">Stats</span>
            </TabsTrigger>
            <TabsTrigger value="certificates" className="gap-1.5 text-xs sm:text-sm">
              <Award className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Certificates</span>
              <span className="sm:hidden">Certs</span>
            </TabsTrigger>
          </TabsList>

          {/* ─── TAB 1: CLASSROOM ─────────────────────────────────────── */}
          <TabsContent value="classroom" className="flex-1 min-h-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 h-[calc(100vh-10rem)]">
              {/* Chat Panel */}
              <div className="lg:col-span-2 flex flex-col bg-white rounded-lg border shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-emerald-600 text-white">
                      <Shield className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm">Prof. Shield</p>
                    <p className="text-xs text-emerald-600 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
                      Online — Network Security Module
                    </p>
                  </div>
                </div>

                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {chatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                      >
                        {msg.role === 'assistant' && (
                          <Avatar className="h-8 w-8 shrink-0 mt-1">
                            <AvatarFallback className="bg-emerald-600 text-white">
                              <Shield className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={`max-w-[80%] sm:max-w-[70%] rounded-lg px-4 py-3 ${
                            msg.role === 'user'
                              ? 'bg-slate-800 text-white'
                              : 'bg-slate-100 text-slate-900'
                          }`}
                        >
                          {msg.content ? (
                            <div className="text-sm whitespace-pre-wrap leading-relaxed">
                              {msg.content}
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                              <div className="flex gap-1">
                                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                              </div>
                              <span>Prof. Shield is typing...</span>
                            </div>
                          )}
                          <p
                            className={`text-[10px] mt-1.5 ${
                              msg.role === 'user' ? 'text-slate-400 text-right' : 'text-slate-500'
                            }`}
                          >
                            {formatTime(msg.timestamp)}
                          </p>
                        </div>
                        {msg.role === 'user' && (
                          <Avatar className="h-8 w-8 shrink-0 mt-1">
                            <AvatarFallback className="bg-slate-700 text-white text-xs">AC</AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                </ScrollArea>

                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Textarea
                      ref={chatTextareaRef}
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={handleChatKeyDown}
                      placeholder="Ask Prof. Shield about cybersecurity..."
                      className="min-h-[44px] max-h-32 resize-none bg-slate-50 text-sm"
                      rows={1}
                      disabled={isStreaming}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!chatInput.trim() || isStreaming}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 h-auto px-4"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Right Sidebar */}
              <div className="flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-10rem)]">
                {/* Current Module */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-emerald-600" />
                      Current Module
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="font-medium text-sm">Network Security Fundamentals</p>
                      <p className="text-xs text-muted-foreground mt-1">Module 3 of 8</p>
                    </div>
                    <Progress value={37.5} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Progress</span>
                      <span>37.5%</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Focus Score */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Target className="h-4 w-4 text-emerald-600" />
                      Focus Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="relative h-16 w-16">
                        <svg className="h-16 w-16 -rotate-90" viewBox="0 0 36 36">
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            className="text-slate-200"
                          />
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke={focusScore >= 75 ? '#10b981' : focusScore >= 50 ? '#eab308' : '#ef4444'}
                            strokeWidth="3"
                            strokeDasharray={`${focusScore}, 100`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                          {focusScore}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{getFocusLabel(focusScore)}</p>
                        <p className="text-xs text-muted-foreground">
                          {focusScore >= 75
                            ? 'Great concentration level'
                            : focusScore >= 50
                              ? 'Try to minimize distractions'
                              : 'Please refocus on the material'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Topics */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Zap className="h-4 w-4 text-emerald-600" />
                      Quick Topics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {quickTopics.map((topic) => (
                        <Button
                          key={topic}
                          variant="outline"
                          size="sm"
                          className="text-xs h-7"
                          onClick={() => {
                            setChatInput(topic);
                            chatTextareaRef.current?.focus();
                          }}
                        >
                          {topic}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* ─── TAB 2: LAB TERMINAL ──────────────────────────────────── */}
          <TabsContent value="lab" className="flex-1 min-h-0">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 h-[calc(100vh-10rem)]">
              {/* Terminal Area */}
              <div className="lg:col-span-3 flex flex-col gap-4">
                {/* Lab Controls */}
                <Card>
                  <CardContent className="py-3">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <Select value={labTopic} onValueChange={setLabTopic}>
                        <SelectTrigger className="w-full sm:w-64">
                          <SelectValue placeholder="Select lab topic..." />
                        </SelectTrigger>
                        <SelectContent>
                          {labTopics.map((t) => (
                            <SelectItem key={t.value} value={t.value}>
                              {t.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex items-center gap-3">
                        <Button
                          onClick={handleStartLab}
                          disabled={!labTopic || labStatus === 'starting' || labStatus === 'running'}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <TerminalIcon className="h-4 w-4 mr-2" />
                          {labStatus === 'starting' ? 'Starting...' : labStatus === 'running' ? 'Lab Active' : 'Start Lab'}
                        </Button>
                        <Badge
                          variant={
                            labStatus === 'running'
                              ? 'default'
                              : labStatus === 'completed'
                                ? 'secondary'
                                : labStatus === 'failed'
                                  ? 'destructive'
                                  : 'outline'
                          }
                          className={
                            labStatus === 'running'
                              ? 'bg-emerald-600 text-white'
                              : ''
                          }
                        >
                          {labStatus === 'idle' && 'No Lab Running'}
                          {labStatus === 'starting' && 'Provisioning...'}
                          {labStatus === 'running' && '● Active'}
                          {labStatus === 'completed' && '✓ Completed'}
                          {labStatus === 'failed' && '✗ Failed'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Terminal */}
                <div className="flex-1 rounded-lg border shadow-sm overflow-hidden bg-slate-950 flex flex-col">
                  {/* Terminal header bar */}
                  <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-slate-400 text-xs">
                    <div className="flex gap-1.5">
                      <span className="h-3 w-3 rounded-full bg-red-500/80" />
                      <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
                      <span className="h-3 w-3 rounded-full bg-green-500/80" />
                    </div>
                    <span className="ml-2 font-mono">student@cybershield-lab:~</span>
                  </div>

                  {/* Terminal output */}
                  <ScrollArea className="flex-1 p-4">
                    <div className="font-mono text-sm space-y-0.5">
                      {terminalLines.length === 0 && (
                        <div className="text-slate-500 text-center py-8">
                          {labStatus === 'idle'
                            ? 'Select a topic and click "Start Lab" to begin.'
                            : labStatus === 'starting'
                              ? 'Provisioning lab environment...'
                              : 'Waiting for terminal connection...'}
                        </div>
                      )}
                      {terminalLines.map((line, i) => (
                        <div
                          key={i}
                          className="text-green-400 whitespace-pre-wrap leading-5 break-all"
                          dangerouslySetInnerHTML={{
                            __html: line
                              .replace(/\x1b\[[0-9;]*m/g, '')
                              .replace(/&/g, '&amp;')
                              .replace(/</g, '&lt;')
                              .replace(/>/g, '&gt;')
                              .replace(/╔|╗|╚|╝|║|═/g, (m) =>
                                `<span class="text-emerald-300">${m}</span>`
                              ),
                          }}
                        />
                      ))}
                      <div ref={terminalEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Terminal input */}
                  <div className="flex items-center gap-0 px-4 py-2 bg-slate-900/50 border-t border-slate-800">
                    <span className="text-emerald-400 font-mono text-sm shrink-0">
                      student@cybershield:~$&nbsp;
                    </span>
                    <input
                      ref={terminalInputRef}
                      type="text"
                      value={terminalInput}
                      onChange={(e) => setTerminalInput(e.target.value)}
                      onKeyDown={handleTerminalKeyDown}
                      disabled={!labActive}
                      placeholder={labActive ? '' : 'Start a lab first...'}
                      className="flex-1 bg-transparent text-green-400 font-mono text-sm outline-none placeholder:text-slate-600 min-w-0"
                      autoComplete="off"
                      spellCheck={false}
                    />
                  </div>
                </div>
              </div>

              {/* Right Sidebar */}
              <div className="flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-10rem)]">
                {/* Objectives */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Target className="h-4 w-4 text-emerald-600" />
                      Lab Objectives
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {labObjectives.filter((o) => o.completed).length}/{labObjectives.length} completed
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Progress
                      value={
                        labObjectives.length > 0
                          ? (labObjectives.filter((o) => o.completed).length / labObjectives.length) * 100
                          : 0
                      }
                      className="h-2 mb-4"
                    />
                    <div className="space-y-2">
                      {labObjectives.map((obj) => (
                        <div key={obj.id} className="flex items-start gap-2">
                          {obj.completed ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                          ) : (
                            <Circle className="h-4 w-4 text-slate-300 mt-0.5 shrink-0" />
                          )}
                          <span
                            className={`text-xs leading-relaxed ${
                              obj.completed ? 'text-muted-foreground line-through' : 'text-slate-700'
                            }`}
                          >
                            {obj.description}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Command History */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Clock className="h-4 w-4 text-emerald-600" />
                      Command History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="max-h-48">
                      {commandHistory.length === 0 ? (
                        <p className="text-xs text-muted-foreground">No commands executed yet.</p>
                      ) : (
                        <div className="space-y-1">
                          {commandHistory.map((cmd, i) => (
                            <div
                              key={i}
                              className="font-mono text-xs bg-slate-50 rounded px-2 py-1 text-slate-600 break-all"
                            >
                              <span className="text-emerald-600">$ </span>
                              {cmd}
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* ─── TAB 3: ANALYTICS ─────────────────────────────────────── */}
          <TabsContent value="analytics" className="flex-1 min-h-0">
            <div className="space-y-6 overflow-y-auto max-h-[calc(100vh-10rem)] pb-8">
              {/* Stats Cards Row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  icon={Target}
                  label="Quiz Accuracy"
                  value={`${Math.round(progressData.overallQuizAccuracy * 100)}%`}
                  progress={progressData.overallQuizAccuracy}
                  color="emerald"
                />
                <StatCard
                  icon={Activity}
                  label="Focus Score"
                  value={`${progressData.averageFocusScore}/100`}
                  progress={progressData.averageFocusScore / 100}
                  color="emerald"
                />
                <StatCard
                  icon={CheckCircle2}
                  label="Lab Completion"
                  value={`${Math.round(progressData.labCompletionRate * 100)}%`}
                  progress={progressData.labCompletionRate}
                  color="emerald"
                />
                <StatCard
                  icon={Clock}
                  label="Study Time"
                  value={formatStudyTime(progressData.totalTimeSpentMinutes)}
                  progress={Math.min(progressData.totalTimeSpentMinutes / 2000, 1)}
                  color="emerald"
                />
              </div>

              {/* Bar Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Module Performance</CardTitle>
                  <CardDescription>Quiz accuracy per module</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-72 sm:h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={progressData.moduleBreakdown} margin={{ top: 5, right: 10, left: -10, bottom: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey="moduleTitle"
                          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                          angle={-35}
                          textAnchor="end"
                          height={70}
                        />
                        <YAxis
                          domain={[0, 100]}
                          tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                          tickFormatter={(v: number) => `${v}%`}
                        />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Bar dataKey={(d: typeof progressData.moduleBreakdown[0]) => Math.round(d.quizAccuracy * 100)} radius={[4, 4, 0, 0]}>
                          {progressData.moduleBreakdown.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                entry.quizAccuracy >= 0.8
                                  ? '#10b981'
                                  : entry.quizAccuracy >= 0.6
                                    ? '#f59e0b'
                                    : entry.quizAccuracy > 0
                                      ? '#ef4444'
                                      : '#e2e8f0'
                              }
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Strengths / Weaknesses / Recommendations */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                {/* Strengths */}
                <Card className="border-emerald-200 bg-emerald-50/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2 text-emerald-800">
                      <TrendingUp className="h-4 w-4 text-emerald-600" />
                      Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {progressData.strengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Weaknesses */}
                <Card className="border-amber-200 bg-amber-50/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2 text-amber-800">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      Areas for Improvement
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {progressData.weaknesses.map((w, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                          <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                          <span>{w}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Recommendations */}
                <Card className="border-blue-200 bg-blue-50/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2 text-blue-800">
                      <Lightbulb className="h-4 w-4 text-blue-600" />
                      Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {progressData.recommendations.map((r, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                          <Lightbulb className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Module Breakdown Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Detailed Module Breakdown</CardTitle>
                  <CardDescription>Performance across all course modules</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left">
                          <th className="pb-3 pr-4 font-medium text-muted-foreground">Module</th>
                          <th className="pb-3 pr-4 font-medium text-muted-foreground text-center">Quiz</th>
                          <th className="pb-3 pr-4 font-medium text-muted-foreground text-center">Focus</th>
                          <th className="pb-3 pr-4 font-medium text-muted-foreground text-center">Lab</th>
                          <th className="pb-3 font-medium text-muted-foreground text-center">Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {progressData.moduleBreakdown.map((mod) => (
                          <tr key={mod.moduleTitle} className="border-b last:border-0">
                            <td className="py-3 pr-4 font-medium">{mod.moduleTitle}</td>
                            <td className="py-3 pr-4 text-center">
                              <Badge
                                variant={mod.quizAccuracy >= 0.8 ? 'default' : mod.quizAccuracy > 0 ? 'secondary' : 'outline'}
                                className={
                                  mod.quizAccuracy >= 0.8
                                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                                    : mod.quizAccuracy >= 0.6
                                      ? 'bg-amber-100 text-amber-700 hover:bg-amber-100'
                                      : mod.quizAccuracy > 0
                                        ? 'bg-red-100 text-red-700 hover:bg-red-100'
                                        : ''
                                }
                              >
                                {mod.quizAccuracy > 0 ? `${Math.round(mod.quizAccuracy * 100)}%` : 'N/A'}
                              </Badge>
                            </td>
                            <td className="py-3 pr-4 text-center">
                              <span className={mod.focusScore >= 75 ? 'text-emerald-600' : mod.focusScore >= 50 ? 'text-amber-600' : 'text-slate-400'}>
                                {mod.focusScore > 0 ? `${mod.focusScore}%` : '—'}
                              </span>
                            </td>
                            <td className="py-3 pr-4 text-center">
                              {mod.labCompleted ? (
                                <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200">
                                  {mod.labScore ? `${Math.round(mod.labScore * 100)}%` : 'Done'}
                                </Badge>
                              ) : (
                                <span className="text-slate-400 text-xs">Pending</span>
                              )}
                            </td>
                            <td className="py-3 text-center text-muted-foreground">{mod.timeSpentMinutes}m</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ─── TAB 4: CERTIFICATES ──────────────────────────────────── */}
          <TabsContent value="certificates" className="flex-1 min-h-0">
            <div className="space-y-6 overflow-y-auto max-h-[calc(100vh-10rem)] pb-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">Your Certificates</h2>
                  <p className="text-sm text-muted-foreground">
                    Earn certificates by completing courses with strong performance.
                  </p>
                </div>
              </div>

              {/* Certificate Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {certificates.map((cert) => (
                  <Card key={cert.id} className="relative overflow-hidden">
                    {/* Decorative top bar */}
                    <div className="h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500" />
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                            <Award className="h-5 w-5 text-emerald-600" />
                          </div>
                          <div>
                            <CardTitle className="text-sm font-semibold">{cert.courseName}</CardTitle>
                            <CardDescription className="text-xs mt-0.5">
                              Issued {formatDate(cert.issuedAt)}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-200 bg-emerald-50">
                          Active
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Issued to</p>
                        <p className="text-sm font-medium flex items-center gap-2">
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                          {cert.userName}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Verification Hash</p>
                        <p className="text-[11px] font-mono text-slate-500 bg-slate-50 rounded px-2 py-1.5 break-all leading-relaxed">
                          {cert.verificationHash}
                        </p>
                      </div>
                      <Separator />
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                        onClick={() => handleDownloadCert(cert.id)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Verify Certificate */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Search className="h-4 w-4 text-emerald-600" />
                    Verify Certificate
                  </CardTitle>
                  <CardDescription>
                    Paste a verification hash to validate an issued certificate.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                      value={verifyHash}
                      onChange={(e) => {
                        setVerifyHash(e.target.value);
                        setVerifyResult(null);
                      }}
                      placeholder="sha256:abcdef1234567890..."
                      className="font-mono text-sm"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleVerifyCertificate();
                      }}
                    />
                    <Button
                      onClick={handleVerifyCertificate}
                      disabled={!verifyHash.trim() || isVerifying}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
                    >
                      {isVerifying ? (
                        <span className="flex items-center gap-2">
                          <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Verifying...
                        </span>
                      ) : (
                        <>
                          <Search className="h-4 w-4 mr-2" />
                          Verify
                        </>
                      )}
                    </Button>
                  </div>
                  {verifyResult && (
                    <div
                      className={`rounded-lg px-4 py-3 text-sm flex items-start gap-2 ${
                        verifyResult.valid
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {verifyResult.valid ? (
                        <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                      )}
                      <span>{verifyResult.message}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  progress,
  color,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  progress: number;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="h-9 w-9 rounded-lg bg-emerald-100 flex items-center justify-center">
            <Icon className="h-4.5 w-4.5 text-emerald-600" />
          </div>
          <span className="text-2xl font-bold">{value}</span>
        </div>
        <p className="text-sm font-medium text-muted-foreground mb-2">{label}</p>
        <Progress value={Math.round(progress * 100)} className="h-2" />
      </CardContent>
    </Card>
  );
}

function formatStudyTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours >= 1) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}