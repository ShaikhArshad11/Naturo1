import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongo';

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await ctx.params;
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const db = await getDb();
    const doc = await db.collection('orders').findOne({ orderId: id });

    if (!doc) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const createdAtVal = (doc as unknown as { createdAt?: unknown }).createdAt;
    const updatedAtVal = (doc as unknown as { updatedAt?: unknown }).updatedAt;

    return NextResponse.json({
      order: {
        id: typeof (doc as unknown as { orderId?: unknown }).orderId === 'string' ? (doc as unknown as { orderId: string }).orderId : '',
        userId: typeof (doc as unknown as { userId?: unknown }).userId === 'string' ? (doc as unknown as { userId: string }).userId : '',
        items: (doc as unknown as { items?: unknown }).items ?? [],
        total: typeof (doc as unknown as { total?: unknown }).total === 'number' ? (doc as unknown as { total: number }).total : 0,
        status: (doc as unknown as { status?: unknown }).status,
        shippingAddress: (doc as unknown as { shippingAddress?: unknown }).shippingAddress ?? null,
        billingAddress: (doc as unknown as { billingAddress?: unknown }).billingAddress ?? null,
        paymentMethod: (doc as unknown as { paymentMethod?: unknown }).paymentMethod,
        createdAt: createdAtVal instanceof Date ? createdAtVal.toISOString() : new Date().toISOString(),
        updatedAt: updatedAtVal instanceof Date ? updatedAtVal.toISOString() : new Date().toISOString(),
        trackingId: typeof (doc as unknown as { trackingId?: unknown }).trackingId === 'string' ? (doc as unknown as { trackingId: string }).trackingId : '',
        razorpayOrderId: typeof (doc as unknown as { razorpayOrderId?: unknown }).razorpayOrderId === 'string' ? (doc as unknown as { razorpayOrderId: string }).razorpayOrderId : undefined,
        razorpayPaymentId: typeof (doc as unknown as { razorpayPaymentId?: unknown }).razorpayPaymentId === 'string' ? (doc as unknown as { razorpayPaymentId: string }).razorpayPaymentId : undefined,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to load order' }, { status: 500 });
  }
}
