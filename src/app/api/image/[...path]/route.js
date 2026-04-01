import { NextResponse } from 'next/server';

export async function GET(_req, { params }) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    return NextResponse.json(
      { error: 'Missing CLOUDINARY_CLOUD_NAME env var' },
      { status: 500 },
    );
  }

  const parts = Array.isArray(params?.path) ? params.path : [];
  const publicId = parts.join('/');
  if (!publicId) {
    return NextResponse.json({ error: 'Missing image path' }, { status: 400 });
  }

  const encodedPublicId = parts.map((p) => encodeURIComponent(p)).join('/');
  const cloudinaryUrl = `https://res.cloudinary.com/${cloudName}/image/upload/w_300,h_300,c_fill,f_auto,q_auto/${encodedPublicId}`;

  const upstream = await fetch(cloudinaryUrl);
  if (!upstream.ok) {
    return NextResponse.json(
      { error: 'Failed to fetch image' },
      { status: upstream.status },
    );
  }

  const contentType = upstream.headers.get('content-type') ?? 'image/jpeg';
  const arrayBuffer = await upstream.arrayBuffer();

  return new NextResponse(arrayBuffer, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
