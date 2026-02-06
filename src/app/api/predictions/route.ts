import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Prediction from '@/models/Prediction';
import Match from '@/models/Match';
import User from '@/models/User';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id || session.user.isAdmin) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await dbConnect();

        const predictions = await Prediction.find({ userId: session.user.id })
            .populate({
                path: 'matchId',
                select: 'title matchDate winner' // Only fetch needed fields
            })
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({ predictions });
    } catch (error) {
        console.error('Get predictions error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch predictions' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id || session.user.isAdmin) {
            return NextResponse.json(
                { error: 'Please login to make predictions' },
                { status: 401 }
            );
        }

        const { matchId, predictedTeam } = await request.json();

        if (!matchId || !predictedTeam) {
            return NextResponse.json(
                { error: 'Match ID and predicted team are required' },
                { status: 400 }
            );
        }

        await dbConnect();

        // Check if match exists and deadline hasn't passed
        const match = await Match.findById(matchId);

        if (!match) {
            return NextResponse.json(
                { error: 'Match not found' },
                { status: 404 }
            );
        }

        // Check if prediction window has opened
        if (match.predictionStartDate && new Date() < new Date(match.predictionStartDate)) {
            return NextResponse.json(
                { error: 'Prediction window has not opened yet' },
                { status: 400 }
            );
        }

        if (new Date() > new Date(match.predictionDeadline)) {
            return NextResponse.json(
                { error: 'Prediction deadline has passed' },
                { status: 400 }
            );
        }

        if (match.status !== 'upcoming') {
            return NextResponse.json(
                { error: 'Cannot predict on live or completed matches' },
                { status: 400 }
            );
        }

        // Check if user already predicted
        const existingPrediction = await Prediction.findOne({
            userId: session.user.id,
            matchId,
        });

        if (existingPrediction) {
            return NextResponse.json(
                { error: 'You have already made a prediction for this match' },
                { status: 400 }
            );
        }

        // Validate predicted team
        if (predictedTeam !== match.teamA && predictedTeam !== match.teamB) {
            return NextResponse.json(
                { error: 'Invalid team selection' },
                { status: 400 }
            );
        }

        // Create prediction
        const prediction = new Prediction({
            userId: session.user.id,
            matchId,
            predictedTeam,
        });

        await prediction.save();

        // Update user's streak
        const user = await User.findById(session.user.id);
        if (user) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (user.lastPredictionDate) {
                const lastDate = new Date(user.lastPredictionDate);
                lastDate.setHours(0, 0, 0, 0);

                const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

                if (diffDays === 1) {
                    // Consecutive day
                    user.currentStreak += 1;
                    user.longestStreak = Math.max(user.longestStreak, user.currentStreak);

                    // Award streak bonuses
                    let streakBonus = 0;
                    if (user.currentStreak === 3) streakBonus = 3;
                    else if (user.currentStreak === 5) streakBonus = 5;
                    else if (user.currentStreak === 7) streakBonus = 10;

                    if (streakBonus > 0) {
                        user.points += streakBonus;
                    }
                } else if (diffDays > 1) {
                    // Streak broken
                    user.currentStreak = 1;
                }
                // If same day, don't change streak
            } else {
                // First prediction
                user.currentStreak = 1;
            }

            user.lastPredictionDate = new Date();
            await user.save();
        }

        // 🚨 Auto-check for suspicious activity (fire and forget)
        // This runs in the background without blocking the response
        import('@/lib/checkSuspicious').then(({ checkSuspiciousActivity }) => {
            checkSuspiciousActivity().catch(err =>
                console.error('Background suspicious check failed:', err)
            );
        });

        return NextResponse.json(
            { message: 'Prediction submitted successfully!', prediction },
            { status: 201 }
        );
    } catch (error) {
        console.error('Create prediction error:', error);
        return NextResponse.json(
            { error: 'Failed to submit prediction' },
            { status: 500 }
        );
    }
}
