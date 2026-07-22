import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ingestTelemetryEvent, getFocusScore, batchIngestTelemetry } from '@/lib/telemetry-service';

const telemetrySchema = z.object({
  userId: z.string().min(1),
  sessionId: z.string().min(1),
  eventType: z.enum(['focus', 'blur', 'tab_switch', 'minimize', 'idle', 'visibility_change']),
  eventValue: z.string().optional(),
  durationMs: z.number().int().positive().optional(),
  pageUrl: z.string().optional(),
  moduleContext: z.string().optional(),
  timestamp: z.string().optional(),
});

const batchSchema = z.object({
  events: z.array(telemetrySchema).min(1).max(50),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const contentType = request.headers.get('content-type') ?? '';

    if (body.events && Array.isArray(body.events)) {
      const parsed = batchSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Invalid batch telemetry data', details: parsed.error.flatten() },
          { status: 400 }
        );
      }

      const count = await batchIngestTelemetry(parsed.data.events);
      return NextResponse.json({
        success: true,
        processed: count,
        message: `Batch ingested ${count} telemetry events`,
      });
    }

    const parsed = telemetrySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid telemetry data', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    await ingestTelemetryEvent(parsed.data);

    const focusResult = await getFocusScore(
      parsed.data.userId,
      parsed.data.sessionId
    );

    return NextResponse.json({
      success: true,
      focusScore: focusResult.score,
      distractionCount: focusResult.distractionCount,
      message: 'Telemetry recorded',
    });
  } catch (error) {
    console.error('Telemetry ingestion error:', error);
    return NextResponse.json(
      { error: 'Internal server error processing telemetry' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const sessionId = searchParams.get('sessionId');

    if (!userId || !sessionId) {
      return NextResponse.json(
        { error: 'userId and sessionId query parameters are required' },
        { status: 400 }
      );
    }

    const focusResult = await getFocusScore(userId, sessionId);
    return NextResponse.json({ success: true, ...focusResult });
  } catch (error) {
    console.error('Focus score retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve focus score' },
      { status: 500 }
    );
  }
}