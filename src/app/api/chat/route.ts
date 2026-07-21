import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { queryRAG } from '@/lib/rag-service';
import { getFocusScore, generateProctoringAlert } from '@/lib/telemetry-service';
import { PROFESSOR_SYSTEM_PROMPT, buildContextualPrompt } from '@/lib/professor-prompt';
import type { ChatMessage, StudentContext, ProctoringAlert } from '@/lib/types';

const chatRequestSchema = z.object({
  userId: z.string().min(1),
  sessionId: z.string().min(1),
  courseId: z.string().optional(),
  moduleId: z.string().optional(),
  message: z.string().min(1).max(4000),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      })
    )
    .max(20),
});

async function generateAIResponse(
  messages: { role: string; content: string }[],
  systemPrompt: string
): Promise<ReadableStream<Uint8Array>> {
  const sdk = await import('z-ai-web-dev-sdk');
  const llm = new sdk.LLM();

  const fullMessages = [
    { role: 'system' as const, content: systemPrompt },
    ...messages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
  ];

  const stream = await llm.chat({
    messages: fullMessages,
    stream: true,
    temperature: 0.7,
    maxTokens: 2048,
  });

  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const content = chunk.choices?.[0]?.delta?.content ?? '';
          if (content) {
            controller.enqueue(encoder.encode(content));
          }
        }
        controller.close();
      } catch (error) {
        console.error('Streaming error:', error);
        controller.error(error);
      }
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = chatRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { userId, sessionId, courseId, moduleId, message, history } = parsed.data;

    const ragResults = moduleId
      ? await queryRAG(message, undefined, moduleId)
      : courseId
        ? await queryRAG(message, courseId)
        : [];

    const focusResult = await getFocusScore(userId, sessionId);
    const proctoringAlert: ProctoringAlert | null = await generateProctoringAlert(
      userId,
      sessionId
    );

    let currentModuleTitle: string | undefined;
    let labActive = false;
    let labTopic: string | undefined;
    let labObjectiveProgress: number | undefined;

    if (moduleId) {
      const mod = await db.module.findUnique({ where: { id: moduleId } });
      currentModuleTitle = mod?.title ?? undefined;
    }

    const activeLab = await db.labSession.findFirst({
      where: { userId, status: 'running' },
    });
    if (activeLab) {
      labActive = true;
      labTopic = activeLab.topic;
      const objectives = safeParseJson(activeLab.objectivesCompleted);
      const totalObjectives = safeParseJson(activeLab.objectives);
      if (Array.isArray(objectives) && Array.isArray(totalObjectives)) {
        labObjectiveProgress =
          totalObjectives.length > 0
            ? objectives.filter((o: { completed: boolean }) => o.completed).length /
              totalObjectives.length
            : 0;
      }
    }

    let enrollmentProgress = 0;
    let quizAccuracy = 0;
    if (courseId) {
      const enrollment = await db.enrollment.findFirst({
        where: { userId, courseId },
      });
      if (enrollment) {
        enrollmentProgress = enrollment.overallProgress;
      }
      const metrics = await db.performanceMetrics.findMany({
        where: { userId, courseId },
      });
      if (metrics.length > 0) {
        quizAccuracy =
          metrics.reduce((s, m) => s + m.quizAccuracy, 0) / metrics.length;
      }
    }

    const studentContext: StudentContext = {
      userId,
      currentModuleId: moduleId,
      sessionId,
      focusScore: focusResult.score,
      labActive,
      labTopic,
      labObjectiveProgress,
      overallProgress: enrollmentProgress,
      quizAccuracy,
    };

    const contextualBlock = buildContextualPrompt(
      {
        focusScore: studentContext.focusScore,
        recentDistraction:
          focusResult.lastEventType !== 'focus' && focusResult.lastEventType !== 'none'
            ? `Last event: ${focusResult.lastEventType} (${focusResult.distractionCount} distractions)`
            : undefined,
        labActive: studentContext.labActive,
        labTopic: studentContext.labTopic,
        labObjectiveProgress: studentContext.labObjectiveProgress,
        currentModuleTitle,
        overallProgress: studentContext.overallProgress,
        quizAccuracy: studentContext.quizAccuracy,
      },
      ragResults
    );

    let systemContent = PROFESSOR_SYSTEM_PROMPT;
    if (contextualBlock) {
      systemContent += '\n\n' + contextualBlock;
    }

    if (proctoringAlert && proctoringAlert.severity !== 'low') {
      systemContent += `\n\nPROCTORING DIRECTIVE: ${proctoringAlert.message} (Severity: ${proctoringAlert.severity})`;
    }

    await db.interactionHistory.create({
      data: {
        userId,
        moduleId: moduleId ?? null,
        sessionId,
        interactionType: 'chat',
        content: message,
      },
    });

    const stream = await generateAIResponse(history, systemContent);

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'X-Proctoring-Alert': proctoringAlert ? JSON.stringify(proctoringAlert) : 'null',
        'X-Focus-Score': String(focusResult.score),
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}

function safeParseJson(str: string | null): unknown {
  if (!str) return null;
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}