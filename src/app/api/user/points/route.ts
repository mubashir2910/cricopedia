import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ points: 0 });
        }

        await dbConnect();

        const user = await User.findById(session.user.id).select('points').lean();

        return NextResponse.json({
            points: user?.points || 0
        });
    } catch (error) {
        console.error('Get user points error:', error);
        return NextResponse.json({ points: 0 });
    }
}
