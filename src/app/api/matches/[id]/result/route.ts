import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Match from '@/models/Match';
import Prediction from '@/models/Prediction';
import User from '@/models/User';

// Points constants
const CORRECT_PREDICTION_POINTS = 10;
const WRONG_PREDICTION_POINTS = -2;

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.isAdmin) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id } = await params;
        const { winner } = await request.json();

        if (!winner) {
            return NextResponse.json(
                { error: 'Winner is required' },
                { status: 400 }
            );
        }

        await dbConnect();

        const match = await Match.findById(id);

        if (!match) {
            return NextResponse.json(
                { error: 'Match not found' },
                { status: 404 }
            );
        }

        if (match.status === 'completed' && match.winner) {
            return NextResponse.json(
                { error: 'Result already declared' },
                { status: 400 }
            );
        }

        // Update match
        match.winner = winner;
        match.status = 'completed';
        await match.save();

        // Get all predictions for this match
        const predictions = await Prediction.find({ matchId: id });

        // Calculate points for each prediction
        const bulkOperations = [];
        const userUpdates: { [userId: string]: { points: number; correct: boolean } } = {};

        for (const prediction of predictions) {
            const isCorrect = prediction.predictedTeam === winner;
            const pointsEarned = isCorrect ? CORRECT_PREDICTION_POINTS : WRONG_PREDICTION_POINTS;

            // Update prediction
            prediction.isCorrect = isCorrect;
            prediction.pointsEarned = pointsEarned;
            await prediction.save();

            // Aggregate user updates
            const userIdStr = prediction.userId.toString();
            if (!userUpdates[userIdStr]) {
                userUpdates[userIdStr] = { points: 0, correct: isCorrect };
            }
            userUpdates[userIdStr].points += pointsEarned;
            if (isCorrect) {
                userUpdates[userIdStr].correct = true;
            }
        }

        // Update users
        for (const [userId, update] of Object.entries(userUpdates)) {
            const updateFields: {
                $inc: { points: number; correctPredictions?: number; wrongPredictions?: number };
            } = {
                $inc: { points: update.points },
            };

            if (update.correct) {
                updateFields.$inc.correctPredictions = 1;
            } else {
                updateFields.$inc.wrongPredictions = 1;
            }

            await User.findByIdAndUpdate(userId, updateFields);
        }

        return NextResponse.json({
            message: 'Result declared successfully',
            match,
            predictionsUpdated: predictions.length,
        });
    } catch (error) {
        console.error('Declare result error:', error);
        return NextResponse.json(
            { error: 'Failed to declare result' },
            { status: 500 }
        );
    }
}
