'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface Quiz {
    _id: string;
    questionNumber: number;
    questionText: string;
    startTime: string;
    endTime: string;
    status: string;
    computedStatus?: string;
}

export default function QuizBanner() {
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const res = await fetch('/api/quiz');
                const data = await res.json();
                const quizzes = data.quizzes || [];

                // Find a live quiz (using computedStatus from API)
                const now = new Date();
                const liveQuiz = quizzes.find((q: Quiz) => {
                    const computedStatus = q.computedStatus || q.status;
                    if (computedStatus !== 'live') return false;
                    const start = new Date(q.startTime);
                    const end = new Date(q.endTime);
                    return now >= start && now <= end;
                });

                // If no live quiz, show upcoming one
                const upcomingQuiz = quizzes.find((q: Quiz) => {
                    const computedStatus = q.computedStatus || q.status;
                    return computedStatus === 'scheduled';
                });

                setQuiz(liveQuiz || upcomingQuiz || null);
            } catch (error) {
                console.error('Failed to fetch quiz:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchQuiz();
        // Refresh every 30 seconds
        const interval = setInterval(fetchQuiz, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading || !quiz) {
        return null;
    }

    const now = new Date();
    const isLive = (quiz.computedStatus === 'live' || quiz.status === 'live') &&
        now >= new Date(quiz.startTime) &&
        now <= new Date(quiz.endTime);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6"
            >
                <Link href="/quiz" className="block">
                    <div
                        className="relative overflow-hidden rounded-2xl p-4 sm:p-6 transition-all hover:scale-[1.01]"
                        style={{
                            background: isLive
                                ? 'linear-gradient(135deg, #059669 0%, #0d9488 50%, #0891b2 100%)'
                                : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
                        }}
                    >
                        {/* Animated background pattern */}
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
                            <div className="absolute bottom-0 right-0 w-48 h-48 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
                        </div>

                        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            {/* Title row - icon and text always on same line */}
                            <div className="flex items-center justify-between sm:flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl sm:text-3xl">🎯</span>
                                    <h3 className="text-lg sm:text-xl font-bold text-white whitespace-nowrap">
                                        {isLive ? 'Quiz is LIVE!' : 'Answer Quiz'}
                                    </h3>
                                    {isLive && (
                                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 text-white text-xs font-medium">
                                            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                            LIVE
                                        </span>
                                    )}
                                </div>
                                {/* Button - visible on mobile in header row */}
                                <span
                                    className="sm:hidden px-3 py-1.5 rounded-lg font-semibold text-xs whitespace-nowrap"
                                    style={{
                                        background: 'rgba(255,255,255,0.2)',
                                        color: 'white',
                                    }}
                                >
                                    {isLive ? 'Answer →' : 'View →'}
                                </span>
                            </div>

                            {/* Subtitle and desktop button row */}
                            <div className="flex items-center justify-between gap-4">
                                <p className="text-white/80 text-sm whitespace-nowrap">
                                    {isLive
                                        ? `Q${quiz.questionNumber} - Answer now!`
                                        : 'Predict fast. Earn points.'}
                                </p>
                                {/* Desktop button */}
                                <span
                                    className="hidden sm:inline-block px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap"
                                    style={{
                                        background: 'rgba(255,255,255,0.2)',
                                        color: 'white',
                                    }}
                                >
                                    {isLive ? 'Answer Now →' : 'View Quizzes →'}
                                </span>
                            </div>
                        </div>
                    </div>
                </Link>
            </motion.div>
        </AnimatePresence>
    );
}
