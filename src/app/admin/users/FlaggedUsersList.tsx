'use client';

import { useState } from 'react';

interface User {
    _id: string;
    email: string;
    phoneNumber: string;
    displayName?: string;
    signupIP?: string;
    flagReason?: string;
    warningsSent: number;
    timesCaught: number;
    createdAt: string;
}

export default function FlaggedUsersList({ users: initialUsers }: { users: User[] }) {
    const [users, setUsers] = useState(initialUsers);
    const [loading, setLoading] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleUnflag = async (userId: string) => {
        setLoading(userId);
        setMessage(null);

        try {
            const res = await fetch('/api/admin/unflag-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId }),
            });

            if (res.ok) {
                setUsers(users.filter(u => u._id !== userId));
                setMessage({ type: 'success', text: 'User unflagged successfully!' });
            } else {
                setMessage({ type: 'error', text: 'Failed to unflag user' });
            }
        } catch {
            setMessage({ type: 'error', text: 'Something went wrong' });
        } finally {
            setLoading(null);
        }
    };

    const handleSendWarning = async (userId: string, email: string) => {
        setLoading(userId);
        setMessage(null);

        try {
            const res = await fetch('/api/admin/send-warning', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, email }),
            });

            const data = await res.json();

            if (res.ok) {
                setUsers(users.map(u =>
                    u._id === userId
                        ? { ...u, warningsSent: u.warningsSent + 1 }
                        : u
                ));
                setMessage({ type: 'success', text: `Warning email sent to ${email}` });
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to send warning' });
            }
        } catch {
            setMessage({ type: 'error', text: 'Something went wrong' });
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="space-y-4">
            {message && (
                <div className={`p-4 rounded-lg ${message.type === 'success'
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                    : 'bg-red-500/10 border border-red-500/30 text-red-400'
                    }`}>
                    {message.text}
                </div>
            )}

            {users.map((user) => (
                <div key={user._id} className="card p-6 border-red-500/20">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-2xl">🚩</span>
                                <div>
                                    <p className="text-white font-medium">
                                        {user.displayName || user.email}
                                    </p>
                                    <p className="text-slate-400 text-sm">{user.email}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4 text-sm">
                                <div>
                                    <p className="text-slate-500">Phone</p>
                                    <p className="text-slate-300">+91 {user.phoneNumber}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500">IP</p>
                                    <p className="text-slate-300">{user.signupIP || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500">Times Caught</p>
                                    <p className={(user.timesCaught ?? 0) > 2 ? 'text-red-400 font-bold' : (user.timesCaught ?? 0) > 0 ? 'text-orange-400' : 'text-slate-300'}>
                                        {user.timesCaught ?? 0}× 🚨
                                    </p>
                                </div>
                                <div>
                                    <p className="text-slate-500">Warnings Sent</p>
                                    <p className={user.warningsSent > 0 ? 'text-amber-400' : 'text-slate-300'}>
                                        {user.warningsSent}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-slate-500">Signed Up</p>
                                    <p className="text-slate-300">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            {user.flagReason && (
                                <div className="mt-4 p-3 rounded bg-red-500/10 border border-red-500/20">
                                    <p className="text-red-400 text-sm">
                                        <strong>Reason:</strong> {user.flagReason}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => handleSendWarning(user._id, user.email)}
                                disabled={loading === user._id}
                                className="px-4 py-2 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors disabled:opacity-50"
                            >
                                {loading === user._id ? '...' : '📧 Send Warning'}
                            </button>
                            <button
                                onClick={() => handleUnflag(user._id)}
                                disabled={loading === user._id}
                                className="px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors disabled:opacity-50"
                            >
                                {loading === user._id ? '...' : '✅ Unflag'}
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
