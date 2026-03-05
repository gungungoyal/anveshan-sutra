"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle, Loader2, Zap, Shield, Target, Users, TrendingUp, Star, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/lib/services/auth";
import { useUserStore } from "@/lib/stores/userStore";
import Footer from "@/components/Footer";

const features = [
    {
        icon: Target,
        color: "text-blue-600 bg-blue-50",
        title: "AI Alignment Scoring",
        desc: "Get a real match score (0–100) for every organization based on your focus areas, region & mission.",
    },
    {
        icon: Shield,
        color: "text-green-600 bg-green-50",
        title: "Verified Profiles",
        desc: "Every organization is verified for credibility. No more chasing bad-fit or ghost partnerships.",
    },
    {
        icon: Zap,
        color: "text-orange-600 bg-orange-50",
        title: "Instant PPT Reports",
        desc: "Auto-generate professional partnership presentations in one click. Zero writing needed.",
    },
    {
        icon: Users,
        color: "text-purple-600 bg-purple-50",
        title: "Multi-Role Platform",
        desc: "Built for NGOs, CSR teams, and incubators — each sees data relevant to their goals.",
    },
];

const roles = [
    {
        id: "for-ngos",
        color: "green",
        emoji: "🌱",
        title: "For NGOs",
        headline: "Find CSR partners who actually care.",
        desc: "Stop cold-emailing strangers. See which CSR companies align with your mission before reaching out.",
        cta: "Get Started as NGO",
        badge: "bg-green-100 text-green-700",
        border: "border-green-200 hover:border-green-400",
        bg: "bg-gradient-to-br from-green-50 to-white",
        ctaBg: "bg-green-600 hover:bg-green-700",
    },
    {
        id: "for-csr",
        color: "orange",
        emoji: "🏢",
        title: "For CSR Teams",
        headline: "Cut through 200 applications to find 3 good ones.",
        desc: "Your AI assistant now ranks NGOs by mission fit, geography, and capacity — so you spend time on decisions, not research.",
        cta: "Get Started as CSR",
        badge: "bg-orange-100 text-orange-700",
        border: "border-orange-200 hover:border-orange-400",
        bg: "bg-gradient-to-br from-orange-50 to-white",
        ctaBg: "bg-orange-500 hover:bg-orange-600",
    },
    {
        id: "for-incubators",
        color: "sky",
        emoji: "🚀",
        title: "For Incubators",
        headline: "Discover startups and NGOs worth backing.",
        desc: "Find organizations that match your investment thesis — screened and scored across impact, scale, and mission.",
        cta: "Get Started as Incubator",
        badge: "bg-sky-100 text-sky-700",
        border: "border-sky-200 hover:border-sky-400",
        bg: "bg-gradient-to-br from-sky-50 to-white",
        ctaBg: "bg-sky-500 hover:bg-sky-600",
    },
];

const stats = [
    { value: "500+", label: "Organizations" },
    { value: "3 min", label: "Avg. time to match" },
    { value: "85%", label: "Match accuracy" },
    { value: "10×", label: "Faster than manual" },
];

const steps = [
    { n: "1", title: "Create your profile", desc: "Tell us your mission, focus areas, and target geography in under 2 minutes." },
    { n: "2", title: "Get your matches", desc: "AI ranks all relevant organizations by alignment score — highest first." },
    { n: "3", title: "Deep-dive & decide", desc: "Read the full compatibility report, risk flags, and reach out with confidence." },
];

const testimonials = [
    { name: "Priya Sharma", role: "CSR Head, TechCorp India", quote: "We used to spend 3 weeks vetting NGOs. Now we shortlist the top 5 in an afternoon." },
    { name: "Ravi Kumar", role: "Executive Director, GreenPath NGO", quote: "Found our first major corporate partner within days of signing up. The match score was spot on." },
    { name: "Anita Patel", role: "Program Manager, StartupNest", quote: "The PPT generator alone saves us 2 hours per organization. Incredibly useful tool." },
];

export default function DrivyaHome() {
    const { user, isLoading } = useAuth();

    const handleSignOut = async () => {
        await signOut();
        useUserStore.getState().resetOnboarding();
        window.location.href = "/";
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">

            {/* ── Minimal top nav (no Header component on landing) ── */}
            <header className="border-b border-border/50 bg-background/80 backdrop-blur-lg sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center shadow-blue">
                            <img src="/drivya-ai-logo.png" alt="" className="w-5 h-5 object-contain" />
                        </div>
                        <span className="font-extrabold text-lg tracking-tight text-foreground">Drivya.AI</span>
                    </Link>

                    <div className="flex items-center gap-2">
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                        ) : user ? (
                            <div className="flex items-center gap-2">
                                <Link href="/explore" className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors">
                                    Go to Explore
                                </Link>
                                <button onClick={handleSignOut} className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary/60 transition-colors">
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link href="/auth" className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
                                    Sign In
                                </Link>
                                <Link href="/start" className="px-4 py-2 text-sm font-semibold rounded-lg gradient-bg text-white shadow-blue hover:shadow-blue-lg transition-all">
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main className="flex-1">

                {/* ── HERO ── */}
                <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/60 via-white to-white dark:from-blue-950/20 dark:via-background dark:to-background pt-16 pb-20 md:pt-24 md:pb-28">
                    {/* Blurry orbs */}
                    <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-400/15 rounded-full blur-3xl" />
                    <div className="absolute top-16 right-1/4 w-48 h-48 bg-sky-300/15 rounded-full blur-3xl" />

                    <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
                        {/* Eyebrow */}
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-6 animate-fade-in-down">
                            <Zap className="w-3.5 h-3.5" />
                            AI-Powered Partnership Matching
                        </div>

                        {/* Headline */}
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-foreground leading-[1.1] mb-6 animate-fade-in-up">
                            Stop chasing partnerships{" "}
                            <span className="gradient-text">that go nowhere.</span>
                        </h1>

                        {/* Subheadline */}
                        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                            Know which organizations are worth your team's time — before you reach out.
                            Drivya ranks every match by real alignment, not guesswork.
                        </p>

                        {/* CTA Group */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
                            {user ? (
                                <Link href="/explore" className="inline-flex items-center gap-2 px-7 py-3.5 gradient-bg text-white rounded-xl font-semibold text-base shadow-blue hover:shadow-blue-lg hover:scale-[1.02] active:scale-[0.98] transition-all">
                                    Go to Explore <ArrowRight className="w-4 h-4" />
                                </Link>
                            ) : (
                                <>
                                    <Link href="/start" className="inline-flex items-center gap-2 px-7 py-3.5 gradient-bg text-white rounded-xl font-semibold text-base shadow-blue hover:shadow-blue-lg hover:scale-[1.02] active:scale-[0.98] transition-all">
                                        Get started free <ArrowRight className="w-4 h-4" />
                                    </Link>
                                    <Link href="/explore" className="inline-flex items-center gap-2 px-7 py-3.5 bg-background border border-border text-foreground rounded-xl font-medium text-base hover:bg-secondary/40 transition-all">
                                        See how it works
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Trust line */}
                        <p className="mt-6 text-sm text-muted-foreground/70 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
                            Trusted by NGOs, CSR teams & incubators nationwide · No credit card required
                        </p>
                    </div>
                </section>

                {/* ── STATS ── */}
                <section className="py-10 border-y border-border bg-white dark:bg-card">
                    <div className="max-w-4xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                        {stats.map((s) => (
                            <div key={s.value}>
                                <div className="text-3xl font-extrabold text-foreground mb-1">{s.value}</div>
                                <div className="text-sm text-muted-foreground font-medium">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── FEATURES ── */}
                <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3">
                            Everything you need to make smarter decisions
                        </h2>
                        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                            Built for the realities of CSR, NGO, and incubator partnerships.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
                        {features.map((f) => {
                            const Icon = f.icon;
                            return (
                                <div key={f.title} className="drivya-card p-5 group">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${f.color.split(" ")[1]}`}>
                                        <Icon className={`w-5 h-5 ${f.color.split(" ")[0]}`} />
                                    </div>
                                    <h3 className="font-bold text-foreground mb-2 text-[15px]">{f.title}</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* ── ROLE CARDS ── */}
                <section className="py-20 bg-secondary/30 dark:bg-card/30">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3">
                                Built for every kind of partnership
                            </h2>
                            <p className="text-muted-foreground text-lg">
                                Whether you're seeking funding or offering it — Drivya works for you.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            {roles.map((r) => (
                                <div key={r.id} id={r.id} className={`${r.bg} border ${r.border} rounded-2xl p-6 flex flex-col transition-all duration-200 hover:shadow-card-hover`}>
                                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-4 w-fit ${r.badge}`}>
                                        <span>{r.emoji}</span>
                                        {r.title}
                                    </div>
                                    <h3 className="text-lg font-bold text-foreground mb-2 leading-tight">{r.headline}</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-1">{r.desc}</p>
                                    <Link
                                        href="/start"
                                        className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-all ${r.ctaBg} hover:scale-[1.02] active:scale-[0.98]`}
                                    >
                                        {r.cta} <ArrowRight className="w-3.5 h-3.5" />
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── HOW IT WORKS ── */}
                <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3">How it works</h2>
                        <p className="text-muted-foreground text-lg">Three steps from sign-up to confident partnership decision.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 relative">
                        {/* Connector line (desktop) */}
                        <div className="hidden md:block absolute top-10 left-[calc(33.33%+12px)] right-[calc(33.33%+12px)] h-0.5 bg-border" />

                        {steps.map((s) => (
                            <div key={s.n} className="flex flex-col items-center text-center group">
                                <div className="w-20 h-20 rounded-2xl gradient-bg flex items-center justify-center mb-5 shadow-blue group-hover:shadow-blue-lg transition-shadow">
                                    <span className="text-3xl font-extrabold text-white">{s.n}</span>
                                </div>
                                <h3 className="font-bold text-foreground mb-2">{s.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── TESTIMONIALS ── */}
                <section className="py-20 bg-foreground dark:bg-card">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-extrabold text-background mb-2">Trusted by decision-makers</h2>
                            <div className="flex justify-center gap-1 mt-1">
                                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                            </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            {testimonials.map((t) => (
                                <div key={t.name} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                    <p className="text-background/80 text-sm leading-relaxed mb-5 italic">&quot;{t.quote}&quot;</p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full gradient-bg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                            {t.name[0]}
                                        </div>
                                        <div>
                                            <p className="text-background font-semibold text-sm">{t.name}</p>
                                            <p className="text-background/50 text-xs">{t.role}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── FINAL CTA ── */}
                <section className="py-20 max-w-3xl mx-auto px-4 sm:px-6 text-center">
                    <div className="drivya-card p-10 relative overflow-hidden">
                        {/* Gradient blob */}
                        <div className="absolute -top-8 -right-8 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
                        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-sky-400/10 rounded-full blur-2xl" />

                        <div className="relative">
                            <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-5 shadow-blue">
                                <TrendingUp className="w-7 h-7 text-white" />
                            </div>
                            <h2 className="text-3xl font-extrabold text-foreground mb-3">
                                Ready to make better partnership decisions?
                            </h2>
                            <p className="text-muted-foreground mb-8 text-lg">
                                Join hundreds of NGOs, CSR teams, and incubators who've replaced guesswork with Drivya's AI-powered matching.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                                <Link href="/start" className="inline-flex items-center gap-2 px-8 py-3.5 gradient-bg text-white rounded-xl font-semibold shadow-blue hover:shadow-blue-lg hover:scale-[1.02] active:scale-[0.98] transition-all">
                                    Start for free <ArrowRight className="w-4 h-4" />
                                </Link>
                                <Link href="/auth" className="px-8 py-3.5 border border-border rounded-xl font-medium text-foreground hover:bg-secondary/40 transition-all">
                                    Sign in
                                </Link>
                            </div>
                            <p className="text-xs text-muted-foreground/60 mt-4">No credit card required · Setup in under 2 minutes</p>
                        </div>
                    </div>
                </section>

            </main>

            <Footer />
        </div>
    );
}
