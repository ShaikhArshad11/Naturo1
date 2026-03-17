import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/mongo';

type RegisterBody = {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RegisterBody;

    const name = body.name?.trim() ?? '';
    const email = body.email?.trim().toLowerCase() ?? '';
    const phone = body.phone?.trim() ?? '';
    const password = body.password ?? '';

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = await getDb();
    const existing = await db.collection('users').findOne({ email });
    if (existing) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const createdAt = new Date();

    const result = await db.collection('users').insertOne({
      name,
      email,
      phone,
      passwordHash,
      role: 'customer',
      createdAt,
    });

    return NextResponse.json(
      {
        user: {
          id: result.insertedId.toString(),
          name,
          email,
          phone,
          password: '',
          role: 'customer',
          createdAt: createdAt.toISOString(),
        },
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json({ error: 'Failed to register' }, { status: 500 });
  }
}
