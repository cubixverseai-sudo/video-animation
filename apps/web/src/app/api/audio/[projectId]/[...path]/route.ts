import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; path: string[] }> }
) {
  const { projectId, path: pathSegments } = await params;
  const fileName = pathSegments.join('/');
  
  // Build the full path to the audio file
  const audioPath = path.resolve(
    process.cwd(),
    '../../projects',
    projectId,
    'assets/audio',
    fileName
  );

  try {
    const fileBuffer = await readFile(audioPath);
    
    // Determine content type
    const ext = path.extname(fileName).toLowerCase();
    const contentType = ext === '.mp3' ? 'audio/mpeg' : 
                       ext === '.wav' ? 'audio/wav' : 
                       ext === '.ogg' ? 'audio/ogg' : 
                       'application/octet-stream';

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch (error) {
    console.error('Audio file not found:', audioPath);
    return NextResponse.json({ error: 'Audio file not found' }, { status: 404 });
  }
}
