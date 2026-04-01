import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongo';
import { ObjectId } from 'mongodb';

async function sendInvoiceEmail(params: {
  to: string;
  name: string;
  orderId: string;
  trackingId: string;
  createdAtIso: string;
  items: unknown;
  total: number;
  shippingAddress: unknown;
}) {
  const host = process.env.EMAIL_HOST;
  const portRaw = process.env.EMAIL_PORT;
  const user = process.env.EMAIL_HOST_USER;
  const pass = process.env.EMAIL_HOST_PASSWORD;
  const useSsl = (process.env.EMAIL_USE_SSL ?? '').toLowerCase() === 'true';
  const useTls = (process.env.EMAIL_USE_TLS ?? '').toLowerCase() === 'true';

  const port = portRaw ? Number(portRaw) : undefined;
  if (!host || !port || !user || !pass) return;

  const firstName = params.name?.split(' ')[0] || 'there';
  const safeItems = Array.isArray(params.items) ? params.items : [];

  const lines = safeItems
    .map((i: unknown) => {
      const product = (i as { product?: unknown }).product as
        | { name?: unknown; price?: unknown }
        | undefined;
      const qty = (i as { quantity?: unknown }).quantity;
      const name = typeof product?.name === 'string' ? product.name : 'Item';
      const price = typeof product?.price === 'number' ? product.price : 0;
      const quantity = typeof qty === 'number' ? qty : 0;
      const subtotal = price * quantity;
      return { name, price, quantity, subtotal };
    })
    .filter(l => l.quantity > 0);

  const shipping = params.shippingAddress as
    | { street?: unknown; city?: unknown; state?: unknown; pincode?: unknown; country?: unknown }
    | undefined;

  const shippingStr = shipping
    ? [
        typeof shipping.street === 'string' ? shipping.street : '',
        typeof shipping.city === 'string' ? shipping.city : '',
        typeof shipping.state === 'string' ? shipping.state : '',
        typeof shipping.pincode === 'string' ? shipping.pincode : '',
        typeof shipping.country === 'string' ? shipping.country : '',
      ]
        .filter(Boolean)
        .join(', ')
    : '';

  const rowsHtml = lines
    .map(
      l =>
        `<tr>
          <td style="padding:10px 8px;border-bottom:1px solid #eee;">${l.name}</td>
          <td style="padding:10px 8px;border-bottom:1px solid #eee;text-align:right;">${l.quantity}</td>
          <td style="padding:10px 8px;border-bottom:1px solid #eee;text-align:right;">₹${l.price}</td>
          <td style="padding:10px 8px;border-bottom:1px solid #eee;text-align:right;">₹${l.subtotal}</td>
        </tr>`,
    )
    .join('');

  const htmlBody = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invoice</title>
</head>
<body style="margin:0;padding:0;background:#f6f6f6;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px;">
    <tr>
      <td align="center">
        <table width="640" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 4px 18px rgba(0,0,0,0.06);">
          <tr>
            <td style="background:#2D6A4F;padding:18px 22px;">
              <div style="color:#fff;font-size:16px;font-weight:700;">Suraj Naturo</div>
              <div style="color:rgba(255,255,255,0.85);font-size:12px;">Cashews &amp; Dry Fruits</div>
            </td>
          </tr>
          <tr>
            <td style="padding:22px;">
              <div style="font-size:14px;color:#333;">Hi ${firstName},</div>
              <div style="margin-top:10px;font-size:14px;color:#333;">Thanks for your purchase. Here is your invoice:</div>

              <div style="margin-top:14px;font-size:13px;color:#555;">
                <div><strong>Order ID:</strong> ${params.orderId}</div>
                <div><strong>Tracking ID:</strong> ${params.trackingId}</div>
                <div><strong>Date:</strong> ${new Date(params.createdAtIso).toLocaleString()}</div>
                ${shippingStr ? `<div><strong>Shipping:</strong> ${shippingStr}</div>` : ''}
              </div>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:18px;border-collapse:collapse;font-size:13px;">
                <thead>
                  <tr>
                    <th align="left" style="padding:10px 8px;border-bottom:2px solid #eee;">Item</th>
                    <th align="right" style="padding:10px 8px;border-bottom:2px solid #eee;">Qty</th>
                    <th align="right" style="padding:10px 8px;border-bottom:2px solid #eee;">Price</th>
                    <th align="right" style="padding:10px 8px;border-bottom:2px solid #eee;">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${rowsHtml}
                </tbody>
              </table>

              <div style="margin-top:14px;text-align:right;font-size:14px;color:#111;"><strong>Total: ₹${params.total}</strong></div>

              <div style="margin-top:18px;font-size:12px;color:#777;">If you have any questions, reply to this email.</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  const textBody = `Hi ${firstName},\n\nThank you for your purchase!\nOrder ID: ${params.orderId}\nTracking ID: ${params.trackingId}\nTotal: ₹${params.total}\n\nSuraj Naturo Cashews & Dry Fruits`;

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
    subject: `Invoice for Order ${params.orderId}`,
    text: textBody,
    html: htmlBody,
  });
}

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

    if (ObjectId.isValid(userId)) {
      void (async () => {
        const userDoc = await db.collection('users').findOne({ _id: new ObjectId(userId) });
        const emailVal = (userDoc as unknown as { email?: unknown } | null)?.email;
        const nameVal = (userDoc as unknown as { name?: unknown } | null)?.name;
        if (typeof emailVal !== 'string' || !emailVal.trim()) return;

        await sendInvoiceEmail({
          to: emailVal.trim(),
          name: typeof nameVal === 'string' ? nameVal : '',
          orderId: doc.orderId,
          trackingId: doc.trackingId,
          createdAtIso: doc.createdAt.toISOString(),
          items: doc.items,
          total: doc.total,
          shippingAddress: doc.shippingAddress,
        });
      })().catch(() => undefined);
    }

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
