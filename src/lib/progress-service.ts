import { db } from '@/lib/db';
import { createHash } from 'crypto';
import type { PerformanceSummary, ModulePerformance } from '@/lib/types';

export async function aggregatePerformance(
  userId: string,
  courseId: string
): Promise<PerformanceSummary> {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error(`User not found: ${userId}`);
  const course = await db.course.findUnique({ where: { id: courseId } });
  if (!course) throw new Error(`Course not found: ${courseId}`);
  const modules = await db.module.findMany({
    where: { courseId, isPublished: true },
    orderBy: { orderIndex: 'asc' },
  });

  const metrics = await db.performanceMetrics.findMany({
    where: { userId, courseId },
  });

  const interactions = await db.interactionHistory.findMany({
    where: { userId },
  });

  const enrollments = await db.enrollment.findMany({
    where: { userId, courseId },
  });

  const enrollment = enrollments[0];

  const moduleBreakdown: ModulePerformance[] = await Promise.all(
    modules.map(async (mod) => {
      const modMetrics = metrics.filter((m) => m.moduleId === mod.id);
      const modInteractions = interactions.filter(
        (i) => i.moduleId === mod.id
      );

      const labSessions = await db.labSession.findMany({
        where: { userId, moduleId: mod.id, status: 'completed' },
      });

      const avgQuiz =
        modMetrics.length > 0
          ? modMetrics.reduce((s, m) => s + m.quizAccuracy, 0) / modMetrics.length
          : 0;

      const avgComprehension =
        modMetrics.length > 0
          ? modMetrics.reduce((s, m) => s + m.comprehensionScore, 0) / modMetrics.length
          : 0;

      const avgFocus =
        modMetrics.length > 0
          ? modMetrics.reduce((s, m) => s + m.averageFocusScore, 0) / modMetrics.length
          : 0;

      const avgLabScore =
        labSessions.length > 0
          ? labSessions.reduce((s, l) => s + (l.score ?? 0), 0) / labSessions.length
          : null;

      const totalTimeSpent =
        modMetrics.length > 0
          ? modMetrics.reduce((s, m) => s + m.timeSpentMinutes, 0)
          : 0;

      return {
        moduleId: mod.id,
        moduleTitle: mod.title,
        quizAccuracy: Math.round(avgQuiz * 100) / 100,
        comprehensionScore: Math.round(avgComprehension * 100) / 100,
        focusScore: Math.round(avgFocus * 100) / 100,
        labCompleted: labSessions.length > 0 && labSessions.some((l) => l.status === 'completed'),
        labScore: avgLabScore !== null ? Math.round(avgLabScore * 100) / 100 : null,
        timeSpentMinutes: Math.round(totalTimeSpent * 100) / 100,
      };
    })
  );

  const completedModules = moduleBreakdown.filter(
    (m) => m.quizAccuracy > 0.6 && m.labCompleted
  ).length;

  const overallQuizAccuracy =
    moduleBreakdown.length > 0
      ? moduleBreakdown.reduce((s, m) => s + m.quizAccuracy, 0) / moduleBreakdown.length
      : 0;

  const avgFocusScore =
    moduleBreakdown.length > 0
      ? moduleBreakdown.reduce((s, m) => s + m.focusScore, 0) / moduleBreakdown.length
      : 0;

  const labCompletionRate =
    moduleBreakdown.length > 0
      ? moduleBreakdown.filter((m) => m.labCompleted).length / moduleBreakdown.length
      : 0;

  const totalTimeSpent =
    moduleBreakdown.reduce((s, m) => s + m.timeSpentMinutes, 0);

  const strengths = analyzeStrengths(moduleBreakdown);
  const weaknesses = analyzeWeaknesses(moduleBreakdown);
  const recommendations = generateRecommendations(
    moduleBreakdown,
    overallQuizAccuracy,
    avgFocusScore,
    labCompletionRate
  );

  return {
    userId,
    userName: user.name,
    courseId,
    courseName: course.title,
    modulesCompleted: completedModules,
    totalModules: modules.length,
    overallQuizAccuracy: Math.round(overallQuizAccuracy * 100) / 100,
    averageFocusScore: Math.round(avgFocusScore * 100) / 100,
    labCompletionRate: Math.round(labCompletionRate * 100) / 100,
    totalInteractionCount: interactions.length,
    totalTimeSpentMinutes: Math.round(totalTimeSpent * 100) / 100,
    strengths,
    weaknesses,
    recommendations,
    moduleBreakdown,
    recordedAt: new Date().toISOString(),
  };
}

function analyzeStrengths(modules: ModulePerformance[]): string[] {
  const strengths: string[] = [];

  const highQuiz = modules.filter((m) => m.quizAccuracy >= 0.8);
  if (highQuiz.length > 0) {
    const names = highQuiz.map((m) => m.moduleTitle).join(', ');
    strengths.push(
      `Strong theoretical understanding in: ${names} (quiz accuracy >= 80%)`
    );
  }

  const highLab = modules.filter(
    (m) => m.labCompleted && (m.labScore ?? 0) >= 0.8
  );
  if (highLab.length > 0) {
    const names = highLab.map((m) => m.moduleTitle).join(', ');
    strengths.push(
      `Excellent practical skills demonstrated in: ${names} (lab score >= 80%)`
    );
  }

  const highFocus = modules.filter((m) => m.focusScore >= 80);
  if (highFocus.length === modules.length && modules.length > 0) {
    strengths.push('Consistently high engagement and focus throughout the course');
  }

  if (strengths.length === 0) {
    strengths.push('Actively participating in course material');
  }

  return strengths;
}

function analyzeWeaknesses(modules: ModulePerformance[]): string[] {
  const weaknesses: string[] = [];

  const lowQuiz = modules.filter((m) => m.quizAccuracy > 0 && m.quizAccuracy < 0.6);
  if (lowQuiz.length > 0) {
    const names = lowQuiz.map((m) => m.moduleTitle).join(', ');
    weaknesses.push(
      `Areas needing theoretical review: ${names} (quiz accuracy < 60%)`
    );
  }

  const incompleteLabs = modules.filter((m) => !m.labCompleted);
  if (incompleteLabs.length > 0) {
    const names = incompleteLabs.map((m) => m.moduleTitle).join(', ');
    weaknesses.push(`Incomplete lab exercises in: ${names}`);
  }

  const lowFocus = modules.filter((m) => m.focusScore < 60 && m.timeSpentMinutes > 0);
  if (lowFocus.length > 0) {
    const names = lowFocus.map((m) => m.moduleTitle).join(', ');
    weaknesses.push(`Lower engagement detected during: ${names} (focus score < 60%)`);
  }

  if (weaknesses.length === 0) {
    weaknesses.push('No significant weaknesses identified - keep up the strong performance');
  }

  return weaknesses;
}

function generateRecommendations(
  modules: ModulePerformance[],
  quizAccuracy: number,
  focusScore: number,
  labRate: number
): string[] {
  const recs: string[] = [];

  if (quizAccuracy < 0.7) {
    recs.push(
      'Review theoretical concepts by re-reading module content and attempting practice quizzes before advancing'
    );
  }

  if (labRate < 0.7) {
    recs.push(
      'Prioritize completing hands-on lab exercises - practical application is essential for retaining cybersecurity skills'
    );
  }

  if (focusScore < 65) {
    recs.push(
      'Try studying in a distraction-free environment with dedicated focus blocks of 25-30 minutes'
    );
  }

  const incompleteModules = modules.filter(
    (m) => m.quizAccuracy === 0 || (!m.labCompleted && m.timeSpentMinutes > 0)
  );
  if (incompleteModules.length > 0) {
    const names = incompleteModules.map((m) => m.moduleTitle).join(', ');
    recs.push(`Resume incomplete modules: ${names}`);
  }

  if (quizAccuracy >= 0.8 && labRate >= 0.8) {
    recs.push(
      'Consider advancing to the next course level or exploring specialized security domains'
    );
  }

  recs.push(
    'Regularly revisit previous modules through spaced repetition to strengthen long-term retention'
  );

  return recs;
}

export function generateVerificationHash(
  userId: string,
  courseId: string,
  issuedAt: string
): string {
  const payload = `${userId}:${courseId}:${issuedAt}:cybershield-academy`;
  return createHash('sha256').update(payload).digest('hex');
}

export async function checkCertificateEligibility(
  userId: string,
  courseId: string
): Promise<{ eligible: boolean; reasons: string[] }> {
  const summary = await aggregatePerformance(userId, courseId);
  const reasons: string[] = [];

  const completionRatio =
    summary.totalModules > 0
      ? summary.modulesCompleted / summary.totalModules
      : 0;

  if (completionRatio < 0.8) {
    reasons.push(
      `Module completion below threshold: ${summary.modulesCompleted}/${summary.totalModules} (need 80%)`
    );
  }

  if (summary.overallQuizAccuracy < 0.6) {
    reasons.push(
      `Quiz accuracy below threshold: ${Math.round(summary.overallQuizAccuracy * 100)}% (need 60%)`
    );
  }

  if (summary.averageFocusScore < 50) {
    reasons.push(
      `Average focus score below threshold: ${Math.round(summary.averageFocusScore)}% (need 50%)`
    );
  }

  if (summary.labCompletionRate < 0.7) {
    reasons.push(
      `Lab completion rate below threshold: ${Math.round(summary.labCompletionRate * 100)}% (need 70%)`
    );
  }

  const existingCert = await db.certificate.findFirst({
    where: { userId, courseId, status: 'active' },
  });
  if (existingCert) {
    reasons.push('Certificate already issued for this course');
    return { eligible: false, reasons };
  }

  return { eligible: reasons.length === 0, reasons };
}

export async function issueCertificate(
  userId: string,
  courseId: string
): Promise<{ success: boolean; certificateId?: string; verificationHash?: string; error?: string }> {
  const eligibility = await checkCertificateEligibility(userId, courseId);
  if (!eligibility.eligible) {
    return { success: false, error: eligibility.reasons.join('; ') };
  }

  const course = await db.course.findUnique({ where: { id: courseId } });
  if (!course) return { success: false, error: 'Course not found' };
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return { success: false, error: 'User not found' };

  const issuedAt = new Date().toISOString();
  const verificationHash = generateVerificationHash(userId, courseId, issuedAt);

  const certificate = await db.certificate.create({
    data: {
      userId,
      courseId,
      courseName: course.title,
      userName: user.name,
      verificationHash,
    },
  });

  return {
    success: true,
    certificateId: certificate.id,
    verificationHash,
  };
}