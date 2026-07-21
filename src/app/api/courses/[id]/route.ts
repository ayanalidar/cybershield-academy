import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

const updateCourseSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  durationHours: z.number().min(0).optional(),
  rating: z.number().min(0).max(5).optional(),
  thumbnailUrl: z.string().url().optional().or(z.literal('')).optional(),
  isPublished: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const course = await db.course.findUnique({
      where: { id },
      include: {
        modules: {
          where: { isPublished: true },
          orderBy: { orderIndex: 'asc' },
        },
        _count: {
          select: { enrollments: true },
        },
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    let enrollment = null;
    if (userId) {
      enrollment = await db.enrollment.findUnique({
        where: {
          userId_courseId: { userId, courseId: id },
        },
        select: {
          id: true,
          status: true,
          overallProgress: true,
          currentModuleId: true,
          enrolledAt: true,
          completedAt: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      course: {
        id: course.id,
        title: course.title,
        description: course.description,
        category: course.category,
        difficulty: course.difficulty,
        durationHours: course.durationHours,
        rating: course.rating,
        studentCount: course.studentCount,
        thumbnailUrl: course.thumbnailUrl,
        modules: course.modules.map((m) => ({
          id: m.id,
          title: m.title,
          description: m.description,
          durationMinutes: m.durationMinutes,
          orderIndex: m.orderIndex,
          videoUrl: m.videoUrl,
          contentType: m.contentType,
        })),
        enrollmentCount: course._count.enrollments,
        enrollment,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
      },
    });
  } catch (error) {
    console.error('Course detail error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role: string }).role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = updateCourseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await db.course.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    const course = await db.course.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json({ success: true, course });
  } catch (error) {
    console.error('Course update error:', error);
    return NextResponse.json(
      { error: 'Failed to update course' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role: string }).role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const { id } = await params;

    const existing = await db.course.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    await db.course.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Course deleted' });
  } catch (error) {
    console.error('Course deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete course' },
      { status: 500 }
    );
  }
}
