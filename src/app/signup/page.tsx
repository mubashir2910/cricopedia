'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

type Step = 'email' | 'otp' | 'password' | 'phone';

export default function SignupPage() {
    const router = useRouter();
    const [step, setStep] = useState<Step>('email');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);

    // Countdown timer for resend OTP
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const getClientInfo = async () => {
        let signupIP = '';
        let signupCoords = null;

        // Get IP address
        try {
            const ipRes = await fetch('https://api.ipify.org?format=json');
            const ipData = await ipRes.json();
            signupIP = ipData.ip;
        } catch {
            console.log('Could not get IP');
        }

        // Get geolocation (if permitted)
        try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    timeout: 5000,
                    maximumAge: 60000,
                });
            });
            signupCoords = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
            };
        } catch {
            console.log('Geolocation not available');
        }

        return { signupIP, signupCoords };
    };

    const handleSendOTP = async () => {
        setError('');
        setSuccess('');

        if (!email) {
            setError('Please enter your email');
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch('/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error);
                return;
            }

            setSuccess('OTP sent to your email! Check your inbox.');
            setStep('otp');
            setCountdown(60); // 60 seconds before resend allowed
        } catch {
            setError('Failed to send OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        setError('');
        setSuccess('');

        if (otp.length !== 6) {
            setError('Please enter the 6-digit OTP');
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error);
                return;
            }

            setSuccess('Email verified! Now create your password.');
            setStep('password');
        } catch {
            setError('Verification failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordSubmit = () => {
        setError('');

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setStep('phone');
    };

    const handleFinalSubmit = async () => {
        setError('');
        setSuccess('');

        if (!displayName || displayName.trim().length < 2) {
            setError('Please enter your display name (at least 2 characters)');
            return;
        }

        if (!phoneNumber || phoneNumber.replace(/\D/g, '').length < 10) {
            setError('Please enter a valid 10-digit phone number');
            return;
        }

        setIsLoading(true);

        try {
            const { signupIP, signupCoords } = await getClientInfo();

            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    password,
                    phoneNumber,
                    displayName: displayName.trim(),
                    signupIP,
                    signupCoords,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error);
                return;
            }

            // Auto-login after successful signup
            const result = await signIn('user-login', {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                router.push('/login');
            } else {
                router.push('/dashboard');
                router.refresh();
            }
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const stepInfo = {
        email: { number: 1, title: 'Verify Email', subtitle: 'We\'ll send you a verification code' },
        otp: { number: 1, title: 'Enter OTP', subtitle: 'Check your email for the 6-digit code' },
        password: { number: 2, title: 'Create Password', subtitle: 'Make it strong and memorable' },
        phone: { number: 3, title: 'Phone Number', subtitle: 'For prize verification' },
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: 'var(--gradient-hero)' }}>
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative w-full max-w-md"
            >
                {/* Logo/Header */}
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4"
                        style={{ background: 'var(--gradient-primary)' }}
                    >
                        <span className="text-4xl">🏏</span>
                    </motion.div>
                    <h1 className="text-3xl font-bold gradient-text mb-2">{stepInfo[step].title}</h1>
                    <p className="text-slate-400">{stepInfo[step].subtitle}</p>
                </div>

                {/* Progress Steps */}
                <div className="flex justify-center gap-2 mb-8">
                    {[1, 2, 3].map((num) => (
                        <div
                            key={num}
                            className={`w-12 h-1.5 rounded-full transition-colors ${stepInfo[step].number >= num ? 'bg-emerald-500' : 'bg-slate-700'
                                }`}
                        />
                    ))}
                </div>

                {/* Signup Form */}
                <div className="card p-8">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm mb-6"
                        >
                            {error}
                        </motion.div>
                    )}

                    {success && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm mb-6"
                        >
                            {success}
                        </motion.div>
                    )}

                    {/* Step 1: Email */}
                    {step === 'email' && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-6"
                        >
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value.toLowerCase())}
                                    className="input"
                                    placeholder="your@email.com"
                                    required
                                />
                            </div>

                            <button
                                onClick={handleSendOTP}
                                disabled={isLoading || !email}
                                className="btn-primary w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Sending OTP...' : 'Send Verification Code'}
                            </button>
                        </motion.div>
                    )}

                    {/* Step 1b: OTP */}
                    {step === 'otp' && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-6"
                        >
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Enter 6-digit OTP
                                </label>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    className="input text-center text-2xl tracking-widest"
                                    placeholder="000000"
                                    maxLength={6}
                                />
                            </div>

                            <button
                                onClick={handleVerifyOTP}
                                disabled={isLoading || otp.length !== 6}
                                className="btn-primary w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Verifying...' : 'Verify OTP'}
                            </button>

                            <div className="text-center">
                                {countdown > 0 ? (
                                    <p className="text-slate-500 text-sm">
                                        Resend OTP in <span className="text-amber-400">{countdown}s</span>
                                    </p>
                                ) : (
                                    <button
                                        onClick={() => { setStep('email'); setOtp(''); }}
                                        className="text-emerald-400 hover:text-emerald-300 text-sm"
                                    >
                                        ← Change email or resend OTP
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* Step 2: Password */}
                    {step === 'password' && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-6"
                        >
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Create Password
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input"
                                    placeholder="Min 6 characters"
                                    minLength={6}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Confirm Password
                                </label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="input"
                                    placeholder="Re-enter password"
                                />
                                {confirmPassword && password !== confirmPassword && (
                                    <p className="mt-1 text-xs text-red-400">Passwords don&apos;t match</p>
                                )}
                            </div>

                            <button
                                onClick={handlePasswordSubmit}
                                disabled={password.length < 6 || password !== confirmPassword}
                                className="btn-primary w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Continue
                            </button>
                        </motion.div>
                    )}

                    {/* Step 3: Phone Number */}
                    {step === 'phone' && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-6"
                        >
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Display Name <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    className="input"
                                    placeholder="Enter your real name"
                                    maxLength={30}
                                    required
                                />
                                <p className="mt-1 text-xs text-slate-500">
                                    This will be shown on the leaderboard
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Phone Number
                                </label>
                                <div className="flex gap-2">
                                    <span className="flex items-center px-4 rounded-lg bg-slate-800 text-slate-400 border border-slate-700">
                                        +91
                                    </span>
                                    <input
                                        type="tel"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                        className="input flex-1"
                                        placeholder="10-digit number"
                                        maxLength={10}
                                    />
                                </div>
                            </div>

                            {/* Warning */}
                            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                                <p className="text-amber-400 text-sm flex items-start gap-2">
                                    <span className="text-lg flex-shrink-0">⚠️</span>
                                    <span>
                                        <strong>Important:</strong> Enter your <strong>correct name and phone number</strong>. If you win any prize (weekly, mid-tournament, or final), we will verify your identity. If your name or number doesn&apos;t match our database, or we detect foul play, you will be <strong>disqualified</strong> from receiving any prizes.
                                    </span>
                                </p>
                            </div>

                            <button
                                onClick={handleFinalSubmit}
                                disabled={isLoading || phoneNumber.length !== 10 || displayName.trim().length < 2}
                                className="btn-primary w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Creating Account...
                                    </span>
                                ) : (
                                    'Create Account 🎉'
                                )}
                            </button>
                        </motion.div>
                    )}

                    <div className="mt-6 text-center">
                        <p className="text-slate-400">
                            Already have an account?{' '}
                            <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
