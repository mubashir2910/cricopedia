import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/mongodb';
import Match from '@/models/Match';
import Link from 'next/link';

async function getMatches() {
    await dbConnect();
    return Match.find().sort({ matchDate: -1 }).lean();
}

export default async function AdminMatchesPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isAdmin) {
        redirect('/admin/login');
    }

    const matches = await getMatches();

    return (
        <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)' }}>
            {/* Admin Header */}
            <header className="border-b border-purple-500/20 bg-purple-900/20 backdrop-blur">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <Link href="/admin" className="text-slate-400 hover:text-white">
                                ← Dashboard
                            </Link>
                            <span className="text-xl font-bold text-white">Manage Matches</span>
                        </div>
                        <Link
                            href="/admin/matches/create"
                            className="px-4 py-2 rounded-lg text-white font-medium transition-all"
                            style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)' }}
                        >
                            + Add Match
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {matches.length > 0 ? (
                    <div className="card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-700/50">
                                        <th className="text-left py-4 px-6 text-sm font-medium text-slate-400">Match</th>
                                        <th className="text-left py-4 px-6 text-sm font-medium text-slate-400">Date</th>
                                        <th className="text-left py-4 px-6 text-sm font-medium text-slate-400">Status</th>
                                        <th className="text-left py-4 px-6 text-sm font-medium text-slate-400">Winner</th>
                                        <th className="text-right py-4 px-6 text-sm font-medium text-slate-400">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {matches.map((match: any) => (
                                        <tr
                                            key={match._id.toString()}
                                            className="border-b border-slate-700/30 hover:bg-white/5 transition-colors"
                                        >
                                            <td className="py-4 px-6">
                                                <div>
                                                    <p className="font-medium text-white">{match.title}</p>
                                                    <p className="text-sm text-slate-400">
                                                        {match.teamA} vs {match.teamB}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <p className="text-white">
                                                    {new Date(match.matchDate).toLocaleDateString()}
                                                </p>
                                                <p className="text-sm text-slate-400">
                                                    {new Date(match.matchDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={`badge ${match.status === 'upcoming' ? 'badge-upcoming' :
                                                    match.status === 'live' ? 'badge-live' : 'badge-completed'
                                                    }`}>
                                                    {match.status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6">
                                                {match.winner ? (
                                                    <span className="text-emerald-400 font-medium">{match.winner}</span>
                                                ) : (
                                                    <span className="text-slate-500">-</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <Link
                                                    href={`/admin/matches/${match._id}/edit`}
                                                    className="text-purple-400 hover:text-purple-300 transition-colors"
                                                >
                                                    Edit →
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="card p-12 text-center">
                        <div className="text-6xl mb-4">🏏</div>
                        <h2 className="text-xl font-bold text-white mb-2">No Matches Yet</h2>
                        <p className="text-slate-400 mb-6">Create your first match to get started!</p>
                        <Link
                            href="/admin/matches/create"
                            className="btn-primary inline-block"
                        >
                            Create Match
                        </Link>
                    </div>
                )}
            </main>
        </div>
    );
}
