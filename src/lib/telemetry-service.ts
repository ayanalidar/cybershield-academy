import { db } from '@/lib/db';
import type { TelemetryEvent, FocusScoreResult, ProctoringAlert } from '@/lib/types';

const FOCUS_WINDOW_MS = 300000;
const IDLE_THRESHOLD_MS = 30000;

export async function ingestTelemetryEvent(event: TelemetryEvent): Promise<TelemetryLogRecord | null> {
  try {
    const userExists = await db.user.findUnique({ where: { id: event.userId }, select: { id: true } });
    if (!userExists) {
      console.warn(`Telemetry: User ${event.userId} not found, skipping event`);
      return null;
    }
  } catch {
    return null;
  }

  const record = await db.telemetryLog.create({
    data: {
      userId: event.userId,
      sessionId: event.sessionId,
      eventType: event.eventType,
      eventValue: event.eventValue ?? null,
      durationMs: event.durationMs ?? null,
      pageUrl: event.pageUrl ?? null,
      moduleContext: event.moduleContext ?? null,
      timestamp: event.timestamp ? new Date(event.timestamp) : new Date(),
    },
  });

  await recalculateFocusScore(event.userId, event.sessionId);

  return record;
}

async function recalculateFocusScore(userId: string, sessionId: string): Promise<void> {
  const windowStart = new Date(Date.now() - FOCUS_WINDOW_MS);

  const recentEvents = await db.telemetryLog.findMany({
    where: {
      userId,
      sessionId,
      timestamp: { gte: windowStart },
    },
    orderBy: { timestamp: 'asc' },
  });

  if (recentEvents.length === 0) return;

  let totalWindowMs = FOCUS_WINDOW_MS;
  let distractedMs = 0;
  let distractionCount = 0;
  let currentDistractionStart: Date | null = null;
  let lastEventType = recentEvents[recentEvents.length - 1].eventType;

  for (const event of recentEvents) {
    if (event.eventType === 'blur' || event.eventType === 'tab_switch' || event.eventType === 'minimize' || event.eventType === 'idle') {
      if (!currentDistractionStart) {
        currentDistractionStart = event.timestamp;
      }
      distractionCount++;
    } else if (event.eventType === 'focus') {
      if (currentDistractionStart) {
        const duration = event.timestamp.getTime() - currentDistractionStart.getTime();
        distractedMs += duration;
        currentDistractionStart = null;
      }
    }
  }

  if (currentDistractionStart) {
    const duration = Date.now() - currentDistractionStart.getTime();
    distractedMs += duration;
  }

  const effectiveFocusedMs = totalWindowMs - distractedMs;
  const focusScore = Math.max(0, Math.min(100, (effectiveFocusedMs / totalWindowMs) * 100));

  await db.telemetryLog.updateMany({
    where: {
      userId,
      sessionId,
      timestamp: { gte: windowStart },
    },
    data: { focusScore: Math.round(focusScore * 10) / 10 },
  });
}

export async function getFocusScore(userId: string, sessionId: string): Promise<FocusScoreResult> {
  const windowStart = new Date(Date.now() - FOCUS_WINDOW_MS);

  const recentEvents = await db.telemetryLog.findMany({
    where: {
      userId,
      sessionId,
      timestamp: { gte: windowStart },
    },
    orderBy: { timestamp: 'desc' },
    take: 50,
  });

  if (recentEvents.length === 0) {
    return {
      score: 100,
      totalSessionMs: 0,
      focusedMs: 0,
      distractionCount: 0,
      lastEventType: 'none',
    };
  }

  const latestScore = recentEvents[0].focusScore ?? 100;
  const distractionEvents = recentEvents.filter(
    (e) => e.eventType === 'blur' || e.eventType === 'tab_switch' || e.eventType === 'minimize'
  );

  return {
    score: latestScore,
    totalSessionMs: FOCUS_WINDOW_MS,
    focusedMs: Math.round((latestScore / 100) * FOCUS_WINDOW_MS),
    distractionCount: distractionEvents.length,
    lastEventType: recentEvents[0].eventType,
  };
}

export async function generateProctoringAlert(
  userId: string,
  sessionId: string
): Promise<ProctoringAlert | null> {
  const focusResult = await getFocusScore(userId, sessionId);

  if (focusResult.score < 30 && focusResult.distractionCount > 5) {
    return {
      type: 'quiz_check',
      message: "I notice you've been away for a while. Let's do a quick check to make sure we're on the same page before we continue.",
      severity: 'high',
      triggerReason: `Focus score dropped to ${focusResult.score.toFixed(1)}% with ${focusResult.distractionCount} distraction events`,
    };
  }

  if (focusResult.score < 50) {
    return {
      type: 'nudge',
      message: "It looks like your attention has been drifting. Let's refocus with a quick practical exercise.",
      severity: 'medium',
      triggerReason: `Focus score at ${focusResult.score.toFixed(1)}%`,
    };
  }

  if (focusResult.score < 70) {
    return {
      type: 'warning',
      message: "Just checking in - are you following along OK? Feel free to ask if anything needs clarification.",
      severity: 'low',
      triggerReason: `Focus score at ${focusResult.score.toFixed(1)}%`,
    };
  }

  return null;
}

export async function batchIngestTelemetry(events: TelemetryEvent[]): Promise<number> {
  let processed = 0;
  for (const event of events) {
    await ingestTelemetryEvent(event);
    processed++;
  }
  return processed;
}

type TelemetryLogRecord = Awaited<ReturnType<typeof db.telemetryLog.create>>;