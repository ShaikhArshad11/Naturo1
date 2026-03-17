import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongo';

type UpdateProductBody = {
  name?: unknown;
  description?: unknown;
  price?: unknown;
  originalPrice?: unknown;
  category?: unknown;
  image?: unknown;
  image2?: unknown;
  benefits?: unknown;
  ingredients?: unknown;
  usage?: unknown;
  rating?: unknown;
  reviews?: unknown;
  inStock?: unknown;
  featured?: unknown;
  bestSeller?: unknown;
};

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Params) {
  try {
    const { id } = await ctx.params;
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const db = await getDb();
    const doc = await db.collection('products').findOne({ $or: [{ productId: id }, { id }] });
    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const createdAtVal = (doc as unknown as { createdAt?: unknown }).createdAt;

    return NextResponse.json({
      product: {
        id: typeof (doc as unknown as { productId?: unknown }).productId === 'string' ? (doc as unknown as { productId: string }).productId : id,
        name: typeof (doc as unknown as { name?: unknown }).name === 'string' ? (doc as unknown as { name: string }).name : '',
        description: typeof (doc as unknown as { description?: unknown }).description === 'string'
          ? (doc as unknown as { description: string }).description
          : '',
        price: typeof (doc as unknown as { price?: unknown }).price === 'number' ? (doc as unknown as { price: number }).price : 0,
        originalPrice: typeof (doc as unknown as { originalPrice?: unknown }).originalPrice === 'number'
          ? (doc as unknown as { originalPrice: number }).originalPrice
          : undefined,
        category: typeof (doc as unknown as { category?: unknown }).category === 'string' ? (doc as unknown as { category: string }).category : '',
        image: typeof (doc as unknown as { image?: unknown }).image === 'string' ? (doc as unknown as { image: string }).image : '',
        image2: typeof (doc as unknown as { image2?: unknown }).image2 === 'string' ? (doc as unknown as { image2: string }).image2 : undefined,
        benefits: Array.isArray((doc as unknown as { benefits?: unknown }).benefits)
          ? ((doc as unknown as { benefits: unknown[] }).benefits as string[])
          : [],
        ingredients: Array.isArray((doc as unknown as { ingredients?: unknown }).ingredients)
          ? ((doc as unknown as { ingredients: unknown[] }).ingredients as string[])
          : [],
        usage: typeof (doc as unknown as { usage?: unknown }).usage === 'string' ? (doc as unknown as { usage: string }).usage : '',
        rating: typeof (doc as unknown as { rating?: unknown }).rating === 'number' ? (doc as unknown as { rating: number }).rating : 4.5,
        reviews: typeof (doc as unknown as { reviews?: unknown }).reviews === 'number' ? (doc as unknown as { reviews: number }).reviews : 0,
        inStock: typeof (doc as unknown as { inStock?: unknown }).inStock === 'boolean' ? (doc as unknown as { inStock: boolean }).inStock : true,
        featured: typeof (doc as unknown as { featured?: unknown }).featured === 'boolean' ? (doc as unknown as { featured: boolean }).featured : false,
        bestSeller: typeof (doc as unknown as { bestSeller?: unknown }).bestSeller === 'boolean'
          ? (doc as unknown as { bestSeller: boolean }).bestSeller
          : false,
        createdAt: createdAtVal instanceof Date ? createdAtVal.toISOString() : new Date().toISOString(),
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to load product' }, { status: 500 });
  }
}

export async function PATCH(req: Request, ctx: Params) {
  try {
    const { id } = await ctx.params;
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const body = (await req.json()) as UpdateProductBody;

    const update: Record<string, unknown> = { updatedAt: new Date() };

    if (typeof body.name === 'string') update.name = body.name.trim();
    if (typeof body.description === 'string') update.description = body.description.trim();
    if (typeof body.category === 'string') update.category = body.category.trim();
    if (typeof body.usage === 'string') update.usage = body.usage.trim();

    if (typeof body.price === 'number' && Number.isFinite(body.price) && body.price > 0) update.price = body.price;
    if (typeof body.originalPrice === 'number' && Number.isFinite(body.originalPrice) && body.originalPrice > 0) update.originalPrice = body.originalPrice;

    if (typeof body.image === 'string') update.image = body.image.trim();
    if (typeof body.image2 === 'string') update.image2 = body.image2.trim();

    if (Array.isArray(body.benefits)) {
      update.benefits = body.benefits.filter((b) => typeof b === 'string' && b.trim()).map((b) => (b as string).trim());
    }
    if (Array.isArray(body.ingredients)) {
      update.ingredients = body.ingredients.filter((i) => typeof i === 'string' && i.trim()).map((i) => (i as string).trim());
    }

    if (typeof body.inStock === 'boolean') update.inStock = body.inStock;
    if (typeof body.featured === 'boolean') update.featured = body.featured;
    if (typeof body.bestSeller === 'boolean') update.bestSeller = body.bestSeller;
    if (typeof body.rating === 'number' && Number.isFinite(body.rating) && body.rating > 0) update.rating = body.rating;
    if (typeof body.reviews === 'number' && Number.isFinite(body.reviews) && body.reviews >= 0) update.reviews = body.reviews;

    const db = await getDb();
    const res = await db.collection('products').findOneAndUpdate(
      { $or: [{ productId: id }, { id }] },
      { $set: update },
      { returnDocument: 'after' },
    );

    const doc = res?.value;
    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const createdAtVal = (doc as unknown as { createdAt?: unknown }).createdAt;

    return NextResponse.json({
      product: {
        id: typeof (doc as unknown as { productId?: unknown }).productId === 'string' ? (doc as unknown as { productId: string }).productId : id,
        name: typeof (doc as unknown as { name?: unknown }).name === 'string' ? (doc as unknown as { name: string }).name : '',
        description: typeof (doc as unknown as { description?: unknown }).description === 'string'
          ? (doc as unknown as { description: string }).description
          : '',
        price: typeof (doc as unknown as { price?: unknown }).price === 'number' ? (doc as unknown as { price: number }).price : 0,
        originalPrice: typeof (doc as unknown as { originalPrice?: unknown }).originalPrice === 'number'
          ? (doc as unknown as { originalPrice: number }).originalPrice
          : undefined,
        category: typeof (doc as unknown as { category?: unknown }).category === 'string' ? (doc as unknown as { category: string }).category : '',
        image: typeof (doc as unknown as { image?: unknown }).image === 'string' ? (doc as unknown as { image: string }).image : '',
        image2: typeof (doc as unknown as { image2?: unknown }).image2 === 'string' ? (doc as unknown as { image2: string }).image2 : undefined,
        benefits: Array.isArray((doc as unknown as { benefits?: unknown }).benefits)
          ? ((doc as unknown as { benefits: unknown[] }).benefits as string[])
          : [],
        ingredients: Array.isArray((doc as unknown as { ingredients?: unknown }).ingredients)
          ? ((doc as unknown as { ingredients: unknown[] }).ingredients as string[])
          : [],
        usage: typeof (doc as unknown as { usage?: unknown }).usage === 'string' ? (doc as unknown as { usage: string }).usage : '',
        rating: typeof (doc as unknown as { rating?: unknown }).rating === 'number' ? (doc as unknown as { rating: number }).rating : 4.5,
        reviews: typeof (doc as unknown as { reviews?: unknown }).reviews === 'number' ? (doc as unknown as { reviews: number }).reviews : 0,
        inStock: typeof (doc as unknown as { inStock?: unknown }).inStock === 'boolean' ? (doc as unknown as { inStock: boolean }).inStock : true,
        featured: typeof (doc as unknown as { featured?: unknown }).featured === 'boolean' ? (doc as unknown as { featured: boolean }).featured : false,
        bestSeller: typeof (doc as unknown as { bestSeller?: unknown }).bestSeller === 'boolean'
          ? (doc as unknown as { bestSeller: boolean }).bestSeller
          : false,
        createdAt: createdAtVal instanceof Date ? createdAtVal.toISOString() : new Date().toISOString(),
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, ctx: Params) {
  try {
    const { id } = await ctx.params;
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const db = await getDb();
    const res = await db.collection('products').deleteOne({ $or: [{ productId: id }, { id }] });
    if (!res.deletedCount) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
