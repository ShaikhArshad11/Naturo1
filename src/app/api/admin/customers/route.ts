import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/mongo';

export async function GET() {
  try {
    const db = await getDb();
    const docs = await db
      .collection('users')
      .find({ role: 'customer' })
      .sort({ createdAt: -1 })
      .limit(2000)
      .toArray();

    const customers = docs.map(d => {
      const createdAtVal = (d as unknown as { createdAt?: unknown }).createdAt;
      const createdAt = createdAtVal instanceof Date ? createdAtVal.toISOString() : new Date().toISOString();

      return {
        id: (d._id as ObjectId).toString(),
        name: typeof (d as unknown as { name?: unknown }).name === 'string' ? (d as unknown as { name: string }).name : '',
        email: typeof (d as unknown as { email?: unknown }).email === 'string' ? (d as unknown as { email: string }).email : '',
        phone: typeof (d as unknown as { phone?: unknown }).phone === 'string' ? (d as unknown as { phone: string }).phone : '',
        password: '',
        role: 'customer' as const,
        createdAt,
      };
    });

    return NextResponse.json({ customers });
  } catch {
    return NextResponse.json({ error: 'Failed to load customers' }, { status: 500 });
  }
}
