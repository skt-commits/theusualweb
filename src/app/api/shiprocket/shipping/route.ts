import { calculateShipping } from '@/lib/shiprocket';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pincode, weight = 0.5 } = body;
    
    if (!pincode) return NextResponse.json({ error: 'Pincode is required' }, { status: 400 });
    
    const rate = await calculateShipping(pincode, weight);
    return NextResponse.json({ rate });
  } catch (error) {
    return NextResponse.json({ rate: 50 }); // Fallback
  }
}
