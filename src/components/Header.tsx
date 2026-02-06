'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function Header() {
    const { data: session } = useSession();
    const pathname = usePathname();
    const [points, setPoints] = useState<number | null>(null);

    // Fetch fresh points from API (not cached session)
    useEffect(() => {
        if (session?.user) {
            const fetchPoints = async () => {
                try {
                    const res = await fetch('/api/user/points');
                    const data = await res.json();
                    setPoints(data.points);
                } catch (error) {
                    console.error('Failed to fetch points:', error);
                    setPoints(session.user.points || 0);
                }
            };

            fetchPoints();
            // Refresh points every 30 seconds
            const interval = setInterval(fetchPoints, 30000);
            return () => clearInterval(interval);
        }
    }, [session]);

    const navLinks = [
        { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
        { href: '/predictions', label: 'My Predictions', icon: '📋' },
        { href: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
        { href: '/quiz', label: 'Quiz', icon: '🎯' },
        { href: '/prizes', label: 'Prizes', icon: '🎁' },
        { href: '/rules', label: 'Rules', icon: '📜' },
    ];

    const displayPoints = points !== null ? points : (session?.user?.points || 0);

    return (
        <header className="sticky top-0 z-50 glass border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/dashboard" className="flex items-center gap-1">
                        <span className="text-2xl">🏏</span>
                        <span className="text-2xl font-bold gradient-text sm:block">Cricopedia</span>
                    </Link>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${pathname === link.href
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <span className="mr-1.5">{link.icon}</span>
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* User Info */}
                    <div className="flex items-center">
                        {session?.user && (
                            <>
                                {/* Points Badge */}
                                <motion.div
                                    key={displayPoints}
                                    initial={{ scale: 0.7 }}
                                    animate={{ scale: 1 }}
                                    className="points-badge"
                                >
                                    <span>⭐</span>
                                    <span className="text-slate-800 font-semibold">{displayPoints} pts</span>
                                </motion.div>

                                {/* User Menu */}
                                <div className="flex items-center gap-3">
                                    <div className="hidden sm:block text-right">
                                        <p className="text-sm font-medium text-white">{session.user.email}</p>
                                        <p className="text-xs text-slate-400">Player</p>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Mobile Navigation */}
                <nav className="md:hidden flex items-center gap-1 pb-3 overflow-x-auto scrollbar-hide">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${pathname === link.href
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <span className="mr-1">{link.icon}</span>
                            {link.label}
                        </Link>
                    ))}
                </nav>
            </div>
        </header>
    );
}
