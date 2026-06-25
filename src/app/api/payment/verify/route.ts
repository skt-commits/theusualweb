import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { pushOrderToShiprocket } from '@/lib/shiprocket';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      // Optional fields below if we want to immediately push to shiprocket
      orderDetails 
    } = body;

    const key_secret = process.env.RAZORPAY_KEY_SECRET || '';

    // Verify signature
    const hmac = crypto.createHmac('sha256', key_secret);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generated_signature = hmac.digest('hex');

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    // Payment is successful and verified
    let shiprocketResponse = null;

    // Push to Shiprocket if order details are provided
    if (orderDetails) {
      try {
        shiprocketResponse = await pushOrderToShiprocket(orderDetails);
      } catch (shiprocketError) {
        console.error('Shiprocket sync failed (payment succeeded):', shiprocketError);
        // We don't fail the payment if shiprocket fails, but we can log it.
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Payment verified successfully',
      shiprocket: shiprocketResponse
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment', details: error?.message || error },
      { status: 500 }
    );
  }
}
