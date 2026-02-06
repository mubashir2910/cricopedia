'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';

interface LeaderboardEntry {
    rank: number;
    username: string;
    points: number;
    correctPredictions: number;
    wrongPredictions: number;
    badges: string[];
    streak: number;
}

export default function LeaderboardPage() {
    const { data: session } = useSession();
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [visibleCount, setVisibleCount] = useState(10);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await fetch('/api/leaderboard');
                const data = await res.json();
                if (res.ok) {
                    setLeaderboard(data.leaderboard);
                }
            } catch (error) {
                console.error('Failed to fetch leaderboard:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    const getMedalEmoji = (rank: number) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return rank;
    };

    const getMedalClass = (rank: number) => {
        if (rank === 1) return 'medal-gold';
        if (rank === 2) return 'medal-silver';
        if (rank === 3) return 'medal-bronze';
        return '';
    };

    if (isLoading) {
        return (
            <div className="min-h-screen" style={{ background: 'var(--gradient-dark)' }}>
                <Header />
                <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header Skeleton */}
                    <div className="text-center mb-12">
                        <div className="h-10 w-64 bg-slate-700/50 rounded-lg mx-auto mb-4 animate-pulse" />
                        <div className="h-5 w-80 bg-slate-700/30 rounded mx-auto animate-pulse" />
                    </div>

                    {/* Top 3 Skeleton */}
                    <div className="space-y-3 mb-8 max-w-2xl mx-auto">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="flex items-center gap-3 p-4 rounded-xl border border-slate-700/30 bg-slate-800/30 animate-pulse"
                            >
                                <div className="w-10 h-10 rounded-full bg-slate-700/50" />
                                <div className="flex-1">
                                    <div className="h-5 w-32 bg-slate-700/50 rounded" />
                                </div>
                                <div className="text-right">
                                    <div className="h-6 w-16 bg-slate-700/50 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Table Skeleton */}
                    <div className="card overflow-hidden">
                        <div className="p-4 border-b border-slate-700/50">
                            <div className="flex gap-4">
                                <div className="h-4 w-12 bg-slate-700/30 rounded animate-pulse" />
                                <div className="h-4 w-24 bg-slate-700/30 rounded animate-pulse" />
                                <div className="h-4 w-16 bg-slate-700/30 rounded animate-pulse ml-auto" />
                            </div>
                        </div>
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="p-4 border-b border-slate-700/30 flex items-center gap-4 animate-pulse">
                                <div className="w-8 h-8 rounded-full bg-slate-700/40" />
                                <div className="flex-1">
                                    <div className="h-4 w-28 bg-slate-700/40 rounded mb-2" />
                                    <div className="h-3 w-20 bg-slate-700/20 rounded" />
                                </div>
                                <div className="h-5 w-12 bg-slate-700/40 rounded" />
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ background: 'var(--gradient-dark)' }}>
            <Header />

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4">
                        <span className="gradient-text">🏆 Leaderboard</span>
                    </h1>
                    <p className="text-slate-400">Who will be crowned the ultimate predictor?</p>
                </div>

                {/* Top 3 - Horizontal Layout */}
                {leaderboard.length >= 1 && (
                    <div className="space-y-3 mb-8 max-w-2xl mx-auto">
                        {/* 1st Place */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-3 p-4 rounded-xl border-2 border-amber-500/50"
                            style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.1) 100%)' }}
                        >
                            <span className="text-3xl medal-gold animate-float">🥇</span>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-white text-lg truncate">{leaderboard[0]?.username}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-amber-400">{leaderboard[0]?.points}</p>
                                <p className="text-xs text-slate-400">points</p>
                            </div>
                            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-medium whitespace-nowrap">
                                👑 Leading
                            </span>
                        </motion.div>

                        {/* 2nd Place */}
                        {leaderboard.length >= 2 && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                                className="flex items-center gap-3 p-4 rounded-xl border border-slate-500/30"
                                style={{ background: 'linear-gradient(135deg, rgba(148, 163, 184, 0.1) 0%, rgba(100, 116, 139, 0.05) 100%)' }}
                            >
                                <span className="text-2xl medal-silver">🥈</span>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-white truncate">{leaderboard[1]?.username}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-bold text-slate-300">{leaderboard[1]?.points}</p>
                                    <p className="text-xs text-slate-500">points</p>
                                </div>
                            </motion.div>
                        )}

                        {/* 3rd Place */}
                        {leaderboard.length >= 3 && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="flex items-center gap-3 p-4 rounded-xl border border-orange-900/30"
                                style={{ background: 'linear-gradient(135deg, rgba(180, 83, 9, 0.1) 0%, rgba(146, 64, 14, 0.05) 100%)' }}
                            >
                                <span className="text-2xl medal-bronze">🥉</span>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-white truncate">{leaderboard[2]?.username}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-bold text-orange-400">{leaderboard[2]?.points}</p>
                                    <p className="text-xs text-slate-500">points</p>
                                </div>
                            </motion.div>
                        )}
                    </div>
                )}

                {/* Full Leaderboard Table */}
                {leaderboard.length > 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="card overflow-hidden"
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-700/50">
                                        <th className="text-center py-4 px-4 text-sm font-medium text-slate-400 w-16">Rank</th>
                                        <th className="text-left py-4 px-4 text-sm font-medium text-slate-400">Player</th>
                                        <th className="text-center py-4 px-4 text-sm font-medium text-slate-400">Correct</th>
                                        <th className="text-center py-4 px-4 text-sm font-medium text-slate-400">Streak</th>
                                        <th className="text-right py-4 px-4 text-sm font-medium text-slate-400">Points</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaderboard.slice(0, visibleCount).map((entry, index) => {
                                        const isCurrentUser = session?.user?.email?.split('@')[0] === entry.username;
                                        const isTop3 = entry.rank <= 3;

                                        return (
                                            <motion.tr
                                                key={entry.username}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.3 + index * 0.05 }}
                                                className={`border-b border-slate-700/30 transition-colors ${isTop3 ? 'table-row top-3' : 'table-row'
                                                    } ${isCurrentUser ? 'bg-emerald-500/10' : ''}`}
                                            >
                                                <td className="py-4 px-4 text-center">
                                                    <span className={`text-xl font-bold ${getMedalClass(entry.rank)}`}>
                                                        {getMedalEmoji(entry.rank)}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-bold">
                                                            {entry.username.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className={`font-medium ${isCurrentUser ? 'text-emerald-400' : 'text-white'}`}>
                                                                {entry.username}
                                                                {isCurrentUser && <span className="ml-2 text-xs">(You)</span>}
                                                            </p>
                                                            {entry.badges?.length > 0 && (
                                                                <div className="flex gap-1 mt-1">
                                                                    {entry.badges.slice(0, 3).map((badge, i) => (
                                                                        <span key={i} className="text-xs" title={badge}>
                                                                            {badge === 'Prediction Master' && '🎯'}
                                                                            {badge === 'Comeback King' && '👑'}
                                                                            {badge === 'World Cup Prophet' && '🔮'}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4 text-center">
                                                    <span className="text-emerald-400 font-medium">{entry.correctPredictions}</span>
                                                </td>
                                                <td className="py-4 px-4 text-center">
                                                    {entry.streak > 0 ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-orange-500/20 text-orange-400 text-sm">
                                                            🔥 {entry.streak}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-500">-</span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-4 text-right">
                                                    <span className={`text-xl font-bold ${entry.points >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                        {entry.points}
                                                    </span>
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        {visibleCount < leaderboard.length && (
                            <div className="p-4 border-t border-slate-700/50">
                                <button
                                    onClick={() => setVisibleCount((prev) => prev + 10)}
                                    className="w-full py-3 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:border-slate-500 transition-all font-medium"
                                >
                                    View More ({leaderboard.length - visibleCount} remaining)
                                </button>
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <div className="card p-12 text-center">
                        <div className="text-6xl mb-4">🏆</div>
                        <h2 className="text-xl font-bold text-white mb-2">No Players Yet</h2>
                        <p className="text-slate-400">Be the first to make a prediction and claim the top spot!</p>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
