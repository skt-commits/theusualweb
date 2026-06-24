import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { to, subject, orderId, totalAmount, items } = body;

    // You need to configure environment variables for this to work
    const userEmail = process.env.EMAIL_USER;
    const userPass = process.env.EMAIL_PASS;

    if (!userEmail || !userPass) {
      console.warn("EMAIL_USER or EMAIL_PASS not set in environment variables.");
      return NextResponse.json({ message: 'Email skipped (Credentials missing)' }, { status: 200 });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: userEmail,
        pass: userPass
      }
    });

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const itemsHtml = items.map((item: any) => {
      const imageUrl = item.image.startsWith('http') ? item.image : `${baseUrl}${item.image}`;
      return `
      <li style="margin-bottom: 15px; display: table; width: 100%; border-bottom: 1px solid #eee; padding-bottom: 15px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td width="75" style="vertical-align: top;">
              <img src="${imageUrl}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; border: 1px solid #ddd;" />
            </td>
            <td style="vertical-align: middle;">
              <p style="margin: 0; font-weight: bold; font-size: 1.1rem; color: #333;">${item.name}</p>
              <p style="margin: 5px 0 0; color: #666; font-size: 0.9rem;">Qty: ${item.quantity}</p>
            </td>
            <td style="vertical-align: middle; text-align: right; font-weight: bold; color: #6d28d9;">
              ${item.price}
            </td>
          </tr>
        </table>
      </li>`;
    }).join('');

    const mailOptions = {
      from: `"The Usuals" <${userEmail}>`,
      to: to,
      subject: subject,
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 30px; color: #333; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #eee; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
          
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #000; margin: 0; font-size: 2.5rem; letter-spacing: -1px;">THE <span style="color: #6d28d9;">USUALS</span></h1>
            <p style="color: #666; font-size: 0.9rem; margin-top: 5px; text-transform: uppercase; letter-spacing: 2px;">Premium Clothing & Fashion</p>
          </div>

          <div style="background: #fdfcff; border: 1px solid #ede9f6; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 30px;">
            <h2 style="color: #6d28d9; margin: 0 0 10px;">Order Confirmed!</h2>
            <p style="font-size: 1.1rem; margin: 0;">Thank you for your purchase.</p>
            <p style="margin: 10px 0 0; color: #555;">Order ID: <strong>${orderId}</strong></p>
          </div>
          
          <h3 style="border-bottom: 2px solid #f0f0f0; padding-bottom: 10px; margin-top: 20px;">Order Summary</h3>
          <ul style="list-style: none; padding: 0; margin: 0;">${itemsHtml}</ul>
          
          <div style="background: #fafafa; padding: 15px 20px; border-radius: 8px; margin-top: 20px; text-align: right;">
            <p style="font-size: 1.3rem; font-weight: bold; margin: 0; color: #333;">Total Paid: <span style="color: #6d28d9;">₹${totalAmount.toLocaleString()}</span></p>
          </div>
          
          <div style="text-align: center; margin-top: 40px; margin-bottom: 20px;">
            <a href="${baseUrl}" style="background-color: #000; color: #fff; text-decoration: none; padding: 14px 30px; border-radius: 30px; font-weight: bold; font-size: 1rem; display: inline-block;">Continue Shopping</a>
          </div>

          <p style="color: #888; font-size: 0.85rem; text-align: center; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
            We will notify you as soon as your order ships.<br/>
            &copy; ${new Date().getFullYear()} The Usuals. All rights reserved.
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return NextResponse.json({ message: 'Email sent successfully' }, { status: 200 });

  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
