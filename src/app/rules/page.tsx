'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function RulesPage() {
    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
    };

    return (
        <div className="min-h-screen" style={{ background: 'var(--gradient-dark)' }}>
            <Header />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        <span className="gradient-text">📜 Rules & Scoring</span>
                    </h1>
                    <p className="text-slate-400 text-lg">
                        Everything you need to know about the prediction game
                    </p>
                </motion.div>

                <div className="space-y-8">
                    {/* How to Play */}
                    <motion.section
                        {...fadeInUp}
                        transition={{ delay: 0.1 }}
                        className="card p-8"
                    >
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                            <span className="text-3xl">🎮</span>
                            How to Play
                        </h2>
                        <div className="space-y-4 text-slate-300">
                            <div className="flex gap-4">
                                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">1</span>
                                <p><strong className="text-white">Sign Up:</strong> Create your account with a unique email and password.</p>
                            </div>
                            <div className="flex gap-4">
                                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">2</span>
                                <p><strong className="text-white">Browse Matches:</strong> View upcoming matches on your dashboard.</p>
                            </div>
                            <div className="flex gap-4">
                                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">3</span>
                                <p><strong className="text-white">Make Predictions:</strong> Select which team you think will win before the deadline.</p>
                            </div>
                            <div className="flex gap-4">
                                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">4</span>
                                <p><strong className="text-white">Earn Points:</strong> Get +10 points for correct predictions, -2 for wrong ones.</p>
                            </div>
                            <div className="flex gap-4">
                                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">5</span>
                                <p>
                                    <strong className="text-white">Joined Late?</strong> Follow the developer on{' '}
                                    <Link
                                        href="https://instagram.com/mubashir_builds"
                                        target="_blank"
                                        className="text-purple-400 hover:text-purple-300 underline"
                                    >
                                        Instagram (@mubashir_builds)
                                    </Link>
                                    {' '}to get timings of bonus quizzes to earn extra points and climb up the ladder! 📈
                                </p>
                            </div>
                            <div className="flex gap-4">
                                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">6</span>
                                <div>
                                    <p><strong className="text-white">Win Prizes:</strong> Top 3 on the leaderboard win amazing prizes at the end of the tournament!</p>
                                    <p className="mt-2 text-sm text-slate-400">
                                        🎁 <strong className="text-amber-400">Weekly/Biweekly Prizes:</strong> Apart from the final 3, we&apos;ll have exciting prizes like <strong className="text-amber-300">World Cup match tickets</strong> and more!
                                    </p>
                                    <p className="mt-2 text-xs text-slate-500 italic">
                                        🤫 Psst... the first weekly gift will be a World Cup match ticket happening during Valentine&apos;s week! If you&apos;re single, better play hard and win that ticket for some quality &quot;me time&quot; at the stadium! 😄🏏
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.section>

                    {/* Scoring System */}
                    <motion.section
                        {...fadeInUp}
                        transition={{ delay: 0.2 }}
                        className="card p-8"
                    >
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                            <span className="text-3xl">⭐</span>
                            Scoring System
                        </h2>
                        <div className="grid md:grid-cols-4 gap-4">
                            <div className="text-center p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                                <div className="text-4xl mb-3">✅</div>
                                <p className="text-3xl font-bold text-emerald-400">+10</p>
                                <p className="text-slate-400 mt-2">Correct Prediction</p>
                            </div>
                            <div className="text-center p-6 rounded-xl bg-red-500/10 border border-red-500/30">
                                <div className="text-4xl mb-3">❌</div>
                                <p className="text-3xl font-bold text-red-400">-2</p>
                                <p className="text-slate-400 mt-2">Wrong Prediction</p>
                            </div>
                            <div className="text-center p-6 rounded-xl bg-purple-500/10 border border-purple-500/30">
                                <div className="text-4xl mb-3">🎯</div>
                                <p className="text-xl font-bold text-purple-400">+5 to +50</p>
                                <p className="text-lg font-bold text-red-400">-1 to -15</p>
                                <p className="text-slate-400 mt-2">Quiz Points (Varies)</p>
                                <p className="text-xs text-slate-500 mt-2 italic">
                                    ⚠️ Don&apos;t miss big points! <Link href="https://instagram.com/mubashir_builds" target="_blank" className="text-purple-400 underline">Follow @mubashir_builds</Link> for quiz timings
                                </p>
                            </div>
                            <div className="text-center p-6 rounded-xl bg-slate-500/10 border border-slate-500/30">
                                <div className="text-4xl mb-3">🚫</div>
                                <p className="text-3xl font-bold text-slate-400">0</p>
                                <p className="text-slate-400 mt-2">No Prediction</p>
                            </div>
                        </div>
                    </motion.section>

                    {/* Streak Bonuses */}
                    <motion.section
                        {...fadeInUp}
                        transition={{ delay: 0.3 }}
                        className="card p-8"
                    >
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                            <span className="text-3xl">🔥</span>
                            Daily Streak Bonuses
                        </h2>
                        <p className="text-slate-400 mb-6">
                            Make predictions on consecutive days to earn bonus points!
                        </p>
                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/30 text-center">
                                <p className="text-2xl font-bold text-orange-400">+3 pts</p>
                                <p className="text-slate-400 text-sm">3-Day Streak</p>
                            </div>
                            <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/30 text-center">
                                <p className="text-2xl font-bold text-orange-400">+5 pts</p>
                                <p className="text-slate-400 text-sm">5-Day Streak</p>
                            </div>
                            <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/30 text-center">
                                <p className="text-2xl font-bold text-orange-400">+10 pts</p>
                                <p className="text-slate-400 text-sm">7-Day Streak</p>
                            </div>
                        </div>
                    </motion.section>

                    {/* Badges */}
                    <motion.section
                        {...fadeInUp}
                        transition={{ delay: 0.4 }}
                        className="card p-8"
                    >
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                            <span className="text-3xl">🏅</span>
                            Badges
                        </h2>
                        <p className="text-slate-400 mb-6">
                            Earn special badges for your achievements!
                        </p>
                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
                                <div className="text-3xl mb-2">🎯</div>
                                <p className="font-bold text-white">Prediction Master</p>
                                <p className="text-slate-400 text-sm">5 correct predictions in a row</p>
                            </div>
                            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                                <div className="text-3xl mb-2">👑</div>
                                <p className="font-bold text-white">Comeback King</p>
                                <p className="text-slate-400 text-sm">Recover from negative points</p>
                            </div>
                            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                                <div className="text-3xl mb-2">🔮</div>
                                <p className="font-bold text-white">Cricket Oracle</p>
                                <p className="text-slate-400 text-sm">80%+ prediction accuracy</p>
                            </div>
                        </div>
                    </motion.section>

                    {/* Important Rules */}
                    <motion.section
                        {...fadeInUp}
                        transition={{ delay: 0.5 }}
                        className="card p-8"
                    >
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                            <span className="text-3xl">⚠️</span>
                            Important Rules
                        </h2>
                        <ul className="space-y-4 text-slate-300">
                            <li className="flex items-start gap-3">
                                <span className="text-amber-400">•</span>
                                <p><strong className="text-white">Deadline:</strong> All predictions must be submitted before the match deadline. Late predictions will not be accepted.</p>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-amber-400">•</span>
                                <p><strong className="text-white">No Edits:</strong> Once you submit a prediction, it cannot be changed or deleted.</p>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-amber-400">•</span>
                                <p><strong className="text-white">One Per Match:</strong> You can only make one prediction per match.</p>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-red-400">🚨</span>
                                <div>
                                    <p><strong className="text-white">Fair Play:</strong> Multiple accounts or any foul play is strictly prohibited. The developer internally logs IP addresses and location data to detect suspicious activity.</p>
                                    <div className="mt-3 p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                                        <p className="text-sm text-slate-300 mb-2"><strong className="text-red-400">Warning System:</strong></p>
                                        <ul className="text-sm space-y-1">
                                            <li className="text-slate-400">• <strong className="text-amber-400">1st Warning:</strong> -5 points + email warning</li>
                                            <li className="text-slate-400">• <strong className="text-orange-400">2nd Warning:</strong> -20 points + email warning</li>
                                            <li className="text-slate-400">• <strong className="text-red-400">3rd Warning:</strong> Points reset to ZERO</li>
                                        </ul>
                                    </div>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-amber-400">•</span>
                                <p><strong className="text-white">Admin Decision:</strong> In case of disputes, the admin&apos;s decision is final and binding.</p>
                            </li>
                        </ul>
                    </motion.section>

                    {/* Leaderboard */}
                    <motion.section
                        {...fadeInUp}
                        transition={{ delay: 0.6 }}
                        className="card p-8"
                    >
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                            <span className="text-3xl">🏆</span>
                            Leaderboard Ranking
                        </h2>
                        <div className="text-slate-300 space-y-3">
                            <p>Players are ranked by:</p>
                            <ol className="list-decimal list-inside space-y-2 pl-2">
                                <li><strong className="text-white">Total Points</strong> (Primary)</li>
                                <li><strong className="text-white">Correct Predictions</strong> (Tie-breaker)</li>
                            </ol>
                            <p className="mt-4 text-slate-400">
                                The leaderboard will be locked at the end of the tournament as declared by the admin.
                            </p>
                        </div>
                    </motion.section>
                </div>
            </main>

            <Footer />
        </div>
    );
}
