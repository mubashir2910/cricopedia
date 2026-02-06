'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface Quiz {
    _id: string;
    questionNumber: number;
    questionText: string;
    startTime: string;
    endTime: string;
    status: string;
    computedStatus: 'scheduled' | 'live' | 'ended';
}

interface QuizAttempt {
    _id: string;
    quizId: {
        _id: string;
        questionNumber: number;
        questionText: string;
        optionA: string;
        optionB: string;
        correctOption: 'A' | 'B';
        correctPoints: number;
        wrongPenalty: number;
    };
    selectedOption: 'A' | 'B' | null;
    isCorrect: boolean | null;
    pointsAwarded: number;
    startedAt: string;
    submittedAt: string | null;
    isTimeout: boolean;
}

interface Stats {
    total: number;
    correct: number;
    wrong: number;
    timeout: number;
    unanswered: number;
}

// Skeleton loaders
function QuizCardSkeleton() {
    return (
        <div className="card p-6 animate-pulse">
            <div className="h-6 bg-slate-700/50 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-slate-700/30 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-slate-700/30 rounded w-1/2"></div>
        </div>
    );
}

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

export default function QuizHubPage() {
    const { data: session, status: sessionStatus } = useSession();
    const router = useRouter();

    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [endedQuizzes, setEndedQuizzes] = useState<Quiz[]>([]);
    const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loadingQuizzes, setLoadingQuizzes] = useState(true);
    const [loadingHistory, setLoadingHistory] = useState(true);

    // Track which ended quizzes the user attempted
    const [attemptedQuizIds, setAttemptedQuizIds] = useState<Set<string>>(new Set());

    // Pagination for Recent Quizzes
    const [visibleEndedCount, setVisibleEndedCount] = useState(3);

    useEffect(() => {
        if (sessionStatus === 'loading') return;

        if (!session?.user || session.user.isAdmin) {
            router.push('/login');
            return;
        }

        fetchQuizzes();
        fetchHistory();

        // Refresh quizzes every 30 seconds to catch status changes
        const interval = setInterval(fetchQuizzes, 30000);
        return () => clearInterval(interval);
    }, [session, sessionStatus, router]);

    const fetchQuizzes = async () => {
        try {
            // Fetch all quizzes including ended ones
            const res = await fetch('/api/quiz?includeEnded=true');
            const data = await res.json();
            const allQuizzes = data.quizzes || [];

            // Separate live/scheduled from ended
            const active = allQuizzes.filter((q: Quiz) =>
                q.computedStatus === 'live' || q.computedStatus === 'scheduled'
            );
            const ended = allQuizzes.filter((q: Quiz) => q.computedStatus === 'ended');

            setQuizzes(active);
            setEndedQuizzes(ended); // Store all ended quizzes
        } catch (error) {
            console.error('Failed to fetch quizzes:', error);
        } finally {
            setLoadingQuizzes(false);
        }
    };

    const fetchHistory = async () => {
        try {
            const res = await fetch('/api/user/quiz-history?limit=50');
            const data = await res.json();
            const allAttempts = data.attempts || [];
            setAttempts(allAttempts.slice(0, 10)); // Show last 10 in table
            setStats(data.stats || null);

            // Track which quiz IDs the user attempted
            const ids = new Set(allAttempts.map((a: QuizAttempt) => a.quizId?._id).filter(Boolean));
            setAttemptedQuizIds(ids as Set<string>);
        } catch (error) {
            console.error('Failed to fetch history:', error);
        } finally {
            setLoadingHistory(false);
        }
    };

    // Get user's attempt for a specific quiz
    const getAttemptForQuiz = (quizId: string) => {
        return attempts.find(a => a.quizId?._id === quizId);
    };

    if (sessionStatus === 'loading') {
        return (
            <div className="min-h-screen" style={{ background: 'var(--gradient-dark)' }}>
                <Header />
                <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <h1 className="text-3xl font-bold text-white mb-8">🎯 Quiz</h1>
                    <QuizCardSkeleton />
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ background: 'var(--gradient-dark)' }}>
            <Header />

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold text-white mb-8">🎯 Quiz</h1>

                {/* Available Quizzes (Live + Upcoming) */}
                <section className="mb-12">
                    <h2 className="text-xl font-bold text-white mb-4">Available Quizzes</h2>

                    {loadingQuizzes ? (
                        <div className="space-y-4">
                            <QuizCardSkeleton />
                            <QuizCardSkeleton />
                        </div>
                    ) : quizzes.length === 0 ? (
                        <div className="card p-8 text-center">
                            <div className="text-4xl mb-4">📭</div>
                            <p className="text-slate-400">No quizzes available right now. Check back later!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {quizzes.map((quiz, index) => {
                                const isLive = quiz.computedStatus === 'live';
                                return (
                                    <motion.div
                                        key={quiz._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <Link
                                            href={isLive ? `/quiz/${quiz._id}` : '#'}
                                            className={`card p-6 block transition-all ${isLive
                                                ? 'hover:border-emerald-500/50 cursor-pointer'
                                                : 'opacity-60 cursor-not-allowed'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-emerald-400 font-bold text-lg">
                                                    Question #{quiz.questionNumber}
                                                </span>
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-medium border ${isLive
                                                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                                        : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                                                        }`}
                                                >
                                                    {isLive ? '🔴 LIVE' : '⏳ Upcoming'}
                                                </span>
                                            </div>

                                            {/* Never show question text on listing - prevent cheating */}
                                            {isLive ? (
                                                <p className="text-amber-400 font-medium mb-3 flex items-center gap-2">
                                                    <span className="text-xl">🔒</span>
                                                    <span>Click to attempt - Question revealed after timer starts!</span>
                                                </p>
                                            ) : (
                                                <p className="text-slate-400 italic mb-3">
                                                    Question will be revealed when quiz goes live
                                                </p>
                                            )}

                                            <div className="flex gap-4 text-sm text-slate-400">
                                                <span>Start: {new Date(quiz.startTime).toLocaleString()}</span>
                                                <span>End: {new Date(quiz.endTime).toLocaleString()}</span>
                                            </div>
                                            {isLive && (
                                                <div className="mt-4">
                                                    <span className="px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 font-medium text-sm">
                                                        🎯 Attempt Now →
                                                    </span>
                                                </div>
                                            )}
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* Recent Quizzes (Ended) */}
                {!loadingQuizzes && endedQuizzes.length > 0 && (
                    <section className="mb-12">
                        <h2 className="text-xl font-bold text-white mb-4">📜 Recent Quizzes</h2>
                        <div className="space-y-3">
                            {endedQuizzes.slice(0, visibleEndedCount).map((quiz) => {
                                const attempt = getAttemptForQuiz(quiz._id);
                                const didAttempt = attemptedQuizIds.has(quiz._id);

                                return (
                                    <div
                                        key={quiz._id}
                                        className="card p-4 flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-4">
                                            <span className="text-slate-400 font-medium">
                                                Q{quiz.questionNumber}
                                            </span>
                                            <span className="text-white">
                                                {quiz.questionText.length > 50
                                                    ? quiz.questionText.substring(0, 50) + '...'
                                                    : quiz.questionText}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {didAttempt ? (
                                                <>
                                                    {attempt?.isTimeout ? (
                                                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400">
                                                            ⏱ Timeout
                                                        </span>
                                                    ) : attempt?.isCorrect ? (
                                                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400">
                                                            ✓ Correct
                                                        </span>
                                                    ) : (
                                                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
                                                            ✗ Wrong
                                                        </span>
                                                    )}
                                                    <span className={`font-bold ${(attempt?.pointsAwarded || 0) > 0
                                                        ? 'text-emerald-400'
                                                        : (attempt?.pointsAwarded || 0) < 0
                                                            ? 'text-red-400'
                                                            : 'text-slate-500'
                                                        }`}>
                                                        {(attempt?.pointsAwarded || 0) > 0 ? '+' : ''}
                                                        {attempt?.pointsAwarded || 0} pts
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-500/20 text-slate-400">
                                                    Missed
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {visibleEndedCount < endedQuizzes.length && (
                            <button
                                onClick={() => setVisibleEndedCount((prev) => prev + 5)}
                                className="mt-4 w-full py-3 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:border-slate-500 transition-all font-medium"
                            >
                                View More ({endedQuizzes.length - visibleEndedCount} remaining)
                            </button>
                        )}
                    </section>
                )}

                {/* My Quiz Performance */}
                <section>
                    <h2 className="text-xl font-bold text-white mb-4">📊 My Quiz Performance</h2>

                    {/* Stats */}
                    {loadingHistory ? (
                        <StatsSkeleton />
                    ) : stats ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className="card p-4 text-center">
                                <p className="text-2xl font-bold text-white">{stats.total}</p>
                                <p className="text-sm text-slate-400">Attempted</p>
                            </div>
                            <div className="card p-4 text-center">
                                <p className="text-2xl font-bold text-emerald-400">{stats.correct}</p>
                                <p className="text-sm text-slate-400">Correct</p>
                            </div>
                            <div className="card p-4 text-center">
                                <p className="text-2xl font-bold text-red-400">{stats.wrong}</p>
                                <p className="text-sm text-slate-400">Wrong</p>
                            </div>
                            <div className="card p-4 text-center">
                                <p className="text-2xl font-bold text-amber-400">{stats.timeout}</p>
                                <p className="text-sm text-slate-400">Missed</p>
                            </div>
                        </div>
                    ) : null}

                    {/* Recent Attempts Table */}
                    {loadingHistory ? (
                        <div className="card p-6 animate-pulse">
                            <div className="h-4 bg-slate-700/30 rounded w-full mb-4"></div>
                            <div className="h-4 bg-slate-700/30 rounded w-3/4 mb-4"></div>
                            <div className="h-4 bg-slate-700/30 rounded w-1/2"></div>
                        </div>
                    ) : attempts.length === 0 ? (
                        <div className="card p-8 text-center">
                            <div className="text-4xl mb-4">📝</div>
                            <p className="text-slate-400">No quiz attempts yet. Start answering quizzes!</p>
                        </div>
                    ) : (
                        <div className="card overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-700/50">
                                            <th className="text-left py-4 px-6 text-sm font-medium text-slate-400">
                                                Question
                                            </th>
                                            <th className="text-left py-4 px-6 text-sm font-medium text-slate-400">
                                                Your Answer
                                            </th>
                                            <th className="text-left py-4 px-6 text-sm font-medium text-slate-400">
                                                Correct
                                            </th>
                                            <th className="text-center py-4 px-6 text-sm font-medium text-slate-400">
                                                Result
                                            </th>
                                            <th className="text-right py-4 px-6 text-sm font-medium text-slate-400">
                                                Points
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {attempts.map((attempt) => (
                                            <tr
                                                key={attempt._id}
                                                className="border-b border-slate-700/30 hover:bg-white/5"
                                            >
                                                <td className="py-4 px-6">
                                                    <span className="text-emerald-400 font-medium">
                                                        Q{attempt.quizId?.questionNumber || '?'}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    {attempt.isTimeout ? (
                                                        <span className="text-amber-400">Timeout</span>
                                                    ) : attempt.selectedOption ? (
                                                        <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400 text-sm">
                                                            {attempt.selectedOption}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-500">-</span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 text-sm">
                                                        {attempt.quizId?.correctOption || '?'}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-center">
                                                    {attempt.isTimeout ? (
                                                        <span className="text-amber-400">⏱ Missed</span>
                                                    ) : attempt.isCorrect === true ? (
                                                        <span className="text-emerald-400 font-bold">✓ Correct</span>
                                                    ) : attempt.isCorrect === false ? (
                                                        <span className="text-red-400 font-bold">✗ Wrong</span>
                                                    ) : (
                                                        <span className="text-slate-500">-</span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    <span
                                                        className={`font-bold ${attempt.pointsAwarded > 0
                                                            ? 'text-emerald-400'
                                                            : attempt.pointsAwarded < 0
                                                                ? 'text-red-400'
                                                                : 'text-slate-500'
                                                            }`}
                                                    >
                                                        {attempt.pointsAwarded > 0 ? '+' : ''}
                                                        {attempt.pointsAwarded}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </section>
            </main>

            <Footer />
        </div>
    );
}
