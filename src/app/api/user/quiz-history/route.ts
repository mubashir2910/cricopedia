import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import QuizAttempt from '@/models/QuizAttempt';

// GET: Get user's quiz attempt history
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id || session.user.isAdmin) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const skip = (page - 1) * limit;

        await dbConnect();

        // Get total count
        const total = await QuizAttempt.countDocuments({ userId: session.user.id });

        // Get paginated attempts with quiz data
        const attempts = await QuizAttempt.find({ userId: session.user.id })
            .populate({
                path: 'quizId',
                select: 'questionNumber questionText optionA optionB correctOption correctPoints wrongPenalty',
            })
            .sort({ startedAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        // Calculate stats
        const allAttempts = await QuizAttempt.find({ userId: session.user.id }).lean();
        const stats = {
            total: allAttempts.length,
            correct: allAttempts.filter((a) => a.isCorrect === true).length,
            wrong: allAttempts.filter((a) => a.isCorrect === false).length,
            timeout: allAttempts.filter((a) => a.isTimeout === true).length,
            unanswered: allAttempts.filter((a) => !a.submittedAt && !a.isTimeout).length,
        };

        return NextResponse.json({
            attempts,
            stats,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Get quiz history error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch quiz history' },
            { status: 500 }
        );
    }
}
