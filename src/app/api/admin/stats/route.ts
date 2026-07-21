import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const [
      totalUsers,
      totalCourses,
      totalEnrollments,
      totalCertificates,
      totalLabSessions,
      quizAttempts,
    ] = await Promise.all([
      db.user.count(),
      db.course.count(),
      db.enrollment.count(),
      db.certificate.count(),
      db.labSession.count(),
      db.quizAttempt.findMany({
        select: { score: true, maxScore: true },
      }),
    ]);

    let averageQuizScore = 0;
    if (quizAttempts.length > 0) {
      const totalScore = quizAttempts.reduce((sum, a) => {
        if (a.maxScore > 0) {
          return sum + (a.score / a.maxScore);
        }
        return sum;
      }, 0);
      const validAttempts = quizAttempts.filter((a) => a.maxScore > 0).length;
      averageQuizScore =
        validAttempts > 0 ? Math.round((totalScore / validAttempts) * 10000) / 100 : 0;
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalCourses,
        totalEnrollments,
        totalCertificates,
        totalLabSessions,
        averageQuizScore,
      },
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch platform stats' },
      { status: 500 }
    );
  }
}
