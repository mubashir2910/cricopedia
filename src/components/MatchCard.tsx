'use client';

import { IMatch, SerializedMatch } from '@/models/Match';
import CountdownTimer from './CountdownTimer';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { getTeamFlag } from '@/lib/teamFlags';

interface MatchCardProps {
    match: SerializedMatch;
    userPrediction?: string | null;
    index?: number;
}

export default function MatchCard({ match, userPrediction, index = 0 }: MatchCardProps) {
    const now = new Date();
    const predictionStartDate = match.predictionStartDate ? new Date(match.predictionStartDate) : null;
    const predictionDeadline = new Date(match.predictionDeadline);

    // Prediction window states
    const isPredictionNotStarted = predictionStartDate && now < predictionStartDate;
    const isPredictionOpen = !isPredictionNotStarted && now < predictionDeadline;
    const isPredictionLocked = now >= predictionDeadline;

    const isCompleted = match.status === 'completed';
    const isLive = match.status === 'live';

    const getStatusBadge = () => {
        if (isLive) return <span className="badge badge-live">🔴 LIVE</span>;
        if (isCompleted) return <span className="badge badge-completed">✓ Completed</span>;
        return <span className="badge badge-upcoming">Upcoming</span>;
    };

    const formatMatchDate = (date: Date | string) => {
        return new Date(date).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatDateTime = (date: Date | string) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="card p-6 hover:border-emerald-500/50"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                {getStatusBadge()}
                <span className="text-sm text-slate-400">{formatMatchDate(match.matchDate)}</span>
            </div>

            {/* Teams */}
            <div className="flex items-center justify-between mb-6">
                {/* Team A */}
                <div className="flex-1 text-center">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-2xl shadow-lg overflow-hidden">
                        {match.teamAFlag?.includes('/') ? (
                            <img src={match.teamAFlag} alt={match.teamA} className="w-full h-full object-cover" />
                        ) : (
                            <span>{match.teamAFlag || getTeamFlag(match.teamA)}</span>
                        )}
                    </div>
                    <h3 className={`font-bold text-lg ${isCompleted && match.winner === match.teamA ? 'text-emerald-400' : 'text-white'}`}>
                        {match.teamA}
                    </h3>
                    {isCompleted && match.winner === match.teamA && (
                        <span className="text-xs text-emerald-400">👑 Winner</span>
                    )}
                </div>

                {/* VS */}
                <div className="px-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                        <span className="text-amber-400 font-bold text-sm">VS</span>
                    </div>
                </div>

                {/* Team B */}
                <div className="flex-1 text-center">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-2xl shadow-lg overflow-hidden">
                        {match.teamBFlag?.includes('/') ? (
                            <img src={match.teamBFlag} alt={match.teamB} className="w-full h-full object-cover" />
                        ) : (
                            <span>{match.teamBFlag || getTeamFlag(match.teamB)}</span>
                        )}
                    </div>
                    <h3 className={`font-bold text-lg ${isCompleted && match.winner === match.teamB ? 'text-emerald-400' : 'text-white'}`}>
                        {match.teamB}
                    </h3>
                    {isCompleted && match.winner === match.teamB && (
                        <span className="text-xs text-emerald-400">👑 Winner</span>
                    )}
                </div>
            </div>

            {/* User Prediction Status */}
            {userPrediction && (
                <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-emerald-400">Your Prediction:</span>
                        <span className="font-bold text-emerald-400">{userPrediction}</span>
                    </div>
                    {isCompleted && (
                        <div className="mt-2 text-center">
                            {match.winner === userPrediction ? (
                                <span className="text-emerald-400 font-bold">✓ Correct! +10 pts</span>
                            ) : (
                                <span className="text-red-400 font-bold">✗ Wrong -2 pts</span>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Prediction Window Status */}
            {!isCompleted && !isLive && (
                <div className="mb-4">
                    {isPredictionNotStarted && predictionStartDate ? (
                        // Prediction hasn't started yet
                        <div>
                            <p className="text-center text-sm text-slate-400 mb-2">Prediction starts in:</p>
                            <CountdownTimer targetDate={predictionStartDate} />
                        </div>
                    ) : isPredictionOpen ? (
                        // Prediction is open - show countdown
                        <div>
                            <p className="text-center text-sm text-slate-400 mb-2">Prediction closes in:</p>
                            <CountdownTimer targetDate={match.predictionDeadline} />
                        </div>
                    ) : isPredictionLocked && (
                        // Prediction is locked
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-center">
                            <p className="text-sm text-red-400">🔒 Predictions Locked</p>
                        </div>
                    )}
                </div>
            )}

            {/* Action Button */}
            <Link
                href={`/matches/${match._id}`}
                className={`btn-primary w-full ${(isPredictionNotStarted || isPredictionLocked) && !userPrediction ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {isCompleted ? (
                    'View Result'
                ) : userPrediction ? (
                    'View Your Prediction'
                ) : isPredictionNotStarted ? (
                    '⏳ Coming Soon'
                ) : isPredictionLocked ? (
                    '🔒 Predictions Locked'
                ) : (
                    'Make Prediction →'
                )}
            </Link>
        </motion.div>
    );
}

