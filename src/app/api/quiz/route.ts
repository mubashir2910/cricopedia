import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Quiz from '@/models/Quiz';

// Helper: Compute real-time status based on current time
function computeRealTimeStatus(quiz: {
    status: string;
    startTime: Date;
    endTime: Date;
}): 'draft' | 'scheduled' | 'live' | 'ended' {
    // Draft quizzes stay as draft
    if (quiz.status === 'draft') return 'draft';

    const now = new Date();
    const startTime = new Date(quiz.startTime);
    const endTime = new Date(quiz.endTime);

    // If past end time, it's ended
    if (now > endTime) return 'ended';

    // If within time window and status is scheduled/live, it's live
    if (now >= startTime && now <= endTime && quiz.status !== 'draft') {
        return 'live';
    }

    // If before start time, it's scheduled (upcoming)
    if (now < startTime && quiz.status !== 'draft') {
        return 'scheduled';
    }

    return quiz.status as 'draft' | 'scheduled' | 'live' | 'ended';
}

// GET: List all quizzes (with optional filters)
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const includeEnded = searchParams.get('includeEnded') === 'true';

        await dbConnect();

        // Build base query
        let query: Record<string, unknown> = {};

        if (session?.user?.isAdmin) {
            // Admin can see all quizzes, optionally filtered by stored status
            if (status && ['draft', 'scheduled', 'live', 'ended'].includes(status)) {
                query.status = status;
            }
        } else {
            // Regular users: get scheduled and live quizzes (not draft)
            // We'll filter by computed status after fetching
            query.status = { $ne: 'draft' };
        }

        const rawQuizzes = await Quiz.find(query)
            .sort({ startTime: -1 })
            .lean();

        // Add computed real-time status
        const quizzes = rawQuizzes.map((quiz: any) => ({
            ...quiz,
            computedStatus: computeRealTimeStatus(quiz),
        }));

        // For non-admin users, filter based on computed status
        let filteredQuizzes = quizzes;
        if (!session?.user?.isAdmin) {
            if (includeEnded) {
                // Show all non-draft quizzes
                filteredQuizzes = quizzes;
            } else {
                // Only show scheduled and live (upcoming and active)
                filteredQuizzes = quizzes.filter(
                    (q: any) => q.computedStatus === 'scheduled' || q.computedStatus === 'live'
                );
            }
        }

        // Sort: live first, then scheduled, then ended
        filteredQuizzes.sort((a: any, b: any) => {
            const order = { live: 0, scheduled: 1, ended: 2, draft: 3 };
            const orderA = order[a.computedStatus as keyof typeof order] ?? 4;
            const orderB = order[b.computedStatus as keyof typeof order] ?? 4;
            if (orderA !== orderB) return orderA - orderB;
            return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
        });

        // For non-admin users, hide question text and options to prevent cheating
        // Users can only see the question after starting an attempt (which starts the timer)
        let responseQuizzes = filteredQuizzes;
        if (!session?.user?.isAdmin) {
            responseQuizzes = filteredQuizzes.map((quiz: any) => {
                // Only hide for live/scheduled quizzes - ended quizzes can show content
                if (quiz.computedStatus === 'live' || quiz.computedStatus === 'scheduled') {
                    const { questionText, optionA, optionB, correctOption, ...safeQuiz } = quiz;
                    return {
                        ...safeQuiz,
                        questionText: '[Hidden until attempt starts]',
                        optionA: '[Hidden]',
                        optionB: '[Hidden]',
                    };
                }
                return quiz;
            });
        }

        return NextResponse.json({ quizzes: responseQuizzes });
    } catch (error) {
        console.error('Get quizzes error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch quizzes' },
            { status: 500 }
        );
    }
}

// POST: Create new quiz (Admin only)
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.isAdmin) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const {
            questionNumber,
            questionText,
            optionA,
            optionB,
            correctOption,
            startTime,
            endTime,
            status = 'draft',
            correctPoints = 5,
            wrongPenalty = 1,
        } = body;

        // Validation
        if (!questionNumber || !questionText || !optionA || !optionB || !correctOption || !startTime || !endTime) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        if (!['A', 'B'].includes(correctOption)) {
            return NextResponse.json(
                { error: 'Correct option must be A or B' },
                { status: 400 }
            );
        }

        if (new Date(endTime) <= new Date(startTime)) {
            return NextResponse.json(
                { error: 'End time must be after start time' },
                { status: 400 }
            );
        }

        await dbConnect();

        // Check if question number already exists
        const existingQuiz = await Quiz.findOne({ questionNumber });
        if (existingQuiz) {
            return NextResponse.json(
                { error: 'Question number already exists' },
                { status: 400 }
            );
        }

        const quiz = new Quiz({
            questionNumber,
            questionText,
            optionA,
            optionB,
            correctOption,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            status,
            correctPoints,
            wrongPenalty,
        });

        await quiz.save();

        return NextResponse.json(
            { message: 'Quiz created successfully', quiz },
            { status: 201 }
        );
    } catch (error) {
        console.error('Create quiz error:', error);
        return NextResponse.json(
            { error: 'Failed to create quiz' },
            { status: 500 }
        );
    }
}
