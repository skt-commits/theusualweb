import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    if (!secretKey) {
      console.warn("RECAPTCHA_SECRET_KEY is missing");
      return NextResponse.json({ success: true, message: "Skipped verify" });
    }

    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`;
    
    const recaptchaRes = await fetch(verifyUrl, { method: 'POST' });
    const recaptchaData = await recaptchaRes.json();

    if (recaptchaData.success) {
      return NextResponse.json({ success: true, score: recaptchaData.score });
    } else {
      return NextResponse.json({ success: false, errors: recaptchaData['error-codes'] }, { status: 400 });
    }
  } catch (error) {
    console.error("Error verifying recaptcha:", error);
    return NextResponse.json({ success: false, error: 'Failed to verify recaptcha' }, { status: 500 });
  }
}
