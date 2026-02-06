import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
    try {
        await dbConnect();

        const users = await User.find()
            .select('email displayName points correctPredictions wrongPredictions badges currentStreak')
            .sort({ points: -1, correctPredictions: -1 })
            .limit(100)
            .lean();

        const leaderboard = users.map((user, index) => ({
            rank: index + 1,
            username: user.displayName || user.email?.split('@')[0] || 'Anonymous',
            points: user.points || 0,
            correctPredictions: user.correctPredictions || 0,
            wrongPredictions: user.wrongPredictions || 0,
            badges: user.badges || [],
            streak: user.currentStreak || 0,
        }));

        return NextResponse.json({ leaderboard });
    } catch (error) {
        console.error('Get leaderboard error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch leaderboard' },
            { status: 500 }
        );
    }
}
