import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Quiz from '@/models/Quiz';
import QuizAttempt from '@/models/QuizAttempt';
import User from '@/models/User';

const QUIZ_TIMER_MS = 10000; // 10 seconds
const TIMER_GRACE_MS = 1000; // 1 second grace period for network latency

// POST: Submit quiz answer
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id || session.user.isAdmin) {
            return NextResponse.json(
                { error: 'Please login to submit answers' },
                { status: 401 }
            );
        }

        const { quizId, selectedOption } = await request.json();

        if (!quizId || !selectedOption) {
            return NextResponse.json(
                { error: 'Quiz ID and selected option are required' },
                { status: 400 }
            );
        }

        if (!['A', 'B'].includes(selectedOption)) {
            return NextResponse.json(
                { error: 'Selected option must be A or B' },
                { status: 400 }
            );
        }

        await dbConnect();

        const now = new Date();

        // Find the attempt
        const attempt = await QuizAttempt.findOne({
            userId: session.user.id,
            quizId,
        });

        if (!attempt) {
            return NextResponse.json(
                { error: 'No active quiz attempt found. Please start the quiz first.' },
                { status: 400 }
            );
        }

        // Check if already submitted
        if (attempt.submittedAt) {
            return NextResponse.json(
                { error: 'You have already submitted an answer for this quiz' },
                { status: 400 }
            );
        }

        // Server-side timer validation
        const elapsed = now.getTime() - attempt.startedAt.getTime();
        if (elapsed > QUIZ_TIMER_MS + TIMER_GRACE_MS) {
            // Mark as timeout
            attempt.isTimeout = true;
            attempt.submittedAt = now;
            await attempt.save();

            return NextResponse.json({
                success: false,
                message: "Time's up! Your answer was not submitted in time.",
                isTimeout: true,
                pointsAwarded: 0,
            });
        }

        // Get quiz to check answer
        const quiz = await Quiz.findById(quizId);

        if (!quiz) {
            return NextResponse.json(
                { error: 'Quiz not found' },
                { status: 404 }
            );
        }

        // Check if quiz is still within time window
        if (now > quiz.endTime) {
            return NextResponse.json(
                { error: 'Quiz has ended' },
                { status: 400 }
            );
        }

        // Calculate result
        const isCorrect = selectedOption === quiz.correctOption;
        const pointsAwarded = isCorrect ? quiz.correctPoints : -quiz.wrongPenalty;

        // Update attempt
        attempt.selectedOption = selectedOption;
        attempt.isCorrect = isCorrect;
        attempt.pointsAwarded = pointsAwarded;
        attempt.submittedAt = now;
        attempt.isTimeout = false;

        await attempt.save();

        // Update user points atomically
        await User.findByIdAndUpdate(
            session.user.id,
            { $inc: { points: pointsAwarded } }
        );

        return NextResponse.json({
            success: true,
            isCorrect,
            correctOption: quiz.correctOption,
            pointsAwarded,
            message: isCorrect
                ? `Correct! +${quiz.correctPoints} points`
                : `Wrong! -${quiz.wrongPenalty} point${quiz.wrongPenalty > 1 ? 's' : ''}`,
        });
    } catch (error) {
        console.error('Submit quiz answer error:', error);
        return NextResponse.json(
            { error: 'Failed to submit answer' },
            { status: 500 }
        );
    }
}
