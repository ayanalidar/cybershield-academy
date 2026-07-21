import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

const createCourseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  durationHours: z.number().min(0).optional(),
  thumbnailUrl: z.string().url().optional().or(z.literal('')),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const userId = searchParams.get('userId');

    const where: Record<string, unknown> = { isPublished: true };

    if (category) {
      where.category = category;
    }
    if (difficulty) {
      where.difficulty = difficulty;
    }

    const courses = await db.course.findMany({
      where,
      include: {
        _count: {
          select: {
            modules: {
              where: { isPublished: true },
            },
            enrollments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    let result = courses.map((course) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      category: course.category,
      difficulty: course.difficulty,
      durationHours: course.durationHours,
      rating: course.rating,
      studentCount: course.studentCount,
      thumbnailUrl: course.thumbnailUrl,
      moduleCount: course._count.modules,
      createdAt: course.createdAt,
    }));

    if (userId) {
      const enrollments = await db.enrollment.findMany({
        where: {
          userId,
          courseId: { in: courses.map((c) => c.id) },
        },
        select: { courseId: true, status: true, overallProgress: true },
      });

      const enrollmentMap = new Map(
        enrollments.map((e) => [e.courseId, e])
      );

      result = result.map((course) => ({
        ...course,
        enrollment: enrollmentMap.get(course.id) ?? null,
      }));
    }

    return NextResponse.json({ success: true, courses: result });
  } catch (error) {
    console.error('Courses list error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role: string }).role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = createCourseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const course = await db.course.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        category: parsed.data.category,
        difficulty: parsed.data.difficulty,
        durationHours: parsed.data.durationHours ?? 0,
        thumbnailUrl: parsed.data.thumbnailUrl,
        isPublished: true,
      },
    });

    return NextResponse.json({ success: true, course }, { status: 201 });
  } catch (error) {
    console.error('Course creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    );
  }
}
