import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Quiz from '@/models/Quiz';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET: Get single quiz by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);

        await dbConnect();

        const quiz = await Quiz.findById(id).lean();

        if (!quiz) {
            return NextResponse.json(
                { error: 'Quiz not found' },
                { status: 404 }
            );
        }

        // Non-admin users can only view scheduled/live quizzes
        if (!session?.user?.isAdmin && !['scheduled', 'live'].includes(quiz.status)) {
            return NextResponse.json(
                { error: 'Quiz not available' },
                { status: 404 }
            );
        }

        return NextResponse.json({ quiz });
    } catch (error) {
        console.error('Get quiz error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch quiz' },
            { status: 500 }
        );
    }
}

// PUT: Update quiz (Admin only, not if live/ended)
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);

        if (!session?.user?.isAdmin) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await dbConnect();

        const quiz = await Quiz.findById(id);

        if (!quiz) {
            return NextResponse.json(
                { error: 'Quiz not found' },
                { status: 404 }
            );
        }

        // Prevent editing live or ended quizzes
        if (['live', 'ended'].includes(quiz.status)) {
            return NextResponse.json(
                { error: 'Cannot edit live or ended quizzes' },
                { status: 400 }
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
            status,
            correctPoints,
            wrongPenalty,
        } = body;

        // Validate correctOption if provided
        if (correctOption && !['A', 'B'].includes(correctOption)) {
            return NextResponse.json(
                { error: 'Correct option must be A or B' },
                { status: 400 }
            );
        }

        // Validate times if both provided
        const newStartTime = startTime ? new Date(startTime) : quiz.startTime;
        const newEndTime = endTime ? new Date(endTime) : quiz.endTime;
        if (newEndTime <= newStartTime) {
            return NextResponse.json(
                { error: 'End time must be after start time' },
                { status: 400 }
            );
        }

        // Check for duplicate question number
        if (questionNumber && questionNumber !== quiz.questionNumber) {
            const existing = await Quiz.findOne({ questionNumber });
            if (existing) {
                return NextResponse.json(
                    { error: 'Question number already exists' },
                    { status: 400 }
                );
            }
        }

        // Update fields
        if (questionNumber) quiz.questionNumber = questionNumber;
        if (questionText) quiz.questionText = questionText;
        if (optionA) quiz.optionA = optionA;
        if (optionB) quiz.optionB = optionB;
        if (correctOption) quiz.correctOption = correctOption;
        if (startTime) quiz.startTime = new Date(startTime);
        if (endTime) quiz.endTime = new Date(endTime);
        if (status && ['draft', 'scheduled'].includes(status)) quiz.status = status;
        if (correctPoints !== undefined) quiz.correctPoints = correctPoints;
        if (wrongPenalty !== undefined) quiz.wrongPenalty = wrongPenalty;

        await quiz.save();

        return NextResponse.json({ message: 'Quiz updated successfully', quiz });
    } catch (error) {
        console.error('Update quiz error:', error);
        return NextResponse.json(
            { error: 'Failed to update quiz' },
            { status: 500 }
        );
    }
}

// DELETE: Delete quiz (Admin only, only if draft)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);

        if (!session?.user?.isAdmin) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await dbConnect();

        const quiz = await Quiz.findById(id);

        if (!quiz) {
            return NextResponse.json(
                { error: 'Quiz not found' },
                { status: 404 }
            );
        }

        // Only allow deletion of draft quizzes
        if (quiz.status !== 'draft') {
            return NextResponse.json(
                { error: 'Can only delete draft quizzes' },
                { status: 400 }
            );
        }

        await Quiz.findByIdAndDelete(id);

        return NextResponse.json({ message: 'Quiz deleted successfully' });
    } catch (error) {
        console.error('Delete quiz error:', error);
        return NextResponse.json(
            { error: 'Failed to delete quiz' },
            { status: 500 }
        );
    }
}
