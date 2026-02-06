'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
}

export default function EditQuizPage() {
    const router = useRouter();
    const params = useParams();
    const quizId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [isLocked, setIsLocked] = useState(false);

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

    useEffect(() => {
        fetchQuiz();
    }, [quizId]);

    const fetchQuiz = async () => {
        try {
            const res = await fetch(`/api/quiz/${quizId}`);
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Failed to fetch quiz');
                return;
            }

            const quiz: Quiz = data.quiz;
            setIsLocked(['live', 'ended'].includes(quiz.status));

            setFormData({
                questionNumber: quiz.questionNumber.toString(),
                questionText: quiz.questionText,
                optionA: quiz.optionA,
                optionB: quiz.optionB,
                correctOption: quiz.correctOption,
                startTime: new Date(quiz.startTime).toISOString().slice(0, 16),
                endTime: new Date(quiz.endTime).toISOString().slice(0, 16),
                status: quiz.status,
                correctPoints: quiz.correctPoints.toString(),
                wrongPenalty: quiz.wrongPenalty.toString(),
            });
        } catch {
            setError('Failed to load quiz');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            const res = await fetch(`/api/quiz/${quizId}`, {
                method: 'PUT',
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
                setError(data.error || 'Failed to update quiz');
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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)' }}>
                <div className="text-white">Loading...</div>
            </div>
        );
    }

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
                    <h1 className="text-2xl font-bold text-white mb-6">
                        Edit Quiz #{formData.questionNumber}
                    </h1>

                    {isLocked && (
                        <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 mb-6">
                            <p className="text-amber-400">
                                ⚠️ This quiz is <strong>{formData.status}</strong> and cannot be edited.
                            </p>
                        </div>
                    )}

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
                                disabled={isLocked}
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
                                disabled={isLocked}
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
                                    disabled={isLocked}
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
                                    disabled={isLocked}
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
                                        disabled={isLocked}
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
                                        disabled={isLocked}
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
                                    disabled={isLocked}
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
                                    disabled={isLocked}
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
                                    disabled={isLocked}
                                    min="1"
                                />
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
                                    disabled={isLocked}
                                    min="0"
                                />
                            </div>
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Status
                            </label>
                            {isLocked ? (
                                <div className="text-white capitalize">{formData.status}</div>
                            ) : (
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="input"
                                >
                                    <option value="draft">Draft</option>
                                    <option value="scheduled">Scheduled</option>
                                </select>
                            )}
                            <p className="text-xs text-slate-500 mt-1">
                                {formData.status === 'draft'
                                    ? 'Draft quizzes are not visible to users'
                                    : formData.status === 'scheduled'
                                        ? 'Scheduled quizzes are visible but auto-go live at start time'
                                        : `This quiz is ${formData.status} and cannot be changed`
                                }
                            </p>
                        </div>

                        {/* Submit */}
                        {!isLocked && (
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
                                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        )}
                    </form>
                </motion.div>
            </main>
        </div>
    );
}
