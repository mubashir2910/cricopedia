'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { TEAMS } from '@/lib/teams';

export default function CreateMatchPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        teamA: '',
        teamB: '',
        teamAFlag: '',
        teamBFlag: '',
        matchDate: '',
        predictionStartDate: '',
        predictionDeadline: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            const res = await fetch('/api/matches', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Failed to create match');
                return;
            }

            router.push('/admin/matches');
            router.refresh();
        } catch {
            setError('Something went wrong');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    return (
        <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)' }}>
            {/* ... header ... */}

            <main className="max-w-2xl mx-auto px-4 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card p-8"
                >
                    <h1 className="text-2xl font-bold text-white mb-6">Create New Match</h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
                                {error}
                            </div>
                        )}

                        {/* Match Title */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Match Title *
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="input"
                                placeholder="e.g., India vs Afghanistan"
                                required
                            />
                        </div>

                        {/* Team Selection Section */}
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

                        {/* Dates */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Match Date & Time *
                                </label>
                                <input
                                    type="datetime-local"
                                    name="matchDate"
                                    value={formData.matchDate}
                                    onChange={handleChange}
                                    className="input"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        Prediction Starts From *
                                    </label>
                                    <input
                                        type="datetime-local"
                                        name="predictionStartDate"
                                        value={formData.predictionStartDate}
                                        onChange={handleChange}
                                        className="input"
                                        required
                                    />
                                    <p className="text-xs text-slate-500 mt-1">When users can start predicting</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        Prediction Deadline *
                                    </label>
                                    <input
                                        type="datetime-local"
                                        name="predictionDeadline"
                                        value={formData.predictionDeadline}
                                        onChange={handleChange}
                                        className="input"
                                        required
                                    />
                                    <p className="text-xs text-slate-500 mt-1">Typically 30 min before match</p>
                                </div>
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="btn-secondary flex-1"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 py-3 rounded-xl text-white font-semibold transition-all disabled:opacity-50"
                                style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)' }}
                            >
                                {isSubmitting ? 'Creating...' : 'Create Match'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </main>
        </div>
    );
}
