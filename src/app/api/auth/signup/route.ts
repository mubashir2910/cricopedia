import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
    try {
        const { email, password, phoneNumber, displayName, signupIP, signupCoords } = await request.json();

        // Validation
        if (!email || !password || !phoneNumber) {
            return NextResponse.json(
                { error: 'Email, password, and phone number are required' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: 'Password must be at least 6 characters' },
                { status: 400 }
            );
        }

        // Validate phone number (basic check for Indian numbers)
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(phoneNumber.replace(/\D/g, '').slice(-10))) {
            return NextResponse.json(
                { error: 'Please enter a valid 10-digit phone number' },
                { status: 400 }
            );
        }

        await dbConnect();

        // Check if email already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });

        if (existingUser) {
            return NextResponse.json(
                { error: 'Email already registered. Please login instead.' },
                { status: 409 }
            );
        }

        // Rate limit: Check signups from same IP in last 24 hours
        if (signupIP) {
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const recentSignupsFromIP = await User.countDocuments({
                signupIP,
                createdAt: { $gte: oneDayAgo },
            });

            if (recentSignupsFromIP >= 3) {
                return NextResponse.json(
                    { error: 'Too many signups from this network. Please try again later.' },
                    { status: 429 }
                );
            }
        }

        // Create new user
        const user = new User({
            email: email.toLowerCase(),
            password,
            phoneNumber: phoneNumber.replace(/\D/g, '').slice(-10), // Store only 10 digits
            displayName: displayName?.trim() || undefined,
            signupIP,
            signupCoords,
            timesCaught: 0, // Explicitly set to ensure field exists
        });

        await user.save();

        return NextResponse.json(
            {
                message: 'Account created successfully!',
                user: {
                    id: user._id.toString(),
                    email: user.email,
                    displayName: user.displayName,
                }
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json(
            { error: 'Something went wrong. Please try again.' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
        return NextResponse.json(
            { error: 'Email is required' },
            { status: 400 }
        );
    }

    await dbConnect();

    const existingUser = await User.findOne({ email: email.toLowerCase() });

    return NextResponse.json({
        available: !existingUser,
    });
}
