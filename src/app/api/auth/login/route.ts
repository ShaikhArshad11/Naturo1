import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/mongo';

type LoginBody = {
  email?: string;
  password?: string;
};

async function ensureDefaultAdmin() {
  const db = await getDb();
  const email = 'admin@naturo.com';
  const existing = await db.collection('users').findOne({ email });
  if (existing) return;

  const passwordHash = await bcrypt.hash('admin123', 10);
  await db.collection('users').insertOne({
    name: 'Admin',
    email,
    phone: '9607555963',
    passwordHash,
    role: 'admin',
    createdAt: new Date(),
  });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as LoginBody;

    const email = body.email?.trim().toLowerCase() ?? '';
    const password = body.password ?? '';

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    }

    await ensureDefaultAdmin();

    const db = await getDb();
    const userDoc = await db.collection('users').findOne({ email });

    if (!userDoc) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const passwordHash = (userDoc as unknown as { passwordHash?: unknown }).passwordHash;
    if (typeof passwordHash !== 'string') {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const ok = await bcrypt.compare(password, passwordHash);
    if (!ok) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const createdAtVal = (userDoc as unknown as { createdAt?: unknown }).createdAt;
    const createdAt = createdAtVal instanceof Date ? createdAtVal.toISOString() : new Date().toISOString();

    return NextResponse.json({
      user: {
        id: (userDoc as unknown as { _id: { toString: () => string } })._id.toString(),
        name: typeof (userDoc as unknown as { name?: unknown }).name === 'string' ? (userDoc as unknown as { name: string }).name : '',
        email,
        phone: typeof (userDoc as unknown as { phone?: unknown }).phone === 'string' ? (userDoc as unknown as { phone: string }).phone : '',
        password: '',
        role: (userDoc as unknown as { role?: unknown }).role === 'admin' ? 'admin' : 'customer',
        createdAt,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to login' }, { status: 500 });
  }
}
