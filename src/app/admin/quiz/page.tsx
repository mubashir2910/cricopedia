'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface Quiz {
    _id: string;
    questionNumber: number;
    questionText: string;
    optionA: string;
    optionB: string;
    correctOption: 'A' | 'B';
    startTime: string;
    endTime: string;
    status: 'draft' | 'scheduled' | 'live' | 'ended';
    correctPoints: number;
    wrongPenalty: number;
    createdAt: string;
}

export default function AdminQuizListPage() {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('');

    useEffect(() => {
        fetchQuizzes();
    }, [filter]);

    const fetchQuizzes = async () => {
        try {
            setLoading(true);
            const url = filter ? `/api/quiz?status=${filter}` : '/api/quiz';
            const res = await fetch(url);
            const data = await res.json();
            setQuizzes(data.quizzes || []);
        } catch (error) {
            console.error('Failed to fetch quizzes:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (quizId: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/quiz/${quizId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (res.ok) {
                fetchQuizzes();
            }
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    const deleteQuiz = async (quizId: string) => {
        if (!confirm('Are you sure you want to delete this quiz?')) return;

        try {
            const res = await fetch(`/api/quiz/${quizId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                fetchQuizzes();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to delete quiz');
            }
        } catch (error) {
            console.error('Failed to delete quiz:', error);
        }
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            draft: 'bg-slate-500/20 text-slate-400',
            scheduled: 'bg-blue-500/20 text-blue-400',
            live: 'bg-emerald-500/20 text-emerald-400',
            ended: 'bg-purple-500/20 text-purple-400',
        };
        return styles[status] || styles.draft;
    };

    return (
        <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)' }}>
            <header className="border-b border-white/10 bg-slate-900/50">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin" className="text-slate-400 hover:text-white">
                            ← Back
                        </Link>
                        <h1 className="text-xl font-bold text-white">Quiz Management</h1>
                    </div>
                    <Link
                        href="/admin/quiz/create"
                        className="px-4 py-2 rounded-lg text-white font-medium transition-all"
                        style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)' }}
                    >
                        + Create Quiz
                    </Link>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {['', 'draft', 'scheduled', 'live', 'ended'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${filter === status
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
                                }`}
                        >
                            {status || 'All'} {status === '' ? `(${quizzes.length})` : ''}
                        </button>
                    ))}
                </div>

                {/* Quiz List */}
                {loading ? (
                    <div className="grid gap-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="card p-6 animate-pulse">
                                <div className="h-6 bg-slate-700/50 rounded w-1/3 mb-4"></div>
                                <div className="h-4 bg-slate-700/30 rounded w-2/3"></div>
                            </div>
                        ))}
                    </div>
                ) : quizzes.length === 0 ? (
                    <div className="card p-12 text-center">
                        <div className="text-6xl mb-4">🎯</div>
                        <h2 className="text-xl font-bold text-white mb-2">No Quizzes Yet</h2>
                        <p className="text-slate-400 mb-6">Create your first quiz to get started!</p>
                        <Link
                            href="/admin/quiz/create"
                            className="btn-primary inline-block"
                        >
                            Create Quiz
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {quizzes.map((quiz, index) => (
                            <motion.div
                                key={quiz._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="card p-6"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-emerald-400 font-bold">
                                                Q{quiz.questionNumber}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusBadge(quiz.status)}`}>
                                                {quiz.status.toUpperCase()}
                                            </span>
                                        </div>
                                        <p className="text-white font-medium mb-2 truncate">
                                            {quiz.questionText}
                                        </p>
                                        <div className="flex gap-4 text-sm text-slate-400">
                                            <span>A: {quiz.optionA}</span>
                                            <span>B: {quiz.optionB}</span>
                                            <span className="text-emerald-400">
                                                ✓ {quiz.correctOption}
                                            </span>
                                        </div>
                                        <div className="flex gap-4 mt-2 text-xs text-slate-500">
                                            <span>Start: {new Date(quiz.startTime).toLocaleString()}</span>
                                            <span>End: {new Date(quiz.endTime).toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {quiz.status === 'draft' && (
                                            <>
                                                <button
                                                    onClick={() => updateStatus(quiz._id, 'scheduled')}
                                                    className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 text-sm hover:bg-blue-500/30"
                                                >
                                                    Schedule
                                                </button>
                                                <Link
                                                    href={`/admin/quiz/${quiz._id}`}
                                                    className="px-3 py-1.5 rounded-lg bg-slate-700/50 text-slate-300 text-sm hover:bg-slate-600/50"
                                                >
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() => deleteQuiz(quiz._id)}
                                                    className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-sm hover:bg-red-500/30"
                                                >
                                                    Delete
                                                </button>
                                            </>
                                        )}
                                        {quiz.status === 'scheduled' && (
                                            <>
                                                <span className="px-3 py-1.5 text-blue-400 text-xs">
                                                    Auto-live at start time
                                                </span>
                                                <Link
                                                    href={`/admin/quiz/${quiz._id}`}
                                                    className="px-3 py-1.5 rounded-lg bg-slate-700/50 text-slate-300 text-sm hover:bg-slate-600/50"
                                                >
                                                    Edit
                                                </Link>
                                            </>
                                        )}
                                        {quiz.status === 'live' && (
                                            <span className="px-3 py-1.5 text-emerald-400 text-xs">
                                                🔴 Currently Live
                                            </span>
                                        )}
                                        {quiz.status === 'ended' && (
                                            <span className="px-3 py-1.5 text-slate-500 text-sm">
                                                Completed
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
