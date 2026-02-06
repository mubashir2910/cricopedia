import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Link from 'next/link';
import FlaggedUsersList from './FlaggedUsersList';

async function getFlaggedUsers() {
    await dbConnect();
    return User.find({ isFlagged: true })
        .select('email phoneNumber displayName signupIP flagReason warningsSent createdAt')
        .sort({ createdAt: -1 })
        .lean();
}

async function getAllUsersCount() {
    await dbConnect();
    return User.countDocuments();
}

export default async function AdminUsersPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isAdmin) {
        redirect('/admin/login');
    }

    const [flaggedUsers, totalUsers] = await Promise.all([
        getFlaggedUsers(),
        getAllUsersCount(),
    ]);

    return (
        <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)' }}>
            {/* Admin Header */}
            <header className="border-b border-purple-500/20 bg-purple-900/20 backdrop-blur">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <Link href="/admin" className="text-purple-300 hover:text-white">
                                ← Back
                            </Link>
                            <span className="text-xl font-bold text-white">Flagged Users</span>
                        </div>
                        <div className="text-slate-400 text-sm">
                            {flaggedUsers.length} flagged / {totalUsers} total
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Info Banner */}
                <div className="card p-4 mb-8 border-amber-500/30 bg-amber-500/5">
                    <p className="text-amber-400 text-sm">
                        <strong>🚨 Flagged users</strong> are accounts suspected of multi-accounting based on same IP or nearby coordinates with opposite predictions.
                    </p>
                </div>

                {/* Flagged Users List */}
                {flaggedUsers.length > 0 ? (
                    <FlaggedUsersList
                        users={JSON.parse(JSON.stringify(flaggedUsers))}
                    />
                ) : (
                    <div className="card p-12 text-center">
                        <span className="text-6xl mb-4 block">✅</span>
                        <p className="text-slate-400 text-lg">No flagged users yet!</p>
                        <p className="text-slate-500 text-sm mt-2">
                            Users will be flagged automatically when suspicious activity is detected.
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}
