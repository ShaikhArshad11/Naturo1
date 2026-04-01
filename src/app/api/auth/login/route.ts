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

  const firstName = params.name?.split(' ')[0] || 'there';

  const htmlBody = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Suraj Naturo</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f0e8;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f0e8;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header Banner -->
          <tr>
            <td style="background-color:#3d2b1f;padding:36px 40px;text-align:center;">
              <p style="margin:0 0 6px;font-size:11px;letter-spacing:3px;color:#c8a96e;text-transform:uppercase;">Est. with Love</p>
              <h1 style="margin:0;font-size:26px;font-weight:700;color:#ffffff;letter-spacing:1px;">Suraj Naturo</h1>
              <p style="margin:6px 0 0;font-size:13px;color:#c8a96e;letter-spacing:1px;">Cashews &amp; Dry Fruits</p>
            </td>
          </tr>

          <!-- Decorative Divider -->
          <tr>
            <td style="background-color:#c8a96e;height:4px;"></td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding:44px 48px 32px;">
              <p style="margin:0 0 8px;font-size:13px;color:#9a8070;letter-spacing:2px;text-transform:uppercase;">Welcome aboard</p>
              <h2 style="margin:0 0 24px;font-size:28px;font-weight:700;color:#3d2b1f;">Hello, ${firstName}!</h2>
              <p style="margin:0 0 20px;font-size:15px;line-height:1.8;color:#5a4a3a;">
                We're truly delighted to have you as part of the <strong>Suraj Naturo</strong> family. 
                Thank you for choosing us — it means the world to us.
              </p>
              <p style="margin:0 0 20px;font-size:15px;line-height:1.8;color:#5a4a3a;">
                From the finest hand-picked cashews to premium dry fruits sourced with care, 
                every product in our collection is a promise of quality, freshness, and taste 
                that you can trust.
              </p>

              <!-- Value Pills -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0;">
                <tr>
                  <td width="33%" style="padding:0 6px 0 0;text-align:center;">
                    <div style="background-color:#fdf6ec;border:1px solid #e8d5b0;border-radius:8px;padding:16px 8px;">
                      <p style="margin:0 0 4px;font-size:20px;">&#127807;</p>
                      <p style="margin:0;font-size:12px;font-weight:700;color:#3d2b1f;letter-spacing:0.5px;">100% Natural</p>
                    </div>
                  </td>
                  <td width="33%" style="padding:0 3px;text-align:center;">
                    <div style="background-color:#fdf6ec;border:1px solid #e8d5b0;border-radius:8px;padding:16px 8px;">
                      <p style="margin:0 0 4px;font-size:20px;">&#10003;</p>
                      <p style="margin:0;font-size:12px;font-weight:700;color:#3d2b1f;letter-spacing:0.5px;">Premium Quality</p>
                    </div>
                  </td>
                  <td width="33%" style="padding:0 0 0 6px;text-align:center;">
                    <div style="background-color:#fdf6ec;border:1px solid #e8d5b0;border-radius:8px;padding:16px 8px;">
                      <p style="margin:0 0 4px;font-size:20px;">&#128230;</p>
                      <p style="margin:0;font-size:12px;font-weight:700;color:#3d2b1f;letter-spacing:0.5px;">Fast Delivery</p>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:32px 0 8px;">
                <tr>
                  <td align="center">
                    <a href="https://www.surajnaturodryfruits.online/" style="display:inline-block;background-color:#3d2b1f;color:#ffffff;font-family:'Georgia',serif;font-size:14px;font-weight:700;letter-spacing:1.5px;text-decoration:none;padding:14px 36px;border-radius:6px;text-transform:uppercase;">
                      Start Shopping
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Quote Strip -->
          <tr>
            <td style="background-color:#fdf6ec;border-top:1px solid #e8d5b0;border-bottom:1px solid #e8d5b0;padding:20px 48px;text-align:center;">
              <p style="margin:0;font-size:13px;font-style:italic;color:#7a6050;line-height:1.7;">
                "Good food is the foundation of genuine happiness."
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:28px 48px;text-align:center;">
              <p style="margin:0 0 6px;font-size:13px;color:#9a8070;">Questions? We're here to help.</p>
              <p style="margin:0;font-size:13px;color:#3d2b1f;font-weight:700;">+91 96075 55963</p>
              <p style="margin:20px 0 0;font-size:11px;color:#bfb0a0;">
                &copy; ${new Date().getFullYear()} Suraj Naturo Cashews &amp; Dry Fruits. All rights reserved.
              </p>
            </td>
          </tr>

          <!-- Bottom Accent -->
          <tr>
            <td style="background-color:#c8a96e;height:4px;"></td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  const textBody = `Hi ${firstName},

Welcome to Suraj Naturo Cashews & Dry Fruits!

We're delighted to have you with us. From premium cashews to handpicked dry fruits, every product is a promise of quality and freshness.

Questions? Call us at +91 96075 55963.

Warm regards,
The Suraj Naturo Team`;

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
    subject: `Welcome to Suraj Naturo, ${firstName}!`,
    text: textBody,
    html: htmlBody,
  });
}

type LoginBody = {
  email?: string;
  password?: string;
};

async function ensureDefaultAdmin() {
  const db = await getDb();
  const email = 'admin@naturo.com';
  const existing = await db.collection('users').findOne({ email });
  if (existing) return;

  const passwordHash = await bcrypt.hash('admin123', 10);
  await db.collection('users').insertOne({
    name: 'Admin',
    email,
    phone: '9607555963',
    passwordHash,
    role: 'admin',
    createdAt: new Date(),
  });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as LoginBody;

    const email = body.email?.trim().toLowerCase() ?? '';
    const password = body.password ?? '';

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    }

    await ensureDefaultAdmin();

    const db = await getDb();
    const userDoc = await db.collection('users').findOne({ email });

    if (!userDoc) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const passwordHash = (userDoc as unknown as { passwordHash?: unknown }).passwordHash;
    if (typeof passwordHash !== 'string') {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const ok = await bcrypt.compare(password, passwordHash);
    if (!ok) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const createdAtVal = (userDoc as unknown as { createdAt?: unknown }).createdAt;
    const createdAt = createdAtVal instanceof Date ? createdAtVal.toISOString() : new Date().toISOString();

    const name =
      typeof (userDoc as unknown as { name?: unknown }).name === 'string'
        ? (userDoc as unknown as { name: string }).name
        : '';

    void sendWelcomeEmail({ to: email, name }).catch(() => undefined);

    return NextResponse.json({
      user: {
        id: (userDoc as unknown as { _id: { toString: () => string } })._id.toString(),
        name,
        email,
        phone:
          typeof (userDoc as unknown as { phone?: unknown }).phone === 'string'
            ? (userDoc as unknown as { phone: string }).phone
            : '',
        password: '',
        role: (userDoc as unknown as { role?: unknown }).role === 'admin' ? 'admin' : 'customer',
        createdAt,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to login' }, { status: 500 });
  }
}