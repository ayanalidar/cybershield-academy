import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

const submitQuizSchema = z.object({
  userId: z.string().min(1, 'userId is required'),
  answers: z.array(
    z.object({
      questionId: z.string().min(1),
      selectedOption: z.string().min(1),
    })
  ).min(1, 'At least one answer is required'),
  timeTakenSec: z.number().int().min(0).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  try {
    const { moduleId } = await params;

    const quiz = await db.quiz.findFirst({
      where: { moduleId },
      include: {
        questions: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json(
        { error: 'No quiz found for this module' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      quiz: {
        id: quiz.id,
        title: quiz.title,
        timeLimitSec: quiz.timeLimitSec,
        passingScore: quiz.passingScore,
        questions: quiz.questions.map((q) => ({
          id: q.id,
          questionText: q.questionText,
          questionType: q.questionType,
          options: JSON.parse(q.options),
          points: q.points,
          orderIndex: q.orderIndex,
        })),
      },
    });
  } catch (error) {
    console.error('Quiz fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quiz' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  try {
    const { moduleId } = await params;
    const body = await request.json();
    const parsed = submitQuizSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { userId, answers, timeTakenSec } = parsed.data;

    const quiz = await db.quiz.findFirst({
      where: { moduleId },
      include: {
        questions: true,
      },
    });

    if (!quiz) {
      return NextResponse.json(
        { error: 'No quiz found for this module' },
        { status: 404 }
      );
    }

    const questionMap = new Map(
      quiz.questions.map((q) => [q.id, q])
    );

    let totalPoints = 0;
    let earnedPoints = 0;
    const results: Array<{
      questionId: string;
      selectedOption: string;
      correct: boolean;
      correctAnswer: string;
      explanation: string | null;
    }> = [];

    for (const answer of answers) {
      const question = questionMap.get(answer.questionId);
      if (!question) continue;

      const isCorrect = answer.selectedOption === question.correctAnswer;
      totalPoints += question.points;
      if (isCorrect) earnedPoints += question.points;

      results.push({
        questionId: answer.questionId,
        selectedOption: answer.selectedOption,
        correct: isCorrect,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
      });
    }

    const score = totalPoints > 0 ? earnedPoints / totalPoints : 0;
    const passed = score >= quiz.passingScore;

    const attempt = await db.quizAttempt.create({
      data: {
        quizId: quiz.id,
        userId,
        answers: JSON.stringify(results),
        score: earnedPoints,
        maxScore: totalPoints,
        passed,
        timeTakenSec: timeTakenSec ?? 0,
      },
    });

    return NextResponse.json({
      success: true,
      attempt: {
        id: attempt.id,
        score: earnedPoints,
        maxScore: totalPoints,
        percentage: Math.round(score * 10000) / 100,
        passed,
        results,
      },
    });
  } catch (error) {
    console.error('Quiz submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit quiz' },
      { status: 500 }
    );
  }
}
