'use client';

import Link from 'next/link';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    const navLinks = [
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/predictions', label: 'My Predictions' },
        { href: '/leaderboard', label: 'Leaderboard' },
        { href: '/prizes', label: 'Prizes' },
        { href: '/rules', label: 'Rules' },
    ];

    return (
        <footer className="border-t border-white/10 bg-slate-900/80 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Top Links */}
                <div className="flex flex-wrap justify-center gap-4 sm:gap-8 mb-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="text-sm text-slate-400 hover:text-emerald-400 transition-colors"
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* Divider */}
                <div className="border-t border-slate-700/50 mb-8" />

                {/* Main Footer Content */}
                <div className="flex flex-col items-center gap-4 text-center">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">🏏</span>
                        <span className="text-lg font-bold gradient-text">Cricopedia</span>
                    </div>

                    {/* Contact Developer */}
                    <p className="text-sm text-slate-400">
                        <span className="text-slate-500">Found a bug?</span>{' '}
                        <a
                            href="https://wa.me/917278304949"
                            className="text-emerald-400 hover:text-emerald-300 transition-colors"
                        >
                            Contact Developer
                        </a>
                    </p>

                    {/* Copyright */}
                    <p className="text-sm text-slate-500">
                        © {currentYear} All rights reserved.
                    </p>
                    <p className="text-sm text-slate-500">
                        Made with{' '}
                        <span className="text-red-400">❤️</span>{' '}
                        by <span className="text-white font-medium"><a href="https://instagram.com/mubashir_builds" target="_blank" className="text-gray-400 underline">Mubashir Iqbal</a></span>
                    </p>
                </div>
            </div>
        </footer>
    );
}
