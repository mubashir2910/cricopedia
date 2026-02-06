'use client';

import { useState } from 'react';

interface FlaggedUser {
    email: string;
    reason: string;
}

interface CheckResult {
    totalViolations: number;
    flagged: { ip: number; coords: number };
    flaggedUsers: FlaggedUser[];
}

export default function CheckSuspiciousButton() {
    const [isChecking, setIsChecking] = useState(false);
    const [result, setResult] = useState<CheckResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleCheck = async () => {
        setIsChecking(true);
        setResult(null);
        setError(null);

        try {
            const res = await fetch('/api/admin/check-suspicious', {
                method: 'POST',
            });

            const data = await res.json();

            if (res.ok) {
                setResult({
                    totalViolations: data.totalViolations || 0,
                    flagged: data.flagged,
                    flaggedUsers: data.flaggedUsers || [],
                });
            } else {
                setError(data.error || 'Check failed');
            }
        } catch {
            setError('Failed to check suspicious activity');
        } finally {
            setIsChecking(false);
        }
    };

    return (
        <div className="space-y-4">
            <button
                onClick={handleCheck}
                disabled={isChecking}
                className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isChecking ? (
                    <>
                        <span className="inline-block animate-spin mr-2">⚙️</span>
                        Scanning...
                    </>
                ) : (
                    '🔍 Check Suspicious Activity Now'
                )}
            </button>

            {error && (
                <div className="p-4 rounded-lg border bg-red-500/10 border-red-500/30 text-red-400">
                    ❌ {error}
                </div>
            )}

            {result && (
                <div className="space-y-3">
                    {/* Summary */}
                    <div className={`p-4 rounded-lg border ${result.totalViolations > 0
                            ? 'bg-red-500/10 border-red-500/30'
                            : 'bg-emerald-500/10 border-emerald-500/30'
                        }`}>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xl">{result.totalViolations > 0 ? '🚨' : '✅'}</span>
                            <span className={result.totalViolations > 0 ? 'text-red-400' : 'text-emerald-400'}>
                                {result.totalViolations > 0
                                    ? `Found ${result.totalViolations} violations!`
                                    : 'No new violations found'}
                            </span>
                        </div>
                        <div className="text-sm text-slate-400">
                            IP matches: {result.flagged.ip} | Location matches: {result.flagged.coords}
                        </div>
                    </div>

                    {/* Flagged Users List */}
                    {result.flaggedUsers.length > 0 && (
                        <div className="p-4 rounded-lg border border-red-500/20 bg-slate-800/50">
                            <p className="text-sm font-medium text-slate-300 mb-3">
                                ⚠️ Users flagged in this scan:
                            </p>
                            <div className="space-y-2">
                                {result.flaggedUsers.map((user, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-red-500/10 px-3 py-2 rounded">
                                        <span className="text-red-400 text-sm truncate">
                                            {user.email}
                                        </span>
                                        <span className="text-xs text-slate-500 ml-2">
                                            {user.reason}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            {result.flaggedUsers.length === 10 && (
                                <p className="text-xs text-slate-500 mt-2 text-center">
                                    + more users flagged...
                                </p>
                            )}
                        </div>
                    )}

                    <button
                        onClick={() => window.location.reload()}
                        className="w-full py-2 text-sm text-slate-400 hover:text-white transition-colors"
                    >
                        🔄 Refresh page to update counts
                    </button>
                </div>
            )}

            <p className="text-xs text-slate-500 text-center">
                Auto-checks run after each prediction. Use this for immediate scan.
            </p>
        </div>
    );
}
