'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface QuizData {
    _id: string;
    questionNumber: number;
    questionText: string;
    optionA: string;
    optionB: string;
}

interface AttemptState {
    alreadySubmitted: boolean;
    isTimeout: boolean;
    remainingMs: number;
}

interface SubmitResult {
    success: boolean;
    isCorrect?: boolean;
    correctOption?: 'A' | 'B';
    pointsAwarded?: number;
    message?: string;
    isTimeout?: boolean;
}

export default function QuizAttemptPage() {
    const { data: session, status: sessionStatus } = useSession();
    const router = useRouter();
    const params = useParams();
    const quizId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [quiz, setQuiz] = useState<QuizData | null>(null);
    const [attemptState, setAttemptState] = useState<AttemptState | null>(null);
    const [selectedOption, setSelectedOption] = useState<'A' | 'B' | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState<SubmitResult | null>(null);
    const [timeLeft, setTimeLeft] = useState(10000);

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const startTimeRef = useRef<number>(0);

    // Start or resume quiz attempt
    const startQuiz = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/quiz/attempt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quizId }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Failed to start quiz');
                return;
            }

            setQuiz(data.quiz);
            setAttemptState({
                alreadySubmitted: data.alreadySubmitted,
                isTimeout: data.isTimeout,
                remainingMs: data.remainingMs,
            });

            if (data.alreadySubmitted || data.isTimeout) {
                // Quiz already completed
                setTimeLeft(0);
            } else {
                // Start timer
                setTimeLeft(data.remainingMs);
                startTimeRef.current = Date.now();
            }
        } catch (err) {
            setError('Something went wrong');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [quizId]);

    // Initialize quiz on mount
    useEffect(() => {
        if (sessionStatus === 'loading') return;

        if (!session?.user || session.user.isAdmin) {
            router.push('/login');
            return;
        }

        startQuiz();
    }, [session, sessionStatus, router, startQuiz]);

    // Timer countdown
    useEffect(() => {
        if (loading || result || attemptState?.alreadySubmitted || attemptState?.isTimeout) {
            return;
        }

        if (timeLeft <= 0) {
            // Time's up!
            handleTimeout();
            return;
        }

        timerRef.current = setInterval(() => {
            const elapsed = Date.now() - startTimeRef.current;
            const remaining = (attemptState?.remainingMs || 10000) - elapsed;
            setTimeLeft(Math.max(0, remaining));

            if (remaining <= 0) {
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                }
            }
        }, 100);

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [loading, result, attemptState, timeLeft]);

    const handleTimeout = async () => {
        setResult({
            success: false,
            isTimeout: true,
            message: "Time's up! You didn't answer in time.",
            pointsAwarded: 0,
        });
    };

    const handleSubmit = async (option: 'A' | 'B') => {
        if (submitting || result || timeLeft <= 0) return;

        setSelectedOption(option);
        setSubmitting(true);

        // Stop timer
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        try {
            const res = await fetch('/api/quiz/attempt/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quizId, selectedOption: option }),
            });

            const data = await res.json();

            if (!res.ok && !data.isTimeout) {
                setError(data.error || 'Failed to submit answer');
                return;
            }

            setResult(data);
        } catch (err) {
            setError('Failed to submit answer');
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    // Format time display
    const formatTime = (ms: number) => {
        const seconds = Math.ceil(ms / 1000);
        return seconds;
    };

    // Timer color based on remaining time
    const getTimerColor = () => {
        if (timeLeft > 5000) return 'text-emerald-400';
        if (timeLeft > 2000) return 'text-amber-400';
        return 'text-red-400';
    };

    // Timer progress percentage
    const timerProgress = (timeLeft / 10000) * 100;

    if (sessionStatus === 'loading' || loading) {
        return (
            <div className="min-h-screen" style={{ background: 'var(--gradient-dark)' }}>
                <Header />
                <main className="max-w-2xl mx-auto px-4 py-8">
                    <div className="card p-8 text-center animate-pulse">
                        <div className="h-8 bg-slate-700/50 rounded w-1/3 mx-auto mb-6"></div>
                        <div className="h-6 bg-slate-700/30 rounded w-2/3 mx-auto mb-4"></div>
                        <div className="h-16 bg-slate-700/30 rounded w-full mb-4"></div>
                        <div className="h-16 bg-slate-700/30 rounded w-full"></div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (error && !quiz) {
        return (
            <div className="min-h-screen" style={{ background: 'var(--gradient-dark)' }}>
                <Header />
                <main className="max-w-2xl mx-auto px-4 py-8">
                    <div className="card p-8 text-center">
                        <div className="text-6xl mb-4">❌</div>
                        <h2 className="text-xl font-bold text-white mb-2">Error</h2>
                        <p className="text-red-400 mb-6">{error}</p>
                        <Link href="/quiz" className="btn-primary inline-block">
                            Back to Quiz Hub
                        </Link>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ background: 'var(--gradient-dark)' }}>
            <Header />

            <main className="max-w-2xl mx-auto px-4 py-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="card p-8"
                >
                    {/* Timer Bar */}
                    {!result && !attemptState?.alreadySubmitted && !attemptState?.isTimeout && (
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-400 text-sm">Time Remaining</span>
                                <span className={`text-3xl font-bold ${getTimerColor()}`}>
                                    {formatTime(timeLeft)}s
                                </span>
                            </div>
                            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                <motion.div
                                    className={`h-full ${timerProgress > 50
                                            ? 'bg-emerald-500'
                                            : timerProgress > 20
                                                ? 'bg-amber-500'
                                                : 'bg-red-500'
                                        }`}
                                    initial={{ width: '100%' }}
                                    animate={{ width: `${timerProgress}%` }}
                                    transition={{ duration: 0.1 }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Question */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-emerald-400 font-bold text-lg">
                                Question #{quiz?.questionNumber}
                            </span>
                        </div>
                        <h2 className="text-xl font-medium text-white leading-relaxed">
                            {quiz?.questionText}
                        </h2>
                    </div>

                    {/* Options */}
                    <div className="space-y-4 mb-8">
                        {['A', 'B'].map((option) => {
                            const optionText = option === 'A' ? quiz?.optionA : quiz?.optionB;
                            const isSelected = selectedOption === option;
                            const isCorrect = result?.correctOption === option;
                            const isWrong = result && isSelected && !result.isCorrect && !result.isTimeout;
                            const isDisabled =
                                submitting ||
                                result !== null ||
                                timeLeft <= 0 ||
                                attemptState?.alreadySubmitted ||
                                attemptState?.isTimeout;

                            let buttonStyle = 'border-slate-600 hover:border-slate-500 bg-slate-800/50';
                            if (result) {
                                if (isCorrect) {
                                    buttonStyle = 'border-emerald-500 bg-emerald-500/20';
                                } else if (isWrong) {
                                    buttonStyle = 'border-red-500 bg-red-500/20';
                                }
                            } else if (isSelected) {
                                buttonStyle = 'border-blue-500 bg-blue-500/20';
                            }

                            return (
                                <button
                                    key={option}
                                    onClick={() => handleSubmit(option as 'A' | 'B')}
                                    disabled={isDisabled}
                                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${buttonStyle} ${isDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span
                                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${result && isCorrect
                                                    ? 'bg-emerald-500 text-white'
                                                    : isWrong
                                                        ? 'bg-red-500 text-white'
                                                        : 'bg-slate-700 text-slate-300'
                                                }`}
                                        >
                                            {option}
                                        </span>
                                        <span className="text-white font-medium flex-1">{optionText}</span>
                                        {result && isCorrect && <span className="text-emerald-400">✓</span>}
                                        {isWrong && <span className="text-red-400">✗</span>}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Result */}
                    <AnimatePresence>
                        {(result || attemptState?.alreadySubmitted || attemptState?.isTimeout) && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className={`p-6 rounded-xl mb-6 text-center ${result?.isCorrect
                                        ? 'bg-emerald-500/20 border border-emerald-500/30'
                                        : result?.isTimeout || attemptState?.isTimeout
                                            ? 'bg-amber-500/20 border border-amber-500/30'
                                            : 'bg-red-500/20 border border-red-500/30'
                                    }`}
                            >
                                <div className="text-4xl mb-2">
                                    {result?.isCorrect ? '🎉' : result?.isTimeout || attemptState?.isTimeout ? '⏱️' : '😔'}
                                </div>
                                <p
                                    className={`text-lg font-bold ${result?.isCorrect
                                            ? 'text-emerald-400'
                                            : result?.isTimeout || attemptState?.isTimeout
                                                ? 'text-amber-400'
                                                : 'text-red-400'
                                        }`}
                                >
                                    {result?.message ||
                                        (attemptState?.alreadySubmitted
                                            ? 'You have already answered this quiz'
                                            : attemptState?.isTimeout
                                                ? "Time's up! You missed this quiz"
                                                : '')}
                                </p>
                                {result?.pointsAwarded !== undefined && (
                                    <p
                                        className={`text-2xl font-bold mt-2 ${result.pointsAwarded > 0
                                                ? 'text-emerald-400'
                                                : result.pointsAwarded < 0
                                                    ? 'text-red-400'
                                                    : 'text-slate-400'
                                            }`}
                                    >
                                        {result.pointsAwarded > 0 ? '+' : ''}
                                        {result.pointsAwarded} points
                                    </p>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Back to Hub */}
                    {(result || attemptState?.alreadySubmitted || attemptState?.isTimeout) && (
                        <Link
                            href="/quiz"
                            className="w-full py-3 rounded-xl text-white font-semibold text-center block transition-all"
                            style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)' }}
                        >
                            Back to Quiz Hub
                        </Link>
                    )}
                </motion.div>
            </main>

            <Footer />
        </div>
    );
}
