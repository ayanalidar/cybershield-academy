import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateVerificationHash } from '@/lib/progress-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hash = searchParams.get('hash');

    if (!hash) {
      return NextResponse.json(
        { error: 'Verification hash is required' },
        { status: 400 }
      );
    }

    const certificate = await db.certificate.findUnique({
      where: { verificationHash: hash },
    });

    if (!certificate) {
      return NextResponse.json({
        valid: false,
        error: 'No certificate found with this verification hash',
      });
    }

    const isRevoked = certificate.status === 'revoked';
    const isExpired = certificate.expiresAt && certificate.expiresAt < new Date();

    const expectedHash = generateVerificationHash(
      certificate.userId,
      certificate.courseId,
      certificate.issuedAt.toISOString()
    );
    const hashValid = expectedHash === hash;

    return NextResponse.json({
      valid: hashValid && !isRevoked && !isExpired,
      certificate: {
        courseName: certificate.courseName,
        userName: certificate.userName,
        issuedAt: certificate.issuedAt,
        expiresAt: certificate.expiresAt,
        status: certificate.status,
      },
      verification: {
        hashIntact: hashValid,
        notRevoked: !isRevoked,
        notExpired: !isExpired,
      },
    });
  } catch (error) {
    console.error('Certificate verification error:', error);
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    );
  }
}