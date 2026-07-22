import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '20');

    const leaderboard = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        xp: true,
        level: true,
        streakDays: true,
        userBadges: { select: { badgeId: true } },
        ctfSubmissions: { where: { correct: true }, select: { id: true } },
      },
      orderBy: { xp: 'desc' },
      take: limit,
    });

    const LEVEL_TITLES = [
      'Script Kiddie', 'Junior Analyst', 'Security Intern', 'Threat Scout',
      'Network Guardian', 'Security Engineer', 'Cyber Defender', 'Pen Tester',
      'Security Architect', 'Incident Commander',
    ];

    return NextResponse.json({
      leaderboard: leaderboard.map((u, i) => ({
        rank: i + 1,
        id: u.id,
        name: u.name,
        xp: u.xp,
        level: u.level,
        title: LEVEL_TITLES[Math.min(u.level - 1, LEVEL_TITLES.length - 1)] || 'Cyber Sentinel',
        badges: u.userBadges.length,
        ctfSolves: u.ctfSubmissions.length,
        streak: u.streakDays,
      })),
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}