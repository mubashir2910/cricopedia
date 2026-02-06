'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import CountdownTimer from '@/components/CountdownTimer';
import Confetti, { firePointsConfetti } from '@/components/Confetti';
import { getTeamFlag } from '@/lib/teamFlags';

interface Match {
    _id: string;
    title: string;
    teamA: string;
    teamB: string;
    teamAFlag?: string;
    teamBFlag?: string;
    matchDate: string;
    predictionStartDate?: string;
    predictionDeadline: string;
    status: 'upcoming' | 'live' | 'completed';
    winner: string | null;
}

interface Prediction {
    predictedTeam: string;
    isCorrect: boolean | null;
    pointsEarned: number | null;
}

export default function MatchDetailPage() {
    const { data: session } = useSession();
    const params = useParams();
    const router = useRouter();
    const [match, setMatch] = useState<Match | null>(null);
    const [prediction, setPrediction] = useState<Prediction | null>(null);
    const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch match
                const matchRes = await fetch(`/api/matches/${params.id}`);
                const matchData = await matchRes.json();

                if (matchRes.ok) {
                    setMatch(matchData.match);
                }

                // Fetch user's prediction
                const predRes = await fetch('/api/predictions');
                const predData = await predRes.json();

                if (predRes.ok) {
                    const userPrediction = predData.predictions?.find(
                        (p: any) => p.matchId?._id === params.id || p.matchId === params.id
                    );
                    if (userPrediction) {
                        setPrediction({
                            predictedTeam: userPrediction.predictedTeam,
                            isCorrect: userPrediction.isCorrect,
                            pointsEarned: userPrediction.pointsEarned,
                        });
                        setSelectedTeam(userPrediction.predictedTeam);
                    }
                }
            } catch (err) {
                console.error('Fetch error:', err);
            } finally {
                setIsLoading(false);
            }
        };

        if (params.id) {
            fetchData();
        }
    }, [params.id]);

    const handlePrediction = async () => {
        if (!selectedTeam || prediction) return;

        setIsSubmitting(true);
        setError('');

        try {
            const res = await fetch('/api/predictions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    matchId: params.id,
                    predictedTeam: selectedTeam,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error);
                return;
            }

            setPrediction({
                predictedTeam: selectedTeam,
                isCorrect: null,
                pointsEarned: null,
            });
            setSuccess('Prediction submitted successfully! 🎉');
            firePointsConfetti();
        } catch {
            setError('Failed to submit prediction');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--gradient-dark)' }}>
                <div className="text-center">
                    <div className="animate-spin w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="text-slate-400">Loading match...</p>
                </div>
            </div>
        );
    }

    if (!match) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--gradient-dark)' }}>
                <div className="text-center">
                    <p className="text-xl text-slate-400">Match not found</p>
                    <button onClick={() => router.push('/dashboard')} className="btn-primary mt-4">
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const now = new Date();
    const predictionStartDate = match.predictionStartDate ? new Date(match.predictionStartDate) : null;
    const predictionDeadline = new Date(match.predictionDeadline);

    const isPredictionNotStarted = !!(predictionStartDate && now < predictionStartDate);
    const isPredictionOpen = !isPredictionNotStarted && now < predictionDeadline;
    const isPredictionLocked = now >= predictionDeadline;
    const isCompleted = match.status === 'completed';

    return (
        <div className="min-h-screen" style={{ background: 'var(--gradient-dark)' }}>
            <Header />
            <Confetti trigger={showConfetti} />

            <main className="max-w-3xl mx-auto px-4 py-8">
                {/* Back Button */}
                <button
                    onClick={() => router.push('/dashboard')}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Dashboard
                </button>

                {/* Match Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card p-8"
                >
                    {/* Match Title */}
                    <div className="text-center mb-8">
                        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{match.title}</h1>
                        <p className="text-slate-400">
                            {new Date(match.matchDate).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </p>
                    </div>

                    {/* Teams */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-8">
                        {/* Team A */}
                        <motion.button
                            whileHover={{ scale: prediction ? 1 : 1.02 }}
                            whileTap={{ scale: prediction ? 1 : 0.98 }}
                            onClick={() => !prediction && !isPredictionLocked && !isPredictionNotStarted && setSelectedTeam(match.teamA)}
                            disabled={!!prediction || isPredictionLocked || isPredictionNotStarted}
                            className={`team-card w-full sm:w-40 ${selectedTeam === match.teamA ? 'selected' : ''} ${prediction || isPredictionLocked ? 'cursor-default' : ''
                                } ${isCompleted && match.winner === match.teamA ? 'border-emerald-500 bg-emerald-500/10' : ''}`}
                        >
                            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center text-5xl overflow-hidden shadow-lg border-4 border-slate-700/50">
                                {match.teamAFlag?.includes('/') ? (
                                    <img src={match.teamAFlag} alt={match.teamA} className="w-full h-full object-cover" />
                                ) : (
                                    <span>{match.teamAFlag || getTeamFlag(match.teamA)}</span>
                                )}
                            </div>
                            <h3 className="font-bold text-lg">{match.teamA}</h3>
                            {isCompleted && match.winner === match.teamA && (
                                <span className="text-xs text-emerald-400 mt-2 block">👑 Winner</span>
                            )}
                        </motion.button>

                        {/* VS */}
                        <div className="flex items-center justify-center py-2 sm:py-0">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                                <span className="text-amber-400 font-bold text-lg">VS</span>
                            </div>
                        </div>

                        {/* Team B */}
                        <motion.button
                            whileHover={{ scale: prediction ? 1 : 1.02 }}
                            whileTap={{ scale: prediction ? 1 : 0.98 }}
                            onClick={() => !prediction && !isPredictionLocked && !isPredictionNotStarted && setSelectedTeam(match.teamB)}
                            disabled={!!prediction || isPredictionLocked || isPredictionNotStarted}
                            className={`team-card w-full sm:w-40 ${selectedTeam === match.teamB ? 'selected' : ''} ${prediction || isPredictionLocked ? 'cursor-default' : ''
                                } ${isCompleted && match.winner === match.teamB ? 'border-emerald-500 bg-emerald-500/10' : ''}`}
                        >
                            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center text-5xl overflow-hidden shadow-lg border-4 border-slate-700/50">
                                {match.teamBFlag?.includes('/') ? (
                                    <img src={match.teamBFlag} alt={match.teamB} className="w-full h-full object-cover" />
                                ) : (
                                    <span>{match.teamBFlag || getTeamFlag(match.teamB)}</span>
                                )}
                            </div>
                            <h3 className="font-bold text-lg">{match.teamB}</h3>
                            {isCompleted && match.winner === match.teamB && (
                                <span className="text-xs text-emerald-400 mt-2 block">👑 Winner</span>
                            )}
                        </motion.button>
                    </div>

                    {/* Prediction Window Status */}
                    {!isCompleted && !prediction && (
                        <div className="mb-8">
                            {isPredictionNotStarted && predictionStartDate ? (
                                <div>
                                    <p className="text-center text-sm text-slate-400 mb-3">Prediction starts in:</p>
                                    <div className="flex justify-center">
                                        <CountdownTimer targetDate={predictionStartDate} />
                                    </div>
                                    <p className="text-center text-xs text-slate-500 mt-2">
                                        You can predict once the window opens
                                    </p>
                                </div>
                            ) : isPredictionOpen ? (
                                <div>
                                    <p className="text-center text-sm text-slate-400 mb-3">Prediction closes in:</p>
                                    <div className="flex justify-center">
                                        <CountdownTimer targetDate={match.predictionDeadline} />
                                    </div>
                                </div>
                            ) : isPredictionLocked && (
                                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-center">
                                    <p className="text-red-400">🔒 Predictions are closed for this match</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Prediction Status */}
                    {prediction && (
                        <div className={`p-4 rounded-lg mb-6 ${isCompleted
                            ? prediction.isCorrect
                                ? 'bg-emerald-500/20 border border-emerald-500/30'
                                : 'bg-red-500/20 border border-red-500/30'
                            : 'bg-blue-500/20 border border-blue-500/30'
                            }`}>
                            <div className="text-center">
                                <p className="text-sm text-slate-300 mb-1">Your Prediction:</p>
                                <p className="text-xl font-bold text-white">{prediction.predictedTeam}</p>
                                {isCompleted && (
                                    <p className={`mt-2 font-bold ${prediction.isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {prediction.isCorrect ? `✓ Correct! +${prediction.pointsEarned} pts` : `✗ Wrong ${prediction.pointsEarned} pts`}
                                    </p>
                                )}
                                {!isCompleted && (
                                    <p className="mt-2 text-sm text-blue-400">Awaiting result...</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Error/Success Messages */}
                    {error && (
                        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-center mb-6">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-center mb-6">
                            {success}
                        </div>
                    )}

                    {/* Submit Button */}
                    {!prediction && !isPredictionLocked && !isPredictionNotStarted && (
                        <button
                            onClick={handlePrediction}
                            disabled={!selectedTeam || isSubmitting}
                            className="btn-primary w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Submitting...
                                </span>
                            ) : selectedTeam ? (
                                `Predict ${selectedTeam} to Win 🏆`
                            ) : (
                                'Select a Team to Predict'
                            )}
                        </button>
                    )}

                    {isPredictionLocked && !prediction && (
                        <div className="text-center py-4 text-slate-400">
                            🔒 Predictions are locked for this match
                        </div>
                    )}

                    {isPredictionNotStarted && !prediction && (
                        <div className="text-center py-4 text-slate-400">
                            ⏳ Predictions will open soon
                        </div>
                    )}
                </motion.div>
            </main>
        </div>
    );
}
