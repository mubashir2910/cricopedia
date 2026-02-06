import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Prediction from '@/models/Prediction';

// Calculate distance between two coordinates in meters (Haversine formula)
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lng2 - lng1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const flaggedCount = { ip: 0, coords: 0 };
        const flaggedUsers: { email: string; reason: string }[] = [];

        // Get all users with their predictions (including already flagged)
        const users = await User.find({}).lean();
        const predictions = await Prediction.find().lean();

        // Helper to get email by userId
        const getEmail = (userId: string) => {
            const user = users.find(u => u._id.toString() === userId);
            return user?.email || 'Unknown';
        };

        // Group users by IP
        const ipGroups: { [ip: string]: typeof users } = {};
        users.forEach(user => {
            if (user.signupIP) {
                if (!ipGroups[user.signupIP]) {
                    ipGroups[user.signupIP] = [];
                }
                ipGroups[user.signupIP].push(user);
            }
        });

        // Check for same IP + opposite predictions
        for (const ip in ipGroups) {
            const usersWithIP = ipGroups[ip];
            if (usersWithIP.length < 2) continue;

            // Get all matches where these users made predictions
            const userIds = usersWithIP.map(u => u._id.toString());
            const userPredictions = predictions.filter(p =>
                userIds.includes(p.userId.toString())
            );

            // Group predictions by match
            const matchPredictions: { [matchId: string]: typeof userPredictions } = {};
            userPredictions.forEach(p => {
                const matchId = p.matchId.toString();
                if (!matchPredictions[matchId]) {
                    matchPredictions[matchId] = [];
                }
                matchPredictions[matchId].push(p);
            });

            // Check for opposite predictions in same match
            for (const matchId in matchPredictions) {
                const preds = matchPredictions[matchId];
                if (preds.length < 2) continue;

                // Check if different teams were predicted
                const teams = new Set(preds.map(p => p.predictedTeam));
                if (teams.size > 1) {
                    // Flag all users from this IP with opposite predictions
                    const userIdsToFlag = [...new Set(preds.map(p => p.userId.toString()))];

                    for (const userId of userIdsToFlag) {
                        const email = getEmail(userId);
                        await User.findByIdAndUpdate(userId, {
                            $set: {
                                isFlagged: true,
                                flagReason: `Same IP (${ip}) with opposite predictions on match`,
                            },
                            $inc: { timesCaught: 1 }
                        });
                        flaggedCount.ip++;
                        flaggedUsers.push({ email, reason: `Same IP (${ip})` });
                    }
                }
            }
        }

        // Check for nearby coordinates + opposite predictions
        const usersWithCoords = users.filter(u => u.signupCoords?.lat && u.signupCoords?.lng);

        for (let i = 0; i < usersWithCoords.length; i++) {
            for (let j = i + 1; j < usersWithCoords.length; j++) {
                const user1 = usersWithCoords[i];
                const user2 = usersWithCoords[j];

                const distance = calculateDistance(
                    user1.signupCoords!.lat,
                    user1.signupCoords!.lng,
                    user2.signupCoords!.lat,
                    user2.signupCoords!.lng
                );

                // If within 50 meters
                if (distance <= 50) {
                    const user1Predictions = predictions.filter(p =>
                        p.userId.toString() === user1._id.toString()
                    );
                    const user2Predictions = predictions.filter(p =>
                        p.userId.toString() === user2._id.toString()
                    );

                    // Check for opposite predictions on same match
                    for (const p1 of user1Predictions) {
                        const oppositeP2 = user2Predictions.find(p2 =>
                            p2.matchId.toString() === p1.matchId.toString() &&
                            p2.predictedTeam !== p1.predictedTeam
                        );

                        if (oppositeP2) {
                            await User.findByIdAndUpdate(user1._id, {
                                $set: {
                                    isFlagged: true,
                                    flagReason: `Nearby location (${Math.round(distance)}m) with opposite predictions`,
                                },
                                $inc: { timesCaught: 1 }
                            });
                            await User.findByIdAndUpdate(user2._id, {
                                $set: {
                                    isFlagged: true,
                                    flagReason: `Nearby location (${Math.round(distance)}m) with opposite predictions`,
                                },
                                $inc: { timesCaught: 1 }
                            });
                            flaggedCount.coords += 2;
                            flaggedUsers.push({ email: user1.email, reason: `Nearby (${Math.round(distance)}m)` });
                            flaggedUsers.push({ email: user2.email, reason: `Nearby (${Math.round(distance)}m)` });
                            break;
                        }
                    }
                }
            }
        }

        // Dedupe flaggedUsers by email
        const uniqueFlagged = Array.from(new Map(flaggedUsers.map(u => [u.email, u])).values());

        return NextResponse.json({
            message: 'Suspicious activity check completed',
            flagged: flaggedCount,
            flaggedUsers: uniqueFlagged.slice(0, 10), // Return top 10 for display
            totalViolations: flaggedCount.ip + flaggedCount.coords,
        });
    } catch (error) {
        console.error('Check suspicious error:', error);
        return NextResponse.json({ error: 'Failed to check suspicious activity' }, { status: 500 });
    }
}
