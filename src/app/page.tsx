'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      if (session?.user?.isAdmin) {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--gradient-hero)' }}>
        <div className="animate-spin w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--gradient-hero)' }}>
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl sm:text-3xl">🏏</span>
            <span className="text-lg sm:text-xl font-bold gradient-text">Cricopedia</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/login"
              className="text-sm sm:text-base text-slate-300 hover:text-white transition-colors px-2 sm:px-3 py-1"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="btn-primary px-4 sm:px-6 py-2 text-sm sm:text-base whitespace-nowrap"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-24 sm:pb-32">
          <div className="text-center">
            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-6xl sm:text-8xl mb-6 sm:mb-8"
              >
                🏆
              </motion.div>

              {/* Small Label */}
              <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-white/10 text-slate-300 mb-4 sm:mb-6">
                T20 World Cup Edition
              </span>

              {/* Main Headline - Colorful */}
              <h1 className="text-2xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6">
                <span className="gradient-text">PREDICT. COMPETE.</span>
                <br />
                <span className="gradient-text">Climb the LEADERBOARD.</span>
              </h1>

              {/* Subheading */}
              <p className="text-base sm:text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-6 sm:mb-8 px-4">
                Make match predictions, play quizzes, and earn exciting prizes by backing your cricket instincts.
              </p>

              {/* Rule Badges */}
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mb-8 sm:mb-10 px-4">
                <span className="px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium bg-emerald-500/20 text-emerald-400">
                  +10 pts Correct
                </span>
                <span className="text-slate-600">•</span>
                <span className="px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium bg-red-500/20 text-red-400">
                  −2 pts Wrong
                </span>
                <span className="text-slate-600 hidden sm:inline">•</span>
                <span className="px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium bg-purple-500/20 text-purple-400">
                  Bonus Quiz Points
                </span>
              </div>
            </motion.div>

            {/* Primary CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-16 px-4"
            >
              <Link href="/signup" className="btn-primary px-8 sm:px-10 py-3 sm:py-4 text-lg sm:text-xl">
                Start Predicting 🎯
              </Link>
              <Link href="/prizes" className="btn-secondary px-8 sm:px-10 py-3 sm:py-4 text-lg sm:text-xl">
                View Prizes 🎁
              </Link>
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto"
            >
              <div className="card p-6 text-center">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-lg font-bold text-white mb-2">Make Predictions</h3>
                <p className="text-slate-400 text-sm">
                  Predict match winners before the deadline
                </p>
              </div>
              <div className="card p-6 text-center">
                <div className="text-4xl mb-4">⭐</div>
                <h3 className="text-lg font-bold text-white mb-2">Earn Points</h3>
                <p className="text-slate-400 text-sm">
                  +10 for correct, -2 for wrong predictions
                </p>
              </div>
              <div className="card p-6 text-center">
                <div className="text-4xl mb-4">🏆</div>
                <h3 className="text-lg font-bold text-white mb-2">Win Prizes</h3>
                <p className="text-slate-400 text-sm">
                  Top 3 on leaderboard win amazing prizes!
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Weekly Prizes Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="py-12"
          style={{ background: 'rgba(139, 92, 246, 0.1)' }}
        >
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="text-4xl mb-4 block">🎁</span>
            <h3 className="text-xl font-bold text-white mb-3">It&apos;s Not Just About Top 3!</h3>
            <p className="text-slate-300 mb-4">
              Play daily and win exciting <span className="text-amber-400 font-bold">weekly/biweekly prizes</span> throughout the tournament!
            </p>
            <p className="text-slate-400 text-sm italic mb-4">
              🤫 Psst... the 1st weekly gift will be a <span className="text-amber-300 font-semibold">World Cup match ticket</span> happening on Valentine&apos;s week!
              If you&apos;re single, better play hard and win that ticket! 😄💕🏏
            </p>
            <div className="inline-block px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/30">
              <p className="text-purple-300 text-sm font-medium">
                💡 Pro Tip: Follow{' '}
                <Link href="https://instagram.com/mubashir_builds" target="_blank" className="text-purple-200 underline">
                  @mubashir_builds
                </Link>{' '}
                to get quiz timings and climb up the ladder!
              </p>
            </div>
          </div>
        </motion.div>

        {/* Prizes Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="py-16"
          style={{ background: 'rgba(0,0,0,0.3)' }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <p className="text-4xl md:text-5xl font-bold text-emerald-400">🎧</p>
                <p className="text-slate-400 mt-2">Airpods</p>
                <p className="text-xs text-slate-500">1st Prize</p>
              </div>
              <div>
                <p className="text-4xl md:text-5xl font-bold text-amber-400">💳</p>
                <p className="text-slate-400 mt-2">Amazon Voucher</p>
                <p className="text-xs text-slate-500">2nd Prize</p>
              </div>
              <div>
                <p className="text-4xl md:text-5xl font-bold text-purple-400">🎫</p>
                <p className="text-slate-400 mt-2">Movie Tickets</p>
                <p className="text-xs text-slate-500">3rd Prize</p>
              </div>
              <div>
                <p className="text-4xl md:text-5xl font-bold gradient-text">∞</p>
                <p className="text-slate-400 mt-2">Fun & Excitement</p>
                <p className="text-xs text-slate-500">Guaranteed</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* How it Works */}
        <div className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            <span className="gradient-text">How It Works</span>
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: '📝', title: 'Sign Up', desc: 'Create your free account' },
              { icon: '🏏', title: 'Pick Matches', desc: 'Browse upcoming matches' },
              { icon: '🎯', title: 'Predict', desc: 'Choose the winning team' },
              { icon: '🏆', title: 'Win', desc: 'Climb the leaderboard!' },
            ].map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-700/20 flex items-center justify-center text-3xl mb-4">
                  {step.icon}
                </div>
                <h3 className="font-bold text-white mb-1">{step.title}</h3>
                <p className="text-slate-400 text-sm">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="py-20 text-center" style={{ background: 'rgba(16, 185, 129, 0.05)' }}>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Join the Competition?
          </h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto">
            Create your account now and start predicting! It&apos;s completely free.
          </p>
          <Link href="/signup" className="btn-primary px-12 py-4 text-xl inline-block">
            Get Started Free →
          </Link>
        </div>

        {/* Footer */}
        <footer className="py-8 border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-slate-500">
              🏏 Cricopedia © 2026 • Made with ❤️
            </p>
          </div>
        </footer>
      </main>

      {/* Floating Cricket Balls */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 360],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              ease: "linear",
              delay: i * 0.5,
            }}
            className="absolute text-2xl opacity-10"
            style={{
              top: `${20 + i * 15}%`,
              left: `${10 + i * 20}%`,
            }}
          >
            🏏
          </motion.div>
        ))}
      </div>
    </div>
  );
}
