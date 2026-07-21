import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ingestModuleContent } from '@/lib/rag-service';
import { db } from '@/lib/db';

const ingestSchema = z.object({
  moduleId: z.string().min(1),
  chunkSize: z.number().int().min(100).max(2000).optional(),
  overlap: z.number().int().min(0).max(500).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = ingestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const mod = await db.module.findUnique({
      where: { id: parsed.data.moduleId },
      select: { id: true, content: true, title: true },
    });

    if (!mod) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    if (!mod.content) {
      return NextResponse.json({ error: 'Module has no content to embed' }, { status: 400 });
    }

    const count = await ingestModuleContent(
      mod.id,
      mod.content,
      parsed.data.chunkSize,
      parsed.data.overlap
    );

    return NextResponse.json({
      success: true,
      chunksCreated: count,
      moduleTitle: mod.title,
      message: `Successfully embedded ${count} chunks from "${mod.title}"`,
    });
  } catch (error) {
    console.error('RAG ingestion error:', error);
    return NextResponse.json(
      { error: 'Failed to ingest module content' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const moduleId = searchParams.get('moduleId');

    if (!moduleId) {
      return NextResponse.json({ error: 'moduleId is required' }, { status: 400 });
    }

    const { default: invalidateModuleCache } = await import('@/lib/rag-service');
    const count = await invalidateModuleCache(moduleId);

    return NextResponse.json({
      success: true,
      deletedChunks: count,
      message: `Invalidated ${count} embedding chunks`,
    });
  } catch (error) {
    console.error('RAG cache invalidation error:', error);
    return NextResponse.json(
      { error: 'Failed to invalidate cache' },
      { status: 500 }
    );
  }
}