import { NextRequest, NextResponse } from 'next/server';
import { readFile, stat } from 'fs/promises';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; path: string[] }> }
) {
  const { projectId, path: pathSegments } = await params;
  const fileName = pathSegments.join('/');
  
  // Build the full path to the image file
  const imagePath = path.resolve(
    process.cwd(),
    '../../projects',
    projectId,
    'assets/images',
    fileName
  );

  try {
    const fileStat = await stat(imagePath);
    const fileSize = fileStat.size;
    
    // Determine content type
    const ext = path.extname(fileName).toLowerCase();
    const contentType = ext === '.png' ? 'image/png' : 
                       ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 
                       ext === '.gif' ? 'image/gif' :
                       ext === '.webp' ? 'image/webp' :
                       ext === '.svg' ? 'image/svg+xml' :
                       'application/octet-stream';

    const fileBuffer = await readFile(imagePath);
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': fileSize.toString(),
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch (error) {
    console.error('Image file not found:', imagePath);
    return NextResponse.json({ error: 'Image file not found' }, { status: 404 });
  }
}
