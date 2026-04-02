import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongo';

const KEY = 'announcement';
const DEFAULT_ANNOUNCEMENT = { enabled: true, text: 'Free Shipping On Orders Above 1499' };

type AnnouncementDoc = {
  key: string;
  enabled: boolean;
  text: string;
  updatedAt: Date;
};

type PutBody = {
  enabled?: boolean;
  text?: string;
};

export async function GET() {
  try {
    const db = await getDb();
    const doc = (await db.collection('site_settings').findOne({ key: KEY })) as AnnouncementDoc | null;

    if (!doc) {
      return NextResponse.json(DEFAULT_ANNOUNCEMENT);
    }

    return NextResponse.json({ enabled: Boolean(doc.enabled), text: typeof doc.text === 'string' ? doc.text : '' });
  } catch {
    return NextResponse.json({ error: 'Failed to load setting' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = (await req.json()) as PutBody;

    const enabled = Boolean(body.enabled);
    const text = typeof body.text === 'string' ? body.text : '';

    const db = await getDb();
    await db.collection('site_settings').updateOne(
      { key: KEY },
      { $set: { key: KEY, enabled, text, updatedAt: new Date() } },
      { upsert: true },
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 });
  }
}
