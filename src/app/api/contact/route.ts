import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongo';

type CreateContactBody = {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CreateContactBody;

    const name = body.name?.trim() ?? '';
    const email = body.email?.trim() ?? '';
    const phone = body.phone?.trim() ?? '';
    const message = body.message?.trim() ?? '';

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const doc = {
      name,
      email,
      phone,
      message,
      read: false,
      createdAt: new Date(),
    };

    const db = await getDb();
    const result = await db.collection('contact_messages').insertOne(doc);

    return NextResponse.json(
      {
        id: result.insertedId.toString(),
        ...doc,
        createdAt: doc.createdAt.toISOString(),
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json({ error: 'Failed to save message' }, { status: 500 });
  }
}
