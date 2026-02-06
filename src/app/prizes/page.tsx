'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function PrizesPage() {
    return (
        <div className="min-h-screen" style={{ background: 'var(--gradient-hero)' }}>
            <Header />

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Hero */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1, rotate: [0, -10, 10, 0] }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-7xl mb-6"
                    >
                        🎁
                    </motion.div>
                    <h1 className="text-4xl md:text-6xl font-bold mb-4">
                        <span className="gradient-text">Amazing Prizes</span>
                    </h1>
                    <p className="text-slate-400 text-base max-w-2xl mx-auto mb-4">
                        The developer is solo and currently has no sponsor but still has managed to gift out exciting prizes! 🎉
                    </p>
                </motion.div>

                {/* Important Notice Before Prizes */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-12"
                >
                    <div className="card p-6 max-w-3xl mx-auto border-purple-500/30 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                        <div className="text-center">
                            <span className="text-4xl mb-4 block">🏆</span>
                            <h3 className="text-xl font-bold text-white mb-3">Before You Scroll Down...</h3>
                            <p className="text-slate-300 mb-4">
                                Remember that there are <span className="text-amber-400 font-bold">weekly/biweekly gifts</span> during the tournament!
                                So don&apos;t just target positions 1-3. <span className="text-emerald-400 font-semibold">Play regularly</span> to win those exciting weekly prizes!
                            </p>
                            <p className="text-slate-400 text-sm italic mb-4">
                                🤫 Psst... the 1st weekly gift will be a <span className="text-amber-300 font-semibold">World Cup match ticket</span> happening on Valentine&apos;s week!
                                If you&apos;re single, better play hard and win that ticket for some quality &quot;me time&quot; at the stadium! 😄💕🏏
                            </p>
                            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 mt-4">
                                <p className="text-purple-400 font-medium flex items-center justify-center gap-2 flex-wrap">
                                    <span>📈</span>
                                    <span>Joined late? Don&apos;t worry! Follow{' '}
                                        <Link
                                            href="https://instagram.com/mubashir_builds"
                                            target="_blank"
                                            className="text-purple-300 underline hover:text-purple-200"
                                        >
                                            @mubashir_builds
                                        </Link>{' '}
                                        on Instagram to get exact quiz timings and climb up the ladder!
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Prizes Grid */}
                <div className="grid md:grid-cols-3 gap-8 mb-16">
                    {/* 1st Prize */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="relative"
                    >
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                            <span className="text-5xl animate-float">🥇</span>
                        </div>
                        <div className="card p-8 pt-16 text-center border-amber-500/50 animate-glow">
                            <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 to-transparent rounded-2xl" />
                            <div className="relative">
                                <motion.div
                                    initial={{ scale: 0.8 }}
                                    animate={{ scale: 1 }}
                                    transition={{ duration: 0.5, delay: 0.5 }}
                                    className="mb-6"
                                >
                                    <div className="w-32 h-32 mx-auto rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/20 flex items-center justify-center mb-4 shadow-lg shadow-amber-500/20">
                                        <span className="text-6xl">🎧</span>
                                    </div>
                                </motion.div>
                                <h2 className="text-2xl font-bold text-amber-400 mb-2">1st Place</h2>
                                <h3 className="text-xl font-bold text-white mb-4">Airpods</h3>
                                <div className="space-y-2 text-slate-300">
                                    <p className="flex items-center justify-center gap-2">
                                        <span className="text-emerald-400">✓</span>
                                        Premium Airpods
                                    </p>
                                    <p className="flex items-center justify-center gap-2">
                                        <span className="text-emerald-400">✓</span>
                                        Crystal Clear Sound
                                    </p>
                                </div>
                                <div className="mt-6 pt-6 border-t border-slate-700/50">
                                    <p className="text-amber-400 font-bold">+ Gift Hamper 🎁</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* 2nd Prize */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                        className="relative md:mt-8"
                    >
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                            <span className="text-5xl">🥈</span>
                        </div>
                        <div className="card p-8 pt-16 text-center border-slate-400/30">
                            <div className="relative">
                                <motion.div
                                    initial={{ scale: 0.8 }}
                                    animate={{ scale: 1 }}
                                    transition={{ duration: 0.5, delay: 0.6 }}
                                    className="mb-6"
                                >
                                    <div className="w-32 h-32 mx-auto rounded-2xl bg-gradient-to-br from-slate-500/20 to-slate-600/20 flex items-center justify-center mb-4 shadow-lg">
                                        <span className="text-6xl">💳</span>
                                    </div>
                                </motion.div>
                                <h2 className="text-2xl font-bold text-slate-300 mb-2">2nd Place</h2>
                                <h3 className="text-xl font-bold text-white mb-4">Amazon Voucher</h3>
                                <div className="space-y-2 text-slate-300">
                                    <p className="flex items-center justify-center gap-2">
                                        <span className="text-emerald-400">✓</span>
                                        Shop whatever you want
                                    </p>
                                </div>
                                <div className="mt-6 pt-6 border-t border-slate-700/50">
                                    <p className="text-amber-400 font-bold">+ Gift Hamper 🎁</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* 3rd Prize */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                        className="relative md:mt-16"
                    >
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                            <span className="text-5xl">🥉</span>
                        </div>
                        <div className="card p-8 pt-16 text-center border-amber-700/30">
                            <div className="relative">
                                <motion.div
                                    initial={{ scale: 0.8 }}
                                    animate={{ scale: 1 }}
                                    transition={{ duration: 0.5, delay: 0.7 }}
                                    className="mb-6"
                                >
                                    <div className="w-32 h-32 mx-auto rounded-2xl bg-gradient-to-br from-amber-700/20 to-amber-800/20 flex items-center justify-center mb-4 shadow-lg">
                                        <span className="text-6xl">🎫</span>
                                    </div>
                                </motion.div>
                                <h2 className="text-2xl font-bold text-amber-600 mb-2">3rd Place</h2>
                                <h3 className="text-xl font-bold text-white mb-4">Movie Tickets</h3>
                                <div className="space-y-2 text-slate-300">
                                    <p className="flex items-center justify-center gap-2">
                                        <span className="text-emerald-400">✓</span>
                                        You decide the movie
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Fair Play Notice */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="mb-12"
                >
                    <div className="card p-6 max-w-3xl mx-auto border-amber-500/30 bg-gradient-to-r from-amber-500/5 to-orange-500/5">
                        <div className="flex items-start gap-4">
                            <span className="text-4xl">🎯</span>
                            <div>
                                <h3 className="text-xl font-bold text-amber-400 mb-2">Fair Play Notice</h3>
                                <p className="text-slate-300 mb-3">
                                    During prize distribution, winners will be verified using their{' '}
                                    <span className="text-amber-400 font-semibold">Aadhaar-linked mobile number</span>.
                                    So if you&apos;re thinking of creating 10 accounts predicting both teams...
                                </p>
                                <p className="text-slate-400 italic">
                                    We&apos;ll catch you 😉
                                </p>
                                <div className="mt-4 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                                    <p className="text-emerald-400 font-medium flex items-center gap-2">
                                        <span>💡</span>
                                        <span>TL;DR: No advantage of 2 accounts. Just flex your cricket knowledge! 🏏</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="text-center"
                >
                    <div className="card p-8 max-w-2xl mx-auto">
                        <h2 className="text-2xl font-bold text-white mb-4">Ready to Compete?</h2>
                        <p className="text-slate-400 mb-6">
                            Start making predictions now and climb your way to the top of the leaderboard!
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a href="/dashboard" className="btn-primary px-8 py-4 text-lg">
                                🏏 Start Predicting
                            </a>
                            <a href="/leaderboard" className="btn-secondary px-8 py-4 text-lg">
                                🏆 View Leaderboard
                            </a>
                        </div>
                    </div>
                </motion.div>

                {/* Floating Elements */}
                <div className="fixed inset-0 pointer-events-none overflow-hidden">
                    <motion.div
                        animate={{
                            y: [0, -20, 0],
                            rotate: [0, 5, -5, 0],
                        }}
                        transition={{
                            duration: 6,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        className="absolute top-1/4 left-10 text-4xl opacity-20"
                    >
                        🏏
                    </motion.div>
                    <motion.div
                        animate={{
                            y: [0, 20, 0],
                            rotate: [0, -5, 5, 0],
                        }}
                        transition={{
                            duration: 5,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 1,
                        }}
                        className="absolute top-1/3 right-10 text-4xl opacity-20"
                    >
                        ⭐
                    </motion.div>
                    <motion.div
                        animate={{
                            y: [0, -15, 0],
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 2,
                        }}
                        className="absolute bottom-1/4 left-1/4 text-4xl opacity-20"
                    >
                        🏆
                    </motion.div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
