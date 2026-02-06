import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Match from '@/models/Match';
import Prediction from '@/models/Prediction';
import User from '@/models/User';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await dbConnect();

        const match = await Match.findById(id).lean();

        if (!match) {
            return NextResponse.json(
                { error: 'Match not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ match });
    } catch (error) {
        console.error('Get match error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch match' },
            { status: 500 }
        );
    }
}

export async function PUT(
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
        const body = await request.json();

        await dbConnect();

        const match = await Match.findByIdAndUpdate(
            id,
            { $set: body },
            { new: true, runValidators: true }
        );

        if (!match) {
            return NextResponse.json(
                { error: 'Match not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: 'Match updated', match });
    } catch (error) {
        console.error('Update match error:', error);
        return NextResponse.json(
            { error: 'Failed to update match' },
            { status: 500 }
        );
    }
}

export async function DELETE(
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
        await dbConnect();

        const match = await Match.findByIdAndDelete(id);

        if (!match) {
            return NextResponse.json(
                { error: 'Match not found' },
                { status: 404 }
            );
        }

        // Delete associated predictions
        await Prediction.deleteMany({ matchId: id });

        return NextResponse.json({ message: 'Match deleted' });
    } catch (error) {
        console.error('Delete match error:', error);
        return NextResponse.json(
            { error: 'Failed to delete match' },
            { status: 500 }
        );
    }
}
