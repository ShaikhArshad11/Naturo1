import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/mongo';

type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
type PaymentMethod = 'upi' | 'card' | 'cod' | 'razorpay';

export async function GET() {
  try {
    const db = await getDb();
    const docs = await db
      .collection('orders')
      .find({})
      .sort({ createdAt: -1 })
      .limit(2000)
      .toArray();

    const userIds = docs
      .map(d => (typeof (d as unknown as { userId?: unknown }).userId === 'string' ? (d as unknown as { userId: string }).userId : ''))
      .filter(Boolean);

    const objectIds = userIds
      .filter(id => ObjectId.isValid(id))
      .map(id => new ObjectId(id));

    const users = objectIds.length
      ? await db.collection('users').find({ _id: { $in: objectIds } }).toArray()
      : [];

    const userMap = new Map(
      users.map(u => [
        (u._id as ObjectId).toString(),
        {
          id: (u._id as ObjectId).toString(),
          name: typeof (u as unknown as { name?: unknown }).name === 'string' ? (u as unknown as { name: string }).name : '',
          email: typeof (u as unknown as { email?: unknown }).email === 'string' ? (u as unknown as { email: string }).email : '',
          phone: typeof (u as unknown as { phone?: unknown }).phone === 'string' ? (u as unknown as { phone: string }).phone : '',
        },
      ]),
    );

    const orders = docs.map(d => {
      const createdAtVal = (d as unknown as { createdAt?: unknown }).createdAt;
      const updatedAtVal = (d as unknown as { updatedAt?: unknown }).updatedAt;
      const userId = typeof (d as unknown as { userId?: unknown }).userId === 'string' ? (d as unknown as { userId: string }).userId : '';

      return {
        id: typeof (d as unknown as { orderId?: unknown }).orderId === 'string' ? (d as unknown as { orderId: string }).orderId : '',
        userId,
        customer: userMap.get(userId) ?? null,
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
