import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

const awardXpSchema = z.object({
  userId: z.string().min(1),
  amount: z.number().int().min(1),
  source: z.string().min(1),
  description: z.string().optional(),
});

const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500, 7500, 10000, 13000, 17000, 22000];

function calculateLevel(xp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

function getLevelTitle(level: number): string {
  const titles = [
    'Script Kiddie', 'Junior Analyst', 'Security Intern', 'Threat Scout',
    'Network Guardian', 'Security Engineer', 'Cyber Defender', 'Pen Tester',
    'Security Architect', 'Incident Commander', 'Threat Hunter',
    'Red Team Lead', 'Shield Master', 'Cyber Sentinel', 'Grandmaster'
  ];
  return titles[Math.min(level - 1, titles.length - 1)] || 'Grandmaster';
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, amount, source, description } = awardXpSchema.parse(body);

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const newXp = user.xp + amount;
    const newLevel = calculateLevel(newXp);

    await db.user.update({
      where: { id: userId },
      data: { xp: newXp, level: newLevel, lastActiveAt: new Date() },
    });

    await db.xpLog.create({
      data: { userId, amount, source, description },
    });

    const allBadges = await db.badge.findMany();
    const earnedBadgeIds = (await db.userBadge.findMany({
      where: { userId },
      select: { badgeId: true },
    })).map(b => b.badgeId);

    const newBadges: { name: string; description: string; icon: string; rarity: string; xpReward: number }[] = [];

    for (const badge of allBadges) {
      if (earnedBadgeIds.includes(badge.id)) continue;
      let earned = false;
      if (badge.name === 'First Blood' && newXp >= 100) earned = true;
      if (badge.name === 'Quiz Master' && source === 'quiz' && amount >= 50) earned = true;
      if (badge.name === 'Lab Explorer' && source === 'lab') earned = true;
      if (badge.name === 'Focus Champion' && source === 'focus') earned = true;
      if (badge.name === 'CTF Winner' && source === 'ctf') earned = true;
      if (badge.name === 'Cipher Master' && newXp >= 1000) earned = true;
      if (badge.name === 'Night Owl' && new Date().getHours() >= 22) earned = true;
      if (badge.name === 'Eagle Eye' && newXp >= 2000) earned = true;

      if (earned) {
        await db.userBadge.create({
          data: { userId, badgeId: badge.id },
        });
        newBadges.push({
          name: badge.name,
          description: badge.description,
          icon: badge.icon,
          rarity: badge.rarity,
          xpReward: badge.xpReward,
        });
      }
    }

    return NextResponse.json({
      success: true,
      xp: newXp,
      level: newLevel,
      title: getLevelTitle(newLevel),
      xpGained: amount,
      newBadges,
      xpToNextLevel: LEVEL_THRESHOLDS[Math.min(newLevel, LEVEL_THRESHOLDS.length - 1)] - newXp,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Gamification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        xp: true,
        level: true,
        streakDays: true,
        userBadges: {
          include: { badge: true },
          orderBy: { earnedAt: 'desc' },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const allBadges = await db.badge.findMany();
    const earnedBadgeIds = user.userBadges.map(b => b.badgeId);

    return NextResponse.json({
      xp: user.xp,
      level: user.level,
      title: getLevelTitle(user.level),
      streakDays: user.streakDays,
      badges: user.userBadges.map(ub => ({
        ...ub.badge,
        earnedAt: ub.earnedAt,
      })),
      allBadges: allBadges.map(b => ({
        ...b,
        earned: earnedBadgeIds.includes(b.id),
      })),
      xpToNextLevel: LEVEL_THRESHOLDS[Math.min(user.level, LEVEL_THRESHOLDS.length - 1)] - user.xp,
      progressPercent: user.level > 0
        ? ((user.xp - LEVEL_THRESHOLDS[user.level - 1]) /
           (LEVEL_THRESHOLDS[Math.min(user.level, LEVEL_THRESHOLDS.length - 1)] - LEVEL_THRESHOLDS[user.level - 1])) * 100
        : 0,
    });
  } catch (error) {
    console.error('Gamification GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}