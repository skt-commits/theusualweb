import { calculateShipping } from '@/lib/shiprocket';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pincode = searchParams.get('pincode');
  const weightParam = searchParams.get('weight');
  
  if (!pincode) return NextResponse.json({ error: 'Pincode is required' }, { status: 400 });
  
  const weight = weightParam ? parseFloat(weightParam) : 0.5;
  
  try {
    const rate = await calculateShipping(pincode, weight);
    return NextResponse.json({ rate });
  } catch (error) {
    return NextResponse.json({ rate: 50 }); // Fallback
  }
}
