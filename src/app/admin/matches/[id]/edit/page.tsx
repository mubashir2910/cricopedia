'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { TEAMS } from '@/lib/teams';

interface Match {
    _id: string;
    title: string;
    teamA: string;
    teamB: string;
    teamAFlag?: string;
    teamBFlag?: string;
    matchDate: string;
    predictionStartDate: string;
    predictionDeadline: string;
    status: 'upcoming' | 'live' | 'completed';
    winner: string | null;
}

export default function EditMatchPage() {
    const router = useRouter();
    const params = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeclaring, setIsDeclaring] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [match, setMatch] = useState<Match | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        teamA: '',
        teamB: '',
        teamAFlag: '',
        teamBFlag: '',
        matchDate: '',
        predictionStartDate: '',
        predictionDeadline: '',
        status: 'upcoming' as 'upcoming' | 'live' | 'completed',
    });

    useEffect(() => {
        const fetchMatch = async () => {
            try {
                const res = await fetch(`/api/matches/${params.id}`);
                const data = await res.json();

                if (res.ok) {
                    setMatch(data.match);
                    setFormData({
                        title: data.match.title,
                        teamA: data.match.teamA,
                        teamB: data.match.teamB,
                        teamAFlag: data.match.teamAFlag || '',
                        teamBFlag: data.match.teamBFlag || '',
                        matchDate: new Date(data.match.matchDate).toISOString().slice(0, 16),
                        predictionStartDate: data.match.predictionStartDate
                            ? new Date(data.match.predictionStartDate).toISOString().slice(0, 16)
                            : '',
                        predictionDeadline: new Date(data.match.predictionDeadline).toISOString().slice(0, 16),
                        status: data.match.status,
                    });
                }
            } catch (err) {
                console.error('Fetch error:', err);
            } finally {
                setIsLoading(false);
            }
        };

        if (params.id) {
            fetchMatch();
        }
    }, [params.id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        setSuccess('');

        try {
            const res = await fetch(`/api/matches/${params.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Failed to update match');
                return;
            }

            setSuccess('Match updated successfully!');
            setMatch(data.match);
        } catch {
            setError('Something went wrong');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeclareResult = async (winner: string) => {
        if (!confirm(`Declare ${winner} as the winner? This will calculate points for all predictions.`)) {
            return;
        }

        setIsDeclaring(true);
        setError('');
        setSuccess('');

        try {
            const res = await fetch(`/api/matches/${params.id}/result`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ winner }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Failed to declare result');
                return;
            }

            setSuccess(`Result declared! ${data.predictionsUpdated} predictions updated.`);
            setMatch(data.match);
            setFormData((prev) => ({ ...prev, status: 'completed' }));
        } catch {
            setError('Something went wrong');
        } finally {
            setIsDeclaring(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this match? This action cannot be undone.')) {
            return;
        }

        setIsDeleting(true);

        try {
            const res = await fetch(`/api/matches/${params.id}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.error || 'Failed to delete match');
                return;
            }

            router.push('/admin/matches');
            router.refresh();
        } catch {
            setError('Something went wrong');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    // Helper to select a team
    const handleSelectTeam = (side: 'A' | 'B', teamId: string) => {
        const team = TEAMS.find(t => t.id === teamId);
        if (team) {
            setFormData(prev => ({
                ...prev,
                [side === 'A' ? 'teamA' : 'teamB']: team.name,
                [side === 'A' ? 'teamAFlag' : 'teamBFlag']: team.logo
            }));
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)' }}>
                <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!match) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)' }}>
                <div className="text-center">
                    <p className="text-xl text-slate-400">Match not found</p>
                    <Link href="/admin/matches" className="btn-primary mt-4 inline-block">
                        Back to Matches
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)' }}>
            {/* Admin Header */}
            <header className="border-b border-purple-500/20 bg-purple-900/20 backdrop-blur">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <Link href="/admin/matches" className="text-slate-400 hover:text-white">
                                ← Back
                            </Link>
                            <span className="text-xl font-bold text-white">Edit Match</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8">
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Edit Form */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="card p-6"
                    >
                        <h2 className="text-xl font-bold text-white mb-6">Match Details</h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                                    {error}
                                </div>
                            )}
                            {success && (
                                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
                                    {success}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="input"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Team A Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Team A</label>
                                    <div className="mb-3">
                                        <label className="text-xs text-slate-400 block mb-1">Quick Select:</label>
                                        <select
                                            className="input py-2 text-sm"
                                            onChange={(e) => handleSelectTeam('A', e.target.value)}
                                            value=""
                                        >
                                            <option value="" disabled>Select Team</option>
                                            {TEAMS.map(team => (
                                                <option key={team.id} value={team.id}>{team.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <input
                                        type="text"
                                        name="teamA"
                                        value={formData.teamA}
                                        onChange={handleChange}
                                        className="input mb-2"
                                        placeholder="Team Name"
                                        required
                                    />
                                    <div className="flex gap-2 items-center">
                                        <input
                                            type="text"
                                            name="teamAFlag"
                                            value={formData.teamAFlag}
                                            onChange={handleChange}
                                            className="input flex-1"
                                            placeholder="Logo URL or Emoji"
                                        />
                                        {formData.teamAFlag && (
                                            <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden flex items-center justify-center border border-slate-600">
                                                {formData.teamAFlag.startsWith('/') ? (
                                                    <img src={formData.teamAFlag} alt="Team A" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-xl">{formData.teamAFlag}</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Team B Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Team B</label>
                                    <div className="mb-3">
                                        <label className="text-xs text-slate-400 block mb-1">Quick Select:</label>
                                        <select
                                            className="input py-2 text-sm"
                                            onChange={(e) => handleSelectTeam('B', e.target.value)}
                                            value=""
                                        >
                                            <option value="" disabled>Select Team</option>
                                            {TEAMS.map(team => (
                                                <option key={team.id} value={team.id}>{team.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <input
                                        type="text"
                                        name="teamB"
                                        value={formData.teamB}
                                        onChange={handleChange}
                                        className="input mb-2"
                                        placeholder="Team Name"
                                        required
                                    />
                                    <div className="flex gap-2 items-center">
                                        <input
                                            type="text"
                                            name="teamBFlag"
                                            value={formData.teamBFlag}
                                            onChange={handleChange}
                                            className="input flex-1"
                                            placeholder="Logo URL or Emoji"
                                        />
                                        {formData.teamBFlag && (
                                            <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden flex items-center justify-center border border-slate-600">
                                                {formData.teamBFlag.startsWith('/') ? (
                                                    <img src={formData.teamBFlag} alt="Team B" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-xl">{formData.teamBFlag}</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Match Date</label>
                                    <input
                                        type="datetime-local"
                                        name="matchDate"
                                        value={formData.matchDate}
                                        onChange={handleChange}
                                        className="input"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        className="input"
                                    >
                                        <option value="upcoming">Upcoming</option>
                                        <option value="live">Live</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Prediction Starts</label>
                                    <input
                                        type="datetime-local"
                                        name="predictionStartDate"
                                        value={formData.predictionStartDate}
                                        onChange={handleChange}
                                        className="input"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Prediction Deadline</label>
                                    <input
                                        type="datetime-local"
                                        name="predictionDeadline"
                                        value={formData.predictionDeadline}
                                        onChange={handleChange}
                                        className="input"
                                        required
                                    />
                                </div>
                            </div>



                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-3 rounded-xl text-white font-semibold transition-all disabled:opacity-50"
                                style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)' }}
                            >
                                {isSubmitting ? 'Saving...' : 'Save Changes'}
                            </button>
                        </form>
                    </motion.div>

                    {/* Actions Panel */}
                    <div className="space-y-6">
                        {/* Declare Result */}
                        {match.status !== 'completed' && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="card p-6"
                            >
                                <h2 className="text-xl font-bold text-white mb-4">🏆 Declare Result</h2>
                                <p className="text-slate-400 text-sm mb-4">
                                    Select the winning team. This will automatically calculate points for all predictions.
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => handleDeclareResult(match.teamA)}
                                        disabled={isDeclaring}
                                        className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all disabled:opacity-50"
                                    >
                                        <span className="text-2xl block mb-2">{match.teamAFlag || '🏏'}</span>
                                        <span className="font-bold text-emerald-400">{match.teamA}</span>
                                    </button>
                                    <button
                                        onClick={() => handleDeclareResult(match.teamB)}
                                        disabled={isDeclaring}
                                        className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all disabled:opacity-50"
                                    >
                                        <span className="text-2xl block mb-2">{match.teamBFlag || '🏏'}</span>
                                        <span className="font-bold text-emerald-400">{match.teamB}</span>
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* Winner Display */}
                        {match.winner && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="card p-6 border-emerald-500/30"
                            >
                                <h2 className="text-xl font-bold text-white mb-4">✅ Result Declared</h2>
                                <div className="text-center py-4">
                                    <span className="text-4xl block mb-2">👑</span>
                                    <p className="text-2xl font-bold text-emerald-400">{match.winner}</p>
                                    <p className="text-slate-400 mt-2">Winner</p>
                                </div>
                            </motion.div>
                        )}

                        {/* Danger Zone */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="card p-6 border-red-500/30"
                        >
                            <h2 className="text-xl font-bold text-red-400 mb-4">⚠️ Danger Zone</h2>
                            <p className="text-slate-400 text-sm mb-4">
                                Deleting this match will also remove all associated predictions.
                            </p>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="w-full py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 font-semibold hover:bg-red-500/30 transition-all disabled:opacity-50"
                            >
                                {isDeleting ? 'Deleting...' : 'Delete Match'}
                            </button>
                        </motion.div>
                    </div>
                </div>
            </main>
        </div>
    );
}
