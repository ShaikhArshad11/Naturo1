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

export async function GET() {
  try {
    const db = await getDb();
    const doc = (await db.collection('site_settings').findOne({ key: KEY })) as AnnouncementDoc | null;

    if (!doc) {
      return NextResponse.json(DEFAULT_ANNOUNCEMENT);
    }

    return NextResponse.json({ enabled: Boolean(doc.enabled), text: typeof doc.text === 'string' ? doc.text : '' });
  } catch {
    return NextResponse.json(DEFAULT_ANNOUNCEMENT);
  }
}
