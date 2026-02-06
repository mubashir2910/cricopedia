import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Quiz from '@/models/Quiz';
import QuizAttempt from '@/models/QuizAttempt';

const QUIZ_TIMER_MS = 10000; // 10 seconds

// POST: Start a quiz attempt
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id || session.user.isAdmin) {
            return NextResponse.json(
                { error: 'Please login to attempt quizzes' },
                { status: 401 }
            );
        }

        const { quizId } = await request.json();

        if (!quizId) {
            return NextResponse.json(
                { error: 'Quiz ID is required' },
                { status: 400 }
            );
        }

        await dbConnect();

        // Check if quiz exists and is live
        const quiz = await Quiz.findById(quizId);

        if (!quiz) {
            return NextResponse.json(
                { error: 'Quiz not found' },
                { status: 404 }
            );
        }

        // Compute real-time status - quiz is considered live if:
        // 1. Status is not 'draft'
        // 2. Current time is within start/end window
        const now = new Date();
        const isWithinTimeWindow = now >= quiz.startTime && now <= quiz.endTime;
        const isActuallyLive = quiz.status !== 'draft' && isWithinTimeWindow;

        if (!isActuallyLive) {
            // Provide specific error message
            if (quiz.status === 'draft') {
                return NextResponse.json(
                    { error: 'Quiz is not available yet' },
                    { status: 400 }
                );
            }
            if (now < quiz.startTime) {
                return NextResponse.json(
                    { error: 'Quiz has not started yet' },
                    { status: 400 }
                );
            }
            if (now > quiz.endTime) {
                return NextResponse.json(
                    { error: 'Quiz has ended' },
                    { status: 400 }
                );
            }
            return NextResponse.json(
                { error: 'Quiz is not currently available' },
                { status: 400 }
            );
        }

        // Check if user already has an attempt
        const existingAttempt = await QuizAttempt.findOne({
            userId: session.user.id,
            quizId,
        });

        if (existingAttempt) {
            // Return existing attempt info for timer resume
            const elapsed = now.getTime() - existingAttempt.startedAt.getTime();
            const remainingMs = Math.max(0, QUIZ_TIMER_MS - elapsed);

            return NextResponse.json({
                attempt: existingAttempt,
                quiz: {
                    _id: quiz._id,
                    questionNumber: quiz.questionNumber,
                    questionText: quiz.questionText,
                    optionA: quiz.optionA,
                    optionB: quiz.optionB,
                },
                remainingMs,
                alreadySubmitted: existingAttempt.submittedAt !== null,
                isTimeout: remainingMs === 0 && !existingAttempt.submittedAt,
            });
        }

        // Create new attempt
        const attempt = new QuizAttempt({
            userId: session.user.id,
            quizId,
            startedAt: now,
        });

        await attempt.save();

        return NextResponse.json({
            attempt,
            quiz: {
                _id: quiz._id,
                questionNumber: quiz.questionNumber,
                questionText: quiz.questionText,
                optionA: quiz.optionA,
                optionB: quiz.optionB,
            },
            remainingMs: QUIZ_TIMER_MS,
            alreadySubmitted: false,
            isTimeout: false,
        });
    } catch (error) {
        console.error('Start quiz attempt error:', error);
        return NextResponse.json(
            { error: 'Failed to start quiz' },
            { status: 500 }
        );
    }
}

// GET: Get existing attempt status
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
        const quizId = searchParams.get('quizId');

        if (!quizId) {
            return NextResponse.json(
                { error: 'Quiz ID is required' },
                { status: 400 }
            );
        }

        await dbConnect();

        const attempt = await QuizAttempt.findOne({
            userId: session.user.id,
            quizId,
        });

        if (!attempt) {
            return NextResponse.json({ attempt: null });
        }

        const now = new Date();
        const elapsed = now.getTime() - attempt.startedAt.getTime();
        const remainingMs = Math.max(0, QUIZ_TIMER_MS - elapsed);

        return NextResponse.json({
            attempt,
            remainingMs,
            alreadySubmitted: attempt.submittedAt !== null,
            isTimeout: remainingMs === 0 && !attempt.submittedAt,
        });
    } catch (error) {
        console.error('Get attempt status error:', error);
        return NextResponse.json(
            { error: 'Failed to get attempt status' },
            { status: 500 }
        );
    }
}
