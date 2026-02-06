import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { sendWarningEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { userId, email } = await request.json();

        if (!userId || !email) {
            return NextResponse.json({ error: 'User ID and email are required' }, { status: 400 });
        }

        await dbConnect();

        // Get current warning count
        const user = await User.findById(userId);

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const newWarningCount = user.warningsSent + 1;

        // Send warning email
        await sendWarningEmail(email, newWarningCount);

        // Update warning count
        await User.findByIdAndUpdate(userId, {
            warningsSent: newWarningCount,
        });

        return NextResponse.json({
            message: 'Warning email sent successfully',
            warningNumber: newWarningCount,
        });
    } catch (error) {
        console.error('Send warning error:', error);
        return NextResponse.json({ error: 'Failed to send warning email' }, { status: 500 });
    }
}
