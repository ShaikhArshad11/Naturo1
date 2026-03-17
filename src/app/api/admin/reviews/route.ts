import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/mongo';

export async function GET() {
  try {
    const db = await getDb();
    const docs = await db.collection('reviews').find({}).sort({ createdAt: -1 }).limit(1000).toArray();

    const reviews = docs.map((d) => {
      const createdAtVal = (d as unknown as { createdAt?: unknown }).createdAt;
      return {
        id: (d._id as ObjectId).toString(),
        name: typeof (d as unknown as { name?: unknown }).name === 'string' ? (d as unknown as { name: string }).name : '',
        email: typeof (d as unknown as { email?: unknown }).email === 'string' ? (d as unknown as { email: string }).email : '',
        text: typeof (d as unknown as { text?: unknown }).text === 'string' ? (d as unknown as { text: string }).text : '',
        rating: typeof (d as unknown as { rating?: unknown }).rating === 'number' ? (d as unknown as { rating: number }).rating : 5,
        approved: Boolean((d as unknown as { approved?: unknown }).approved),
        createdAt: createdAtVal instanceof Date ? createdAtVal.toISOString() : new Date().toISOString(),
      };
    });

    return NextResponse.json({ reviews });
  } catch {
    return NextResponse.json({ error: 'Failed to load reviews' }, { status: 500 });
  }
}
