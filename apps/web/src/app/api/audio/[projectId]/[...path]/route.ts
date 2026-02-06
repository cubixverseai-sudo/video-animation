import { NextRequest, NextResponse } from 'next/server';
import { readFile, stat } from 'fs/promises';
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
    const fileStat = await stat(audioPath);
    const fileSize = fileStat.size;
    
    // Determine content type
    const ext = path.extname(fileName).toLowerCase();
    const contentType = ext === '.mp3' ? 'audio/mpeg' : 
                       ext === '.wav' ? 'audio/wav' : 
                       ext === '.ogg' ? 'audio/ogg' : 
                       'application/octet-stream';

    // Check for Range header (required for Remotion seeking)
    const range = request.headers.get('range');
    
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;
      
      const fileBuffer = await readFile(audioPath);
      const chunk = fileBuffer.slice(start, end + 1);
      
      return new NextResponse(chunk, {
        status: 206,
        headers: {
          'Content-Type': contentType,
          'Content-Length': chunkSize.toString(),
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'public, max-age=31536000',
        },
      });
    }

    // No range - return full file with Accept-Ranges header
    const fileBuffer = await readFile(audioPath);
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': fileSize.toString(),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch (error) {
    console.error('Audio file not found:', audioPath);
    return NextResponse.json({ error: 'Audio file not found' }, { status: 404 });
  }
}
