import { NextRequest, NextResponse } from 'next/server';

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMITS: Record<string, { windowMs: number; maxRequests: number }> = {
  '/api/chat': { windowMs: 60000, maxRequests: 20 },
  '/api/telemetry': { windowMs: 60000, maxRequests: 60 },
  '/api/labs': { windowMs: 60000, maxRequests: 10 },
  '/api/quizzes': { windowMs: 60000, maxRequests: 30 },
  '/api/certificates': { windowMs: 60000, maxRequests: 10 },
  default: { windowMs: 60000, maxRequests: 100 },
};

function getClientKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  const userId = request.headers.get('x-user-id') ?? '';
  return `${userId || ip}`;
}

function checkRateLimit(key: string, path: string): { allowed: boolean; remaining: number; resetMs: number } {
  const limit = RATE_LIMITS[path] ?? RATE_LIMITS['default'];
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + limit.windowMs });
    return { allowed: true, remaining: limit.maxRequests - 1, resetMs: limit.windowMs };
  }

  if (entry.count >= limit.maxRequests) {
    return { allowed: false, remaining: 0, resetMs: entry.resetTime - now };
  }

  entry.count++;
  return { allowed: true, remaining: limit.maxRequests - entry.count, resetMs: entry.resetTime - now };
}

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 60000);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  const clientKey = getClientKey(request);
  const { allowed, remaining, resetMs } = checkRateLimit(clientKey, pathname);

  const response = allowed
    ? NextResponse.next()
    : NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );

  response.headers.set('X-RateLimit-Remaining', String(remaining));
  response.headers.set('X-RateLimit-Reset', String(Math.ceil(resetMs / 1000)));

  return response;
}

export const config = {
  matcher: ['/api/:path*'],
};