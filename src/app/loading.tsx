'use client';

import { useState, useEffect } from 'react';

const loaderSteps = [
    { emoji: '🏏', text: 'Swing Cricket' },
    { emoji: '🏆', text: 'Win Cricket' },
    { emoji: '🎯', text: 'Predict Cricket' },
    { emoji: '📊', text: 'Analyse Cricket' },
    { emoji: '⚡', text: 'Live Cricket' },
    { emoji: '🔥', text: 'Follow Cricket' },
];

export default function Loading() {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % loaderSteps.length);
        }, 500);

        return () => clearInterval(interval);
    }, []);

    const currentStep = loaderSteps[currentIndex];

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)' }}
        >
            {/* Animated Icon */}
            <div className="relative mb-6">
                <div
                    key={currentIndex}
                    className="text-7xl animate-bounce"
                    style={{
                        animation: 'bounce 0.5s ease-in-out',
                    }}
                >
                    {currentStep.emoji}
                </div>
                {/* Glow effect */}
                <div className="absolute inset-0 blur-2xl opacity-30 flex items-center justify-center">
                    <span className="text-7xl">{currentStep.emoji}</span>
                </div>
            </div>

            {/* Animated Text */}
            <div
                key={`text-${currentIndex}`}
                className="text-xl font-semibold text-white mb-8"
                style={{
                    animation: 'fadeIn 0.3s ease-out',
                }}
            >
                {currentStep.text}
            </div>

            {/* Loading Bar */}
            <div className="w-48 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full"
                    style={{
                        background: 'linear-gradient(90deg, #10b981, #059669)',
                        width: `${((currentIndex + 1) / loaderSteps.length) * 100}%`,
                        transition: 'width 0.5s ease-out',
                    }}
                />
            </div>

            {/* Dots indicator */}
            <div className="flex gap-2 mt-6">
                {loaderSteps.map((_, index) => (
                    <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentIndex
                                ? 'bg-emerald-500 scale-125'
                                : 'bg-slate-600'
                            }`}
                    />
                ))}
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
}
