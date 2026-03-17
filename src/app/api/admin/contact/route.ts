import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/mongo';

export async function GET() {
  try {
    const db = await getDb();
    const docs = await db
      .collection('contact_messages')
      .find({})
      .sort({ createdAt: -1 })
      .limit(500)
      .toArray();

    const messages = docs.map(d => ({
      id: (d._id as ObjectId).toString(),
      name: typeof (d as unknown as { name?: unknown }).name === 'string' ? (d as unknown as { name: string }).name : '',
      email: typeof (d as unknown as { email?: unknown }).email === 'string' ? (d as unknown as { email: string }).email : '',
      phone: typeof (d as unknown as { phone?: unknown }).phone === 'string' ? (d as unknown as { phone: string }).phone : '',
      message: typeof (d as unknown as { message?: unknown }).message === 'string' ? (d as unknown as { message: string }).message : '',
      read: Boolean((d as unknown as { read?: unknown }).read),
      createdAt:
        (d as unknown as { createdAt?: unknown }).createdAt instanceof Date
          ? ((d as unknown as { createdAt: Date }).createdAt).toISOString()
          : new Date().toISOString(),
    }));

    return NextResponse.json({ messages });
  } catch {
    return NextResponse.json({ error: 'Failed to load messages' }, { status: 500 });
  }
}
