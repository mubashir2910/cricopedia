import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import OTP from '@/models/OTP';
import User from '@/models/User';
import { sendOTPEmail } from '@/lib/email';

function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Please enter a valid email address' },
                { status: 400 }
            );
        }

        await dbConnect();

        // Check if email already registered
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return NextResponse.json(
                { error: 'This email is already registered. Please login instead.' },
                { status: 409 }
            );
        }

        // Delete any existing OTPs for this email
        await OTP.deleteMany({ email: email.toLowerCase() });

        // Generate new OTP
        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Save OTP to database
        await OTP.create({
            email: email.toLowerCase(),
            otp,
            expiresAt,
        });

        // Send OTP via email
        await sendOTPEmail(email, otp);

        return NextResponse.json(
            { message: 'OTP sent successfully! Check your email.' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Send OTP error:', error);
        return NextResponse.json(
            { error: 'Failed to send OTP. Please try again.' },
            { status: 500 }
        );
    }
}
