'use client';

import { useEffect, useState } from 'react';

interface CountdownTimerProps {
    targetDate: Date | string;
    onExpire?: () => void;
}

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

export default function CountdownTimer({ targetDate, onExpire }: CountdownTimerProps) {
    const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const target = new Date(targetDate).getTime();
            const now = new Date().getTime();
            const difference = target - now;

            if (difference <= 0) {
                setIsExpired(true);
                onExpire?.();
                return { days: 0, hours: 0, minutes: 0, seconds: 0 };
            }

            return {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((difference % (1000 * 60)) / 1000),
            };
        };

        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDate, onExpire]);

    if (isExpired) {
        return (
            <div className="text-center text-red-400 font-semibold">
                Predictions Locked 🔒
            </div>
        );
    }

    // Safely format numbers - ensure they're never negative
    const formatNum = (n: number) => String(Math.max(0, n || 0)).padStart(2, '0');

    return (
        <div className="countdown">
            <div className="countdown-item">
                <div className="countdown-value">{formatNum(timeLeft.days)}</div>
                <div className="countdown-label">Days</div>
            </div>
            <div className="countdown-item">
                <div className="countdown-value">{formatNum(timeLeft.hours)}</div>
                <div className="countdown-label">Hours</div>
            </div>
            <div className="countdown-item">
                <div className="countdown-value">{formatNum(timeLeft.minutes)}</div>
                <div className="countdown-label">Mins</div>
            </div>
            <div className="countdown-item">
                <div className="countdown-value">{formatNum(timeLeft.seconds)}</div>
                <div className="countdown-label">Secs</div>
            </div>
        </div>
    );
}
