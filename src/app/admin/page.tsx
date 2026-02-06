import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/mongodb';
import Match from '@/models/Match';
import User from '@/models/User';
import Prediction from '@/models/Prediction';
import Link from 'next/link';
import CheckSuspiciousButton from './CheckSuspiciousButton';


async function getStats() {
    await dbConnect();

    const [totalMatches, totalUsers, totalPredictions, upcomingMatches, completedMatches, flaggedUsers] = await Promise.all([
        Match.countDocuments(),
        User.countDocuments(),
        Prediction.countDocuments(),
        Match.countDocuments({ status: 'upcoming' }),
        Match.countDocuments({ status: 'completed' }),
        User.countDocuments({ isFlagged: true }),
    ]);

    return { totalMatches, totalUsers, totalPredictions, upcomingMatches, completedMatches, flaggedUsers };
}

async function getRecentMatches() {
    await dbConnect();
    return Match.find().sort({ createdAt: -1 }).limit(5).lean();
}

export default async function AdminDashboard() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isAdmin) {
        redirect('/admin/login');
    }

    const stats = await getStats();
    const recentMatches = await getRecentMatches();

    return (
        <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)' }}>
            {/* Admin Header */}
            <header className="border-b border-purple-500/20 bg-purple-900/20 backdrop-blur">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">🔐</span>
                            <span className="text-xl font-bold text-white">Admin Dashboard</span>
                        </div>
                        <nav className="flex items-center gap-4">
                            <Link
                                href="/admin/matches"
                                className="text-purple-300 hover:text-white transition-colors"
                            >
                                Manage Matches
                            </Link>
                            <Link
                                href="/admin/quiz"
                                className="text-purple-300 hover:text-white transition-colors"
                            >
                                Manage Quizzes
                            </Link>
                            <Link
                                href="/"
                                className="text-slate-400 hover:text-white transition-colors text-sm"
                            >
                                View Site →
                            </Link>
                        </nav>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Welcome, Admin!</h1>
                    <p className="text-slate-400">Manage matches, declare results, and monitor the tournament.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
                    <div className="card p-6 text-center border-purple-500/30">
                        <p className="text-3xl font-bold text-purple-400">{stats.totalMatches}</p>
                        <p className="text-sm text-slate-400">Total Matches</p>
                    </div>
                    <div className="card p-6 text-center border-blue-500/30">
                        <p className="text-3xl font-bold text-blue-400">{stats.upcomingMatches}</p>
                        <p className="text-sm text-slate-400">Upcoming</p>
                    </div>
                    <div className="card p-6 text-center border-emerald-500/30">
                        <p className="text-3xl font-bold text-emerald-400">{stats.completedMatches}</p>
                        <p className="text-sm text-slate-400">Completed</p>
                    </div>
                    <div className="card p-6 text-center border-amber-500/30">
                        <p className="text-3xl font-bold text-amber-400">{stats.totalUsers}</p>
                        <p className="text-sm text-slate-400">Total Users</p>
                    </div>
                    <div className="card p-6 text-center border-pink-500/30">
                        <p className="text-3xl font-bold text-pink-400">{stats.totalPredictions}</p>
                        <p className="text-sm text-slate-400">Predictions</p>
                    </div>
                    <Link href="/admin/users" className="card p-6 text-center border-red-500/30 hover:border-red-500/50 transition-colors">
                        <p className="text-3xl font-bold text-red-400">{stats.flaggedUsers}</p>
                        <p className="text-sm text-slate-400">Flagged 🚩</p>
                    </Link>
                </div>

                {/* Quick Actions */}
                <div className="grid md:grid-cols-2 gap-8 mb-12">
                    <div className="card p-6">
                        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
                        <div className="space-y-3">
                            <Link
                                href="/admin/matches/create"
                                className="flex items-center gap-3 p-4 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 transition-colors"
                            >
                                <span className="text-2xl">➕</span>
                                <div>
                                    <p className="font-medium text-white">Create New Match</p>
                                    <p className="text-sm text-slate-400">Add an upcoming match</p>
                                </div>
                            </Link>
                            <Link
                                href="/admin/matches"
                                className="flex items-center gap-3 p-4 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 transition-colors"
                            >
                                <span className="text-2xl">📋</span>
                                <div>
                                    <p className="font-medium text-white">Manage Matches</p>
                                    <p className="text-sm text-slate-400">Edit, delete, or declare results</p>
                                </div>
                            </Link>
                            <Link
                                href="/admin/quiz/create"
                                className="flex items-center gap-3 p-4 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-colors"
                            >
                                <span className="text-2xl">🎯</span>
                                <div>
                                    <p className="font-medium text-white">Create New Quiz</p>
                                    <p className="text-sm text-slate-400">Add a timed quiz question</p>
                                </div>
                            </Link>
                            <Link
                                href="/admin/quiz"
                                className="flex items-center gap-3 p-4 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 transition-colors"
                            >
                                <span className="text-2xl">📝</span>
                                <div>
                                    <p className="font-medium text-white">Manage Quizzes</p>
                                    <p className="text-sm text-slate-400">Edit, schedule, or end quizzes</p>
                                </div>
                            </Link>
                            <Link
                                href="/admin/users"
                                className="flex items-center gap-3 p-4 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition-colors"
                            >
                                <span className="text-2xl">🚩</span>
                                <div>
                                    <p className="font-medium text-white">View Flagged Users</p>
                                    <p className="text-sm text-slate-400">Review suspicious accounts</p>
                                </div>
                            </Link>
                        </div>
                    </div>

                    {/* Suspicious Activity Check */}
                    <div className="card p-6">
                        <h2 className="text-xl font-bold text-white mb-4">🔍 Security</h2>
                        <CheckSuspiciousButton />
                    </div>
                </div>

                {/* Recent Matches */}
                <div className="card p-6">
                    <h2 className="text-xl font-bold text-white mb-4">Recent Matches</h2>
                    {recentMatches.length > 0 ? (
                        <div className="space-y-3">
                            {recentMatches.map((match: any) => (
                                <Link
                                    key={match._id.toString()}
                                    href={`/admin/matches/${match._id}/edit`}
                                    className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors"
                                >
                                    <div>
                                        <p className="font-medium text-white">{match.title}</p>
                                        <p className="text-sm text-slate-400">
                                            {new Date(match.matchDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span className={`badge ${match.status === 'upcoming' ? 'badge-upcoming' :
                                        match.status === 'live' ? 'badge-live' : 'badge-completed'
                                        }`}>
                                        {match.status}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-400 text-center py-4">No matches created yet</p>
                    )}
                </div>
            </main>
        </div>
    );
}
