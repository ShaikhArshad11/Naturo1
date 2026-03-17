import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongo';

type CreateProductBody = {
  id?: string;
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
  createdAt?: unknown;
};

export async function GET() {
  try {
    const db = await getDb();
    const docs = await db
      .collection('products')
      .find({})
      .sort({ createdAt: -1 })
      .limit(2000)
      .toArray();

    const products = docs.map((d) => {
      const createdAtVal = (d as unknown as { createdAt?: unknown }).createdAt;
      return {
        id: typeof (d as unknown as { productId?: unknown }).productId === 'string' ? (d as unknown as { productId: string }).productId : '',
        name: typeof (d as unknown as { name?: unknown }).name === 'string' ? (d as unknown as { name: string }).name : '',
        description: typeof (d as unknown as { description?: unknown }).description === 'string'
          ? (d as unknown as { description: string }).description
          : '',
        price: typeof (d as unknown as { price?: unknown }).price === 'number' ? (d as unknown as { price: number }).price : 0,
        originalPrice: typeof (d as unknown as { originalPrice?: unknown }).originalPrice === 'number'
          ? (d as unknown as { originalPrice: number }).originalPrice
          : undefined,
        category: typeof (d as unknown as { category?: unknown }).category === 'string' ? (d as unknown as { category: string }).category : '',
        image: typeof (d as unknown as { image?: unknown }).image === 'string' ? (d as unknown as { image: string }).image : '',
        image2: typeof (d as unknown as { image2?: unknown }).image2 === 'string' ? (d as unknown as { image2: string }).image2 : undefined,
        benefits: Array.isArray((d as unknown as { benefits?: unknown }).benefits) ? ((d as unknown as { benefits: unknown[] }).benefits as string[]) : [],
        ingredients: Array.isArray((d as unknown as { ingredients?: unknown }).ingredients)
          ? ((d as unknown as { ingredients: unknown[] }).ingredients as string[])
          : [],
        usage: typeof (d as unknown as { usage?: unknown }).usage === 'string' ? (d as unknown as { usage: string }).usage : '',
        rating: typeof (d as unknown as { rating?: unknown }).rating === 'number' ? (d as unknown as { rating: number }).rating : 4.5,
        reviews: typeof (d as unknown as { reviews?: unknown }).reviews === 'number' ? (d as unknown as { reviews: number }).reviews : 0,
        inStock: typeof (d as unknown as { inStock?: unknown }).inStock === 'boolean' ? (d as unknown as { inStock: boolean }).inStock : true,
        featured: typeof (d as unknown as { featured?: unknown }).featured === 'boolean' ? (d as unknown as { featured: boolean }).featured : false,
        bestSeller: typeof (d as unknown as { bestSeller?: unknown }).bestSeller === 'boolean'
          ? (d as unknown as { bestSeller: boolean }).bestSeller
          : false,
        createdAt: createdAtVal instanceof Date ? createdAtVal.toISOString() : new Date().toISOString(),
      };
    });

    return NextResponse.json({ products });
  } catch {
    return NextResponse.json({ error: 'Failed to load products' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CreateProductBody;

    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const category = typeof body.category === 'string' ? body.category.trim() : '';
    const description = typeof body.description === 'string' ? body.description.trim() : '';
    const usage = typeof body.usage === 'string' ? body.usage.trim() : '';

    const price = typeof body.price === 'number' ? body.price : NaN;
    const originalPrice = typeof body.originalPrice === 'number' ? body.originalPrice : undefined;

    const image = typeof body.image === 'string' ? body.image.trim() : '';
    const image2 = typeof body.image2 === 'string' ? body.image2.trim() : undefined;

    const benefits = Array.isArray(body.benefits) ? body.benefits.filter((b) => typeof b === 'string' && b.trim()).map((b) => (b as string).trim()) : [];
    const ingredients = Array.isArray(body.ingredients)
      ? body.ingredients.filter((i) => typeof i === 'string' && i.trim()).map((i) => (i as string).trim())
      : [];

    const inStock = typeof body.inStock === 'boolean' ? body.inStock : true;
    const featured = typeof body.featured === 'boolean' ? body.featured : false;
    const bestSeller = typeof body.bestSeller === 'boolean' ? body.bestSeller : false;

    const rating = typeof body.rating === 'number' ? body.rating : 4.5;
    const reviews = typeof body.reviews === 'number' ? body.reviews : 0;

    if (!name || !category) {
      return NextResponse.json({ error: 'Name and category are required' }, { status: 400 });
    }
    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json({ error: 'Valid price is required' }, { status: 400 });
    }
    if (!image) {
      return NextResponse.json({ error: 'Primary image is required' }, { status: 400 });
    }

    const productId = typeof body.id === 'string' && body.id ? body.id : crypto.randomUUID();

    const db = await getDb();

    const existing = await db.collection('products').findOne({ productId });
    if (existing) {
      return NextResponse.json({ error: 'Product already exists' }, { status: 409 });
    }

    const createdAt = new Date();

    const doc = {
      productId,
      name,
      description,
      price,
      originalPrice,
      category,
      image,
      image2,
      benefits,
      ingredients,
      usage,
      rating,
      reviews,
      inStock,
      featured,
      bestSeller,
      createdAt,
      updatedAt: createdAt,
    };

    await db.collection('products').insertOne(doc);

    return NextResponse.json(
      {
        product: {
          id: doc.productId,
          name: doc.name,
          description: doc.description,
          price: doc.price,
          originalPrice: doc.originalPrice,
          category: doc.category,
          image: doc.image,
          image2: doc.image2,
          benefits: doc.benefits,
          ingredients: doc.ingredients,
          usage: doc.usage,
          rating: doc.rating,
          reviews: doc.reviews,
          inStock: doc.inStock,
          featured: doc.featured,
          bestSeller: doc.bestSeller,
          createdAt: doc.createdAt.toISOString(),
        },
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
