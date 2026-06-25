import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, currency = 'INR', receipt = 'receipt_1' } = body;

    // Create an order in Razorpay
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // amount in smallest currency unit (paise)
      currency,
      receipt,
      payment_capture: true,
    });

    return NextResponse.json({ order }, { status: 200 });
  } catch (error: any) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json(
      { error: 'Failed to create Razorpay order', details: error?.message || error },
      { status: 500 }
    );
  }
}
