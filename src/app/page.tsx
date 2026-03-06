"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ArrowRight, ChevronRight, Target, Search, Target as TargetIcon, Globe, MapPin, Users, Zap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/lib/services/auth";
import { useUserStore } from "@/lib/stores/userStore";
import Footer from "@/components/Footer";

// Animation component using IntersectionObserver
function ScrollReveal({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setTimeout(() => setIsVisible(true), delay);
            }
        }, { threshold: 0.1 });

        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [delay]);

    return (
        <div
            ref={ref}
            className={`${className} transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
            {children}
        </div>
    );
}

// Progress bar component for the score demo
function ScoreBar({ label, value, colorClass }: { label: string, value: number, colorClass: string }) {
    const [width, setWidth] = useState(0);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setTimeout(() => setWidth(value), 300);
            }
        }, { threshold: 0.1 });

        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [value]);

    return (
        <div ref={ref} className="mb-4">
            <div className="flex justify-between text-xs font-semibold mb-1 uppercase tracking-wider opacity-70">
                <span>{label}</span>
                <span>{width}%</span>
            </div>
            <div className="h-2 bg-black/10 rounded-full overflow-hidden">
                <div
                    className={`h-full ${colorClass} transition-all duration-1000 ease-out rounded-full`}
                    style={{ width: `${width}%` }}
                />
            </div>
        </div>
    );
}

const stats = [
    { value: "3 min", label: "setup" },
    { value: "5+", label: "years data" },
    { value: "1", label: "verified score" }
];

const problems = [
    {
        icon: <Search className="w-5 h-5" />,
        text: "You've spent weeks searching for the right CSR partner — and still have nothing concrete to show for it."
    },
    {
        icon: <MapPin className="w-5 h-5" />,
        text: "You found an organization that looked perfect on paper, but their geography didn't match your project area."
    },
    {
        icon: <TargetIcon className="w-5 h-5" />,
        text: "You reached out to 10 NGOs. 8 never replied. 2 had completely different goals than what you needed."
    },
    {
        icon: <Globe className="w-5 h-5" />,
        text: "You can't tell from a website what an organization actually does or who they've genuinely worked with before."
    }
];

export default function DrivyaHome() {
    const { user, isLoading } = useAuth();
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleSignOut = async () => {
        await signOut();
        useUserStore.getState().resetOnboarding();
        window.location.href = "/";
    };

    return (
        <div className="min-h-screen bg-[#FAF7F2] font-['DM_Sans',_sans-serif] text-[#064E3B] selection:bg-[#064E3B]/10 overflow-x-hidden">

            {/* Navbar */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md py-3 shadow-sm' : 'bg-transparent py-5'}`}>
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    <Link href="/" className="text-2xl font-serif font-bold flex items-center gap-1 group">
                        <span className="text-[#064E3B]">Driv</span>
                        <span className="text-[#064E3B] opacity-70 group-hover:opacity-100 transition-opacity">ya</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-8 text-sm font-semibold opacity-70">
                        <Link href="#problem" className="hover:opacity-100 transition-opacity">The Problem</Link>
                        <Link href="#how-it-works" className="hover:opacity-100 transition-opacity">How it Works</Link>
                        <Link href="#for-you" className="hover:opacity-100 transition-opacity">For You</Link>
                    </div>

                    <div className="flex items-center gap-4">
                        {user ? (
                            <Link href="/explore" className="px-5 py-2.5 bg-[#064E3B] text-white rounded-lg text-sm font-bold hover:bg-[#064E3B]/90 transition-all">
                                Go to Explore
                            </Link>
                        ) : (
                            <>
                                <Link href="/auth" className="text-sm font-semibold opacity-70 hover:opacity-100 transition-opacity">Sign In</Link>
                                <Link href="/start" className="px-5 py-2.5 bg-[#064E3B] text-white rounded-lg text-sm font-bold hover:bg-[#064E3B]/90 transition-all">
                                    Request Early Access
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="pt-32 pb-20 px-6 relative">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
                    <ScrollReveal>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E8F3EF] text-[#064E3B] rounded-full text-xs font-bold mb-8 uppercase tracking-wider">
                            <span className="w-2 h-2 bg-[#064E3B] rounded-full animate-pulse" />
                            Now in Early Access
                        </div>
                        <h1 className="text-5xl md:text-7xl font-serif font-bold leading-tight mb-8">
                            Find the Right <br />
                            <span className="text-[#064E3B]">Collaboration Partner.</span> <br />
                            <span className="text-[#064E3B] opacity-50 underline decoration-[#064E3B]/20">Not Just Any Partner.</span>
                        </h1>
                        <p className="text-lg md:text-xl opacity-70 max-w-xl mb-12 leading-relaxed font-medium">
                            Drivya matches Incubators, CSRs, and NGOs based on real alignment —
                            focus area, geography, past work, and funding compatibility.
                            No more guesswork. No more wasted outreach.
                        </p>
                        <div className="flex flex-wrap items-center gap-6">
                            <Link href="/start" className="px-8 py-4 bg-[#064E3B] text-white rounded-lg text-base font-bold hover:translate-y-[-2px] transition-all shadow-lg shadow-[#064E3B]/20">
                                Request Early Access
                            </Link>
                            <Link href="#how-it-works" className="text-base font-bold flex items-center gap-1 group">
                                See how it works <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                        {/* Stats */}
                        <div className="mt-20 grid grid-cols-3 gap-12 border-t border-[#064E3B]/10 pt-12">
                            {stats.map(s => (
                                <div key={s.label}>
                                    <div className="text-4xl font-serif font-bold mb-1">{s.value}</div>
                                    <div className="text-xs uppercase tracking-widest font-bold opacity-40">{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </ScrollReveal>

                    {/* Score Demo Visual (similar to the image) */}
                    <ScrollReveal delay={200} className="hidden lg:block">
                        <div className="bg-white p-8 rounded-2xl shadow-2xl border border-black/5 relative hover:rotate-[-1deg] transition-transform duration-500">
                            <div className="flex items-center justify-between mb-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-[#064E3B] rounded-xl flex items-center justify-center">
                                        <Target className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-lg">Drivya.ai</div>
                                        <div className="text-xs opacity-50 font-bold uppercase tracking-wider">Alignment Score</div>
                                    </div>
                                </div>
                                <div className="text-5xl font-serif font-bold text-[#064E3B]">94%</div>
                            </div>

                            <ScoreBar label="Sector Fit" value={98} colorClass="bg-[#064E3B]" />
                            <ScoreBar label="Geography Match" value={92} colorClass="bg-[#064E3B]" />
                            <ScoreBar label="Funding Range" value={85} colorClass="bg-[#064E3B]" />
                            <ScoreBar label="Project Capacity" value={94} colorClass="bg-[#064E3B]" />

                            <div className="mt-8 pt-8 border-t border-black/5">
                                <div className="text-xs font-bold uppercase tracking-widest mb-4 opacity-40">Top Match Factors</div>
                                <div className="flex flex-wrap gap-2">
                                    {['Educational Impact', 'Pan-India Presence', 'Tier 2 Focus', 'CSR Ready'].map(tag => (
                                        <span key={tag} className="px-3 py-1 bg-[#E8F3EF] rounded-full text-[10px] font-bold uppercase tracking-wider">{tag}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </ScrollReveal>
                </div>
            </section>

            {/* Problem Section (Dark Green) */}
            <section id="problem" className="bg-[#064E3B] text-[#FAF7F2] py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <ScrollReveal>
                        <div className="text-xs font-bold uppercase tracking-[0.2em] mb-8 text-[#FAF7F2]/40">The Problem</div>
                        <h2 className="text-4xl md:text-6xl font-serif font-bold mb-8">Sound familiar?</h2>
                        <p className="text-xl md:text-2xl opacity-60 max-w-2xl mb-20 font-medium">
                            Finding collaboration partners today is slow, vague, and exhausting.
                            You&apos;re not doing it wrong — the process is broken.
                        </p>
                    </ScrollReveal>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-[#FAF7F2]/10 border border-[#FAF7F2]/10">
                        {problems.map((p, i) => (
                            <ScrollReveal key={i} delay={i * 100} className="bg-[#064E3B] p-10 hover:bg-[#064E3B]/80 transition-colors group">
                                <div className="w-10 h-10 bg-[#FAF7F2]/10 rounded-lg flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                                    {p.icon}
                                </div>
                                <p className="text-lg leading-relaxed font-medium opacity-70 group-hover:opacity-100 transition-opacity">
                                    {p.text}
                                </p>
                            </ScrollReveal>
                        ))}
                    </div>

                    <ScrollReveal delay={400} className="mt-32 pt-12 border-t border-[#FAF7F2]/10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex items-center gap-6">
                            <div className="h-0.5 w-12 bg-[#FAF7F2]/50" />
                            <p className="text-2xl font-serif font-bold italic opacity-90">
                                This isn&apos;t a you problem. This is a broken process. Drivya fixes it.
                            </p>
                        </div>
                    </ScrollReveal>
                </div>
            </section>

            {/* How It Works */}
            <section id="how-it-works" className="py-32 px-6 bg-white">
                <div className="max-w-4xl mx-auto text-center">
                    <ScrollReveal>
                        <h2 className="text-4xl font-serif font-bold mb-6 italic">How it works</h2>
                        <p className="text-lg opacity-70 mb-20 font-medium">Three steps from sign-up to confident partnership decision.</p>
                    </ScrollReveal>

                    <div className="space-y-12">
                        {[
                            { n: '01', title: 'Create your profile', desc: 'Tell us your mission, focus areas, and target geography in under 2 minutes.' },
                            { n: '02', title: 'Get your matches', desc: 'AI ranks all relevant organizations by alignment score — highest first.' },
                            { n: '03', title: 'Deep-dive & decide', desc: 'Read the full compatibility report, risk flags, and reach out with confidence.' }
                        ].map((s, i) => (
                            <ScrollReveal key={i} delay={i * 100} className="flex gap-12 items-start text-left group">
                                <div className="text-6xl md:text-8xl font-serif font-bold text-[#064E3B]/5 group-hover:text-[#064E3B]/10 transition-colors">
                                    {s.n}
                                </div>
                                <div className="pt-4 md:pt-10">
                                    <h3 className="text-2xl font-serif font-bold mb-3">{s.title}</h3>
                                    <p className="text-lg opacity-60 font-medium">{s.desc}</p>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-32 px-6">
                <div className="max-w-3xl mx-auto text-center bg-[#064E3B] text-[#FAF7F2] p-16 rounded-3xl relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                        <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] rounded-full bg-white/20 blur-[120px]" />
                        <div className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] rounded-full bg-white/10 blur-[100px]" />
                    </div>

                    <ScrollReveal>
                        <Zap className="w-12 h-12 mx-auto mb-8 opacity-50" />
                        <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">Ready to make better partnership decisions?</h2>
                        <p className="text-lg opacity-60 mb-12 font-medium">Join hundreds of NGOs, CSR teams, and incubators who&apos;ve replaced guesswork with Drivya.</p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/start" className="w-full sm:w-auto px-10 py-4 bg-[#FAF7F2] text-[#064E3B] rounded-xl text-base font-bold hover:bg-white transition-all">
                                Request Early Access
                            </Link>
                            <Link href="/auth" className="w-full sm:w-auto px-10 py-4 border border-[#FAF7F2]/20 text-[#FAF7F2] rounded-xl text-base font-bold hover:bg-white/10 transition-all">
                                Sign In
                            </Link>
                        </div>
                    </ScrollReveal>
                </div>
            </section>

            <Footer />
        </div>
    );
}
