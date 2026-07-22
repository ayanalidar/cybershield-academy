import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { issueCertificate, generateVerificationHash } from '@/lib/progress-service';
import { generateCertificatePDF } from '@/lib/certificate-generator';

const issueSchema = z.object({
  userId: z.string().min(1),
  courseId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = issueSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const result = await issueCertificate(parsed.data.userId, parsed.data.courseId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      certificateId: result.certificateId,
      verificationHash: result.verificationHash,
      verificationUrl: `/api/certificates/verify?hash=${result.verificationHash}`,
    });
  } catch (error) {
    console.error('Certificate issuance error:', error);
    return NextResponse.json(
      { error: 'Failed to issue certificate' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const certificateId = searchParams.get('certificateId');
    const download = searchParams.get('download');

    if (certificateId) {
      const cert = await db.certificate.findUnique({ where: { id: certificateId } });
      if (!cert) {
        return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, certificate: cert });
    }

    if (userId) {
      const certs = await db.certificate.findMany({
        where: { userId, status: 'active' },
        orderBy: { issuedAt: 'desc' },
      });
      return NextResponse.json({ success: true, certificates: certs });
    }

    if (download) {
      const cert = await db.certificate.findUnique({ where: { id: download } });
      if (!cert) {
        return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
      }

      const pdfBuffer = await generateCertificatePDF({
        id: cert.id,
        userId: cert.userId,
        courseId: cert.courseId,
        courseName: cert.courseName,
        userName: cert.userName,
        verificationHash: cert.verificationHash,
        issuedAt: cert.issuedAt.toISOString(),
      });

      return new Response(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="certificate-${cert.courseName.replace(/\s+/g, '-').toLowerCase()}.pdf"`,
        },
      });
    }

    return NextResponse.json(
      { error: 'userId or certificateId or download parameter is required' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Certificate retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve certificates' },
      { status: 500 }
    );
  }
}