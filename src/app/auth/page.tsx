"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Mail,
    Lock,
    User,
    ArrowRight,
    Eye,
    EyeOff,
    Loader2,
    CheckCircle,
    AlertCircle,
    ArrowLeft
} from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useAuth } from "@/hooks/useAuth";
import { sendOtp, verifyOtp, signUpWithPassword, signInWithPassword, resetPassword } from "@/lib/services/auth";

function AuthPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useAuth();

    const [mode, setMode] = useState<"signup" | "login" | "forgot_password">("signup");
    const [step, setStep] = useState<"form" | "otp" | "reset_password" | "success">("form");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [isInfoMessage, setIsInfoMessage] = useState(false);

    // Form states
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [role, setRole] = useState<"incubator" | "csr" | "ngo">("incubator");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");

    // Resend cooldown
    const [resendCooldown, setResendCooldown] = useState(0);

    useEffect(() => {
        const type = searchParams.get("type");
        if (type === "login") setMode("login");
        else if (type === "signup") setMode("signup");

        const message = searchParams.get("message");
        if (message) {
            setErrorMessage(decodeURIComponent(message));
            setIsInfoMessage(true);
        }
    }, [searchParams]);

    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    // Role mapping for backend
    const roleMap = {
        incubator: 'incubator',
        csr: 'csr_partner',
        ngo: 'ngo_partner'
    };

    const handleSignupSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage("");
        setIsInfoMessage(false);

        if (password !== confirmPassword) {
            setErrorMessage("Passwords do not match");
            return;
        }

        setIsLoading(true);
        try {
            const result = await signUpWithPassword(email, password, name, roleMap[role] as any);

            if (result.error) {
                if (result.errorCode === 'USER_EXISTS') {
                    setErrorMessage("This email is already registered. Please sign in instead.");
                } else {
                    setErrorMessage(result.error);
                }
                setIsInfoMessage(false);
                return;
            }

            // Actually send the OTP email now that the account is created
            const otpResult = await sendOtp(email, 'signup');
            if (!otpResult.success) {
                // Account created but email failed — still show OTP step so user can resend
                setStep("otp");
                setIsInfoMessage(false);
                setErrorMessage(otpResult.error || "Account created but failed to send verification email. Click Resend.");
            } else {
                setResendCooldown(60); // start cooldown so user doesn't immediately resend
                setStep("otp");
                setIsInfoMessage(true);
                setErrorMessage("Verification code sent! Please check your email.");
            }
        } catch (error: any) {
            setErrorMessage(error.message || "An error occurred during sign up");
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage("");
        setIsInfoMessage(false);
        setIsLoading(true);

        try {
            await signInWithPassword(email, password);
            router.push("/dashboard");
        } catch (error: any) {
            // Check if email not verified
            if (error.message?.includes("Email not confirmed")) {
                await sendOtp(email);
                setStep("otp");
                setIsInfoMessage(true);
                setErrorMessage("Your email is not verified. We've sent a new code.");
            } else {
                setErrorMessage(error.message || "Invalid email or password");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendOtp = async () => {
        if (resendCooldown > 0) return;
        setIsLoading(true);
        try {
            await sendOtp(email);
            setResendCooldown(60);
            setIsInfoMessage(true);
            setErrorMessage("Verification code resent to your email.");
        } catch (error: any) {
            setErrorMessage(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        setIsLoading(true);
        setErrorMessage("");
        try {
            await verifyOtp(email, otp);
            if (mode === "forgot_password") {
                setStep("reset_password");
            } else {
                router.push("/dashboard");
            }
        } catch (error: any) {
            setErrorMessage(error.message || "Invalid code. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async () => {
        setIsLoading(true);
        try {
            await resetPassword(email, newPassword);
            setStep("success");
        } catch (error: any) {
            setErrorMessage(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout>
            <main className="w-full max-w-md relative z-10">
                <AnimatePresence mode="wait">
                    {step === "form" && mode !== "forgot_password" && (
                        <motion.div
                            key="form-main"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="w-full"
                        >
                            <div className="mb-10 text-center lg:text-left relative">
                                <div className="absolute top-0 right-0 hidden lg:block">
                                    <p className="text-sm font-medium">
                                        {mode === "signup" ? "Already have an account?" : "New to Drivya?"}
                                        <button
                                            onClick={() => setMode(mode === "signup" ? "login" : "signup")}
                                            className="text-[#C9A84C] font-bold underline ml-1"
                                        >
                                            {mode === "signup" ? "Sign In" : "Sign Up"}
                                        </button>
                                    </p>
                                </div>
                                <h2 className="font-serif text-4xl lg:text-5xl font-semibold mb-2 text-[#0D1B2A]">
                                    {mode === "signup" ? "Create your account" : "Welcome back."}
                                </h2>
                                <p className="text-[#666e75] font-sans-dm">
                                    {mode === "signup" ? "Start finding aligned partners in minutes." : "Sign in to see your matches."}
                                </p>
                            </div>

                            <div className="lg:hidden flex p-1 bg-black/5 rounded-xl mb-8">
                                <button
                                    onClick={() => { setMode("signup"); setErrorMessage(""); setIsInfoMessage(false); }}
                                    className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${mode === "signup" ? "bg-[#0D1B2A] text-white shadow-sm" : "text-[#666e75]"}`}
                                >
                                    Sign Up
                                </button>
                                <button
                                    onClick={() => { setMode("login"); setErrorMessage(""); setIsInfoMessage(false); }}
                                    className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${mode === "login" ? "bg-[#0D1B2A] text-white shadow-sm" : "text-[#666e75]"}`}
                                >
                                    Sign In
                                </button>
                            </div>

                            {errorMessage && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    className={`flex items-start gap-3 p-4 rounded-sm mb-6 overflow-hidden ${isInfoMessage
                                        ? 'bg-blue-500/10 border border-blue-500/20 text-blue-600'
                                        : 'bg-red-500/10 border border-red-500/20 text-red-600'
                                        }`}
                                >
                                    {isInfoMessage ? <CheckCircle className="w-5 h-5 mt-0.5 shrink-0" /> : <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />}
                                    <span className="text-sm font-medium leading-relaxed">{errorMessage}</span>
                                </motion.div>
                            )}

                            {mode === "signup" ? (
                                <form onSubmit={handleSignupSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[12px] font-bold text-[#0D1B2A] uppercase tracking-wider">Full Name</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="John Doe"
                                            className="w-full px-4 py-4 border border-[#0D1B2A]/10 rounded-sm bg-white focus:ring-4 focus:ring-[#C9A84C]/10 focus:border-[#C9A84C] transition-all outline-none font-sans-dm"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[12px] font-bold text-[#0D1B2A] uppercase tracking-wider">Work Email</label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="john@company.com"
                                            className="w-full px-4 py-4 border border-[#0D1B2A]/10 rounded-sm bg-white focus:ring-4 focus:ring-[#C9A84C]/10 focus:border-[#C9A84C] transition-all outline-none font-sans-dm"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[12px] font-bold text-[#0D1B2A] uppercase tracking-wider">Password</label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="Min. 8 characters"
                                                className="w-full px-4 py-4 border border-[#0D1B2A]/10 rounded-sm bg-white focus:ring-4 focus:ring-[#C9A84C]/10 focus:border-[#C9A84C] transition-all outline-none font-sans-dm"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition-opacity"
                                            >
                                                {showPassword ? <EyeOff className="w-5 h-5 text-[#0D1B2A]" /> : <Eye className="w-5 h-5 text-[#0D1B2A]" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[12px] font-bold text-[#0D1B2A] uppercase tracking-wider">Confirm Password</label>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Repeat password"
                                            className="w-full px-4 py-4 border border-[#0D1B2A]/10 rounded-sm bg-white focus:ring-4 focus:ring-[#C9A84C]/10 focus:border-[#C9A84C] transition-all outline-none font-sans-dm"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[12px] font-bold text-[#0D1B2A] uppercase tracking-wider">Select your role</label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {[
                                                { id: 'incubator', label: 'Incubator', icon: '🏗️' },
                                                { id: 'csr', label: 'CSR', icon: '🏢' },
                                                { id: 'ngo', label: 'NGO', icon: '🤝' }
                                            ].map((r) => (
                                                <button
                                                    key={r.id}
                                                    type="button"
                                                    onClick={() => setRole(r.id as any)}
                                                    className={`p-4 border rounded-sm text-center transition-all ${role === r.id ? "bg-[#0D1B2A] border-[#C9A84C] text-[#FAF7F2] shadow-lg" : "bg-white border-[#0D1B2A]/10 text-[#0D1B2A] hover:border-[#C9A84C]"}`}
                                                >
                                                    <span className="block text-2xl mb-2">{r.icon}</span>
                                                    <span className="text-[10px] font-bold uppercase tracking-tight">{r.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full py-5 bg-[#C9A84C] text-[#0D1B2A] rounded-sm font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#C9A84C]/90 active:scale-[0.98] transition-all disabled:opacity-50 mt-8"
                                    >
                                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Create Account &rarr;</>}
                                    </button>

                                    <p className="text-[11px] text-[#666e75] text-center mt-6 leading-relaxed">
                                        By signing up you agree to Drivya&apos;s <br />
                                        <span className="underline cursor-pointer">Terms</span> and <span className="underline cursor-pointer">Privacy Policy</span>
                                    </p>
                                </form>
                            ) : (
                                <form onSubmit={handleLogin} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[12px] font-bold text-[#0D1B2A] uppercase tracking-wider">Work Email</label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="you@company.com"
                                            className="w-full px-4 py-4 border border-[#0D1B2A]/10 rounded-sm bg-white focus:ring-4 focus:ring-[#C9A84C]/10 focus:border-[#C9A84C] transition-all outline-none font-sans-dm"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <label className="text-[12px] font-bold text-[#0D1B2A] uppercase tracking-wider">Password</label>
                                            <button
                                                type="button"
                                                onClick={() => { setMode("forgot_password"); setStep("form"); }}
                                                className="text-[10px] font-bold text-[#C9A84C] uppercase tracking-tight hover:underline"
                                            >
                                                Forgot Password?
                                            </button>
                                        </div>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="Enter password"
                                                className="w-full px-4 py-4 border border-[#0D1B2A]/10 rounded-sm bg-white focus:ring-4 focus:ring-[#C9A84C]/10 focus:border-[#C9A84C] transition-all outline-none font-sans-dm"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition-opacity"
                                            >
                                                {showPassword ? <EyeOff className="w-5 h-5 text-[#0D1B2A]" /> : <Eye className="w-5 h-5 text-[#0D1B2A]" />}
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full py-5 bg-[#0D1B2A] text-[#FAF7F2] rounded-sm font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#1a2b3c] active:scale-[0.98] transition-all disabled:opacity-50 mt-8"
                                    >
                                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Sign In &rarr;</>}
                                    </button>

                                    <div className="relative py-4">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-[#0D1B2A]/10"></div>
                                        </div>
                                        <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
                                            <span className="bg-[#FAF7F2] px-4 text-[#666e75]">Or continue with</span>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        className="w-full py-4 border border-[#0D1B2A]/10 rounded-sm font-bold text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black/5 transition-all text-[#0D1B2A]"
                                    >
                                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                        </svg>
                                        Google
                                    </button>
                                </form>
                            )}
                        </motion.div>
                    )}

                    {step === "otp" && (
                        <motion.div
                            key="otp"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            className="w-full max-w-sm mx-auto text-center"
                        >
                            <h1 className="font-serif text-4xl lg:text-5xl font-semibold mb-4 text-[#0D1B2A]">Verify Email</h1>
                            <p className="text-[#666e75] font-sans-dm mb-12">
                                A 6-digit code has been sent to <span className="font-bold text-[#0D1B2A]">{email}</span>
                            </p>

                            <div className="flex justify-center mb-10">
                                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                                    <InputOTPGroup className="gap-2 sm:gap-3 ring-0 border-0">
                                        {[0, 1, 2, 3, 4, 5].map((i) => (
                                            <InputOTPSlot
                                                key={i}
                                                index={i}
                                                className="w-12 h-16 sm:w-14 sm:h-20 text-2xl font-bold border border-[#0D1B2A]/10 rounded-sm bg-white focus:border-[#C9A84C] focus:ring-4 focus:ring-[#C9A84C]/10 transition-all text-[#0D1B2A]"
                                            />
                                        ))}
                                    </InputOTPGroup>
                                </InputOTP>
                            </div>

                            <button
                                onClick={handleVerifyOtp}
                                disabled={isLoading || otp.length !== 6}
                                className="w-full py-5 bg-[#0D1B2A] text-[#FAF7F2] rounded-sm font-bold text-sm uppercase tracking-widest flex items-center justify-center transition-all disabled:opacity-50"
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify Identity"}
                            </button>

                            <div className="mt-12 text-center">
                                <p className="text-[11px] text-[#666e75] uppercase tracking-widest font-bold mb-3">Didn&apos;t receive it?</p>
                                <button
                                    onClick={handleSendOtp}
                                    disabled={resendCooldown > 0}
                                    className="text-[12px] font-bold text-[#C9A84C] uppercase tracking-widest underline disabled:text-gray-400"
                                >
                                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === "reset_password" && (
                        <motion.div
                            key="reset_password"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="w-full max-w-sm mx-auto"
                        >
                            <div className="text-center mb-10">
                                <h1 className="font-serif text-4xl font-semibold mb-2 text-[#0D1B2A]">New Password</h1>
                                <p className="text-[#666e75] font-sans-dm">Choose a strong password for your account.</p>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[12px] font-bold text-[#0D1B2A] uppercase tracking-wider">New Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0D1B2A]/50" />
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="At least 8 characters"
                                            className="w-full pl-12 pr-4 py-4 border border-[#0D1B2A]/10 rounded-sm bg-white focus:ring-4 focus:ring-[#C9A84C]/10 focus:border-[#C9A84C] transition-all outline-none font-sans-dm"
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={handleResetPassword}
                                    disabled={isLoading}
                                    className="w-full py-5 bg-[#0D1B2A] text-[#FAF7F2] rounded-sm font-bold text-sm uppercase tracking-widest flex items-center justify-center transition-all disabled:opacity-50"
                                >
                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Reset Password"}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === "success" && (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-full max-w-sm mx-auto text-center"
                        >
                            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 text-[#0D1B2A]">
                                <CheckCircle className="w-12 h-12" />
                            </div>
                            <h1 className="font-serif text-4xl font-semibold mb-4 text-[#0D1B2A]">Success!</h1>
                            <p className="text-[#666e75] mb-10 text-lg font-sans-dm px-4">
                                Your account is ready. You can now securely sign in to the Drivya platform.
                            </p>
                            <button
                                onClick={() => { setMode("login"); setStep("form"); }}
                                className="w-full py-5 bg-[#0D1B2A] text-[#FAF7F2] rounded-sm font-bold text-sm uppercase tracking-widest transition-all hover:bg-[#1a2b3c]"
                            >
                                Sign In Now
                            </button>
                        </motion.div>
                    )}

                    {mode === "forgot_password" && step === "form" && (
                        <motion.div
                            key="forgot"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="w-full max-w-sm mx-auto"
                        >
                            <button onClick={() => setMode("login")} className="flex items-center gap-2 text-[10px] font-bold text-[#666e75] uppercase tracking-widest hover:text-[#0D1B2A] mb-10 transition-colors group">
                                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to login
                            </button>

                            <div className="text-center mb-10 lg:text-left">
                                <h1 className="font-serif text-4xl lg:text-5xl font-semibold mb-4 text-[#0D1B2A]">Reset Password</h1>
                                <p className="text-[#666e75] font-sans-dm">
                                    Enter your work email and we&apos;ll send a code to reset your password.
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[12px] font-bold text-[#0D1B2A] uppercase tracking-wider">Work Email</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@company.com"
                                        className="w-full px-4 py-4 border border-[#0D1B2A]/10 rounded-sm bg-white focus:ring-4 focus:ring-[#C9A84C]/10 focus:border-[#C9A84C] transition-all outline-none font-sans-dm"
                                    />
                                </div>
                                <button
                                    onClick={handleSendOtp}
                                    disabled={isLoading}
                                    className="w-full py-5 bg-[#0D1B2A] text-[#FAF7F2] rounded-sm font-bold text-sm uppercase tracking-widest flex items-center justify-center transition-all disabled:opacity-50"
                                >
                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Reset Code"}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </AuthLayout>
    );
}

export default function AuthPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center text-[#0D1B2A]">
                <Loader2 className="w-10 h-10 animate-spin" />
            </div>
        }>
            <AuthPageContent />
        </Suspense>
    );
}
