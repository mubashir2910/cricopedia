import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Match from '@/models/Match';

export async function GET() {
    try {
        await dbConnect();

        const matches = await Match.find()
            .sort({ matchDate: 1 })
            .lean();

        return NextResponse.json({ matches });
    } catch (error) {
        console.error('Get matches error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch matches' },
            { status: 500 }
        );
    }
}

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
        const { title, teamA, teamB, teamAFlag, teamBFlag, matchDate, predictionStartDate, predictionDeadline } = body;

        if (!title || !teamA || !teamB || !matchDate || !predictionStartDate || !predictionDeadline) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        await dbConnect();

        const match = new Match({
            title,
            teamA,
            teamB,
            teamAFlag: teamAFlag || '',
            teamBFlag: teamBFlag || '',
            matchDate: new Date(matchDate),
            predictionStartDate: new Date(predictionStartDate),
            predictionDeadline: new Date(predictionDeadline),
        });

        await match.save();

        return NextResponse.json(
            { message: 'Match created successfully', match },
            { status: 201 }
        );
    } catch (error) {
        console.error('Create match error:', error);
        return NextResponse.json(
            { error: 'Failed to create match' },
            { status: 500 }
        );
    }
}
