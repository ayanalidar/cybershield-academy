import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

const submitFlagSchema = z.object({
  userId: z.string().min(1),
  challengeId: z.string().min(1),
  flag: z.string().min(1),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    const challenges = await db.ctfChallenge.findMany({
      where: { isPublished: true },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        difficulty: true,
        points: true,
        solveCount: true,
        flag: false,
      },
      orderBy: { points: 'desc' },
    });

    let solvedIds: string[] = [];
    if (userId) {
      const subs = await db.ctfSubmission.findMany({
        where: { userId, correct: true },
        select: { challengeId: true },
      });
      solvedIds = subs.map(s => s.challengeId);
    }

    return NextResponse.json({
      challenges: challenges.map(c => ({
        ...c,
        solved: solvedIds.includes(c.id),
      })),
    });
  } catch (error) {
    console.error('CTF GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, challengeId, flag } = submitFlagSchema.parse(body);

    const challenge = await db.ctfChallenge.findUnique({
      where: { id: challengeId },
    });

    if (!challenge) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
    }

    const correct = flag.trim() === challenge.flag.trim();

    const existingSolve = await db.ctfSubmission.findFirst({
      where: { userId, challengeId, correct: true },
    });

    if (existingSolve) {
      return NextResponse.json({
        success: true,
        correct: true,
        alreadySolved: true,
        message: 'You already solved this challenge!',
      });
    }

    await db.ctfSubmission.create({
      data: { userId, challengeId, flagSubmitted: flag, correct },
    });

    if (correct) {
      await db.ctfChallenge.update({
        where: { id: challengeId },
        data: { solveCount: { increment: 1 } },
      });

      const user = await db.user.findUnique({ where: { id: userId } });
      if (user) {
        const newXp = user.xp + challenge.points;
        const level = Math.floor(Math.sqrt(newXp / 50)) + 1;
        await db.user.update({
          where: { id: userId },
          data: { xp: newXp, level },
        });
        await db.xpLog.create({
          data: {
            userId,
            amount: challenge.points,
            source: 'ctf',
            description: `Solved CTF: ${challenge.title}`,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      correct,
      message: correct
        ? `Correct! +${challenge.points} XP`
        : 'Incorrect flag. Try again!',
      points: correct ? challenge.points : 0,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('CTF POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}