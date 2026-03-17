import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

type Body = {
  amount?: number;
  receipt?: string;
};

export async function POST(req: Request) {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_SECRET_KEY;

    if (!keyId || !keySecret) {
      return NextResponse.json({ error: 'Razorpay keys not configured' }, { status: 500 });
    }

    const body = (await req.json()) as Body;
    const amount = body.amount;
    const receipt = body.receipt;

    if (!amount || typeof amount !== 'number' || amount <= 0 || !receipt) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt,
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to create Razorpay order' }, { status: 500 });
  }
}
