"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, User, ArrowRight, ArrowLeft, Loader2, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { sendOtp, verifyOtp, signUpWithPassword, signInWithPassword, resetPassword } from "@/lib/services/auth";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";

type AuthMode = "signup" | "login" | "forgot_password";
type AuthStep = "form" | "otp" | "reset_password" | "success";

function AuthPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { isAuthenticated, isLoading: authLoading, refreshUser, user } = useAuth();

    const [mode, setMode] = useState<AuthMode>("signup");
    const [step, setStep] = useState<AuthStep>("form");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [isInfoMessage, setIsInfoMessage] = useState(false); // For showing info instead of error (e.g., user already exists)

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");

    const [otpExpiresAt, setOtpExpiresAt] = useState<Date | null>(null);
    const [resendCooldown, setResendCooldown] = useState(0);


    const returnTo = searchParams?.get("returnTo") || "/onboarding";
    const [isRedirecting, setIsRedirecting] = useState(false);

    useEffect(() => {
        const handleRedirect = async () => {
            if (!authLoading && isAuthenticated && user?.id) {
                // Set redirecting state immediately to prevent flash
                setIsRedirecting(true);

                // Check onboarding status to determine redirect
                try {
                    const response = await fetch('/api/onboarding-status');
                    if (response.ok) {
                        const status = await response.json();

                        // If user has completed onboarding and has org, go to dashboard
                        if (status.hasOrganization && status.step === 'complete') {
                            const dashboardPath = status.role === 'ngo'
                                ? '/ngo-dashboard'
                                : '/search';
                            router.push(dashboardPath);
                            return;
                        }
                    }
                } catch (error) {
                    console.error('Error checking onboarding status:', error);
                }

                // Default: go to onboarding
                router.push(returnTo);
            }
        };

        handleRedirect();
    }, [isAuthenticated, authLoading, returnTo, router, user]);

    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    const handleSendOtp = async () => {
        setIsLoading(true);
        setErrorMessage("");
        try {
            const purpose = mode === "forgot_password" ? "password_reset" : "signup";
            const result = await sendOtp(email, purpose);
            if (result.success) {
                setStep("otp");
                setOtpExpiresAt(new Date(Date.now() + 10 * 60 * 1000));
                setResendCooldown(60);
            } else {
                setErrorMessage(result.error || "Failed to send OTP");
            }
        } catch (err: any) {
            setErrorMessage(err.message || "Failed to send OTP");
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (otp.length !== 6) {
            setErrorMessage("Please enter a 6-digit code");
            return;
        }
        setIsLoading(true);
        setErrorMessage("");
        setIsInfoMessage(false);
        try {
            const result = await verifyOtp(email, otp);
            if (result.success) {
                if (mode === "signup") {
                    const signupResult = await signUpWithPassword(email, password, name);
                    if (signupResult.error) {
                        // Check if user already exists - switch to login mode with a helpful message
                        if (signupResult.errorCode === 'USER_EXISTS') {
                            setStep("form");
                            setMode("login");
                            setErrorMessage("This email is already registered. Please sign in with your password.");
                            setIsInfoMessage(true);
                            setOtp("");
                        } else {
                            setErrorMessage(signupResult.error);
                        }
                    } else {
                        await refreshUser();
                        // NEW SIGNUPS: Always go directly to onboarding - no exceptions
                        router.push('/onboarding');
                    }
                } else if (mode === "forgot_password") {
                    setStep("reset_password");
                }
            } else {
                setErrorMessage(result.error || "Invalid OTP");
            }
        } catch (err: any) {
            setErrorMessage(err.message || "Verification failed");
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage("");
        try {
            const result = await signInWithPassword(email, password);
            if (result.error) {
                setErrorMessage(result.error);
            } else {
                await refreshUser();
                router.push(returnTo);
            }
        } catch (err: any) {
            setErrorMessage(err.message || "Login failed");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (newPassword.length < 8) {
            setErrorMessage("Password must be at least 8 characters");
            return;
        }
        setIsLoading(true);
        setErrorMessage("");
        try {
            const result = await resetPassword(email, newPassword);
            if (result.error) {
                setErrorMessage(result.error);
            } else {
                setStep("success");
            }
        } catch (err: any) {
            setErrorMessage(err.message || "Password reset failed");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignupSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setErrorMessage("Please enter your name");
            return;
        }
        if (password.length < 8) {
            setErrorMessage("Password must be at least 8 characters");
            return;
        }
        if (password !== confirmPassword) {
            setErrorMessage("Passwords do not match");
            return;
        }
        await handleSendOtp();
    };

    if (authLoading || isRedirecting) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="container mx-auto px-4 py-12 max-w-md">
                <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
                    <AnimatePresence mode="wait">
                        {step === "form" && (
                            <motion.div
                                key="form"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                            >
                                <div className="flex gap-2 mb-6">
                                    <button
                                        onClick={() => { setMode("signup"); setErrorMessage(""); setIsInfoMessage(false); }}
                                        className={`flex-1 py-2 rounded-lg font-medium transition ${mode === "signup" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                                    >
                                        Sign Up
                                    </button>
                                    <button
                                        onClick={() => { setMode("login"); setErrorMessage(""); setIsInfoMessage(false); }}
                                        className={`flex-1 py-2 rounded-lg font-medium transition ${mode === "login" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                                    >
                                        Sign In
                                    </button>
                                </div>

                                {errorMessage && (
                                    <div className={`flex items-center gap-2 p-3 rounded-lg mb-4 ${isInfoMessage
                                        ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400'
                                        : 'bg-red-50 dark:bg-red-950/30 text-red-600'
                                        }`}>
                                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                        <span className="text-sm">{errorMessage}</span>
                                    </div>
                                )}

                                {mode === "signup" ? (
                                    <form onSubmit={handleSignupSubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Name</label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                                <input
                                                    type="text"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    placeholder="Your full name"
                                                    className="w-full pl-10 pr-4 py-3 border border-border rounded-xl bg-background focus:ring-2 focus:ring-primary"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Email</label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                                <input
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    placeholder="you@example.com"
                                                    className="w-full pl-10 pr-4 py-3 border border-border rounded-xl bg-background focus:ring-2 focus:ring-primary"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Password</label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    placeholder="Min 8 characters"
                                                    className="w-full pl-10 pr-12 py-3 border border-border rounded-xl bg-background focus:ring-2 focus:ring-primary"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                                >
                                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Confirm Password</label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    placeholder="Confirm password"
                                                    className="w-full pl-10 pr-4 py-3 border border-border rounded-xl bg-background focus:ring-2 focus:ring-primary"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-50"
                                        >
                                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Create Account <ArrowRight className="w-5 h-5" /></>}
                                        </button>
                                    </form>
                                ) : (
                                    <form onSubmit={handleLogin} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Email</label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                                <input
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    placeholder="you@example.com"
                                                    className="w-full pl-10 pr-4 py-3 border border-border rounded-xl bg-background focus:ring-2 focus:ring-primary"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Password</label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    placeholder="Your password"
                                                    className="w-full pl-10 pr-12 py-3 border border-border rounded-xl bg-background focus:ring-2 focus:ring-primary"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                                >
                                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                </button>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => { setMode("forgot_password"); setStep("form"); }}
                                            className="text-sm text-primary hover:underline"
                                        >
                                            Forgot password?
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-50"
                                        >
                                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Sign In <ArrowRight className="w-5 h-5" /></>}
                                        </button>
                                    </form>
                                )}

                                {mode === "forgot_password" && (
                                    <div className="space-y-4">
                                        <button onClick={() => setMode("login")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                                            <ArrowLeft className="w-4 h-4" /> Back to login
                                        </button>
                                        <h2 className="text-xl font-bold">Reset Password</h2>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Email</label>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="you@example.com"
                                                className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:ring-2 focus:ring-primary"
                                            />
                                        </div>
                                        <button
                                            onClick={handleSendOtp}
                                            disabled={isLoading}
                                            className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold"
                                        >
                                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Send Reset Code"}
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {step === "otp" && (
                            <motion.div
                                key="otp"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="text-center"
                            >
                                <h2 className="text-xl font-bold mb-2">Enter Verification Code</h2>
                                <p className="text-muted-foreground mb-6">We sent a 6-digit code to {email}</p>

                                {errorMessage && (
                                    <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 text-red-600 rounded-lg mb-4">
                                        <AlertCircle className="w-4 h-4" />
                                        <span className="text-sm">{errorMessage}</span>
                                    </div>
                                )}

                                <div className="flex justify-center mb-6">
                                    <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                                        <InputOTPGroup>
                                            <InputOTPSlot index={0} />
                                            <InputOTPSlot index={1} />
                                            <InputOTPSlot index={2} />
                                            <InputOTPSlot index={3} />
                                            <InputOTPSlot index={4} />
                                            <InputOTPSlot index={5} />
                                        </InputOTPGroup>
                                    </InputOTP>
                                </div>

                                <button
                                    onClick={handleVerifyOtp}
                                    disabled={isLoading || otp.length !== 6}
                                    className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold disabled:opacity-50"
                                >
                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Verify"}
                                </button>

                                <button
                                    onClick={handleSendOtp}
                                    disabled={resendCooldown > 0}
                                    className="mt-4 text-sm text-primary hover:underline disabled:text-muted-foreground"
                                >
                                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
                                </button>
                            </motion.div>
                        )}

                        {step === "reset_password" && (
                            <motion.div
                                key="reset"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-4"
                            >
                                <h2 className="text-xl font-bold">Set New Password</h2>
                                <div>
                                    <label className="block text-sm font-medium mb-1">New Password</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Min 8 characters"
                                        className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <button
                                    onClick={handleResetPassword}
                                    disabled={isLoading}
                                    className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold"
                                >
                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Reset Password"}
                                </button>
                            </motion.div>
                        )}

                        {step === "success" && (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-8"
                            >
                                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="w-8 h-8 text-green-600" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Password Reset!</h3>
                                <p className="text-muted-foreground mb-4">Your password has been updated.</p>
                                <button
                                    onClick={() => { setMode("login"); setStep("form"); }}
                                    className="text-primary hover:underline"
                                >
                                    Sign in with new password
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default function AuthPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        }>
            <AuthPageContent />
        </Suspense>
    );
}
