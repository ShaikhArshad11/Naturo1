import { NextResponse } from 'next/server';
import crypto from 'crypto';

type Body = {
  folder?: unknown;
};

export async function POST(req: Request) {
  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      const missing = [
        !cloudName ? 'CLOUDINARY_CLOUD_NAME' : null,
        !apiKey ? 'CLOUDINARY_API_KEY' : null,
        !apiSecret ? 'CLOUDINARY_API_SECRET' : null,
      ].filter(Boolean);
      return NextResponse.json(
        { error: 'Cloudinary not configured', missing },
        { status: 500 }
      );
    }

    const body = (await req.json().catch(() => ({}))) as Body;
    const folder = typeof body.folder === 'string' && body.folder.trim() ? body.folder.trim() : 'products';

    const timestamp = Math.floor(Date.now() / 1000);

    const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
    const signature = crypto.createHash('sha1').update(paramsToSign + apiSecret).digest('hex');

    return NextResponse.json({ cloudName, apiKey, timestamp, signature, folder });
  } catch {
    return NextResponse.json({ error: 'Failed to create signature' }, { status: 500 });
  }
}
