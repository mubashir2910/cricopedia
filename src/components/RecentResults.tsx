'use client';

import { useState } from 'react';
import MatchCard from './MatchCard';
import { IMatch, SerializedMatch } from '@/models/Match';

interface RecentResultsProps {
    matches: (SerializedMatch & { userPrediction: string | null })[];
}

export default function RecentResults({ matches }: RecentResultsProps) {
    const INITIAL_COUNT = 4;
    const LOAD_MORE_COUNT = 6;

    const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);

    const visibleMatches = matches.slice(0, visibleCount);
    const hasMore = visibleCount < matches.length;
    const remainingCount = matches.length - visibleCount;

    const handleLoadMore = () => {
        setVisibleCount(prev => Math.min(prev + LOAD_MORE_COUNT, matches.length));
    };

    if (matches.length === 0) {
        return null;
    }

    return (
        <section>
            <h2 className="text-2xl font-bold mb-6">✅ Recent Results</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {visibleMatches.map((match, index) => (
                    <MatchCard
                        key={match._id}
                        match={match}
                        userPrediction={match.userPrediction}
                        index={index}
                    />
                ))}
            </div>

            {/* View More Button */}
            {hasMore && (
                <div className="mt-8 text-center">
                    <button
                        onClick={handleLoadMore}
                        className="btn-secondary px-8 py-3 rounded-lg font-medium transition-all hover:scale-105"
                    >
                        View More ({remainingCount} remaining)
                    </button>
                </div>
            )}

            {/* All Loaded Message */}
            {!hasMore && matches.length > INITIAL_COUNT && (
                <div className="mt-8 text-center">
                    <p className="text-slate-400 text-sm">
                        ✓ All {matches.length} results loaded
                    </p>
                </div>
            )}
        </section>
    );
}
