import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongo';

type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
type PaymentMethod = 'upi' | 'card' | 'cod' | 'razorpay';

type CreateOrderBody = {
  id?: string;
  userId?: string;
  items?: unknown;
  total?: unknown;
  status?: OrderStatus;
  shippingAddress?: unknown;
  billingAddress?: unknown;
  paymentMethod?: PaymentMethod;
  trackingId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CreateOrderBody;

    const id = typeof body.id === 'string' ? body.id : '';
    const userId = typeof body.userId === 'string' ? body.userId : '';
    const trackingId = typeof body.trackingId === 'string' ? body.trackingId : '';

    if (!id || !userId || !trackingId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const total = typeof body.total === 'number' ? body.total : NaN;
    if (!Number.isFinite(total) || total < 0) {
      return NextResponse.json({ error: 'Invalid total' }, { status: 400 });
    }

    const db = await getDb();

    const existing = await db.collection('orders').findOne({ orderId: id });
    if (existing) {
      return NextResponse.json({ error: 'Order already exists' }, { status: 409 });
    }

    const createdAt = new Date();
    const updatedAt = new Date();

    const doc = {
      orderId: id,
      userId,
      items: body.items ?? [],
      total,
      status: body.status ?? 'pending',
      shippingAddress: body.shippingAddress ?? null,
      billingAddress: body.billingAddress ?? null,
      paymentMethod: body.paymentMethod ?? 'cod',
      trackingId,
      razorpayOrderId: body.razorpayOrderId,
      razorpayPaymentId: body.razorpayPaymentId,
      createdAt,
      updatedAt,
    };

    await db.collection('orders').insertOne(doc);

    return NextResponse.json({
      order: {
        id: doc.orderId,
        userId: doc.userId,
        items: doc.items,
        total: doc.total,
        status: doc.status,
        shippingAddress: doc.shippingAddress,
        billingAddress: doc.billingAddress,
        paymentMethod: doc.paymentMethod,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
        trackingId: doc.trackingId,
        razorpayOrderId: doc.razorpayOrderId,
        razorpayPaymentId: doc.razorpayPaymentId,
      },
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');

    const db = await getDb();

    const filter = userId ? { userId } : {};
    const docs = await db
      .collection('orders')
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(1000)
      .toArray();

    const orders = docs.map(d => {
      const createdAtVal = (d as unknown as { createdAt?: unknown }).createdAt;
      const updatedAtVal = (d as unknown as { updatedAt?: unknown }).updatedAt;
      return {
        id: typeof (d as unknown as { orderId?: unknown }).orderId === 'string' ? (d as unknown as { orderId: string }).orderId : '',
        userId: typeof (d as unknown as { userId?: unknown }).userId === 'string' ? (d as unknown as { userId: string }).userId : '',
        items: (d as unknown as { items?: unknown }).items ?? [],
        total: typeof (d as unknown as { total?: unknown }).total === 'number' ? (d as unknown as { total: number }).total : 0,
        status: (d as unknown as { status?: unknown }).status as OrderStatus,
        shippingAddress: (d as unknown as { shippingAddress?: unknown }).shippingAddress ?? null,
        billingAddress: (d as unknown as { billingAddress?: unknown }).billingAddress ?? null,
        paymentMethod: (d as unknown as { paymentMethod?: unknown }).paymentMethod as PaymentMethod,
        createdAt: createdAtVal instanceof Date ? createdAtVal.toISOString() : new Date().toISOString(),
        updatedAt: updatedAtVal instanceof Date ? updatedAtVal.toISOString() : new Date().toISOString(),
        trackingId: typeof (d as unknown as { trackingId?: unknown }).trackingId === 'string' ? (d as unknown as { trackingId: string }).trackingId : '',
        razorpayOrderId: typeof (d as unknown as { razorpayOrderId?: unknown }).razorpayOrderId === 'string' ? (d as unknown as { razorpayOrderId: string }).razorpayOrderId : undefined,
        razorpayPaymentId: typeof (d as unknown as { razorpayPaymentId?: unknown }).razorpayPaymentId === 'string' ? (d as unknown as { razorpayPaymentId: string }).razorpayPaymentId : undefined,
      };
    });

    return NextResponse.json({ orders });
  } catch {
    return NextResponse.json({ error: 'Failed to load orders' }, { status: 500 });
  }
}
