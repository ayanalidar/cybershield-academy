import { db } from '@/lib/db';
import type { RAGContext } from '@/lib/types';

const EMBEDDING_DIMENSIONS = 128;
const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL ?? 'hash-fallback';

function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length || vecA.length === 0) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

function parseVector(vectorStr: string): number[] {
  try {
    const cleaned = vectorStr.trim().replace(/^\[|\]$/g, '');
    if (!cleaned) return [];
    return cleaned.split(',').map((n) => parseFloat(n.trim())).filter((n) => !isNaN(n));
  } catch {
    return [];
  }
}

function simpleHashEmbedding(text: string, dimensions: number = EMBEDDING_DIMENSIONS): number[] {
  const vector = new Array(dimensions).fill(0);
  const words = text.toLowerCase().split(/\s+/);
  for (const word of words) {
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      const char = word.charCodeAt(i);
      hash = ((hash << 5) - hash + char) | 0;
    }
    const slot = Math.abs(hash) % dimensions;
    vector[slot] += 1;
    if (slot + 1 < dimensions) vector[slot + 1] += 0.5;
    if (slot > 0) vector[slot - 1] += 0.25;
  }
  const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
  return norm > 0 ? vector.map((v) => v / norm) : vector;
}

export async function ingestModuleContent(
  moduleId: string,
  content: string,
 chunkSize: number = 500,
  overlap: number = 100
): Promise<number> {
  await db.embedding.deleteMany({ where: { moduleId } });

  const chunks: { text: string; index: number }[] = [];
  const words = content.split(/\s+/);
  let position = 0;
  let chunkIndex = 0;

  while (position < words.length) {
    const end = Math.min(position + chunkSize, words.length);
    const chunkText = words.slice(position, end).join(' ');
    chunks.push({ text: chunkText, index: chunkIndex });
    position = end - Math.floor(overlap / 2);
    chunkIndex++;
  }

  for (const chunk of chunks) {
    const vector = simpleHashEmbedding(chunk.text);
    await db.embedding.create({
      data: {
        moduleId,
        chunkIndex: chunk.index,
        content: chunk.text,
        vector: JSON.stringify(vector),
      },
    });
  }

  return chunks.length;
}

export async function queryRAG(
  query: string,
 courseId?: string,
 moduleId?: string,
 topK: number = 5
): Promise<RAGContext[]> {
  const queryVector = simpleHashEmbedding(query);

  const whereClause: Record<string, unknown> = {};
  if (moduleId) {
    whereClause.moduleId = moduleId;
  } else if (courseId) {
    whereClause.module = { courseId };
  }

  const embeddings = await db.embedding.findMany({
    where: whereClause,
    include: { module: { select: { id: true, title: true, courseId: true } } },
  });

  const scored = embeddings
    .map((emb) => {
      const vec = parseVector(emb.vector);
      const similarity = cosineSimilarity(queryVector, vec);
      return {
        moduleId: emb.moduleId,
        chunkContent: emb.content,
        relevanceScore: similarity,
        source: emb.module.title,
      };
    })
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, topK);

  return scored.filter((s) => s.relevanceScore > 0.1);
}

export async function invalidateModuleCache(moduleId: string): Promise<number> {
  const result = await db.embedding.deleteMany({ where: { moduleId } });
  return result.count;
}

async function generateRealEmbedding(text: string): Promise<number[] | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.EMBEDDING_MODEL ?? 'text-embedding-3-small',
        input: text,
        dimensions: EMBEDDING_DIMENSIONS,
      }),
    });

    if (!response.ok) {
      console.error(`Embedding API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error('Embedding generation failed:', error);
    return null;
  }
}

export async function embedText(text: string): Promise<number[]> {
  if (EMBEDDING_MODEL !== 'hash-fallback') {
    const realVector = await generateRealEmbedding(text);
    if (realVector) return realVector;
  }
  return simpleHashEmbedding(text);
}
