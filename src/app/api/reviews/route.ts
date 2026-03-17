import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/mongo';

type CreateReviewBody = {
  name?: unknown;
  email?: unknown;
  text?: unknown;
  rating?: unknown;
};

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const approvedParam = url.searchParams.get('approved');
    const approvedOnly = approvedParam === null ? true : approvedParam === 'true';

    const db = await getDb();
    const docs = await db
      .collection('reviews')
      .find(approvedOnly ? { approved: true } : {})
      .sort({ createdAt: -1 })
      .limit(200)
      .toArray();

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

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CreateReviewBody;

    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const text = typeof body.text === 'string' ? body.text.trim() : '';
    const rating = typeof body.rating === 'number' ? body.rating : 5;

    if (!name || !text) {
      return NextResponse.json({ error: 'Name and review text are required' }, { status: 400 });
    }

    const safeRating = Number.isFinite(rating) ? Math.max(1, Math.min(5, Math.round(rating))) : 5;

    const createdAt = new Date();

    const db = await getDb();
    const doc = {
      name,
      email,
      text,
      rating: safeRating,
      approved: false,
      createdAt,
      updatedAt: createdAt,
    };

    const res = await db.collection('reviews').insertOne(doc);

    return NextResponse.json(
      {
        review: {
          id: (res.insertedId as ObjectId).toString(),
          name: doc.name,
          email: doc.email,
          text: doc.text,
          rating: doc.rating,
          approved: doc.approved,
          createdAt: doc.createdAt.toISOString(),
        },
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}
