import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { aggregatePerformance, issueCertificate, checkCertificateEligibility } from '@/lib/progress-service';
import { generateProgressPDF } from '@/lib/certificate-generator';

const progressSchema = z.object({
  userId: z.string().min(1),
  courseId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = progressSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { userId, courseId } = parsed.data;
    const summary = await aggregatePerformance(userId, courseId);

    await db.performanceMetrics.upsert({
      where: {
        id: `${userId}-${courseId}-summary`,
      },
      create: {
        id: `${userId}-${courseId}-summary`,
        userId,
        courseId,
        quizAccuracy: summary.overallQuizAccuracy,
        comprehensionScore:
          summary.moduleBreakdown.length > 0
            ? summary.moduleBreakdown.reduce((s, m) => s + m.comprehensionScore, 0) /
              summary.moduleBreakdown.length
            : 0,
        averageFocusScore: summary.averageFocusScore,
        labCompletionRate: summary.labCompletionRate,
        interactionCount: summary.totalInteractionCount,
        timeSpentMinutes: summary.totalTimeSpentMinutes,
        strengths: JSON.stringify(summary.strengths),
        weaknesses: JSON.stringify(summary.weaknesses),
        recommendations: JSON.stringify(summary.recommendations),
      },
      update: {
        quizAccuracy: summary.overallQuizAccuracy,
        comprehensionScore:
          summary.moduleBreakdown.length > 0
            ? summary.moduleBreakdown.reduce((s, m) => s + m.comprehensionScore, 0) /
              summary.moduleBreakdown.length
            : 0,
        averageFocusScore: summary.averageFocusScore,
        labCompletionRate: summary.labCompletionRate,
        interactionCount: summary.totalInteractionCount,
        timeSpentMinutes: summary.totalTimeSpentMinutes,
        strengths: JSON.stringify(summary.strengths),
        weaknesses: JSON.stringify(summary.weaknesses),
        recommendations: JSON.stringify(summary.recommendations),
      },
    });

    const eligibility = await checkCertificateEligibility(userId, courseId);

    return NextResponse.json({
      success: true,
      performance: summary,
      certificate: {
        eligible: eligibility.eligible,
        reasons: eligibility.reasons,
      },
    });
  } catch (error) {
    console.error('Progress report error:', error);
    return NextResponse.json(
      { error: 'Failed to generate progress report' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const courseId = searchParams.get('courseId');
    const format = searchParams.get('format');

    if (!userId || !courseId) {
      return NextResponse.json(
        { error: 'userId and courseId are required' },
        { status: 400 }
      );
    }

    const summary = await aggregatePerformance(userId, courseId);

    if (format === 'pdf') {
      const pdfBuffer = await generateProgressPDF(summary);
      return new Response(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="progress-report-${userId.slice(0, 8)}.pdf"`,
        },
      });
    }

    return NextResponse.json({ success: true, performance: summary });
  } catch (error) {
    console.error('Progress retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve progress data' },
      { status: 500 }
    );
  }
}