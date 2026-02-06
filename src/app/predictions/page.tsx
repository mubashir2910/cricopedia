'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface PredictionWithMatch {
    _id: string;
    matchId: {
        _id: string;
        title: string;
        matchDate: string;
        winner: string | null;
    } | null;
    predictedTeam: string;
    isCorrect: boolean | null;
    pointsEarned: number | null;
    createdAt: string;
}

// Skeleton loading component for the stats cards
function StatsSkeleton() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="card p-4 text-center animate-pulse">
                    <div className="h-8 bg-slate-700/50 rounded w-12 mx-auto mb-2"></div>
                    <div className="h-4 bg-slate-700/30 rounded w-20 mx-auto"></div>
                </div>
            ))}
        </div>
    );
}

// Skeleton loading component for the table rows
function TableSkeleton() {
    return (
        <div className="card overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-700/50">
                            <th className="text-left py-4 px-6 text-sm font-medium text-slate-400">Match</th>
                            <th className="text-left py-4 px-6 text-sm font-medium text-slate-400">Your Prediction</th>
                            <th className="text-left py-4 px-6 text-sm font-medium text-slate-400">Actual Winner</th>
                            <th className="text-center py-4 px-6 text-sm font-medium text-slate-400">Result</th>
                            <th className="text-right py-4 px-6 text-sm font-medium text-slate-400">Points</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[...Array(5)].map((_, i) => (
                            <tr key={i} className="border-b border-slate-700/30 animate-pulse">
                                <td className="py-4 px-6">
                                    <div className="h-5 bg-slate-700/50 rounded w-32 mb-2"></div>
                                    <div className="h-4 bg-slate-700/30 rounded w-20"></div>
                                </td>
                                <td className="py-4 px-6">
                                    <div className="h-6 bg-blue-500/20 rounded-full w-20"></div>
                                </td>
                                <td className="py-4 px-6">
                                    <div className="h-6 bg-slate-700/30 rounded-full w-20"></div>
                                </td>
                                <td className="py-4 px-6 text-center">
                                    <div className="h-6 bg-slate-700/30 rounded w-16 mx-auto"></div>
                                </td>
                                <td className="py-4 px-6 text-right">
                                    <div className="h-5 bg-slate-700/30 rounded w-10 ml-auto"></div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default function PredictionsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [predictions, setPredictions] = useState<PredictionWithMatch[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (status === 'loading') return;

        if (!session?.user || session.user.isAdmin) {
            router.push('/login');
            return;
        }

        const fetchPredictions = async () => {
            try {
                setLoading(true);
                const res = await fetch('/api/predictions');

                if (!res.ok) {
                    throw new Error('Failed to fetch predictions');
                }

                const data = await res.json();
                setPredictions(data.predictions || []);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Something went wrong');
            } finally {
                setLoading(false);
            }
        };

        fetchPredictions();
    }, [session, status, router]);

    // Calculate stats
    const totalPoints = predictions.reduce((sum, p) => sum + (p.pointsEarned || 0), 0);
    const correctCount = predictions.filter((p) => p.isCorrect === true).length;
    const wrongCount = predictions.filter((p) => p.isCorrect === false).length;
    const pendingCount = predictions.filter((p) => p.isCorrect === null).length;

    // Show loading state while session is being checked
    if (status === 'loading') {
        return (
            <div className="min-h-screen" style={{ background: 'var(--gradient-dark)' }}>
                <Header />
                <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <h1 className="text-3xl font-bold text-white mb-8">📋 My Predictions</h1>
                    <StatsSkeleton />
                    <TableSkeleton />
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ background: 'var(--gradient-dark)' }}>
            <Header />

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold text-white mb-8">📋 My Predictions</h1>

                {/* Error State */}
                {error && (
                    <div className="card p-6 mb-8 border border-red-500/30 bg-red-500/10">
                        <p className="text-red-400 text-center">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="btn-primary mx-auto mt-4 block"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Stats - Show skeleton while loading */}
                {loading ? (
                    <StatsSkeleton />
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="card p-4 text-center">
                            <p className="text-2xl font-bold text-white">{predictions.length}</p>
                            <p className="text-sm text-slate-400">Total Predictions</p>
                        </div>
                        <div className="card p-4 text-center">
                            <p className="text-2xl font-bold text-emerald-400">{correctCount}</p>
                            <p className="text-sm text-slate-400">Correct</p>
                        </div>
                        <div className="card p-4 text-center">
                            <p className="text-2xl font-bold text-red-400">{wrongCount}</p>
                            <p className="text-sm text-slate-400">Wrong</p>
                        </div>
                        <div className="card p-4 text-center">
                            <p className="text-2xl font-bold text-blue-400">{pendingCount}</p>
                            <p className="text-sm text-slate-400">Pending</p>
                        </div>
                    </div>
                )}

                {/* Predictions Table */}
                {loading ? (
                    <TableSkeleton />
                ) : predictions.length > 0 ? (
                    <div className="card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-700/50">
                                        <th className="text-left py-4 px-6 text-sm font-medium text-slate-400">Match</th>
                                        <th className="text-left py-4 px-6 text-sm font-medium text-slate-400">Your Prediction</th>
                                        <th className="text-left py-4 px-6 text-sm font-medium text-slate-400">Actual Winner</th>
                                        <th className="text-center py-4 px-6 text-sm font-medium text-slate-400">Result</th>
                                        <th className="text-right py-4 px-6 text-sm font-medium text-slate-400">Points</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {predictions.map((prediction, index) => {
                                        const match = prediction.matchId;
                                        return (
                                            <tr
                                                key={prediction._id}
                                                className="border-b border-slate-700/30 hover:bg-white/5 transition-colors"
                                                style={{ animationDelay: `${index * 50}ms` }}
                                            >
                                                <td className="py-4 px-6">
                                                    <p className="font-medium text-white">{match?.title || 'Unknown Match'}</p>
                                                    <p className="text-sm text-slate-400">
                                                        {match?.matchDate
                                                            ? new Date(match.matchDate).toLocaleDateString()
                                                            : '-'}
                                                    </p>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm font-medium">
                                                        {prediction.predictedTeam}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    {match?.winner ? (
                                                        <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-medium">
                                                            {match.winner}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-500">-</span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-6 text-center">
                                                    {prediction.isCorrect === null ? (
                                                        <span className="badge badge-upcoming">Pending</span>
                                                    ) : prediction.isCorrect ? (
                                                        <span className="text-emerald-400 font-bold">✓ Correct</span>
                                                    ) : (
                                                        <span className="text-red-400 font-bold">✗ Wrong</span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    {prediction.pointsEarned !== null ? (
                                                        <span
                                                            className={`font-bold ${prediction.pointsEarned > 0 ? 'text-emerald-400' : 'text-red-400'
                                                                }`}
                                                        >
                                                            {prediction.pointsEarned > 0 ? '+' : ''}{prediction.pointsEarned}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-500">-</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : !error && (
                    <div className="card p-12 text-center">
                        <div className="text-6xl mb-4">📝</div>
                        <h2 className="text-xl font-bold text-white mb-2">No Predictions Yet</h2>
                        <p className="text-slate-400 mb-6">
                            Start predicting match outcomes to see them here!
                        </p>
                        <a href="/dashboard" className="btn-primary inline-block">
                            View Matches
                        </a>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
