import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MatchCard from '@/components/MatchCard';
import RecentResults from '@/components/RecentResults';
import QuizBanner from '@/components/QuizBanner';
import dbConnect from '@/lib/mongodb';
import Match from '@/models/Match';
import Prediction from '@/models/Prediction';

async function getMatchesWithPredictions(userId: string) {
    await dbConnect();

    const matches = await Match.find()
        .sort({ matchDate: 1 })
        .lean();

    const predictions = await Prediction.find({ userId })
        .select('matchId predictedTeam')
        .lean();

    const predictionMap = new Map(
        predictions.map((p) => [p.matchId.toString(), p.predictedTeam])
    );

    return matches.map((match) => ({
        ...match,
        _id: match._id.toString(),
        userPrediction: predictionMap.get(match._id.toString()) || null,
    }));
}

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.isAdmin) {
        redirect('/login');
    }

    const matches = await getMatchesWithPredictions(session.user.id);

    const upcomingMatches = matches.filter((m) => m.status === 'upcoming');
    const liveMatches = matches.filter((m) => m.status === 'live');
    const completedMatches = matches.filter((m) => m.status === 'completed');

    return (
        <div className="min-h-screen" style={{ background: 'var(--gradient-dark)' }}>
            <Header />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <h1 className="text-2xl md:text-5xl font-bold mb-4">
                        T20 World Cup Edition
                    </h1>
                    <p className="text-slate-400 text-md max-w-2xl mx-auto mb-6">
                        Predict match winners, play quizzes, earn points, and climb the leaderboard to win exciting prizes!
                    </p>
                </div>

                {/* Quiz Banner */}
                <QuizBanner />

                {/* Stats Bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                    <div className="card p-4 text-center">
                        <p className="text-3xl font-bold text-emerald-400">{session.user.points}</p>
                        <p className="text-sm text-slate-400">Total Points</p>
                    </div>
                    <div className="card p-4 text-center">
                        <p className="text-3xl font-bold text-amber-400">{upcomingMatches.length}</p>
                        <p className="text-sm text-slate-400">Upcoming Matches</p>
                    </div>
                    <div className="card p-4 text-center">
                        <p className="text-3xl font-bold text-blue-400">
                            {matches.filter((m) => m.userPrediction).length}
                        </p>
                        <p className="text-sm text-slate-400">Predictions Made</p>
                    </div>
                    <div className="card p-4 text-center">
                        <p className="text-3xl font-bold text-purple-400">
                            {completedMatches.filter((m) => m.userPrediction && m.winner === m.userPrediction).length}
                        </p>
                        <p className="text-sm text-slate-400">Correct Predictions</p>
                    </div>
                </div>

                {/* Live Matches */}
                {liveMatches.length > 0 && (
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                            Live Matches
                        </h2>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {liveMatches.map((match, index) => (
                                <MatchCard
                                    key={match._id}
                                    match={match}
                                    userPrediction={match.userPrediction}
                                    index={index}
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* Upcoming Matches */}
                {upcomingMatches.length > 0 && (
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-6">🗓️ Upcoming Matches</h2>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {upcomingMatches.map((match, index) => (
                                <MatchCard
                                    key={match._id}
                                    match={match}
                                    userPrediction={match.userPrediction}
                                    index={index}
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* Recent Completed - Paginated */}
                <RecentResults matches={completedMatches} />

                {/* No Matches State */}
                {matches.length === 0 && (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">🏏</div>
                        <h2 className="text-2xl font-bold text-white mb-2">No Matches Yet</h2>
                        <p className="text-slate-400">
                            Check back soon for upcoming T20 World Cup matches!
                        </p>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
