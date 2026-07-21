import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

const enrollSchema = z.object({
  userId: z.string().min(1, 'userId is required'),
  courseId: z.string().min(1, 'courseId is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = enrollSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { userId, courseId } = parsed.data;

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const course = await db.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    const existing = await db.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Already enrolled in this course' },
        { status: 409 }
      );
    }

    const publishedModules = await db.module.findMany({
      where: { courseId, isPublished: true },
      orderBy: { orderIndex: 'asc' },
      select: { id: true },
    });

    const enrollment = await db.enrollment.create({
      data: {
        userId,
        courseId,
        status: 'active',
        currentModuleId: publishedModules[0]?.id ?? null,
        overallProgress: 0,
      },
    });

    await db.course.update({
      where: { id: courseId },
      data: { studentCount: { increment: 1 } },
    });

    return NextResponse.json({ success: true, enrollment }, { status: 201 });
  } catch (error) {
    console.error('Enrollment error:', error);
    return NextResponse.json(
      { error: 'Failed to enroll in course' },
      { status: 500 }
    );
  }
}
