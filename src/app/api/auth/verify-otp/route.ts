import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import OTP from '@/models/OTP';

export async function POST(request: NextRequest) {
    try {
        const { email, otp } = await request.json();

        if (!email || !otp) {
            return NextResponse.json(
                { error: 'Email and OTP are required' },
                { status: 400 }
            );
        }

        await dbConnect();

        // Find valid OTP
        const otpRecord = await OTP.findOne({
            email: email.toLowerCase(),
            otp,
            expiresAt: { $gt: new Date() },
        });

        if (!otpRecord) {
            return NextResponse.json(
                { error: 'Invalid or expired OTP. Please try again.' },
                { status: 400 }
            );
        }

        // Delete the used OTP
        await OTP.deleteOne({ _id: otpRecord._id });

        return NextResponse.json(
            {
                message: 'OTP verified successfully!',
                verified: true,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Verify OTP error:', error);
        return NextResponse.json(
            { error: 'Verification failed. Please try again.' },
            { status: 500 }
        );
    }
}
