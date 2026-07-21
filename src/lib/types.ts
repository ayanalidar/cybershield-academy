export interface TelemetryEvent {
  userId: string;
  sessionId: string;
  eventType: "focus" | "blur" | "tab_switch" | "minimize" | "idle" | "visibility_change";
  eventValue?: string;
  durationMs?: number;
  pageUrl?: string;
  moduleContext?: string;
  timestamp?: string;
}

export interface FocusScoreResult {
  score: number;
  totalSessionMs: number;
  focusedMs: number;
  distractionCount: number;
  lastEventType: string;
}

export interface LabSpawnRequest {
  userId: string;
  moduleId?: string;
  topic: string;
  objectives: string[];
}

export interface LabSessionState {
  id: string;
  containerId: string;
  containerName: string;
  status: "starting" | "running" | "completed" | "failed" | "terminated";
  topic: string;
  objectives: LabObjective[];
  commandHistory: string[];
  score: number | null;
}

export interface LabObjective {
  id: string;
  description: string;
  completed: boolean;
  verifiedAt?: string;
  verificationPattern?: string;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
  timestamp?: string;
  metadata?: Record<string, unknown>;
}

export interface RAGContext {
  moduleId: string;
  chunkContent: string;
  relevanceScore: number;
  source: string;
}

export interface StudentContext {
  userId: string;
  currentModuleId?: string;
  sessionId: string;
  focusScore: number;
  recentInteractionType?: string;
  labActive: boolean;
  labObjectivesProgress?: number;
  overallProgress: number;
  quizAccuracy: number;
}

export interface PerformanceSummary {
  userId: string;
  userName: string;
  courseId: string;
  courseName: string;
  modulesCompleted: number;
  totalModules: number;
  overallQuizAccuracy: number;
  averageFocusScore: number;
  labCompletionRate: number;
  totalInteractionCount: number;
  totalTimeSpentMinutes: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  moduleBreakdown: ModulePerformance[];
  recordedAt: string;
}

export interface ModulePerformance {
  moduleId: string;
  moduleTitle: string;
  quizAccuracy: number;
  comprehensionScore: number;
  focusScore: number;
  labCompleted: boolean;
  labScore: number | null;
  timeSpentMinutes: number;
}

export interface CertificateData {
  id: string;
  userId: string;
  courseId: string;
  courseName: string;
  userName: string;
  verificationHash: string;
  issuedAt: string;
  expiresAt?: string;
}

export interface ProctoringAlert {
  type: "warning" | "nudge" | "quiz_check";
  message: string;
  severity: "low" | "medium" | "high";
  triggerReason: string;
}