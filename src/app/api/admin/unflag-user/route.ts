import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { userId } = await request.json();

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        await dbConnect();

        await User.findByIdAndUpdate(userId, {
            isFlagged: false,
            flagReason: null,
        });

        return NextResponse.json({ message: 'User unflagged successfully' });
    } catch (error) {
        console.error('Unflag user error:', error);
        return NextResponse.json({ error: 'Failed to unflag user' }, { status: 500 });
    }
}
