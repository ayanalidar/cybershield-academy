import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File | null;

    if (!audioFile) {
      return NextResponse.json({ error: 'Audio file is required' }, { status: 400 });
    }

    const arrayBuffer = await audioFile.arrayBuffer();
    const base64Audio = Buffer.from(new Uint8Array(arrayBuffer)).toString('base64');

    const ZAI = (await import('z-ai-web-dev-sdk')).default;
    const zai = await ZAI.create();

    const response = await zai.audio.asr.create({
      file_base64: base64Audio,
    });

    return NextResponse.json({
      success: true,
      text: response.text,
    });
  } catch (error) {
    console.error('ASR Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Speech recognition failed' },
      { status: 500 }
    );
  }
}