import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import OTP from '@/models/OTP';

export async function POST(request: NextRequest) {
    try {
        const { email, otp } = await request.json();

        if (!email || !otp) {
            return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
        }

        await dbConnect();

        // Find OTP record
        const otpRecord = await OTP.findOne({
            email: email.toLowerCase(),
            otp,
        });

        if (!otpRecord) {
            return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
        }

        // Check if expired
        if (new Date() > otpRecord.expiresAt) {
            await OTP.deleteOne({ _id: otpRecord._id });
            return NextResponse.json({ error: 'OTP has expired' }, { status: 400 });
        }

        // OTP is valid - don't delete yet, wait for password reset
        return NextResponse.json({ message: 'OTP verified successfully', verified: true });
    } catch (error) {
        console.error('Forgot password verify OTP error:', error);
        return NextResponse.json({ error: 'Failed to verify OTP' }, { status: 500 });
    }
}
