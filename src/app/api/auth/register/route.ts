import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/mongo';

async function sendWelcomeEmail(params: { to: string; name: string }) {
  const host = process.env.EMAIL_HOST;
  const portRaw = process.env.EMAIL_PORT;
  const user = process.env.EMAIL_HOST_USER;
  const pass = process.env.EMAIL_HOST_PASSWORD;
  const useSsl = (process.env.EMAIL_USE_SSL ?? '').toLowerCase() === 'true';
  const useTls = (process.env.EMAIL_USE_TLS ?? '').toLowerCase() === 'true';

  const port = portRaw ? Number(portRaw) : undefined;
  if (!host || !port || !user || !pass) return;

  const nodemailer = (await import('nodemailer')).default;
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: useSsl,
    auth: { user, pass },
    tls: useTls ? { rejectUnauthorized: false } : undefined,
  });

  await transporter.sendMail({
    from: `Suraj Naturo <${user}>`,
    to: params.to,
    subject: 'Welcome to Suraj Naturo Cashews & Dry Fruits',
    text: `Hi ${params.name || 'there'},\n\nWelcome to Suraj Naturo Cashews & Dry Fruits!\n\nThank you for registering with us.`,
  });
}

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

    void sendWelcomeEmail({ to: email, name }).catch(() => undefined);

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
