'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function CreateQuizPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        questionNumber: '',
        questionText: '',
        optionA: '',
        optionB: '',
        correctOption: 'A',
        startTime: '',
        endTime: '',
        status: 'draft',
        correctPoints: '5',
        wrongPenalty: '1',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            const res = await fetch('/api/quiz', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    questionNumber: parseInt(formData.questionNumber),
                    correctPoints: parseInt(formData.correctPoints),
                    wrongPenalty: parseInt(formData.wrongPenalty),
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Failed to create quiz');
                return;
            }

            router.push('/admin/quiz');
            router.refresh();
        } catch {
            setError('Something went wrong');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    return (
        <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)' }}>
            <header className="border-b border-white/10 bg-slate-900/50">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <Link href="/admin/quiz" className="text-slate-400 hover:text-white">
                        ← Back to Quizzes
                    </Link>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card p-8"
                >
                    <h1 className="text-2xl font-bold text-white mb-6">Create New Quiz</h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
                                {error}
                            </div>
                        )}

                        {/* Question Number */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Question Number *
                            </label>
                            <input
                                type="number"
                                name="questionNumber"
                                value={formData.questionNumber}
                                onChange={handleChange}
                                className="input"
                                placeholder="e.g., 1"
                                required
                                min="1"
                            />
                        </div>

                        {/* Question Text */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Question Text *
                            </label>
                            <textarea
                                name="questionText"
                                value={formData.questionText}
                                onChange={handleChange}
                                className="input min-h-[80px]"
                                placeholder="Enter your question here..."
                                required
                            />
                        </div>

                        {/* Options */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Option A *
                                </label>
                                <input
                                    type="text"
                                    name="optionA"
                                    value={formData.optionA}
                                    onChange={handleChange}
                                    className="input"
                                    placeholder="First option"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Option B *
                                </label>
                                <input
                                    type="text"
                                    name="optionB"
                                    value={formData.optionB}
                                    onChange={handleChange}
                                    className="input"
                                    placeholder="Second option"
                                    required
                                />
                            </div>
                        </div>

                        {/* Correct Option */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Correct Answer *
                            </label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="correctOption"
                                        value="A"
                                        checked={formData.correctOption === 'A'}
                                        onChange={handleChange}
                                        className="w-4 h-4 accent-emerald-500"
                                    />
                                    <span className="text-white">Option A</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="correctOption"
                                        value="B"
                                        checked={formData.correctOption === 'B'}
                                        onChange={handleChange}
                                        className="w-4 h-4 accent-emerald-500"
                                    />
                                    <span className="text-white">Option B</span>
                                </label>
                            </div>
                        </div>

                        {/* Time Window */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Start Time *
                                </label>
                                <input
                                    type="datetime-local"
                                    name="startTime"
                                    value={formData.startTime}
                                    onChange={handleChange}
                                    className="input"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    End Time *
                                </label>
                                <input
                                    type="datetime-local"
                                    name="endTime"
                                    value={formData.endTime}
                                    onChange={handleChange}
                                    className="input"
                                    required
                                />
                            </div>
                        </div>

                        {/* Points Config */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Correct Points
                                </label>
                                <input
                                    type="number"
                                    name="correctPoints"
                                    value={formData.correctPoints}
                                    onChange={handleChange}
                                    className="input"
                                    min="1"
                                />
                                <p className="text-xs text-slate-500 mt-1">Default: +5</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Wrong Penalty
                                </label>
                                <input
                                    type="number"
                                    name="wrongPenalty"
                                    value={formData.wrongPenalty}
                                    onChange={handleChange}
                                    className="input"
                                    min="0"
                                />
                                <p className="text-xs text-slate-500 mt-1">Default: -1</p>
                            </div>
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Status
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="input"
                            >
                                <option value="draft">Draft</option>
                                <option value="scheduled">Scheduled</option>
                            </select>
                        </div>

                        {/* Info Box */}
                        <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                            <p className="text-blue-400 text-sm">
                                ⏱️ Each quiz has a <strong>10-second timer</strong> for users to answer.
                                This is enforced server-side and cannot be changed.
                            </p>
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
                                {isSubmitting ? 'Creating...' : 'Create Quiz'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </main>
        </div>
    );
}
