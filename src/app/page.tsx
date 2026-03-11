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
        text: "You've shortlisted an NGO — only to realize 30-40 days later they can't deliver at scale."
    },
    {
        icon: <Target className="w-5 h-5" />,
        text: "Your CSR budget is allocated but the right verified partner is still not finalized."
    },
    {
        icon: <Users className="w-5 h-5" />,
        text: "KPI negotiations and contract discussions drag on for weeks after you find someone."
    },
    {
        icon: <Zap className="w-5 h-5" />,
        text: "Due diligence keeps filtering out NGOs with false claims and past failures."
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
        <div className="min-h-screen bg-[#FAF7F2] font-['DM_Sans',_sans-serif] text-[#0D1B2A] selection:bg-[#C9A84C]/20 overflow-x-hidden">

            {/* Navbar */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md py-3 shadow-sm' : 'bg-transparent py-5'}`}>
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    <Link href="/" className="text-2xl font-serif font-bold flex items-center gap-1 group">
                        <span className="text-[#0D1B2A]">Driv</span>
                        <span className="text-[#C9A84C]">ya</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-8 text-sm font-semibold opacity-70">
                        <Link href="#problem" className="hover:text-[#C9A84C] transition-colors">The Partnership Gap</Link>
                        <Link href="#solutions" className="hover:text-[#C9A84C] transition-colors">How it Works</Link>
                        <Link href="#explore" className="hover:text-[#C9A84C] transition-colors">Explore</Link>
                    </div>

                    <div className="flex items-center gap-4">
                        {user ? (
                            <Link href="/dashboard" className="px-5 py-2.5 bg-[#C9A84C] text-[#0D1B2A] rounded-sm text-sm font-bold hover:brightness-110 transition-all">
                                Go to Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link href="/auth" className="text-sm font-semibold opacity-70 hover:opacity-100 transition-opacity">Sign In</Link>
                                <Link href="/auth" className="px-5 py-2.5 bg-[#C9A84C] text-[#0D1B2A] rounded-sm text-sm font-bold hover:brightness-110 transition-all">
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="pt-40 pb-20 px-6 relative bg-[#0D1B2A] text-[#FAF7F2]">
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute top-[-10% ] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#C9A84C]/20 blur-[120px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-[#C9A84C]/10 blur-[100px]" />
                </div>
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
                    <ScrollReveal>
                        <h1 className="text-5xl md:text-7xl font-serif font-bold leading-tight mb-8">
                            Helping CSR Teams Find the Right NGO Partner.<br />
                            <span className="text-[#C9A84C]">Verified. Aligned. Ready to Deliver.</span>
                        </h1>
                        <p className="text-lg md:text-xl text-white/70 max-w-xl mb-12 leading-relaxed font-medium">
                            Drivya matches CSR teams with NGOs and Incubators based on real compatibility — focus area, geography, past project success, and delivery capacity. No more 30-40 day surprises. No more misaligned partners.
                        </p>
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-wrap items-center gap-6">
                                <Link href="/auth" className="px-10 py-5 bg-[#C9A84C] text-[#0D1B2A] rounded-sm text-base font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-[#C9A84C]/20">
                                    Sign Up Free
                                </Link>
                                <Link href="/auth" className="px-10 py-5 border border-white/20 text-white rounded-sm text-base font-bold uppercase tracking-widest hover:bg-white/5 transition-all">
                                    Request Demo
                                </Link>
                            </div>
                            <Link href="#explore" className="text-sm text-white/40 hover:text-[#C9A84C] transition-colors italic group w-fit">
                                Explore organizations without signing up <ArrowRight className="inline-block w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                        {/* Stats */}
                        <div className="mt-20 grid grid-cols-3 gap-12 border-t border-white/10 pt-12">
                            {stats.map(s => (
                                <div key={s.label}>
                                    <div className="text-4xl font-serif font-bold mb-1">{s.value}</div>
                                    <div className="text-xs uppercase tracking-widest font-bold opacity-40">{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </ScrollReveal>

                    <ScrollReveal delay={200} className="hidden lg:block">
                        <div className="bg-white/5 backdrop-blur-xl p-8 rounded-lg border border-white/10 shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-700">
                            <div className="flex items-center justify-between mb-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-[#C9A84C] rounded-full flex items-center justify-center">
                                        <div className="text-[#0D1B2A] font-bold text-lg">94</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-white/50 font-bold uppercase tracking-wider">Match Score</div>
                                        <div className="font-serif text-xl font-bold text-white">Excellent Compatibility</div>
                                    </div>
                                </div>
                            </div>

                            <ScoreBar label="Sector Fit" value={95} colorClass="bg-[#C9A84C]" />
                            <ScoreBar label="Geography Match" value={90} colorClass="bg-[#C9A84C]" />
                            <ScoreBar label="Past Performance" value={88} colorClass="bg-[#C9A84C]" />

                            <div className="mt-8 pt-8 border-t border-white/5">
                                <div className="text-xs font-bold uppercase tracking-widest mb-4 opacity-40 text-white">Top Match Factors</div>
                                <div className="flex flex-wrap gap-2">
                                    {['Educational Impact', 'Verified Capacity', 'CSR Ready'].map(tag => (
                                        <span key={tag} className="px-3 py-1 bg-white/10 text-white rounded-full text-[10px] font-bold uppercase tracking-wider border border-white/10">{tag}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </ScrollReveal>
                </div>
            </section>

            {/* Role Cards Section */}
            <section className="py-24 px-6 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* CSR Card (Highlighted) */}
                    <ScrollReveal className="relative bg-white p-12 rounded-sm border-2 border-[#C9A84C] shadow-2xl transform md:scale-105 z-10">
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#C9A84C] text-[#0D1B2A] text-[10px] font-bold uppercase tracking-widest px-6 py-2 rounded-full">
                            Most Popular
                        </div>
                        <div className="space-y-6 text-center">
                            <div className="w-16 h-16 bg-[#0D1B2A] text-[#C9A84C] rounded-full flex items-center justify-center mx-auto text-2xl">🤝</div>
                            <h3 className="text-3xl font-serif font-bold">I am a CSR Team</h3>
                            <p className="text-navy/60 text-sm leading-relaxed mb-6">Find verified partners who can actually deliver at scale. Reduce due diligence time by 70%.</p>
                            <Link href="/auth" className="inline-block w-full bg-[#0D1B2A] text-white py-4 text-[11px] font-bold uppercase tracking-widest hover:bg-[#0D1B2A]/90 transition-all text-center">Get Started</Link>
                        </div>
                    </ScrollReveal>
                    {/* NGO Card */}
                    <ScrollReveal delay={100} className="bg-white p-12 rounded-sm border border-[#0D1B2A]/5 shadow-sm hover:border-[#0D1B2A]/20 transition-all flex flex-col justify-center">
                        <div className="space-y-6 text-center">
                            <div className="w-16 h-16 bg-[#0D1B2A]/5 text-[#0D1B2A]/40 rounded-full flex items-center justify-center mx-auto text-2xl">🌱</div>
                            <h3 className="text-3xl font-serif font-bold">I am an NGO</h3>
                            <p className="text-navy/40 text-sm leading-relaxed mb-6">Connect with funders who align with your mission and geography. Showcase your real capacity.</p>
                            <Link href="/auth" className="inline-block w-full border border-[#0D1B2A]/10 py-4 text-[11px] font-bold uppercase tracking-widest hover:border-[#0D1B2A]/30 transition-all text-center">Register NGO</Link>
                        </div>
                    </ScrollReveal>
                </div>
            </section>

            {/* Problem Section */}
            <section id="problem" className="bg-[#0D1B2A] text-[#FAF7F2] py-32 px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <ScrollReveal>
                        <div className="text-xs font-bold uppercase tracking-[0.2em] mb-8 text-[#C9A84C]/60 italic font-serif">The Partnership Gap</div>
                        <h2 className="text-4xl md:text-6xl font-serif font-bold mb-8 italic">Sound familiar?</h2>
                        <p className="text-xl md:text-2xl opacity-60 max-w-2xl mb-20 font-medium leading-relaxed">
                            Finding CSR-NGO partnerships today is slow, vague, and risky.
                            The mismatch doesn&apos;t show up until 2 months into the project.
                        </p>
                    </ScrollReveal>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-[#FAF7F2]/10 border border-[#FAF7F2]/10">
                        {problems.map((p, i) => (
                            <ScrollReveal key={i} delay={i * 100} className="bg-[#0D1B2A] p-10 hover:bg-[#1B263B] transition-colors group">
                                <div className="text-[#C9A84C] font-serif text-3xl opacity-30 mb-6 font-bold group-hover:opacity-100 transition-opacity">
                                    0{i + 1}.
                                </div>
                                <p className="text-lg leading-relaxed font-medium opacity-70 group-hover:opacity-100 transition-opacity">
                                    {p.text}
                                </p>
                            </ScrollReveal>
                        ))}
                    </div>

                    <ScrollReveal delay={400} className="mt-32 pt-12 border-t border-[#FAF7F2]/10 flex flex-col md:flex-row items-center justify-center">
                        <p className="text-2xl font-serif font-bold italic opacity-90 text-center max-w-2xl">
                            "This isn&apos;t a people problem. This is a data problem. Drivya fixes it."
                        </p>
                    </ScrollReveal>
                </div>
            </section>

            {/* Solution Section */}
            <section id="solutions" className="py-32 px-6 bg-[#FAF7F2] border-y border-[#0D1B2A]/5">
                <div className="max-w-4xl mx-auto text-center space-y-12">
                    <ScrollReveal>
                        <h2 className="text-4xl md:text-6xl font-serif font-bold leading-tight">Verified. Aligned. Automated.</h2>
                        <p className="text-xl md:text-2xl text-[#0D1B2A]/70 leading-relaxed italic mt-8 max-w-3xl mx-auto">
                            "Drivya analyses each organization&apos;s focus area, geography, past project success rate, delivery capacity, and funding fit — then shows you verified, aligned partners with a Drivya Match Score. Know why a partnership works before you spend a single rupee or day on it."
                        </p>
                        <div className="flex justify-center flex-wrap gap-12 pt-12">
                            <div className="text-center">
                                <div className="text-4xl font-serif font-bold text-[#C9A84C]">70%</div>
                                <div className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-40">Less Diligence Time</div>
                            </div>
                            <div className="hidden sm:block w-px h-12 bg-[#0D1B2A]/10"></div>
                            <div className="text-center">
                                <div className="text-4xl font-serif font-bold text-[#C9A84C]">100%</div>
                                <div className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-40">Verified Partners</div>
                            </div>
                        </div>
                    </ScrollReveal>
                </div>
            </section>

            {/* Explore Section */}
            <section id="explore" className="py-32 px-6 bg-white scroll-mt-20">
                <div className="max-w-7xl mx-auto space-y-16">
                    <ScrollReveal className="text-center space-y-4">
                        <div className="text-[10px] uppercase tracking-widest font-bold text-[#C9A84C]">Explore</div>
                        <h2 className="text-4xl md:text-5xl font-serif font-bold">See who&apos;s already on Drivya.</h2>
                        <p className="text-[#0D1B2A]/60 max-w-xl mx-auto">Sign up to see your compatibility score with each organization based on your specific CSR metrics.</p>
                    </ScrollReveal>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Preview Card 1 */}
                        <ScrollReveal className="bg-[#FAF7F2]/30 p-8 rounded-sm border border-[#0D1B2A]/5 flex flex-col justify-between hover:border-[#C9A84C]/30 transition-all group">
                            <div className="space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="w-12 h-12 bg-[#0D1B2A] text-[#C9A84C] rounded-sm flex items-center justify-center font-bold font-serif text-xl border border-[#C9A84C]/20">AS</div>
                                    <span className="text-[10px] bg-[#0D1B2A]/5 px-3 py-1 rounded-full uppercase font-bold tracking-wider">CSR Partner</span>
                                </div>
                                <div>
                                    <h4 className="text-2xl font-serif font-bold">Aryan Social Foundation</h4>
                                    <p className="text-sm opacity-50">Focus: Education, Skill Development</p>
                                    <p className="text-sm opacity-50">Location: Uttar Pradesh</p>
                                </div>
                                <div className="pt-4 border-t border-[#0D1B2A]/5 mt-4">
                                    <div className="text-[10px] font-bold uppercase tracking-widest text-[#C9A84C] mb-1">Match Score</div>
                                    <div className="text-sm italic opacity-30">Sign up to see your Match Score</div>
                                </div>
                            </div>
                            <Link href="/auth" className="mt-8 text-[11px] font-bold uppercase tracking-widest text-[#0D1B2A]/40 group-hover:text-[#C9A84C] transition-colors flex items-center gap-1">
                                See Match Score <ArrowRight className="w-3 h-3 translate-x-0 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </ScrollReveal>

                        {/* Preview Card 2 */}
                        <ScrollReveal delay={100} className="bg-[#FAF7F2]/30 p-8 rounded-sm border border-[#0D1B2A]/5 flex flex-col justify-between hover:border-[#C9A84C]/30 transition-all group">
                            <div className="space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="w-12 h-12 bg-[#0D1B2A] text-[#C9A84C] rounded-sm flex items-center justify-center font-bold font-serif text-xl border border-[#C9A84C]/20">GF</div>
                                    <span className="text-[10px] bg-[#0D1B2A]/5 px-3 py-1 rounded-full uppercase font-bold tracking-wider">CSR Partner</span>
                                </div>
                                <div>
                                    <h4 className="text-2xl font-serif font-bold">GreenRoots Foundation</h4>
                                    <p className="text-sm opacity-50">Focus: Environment, Rural Development</p>
                                    <p className="text-sm opacity-50">Location: Maharashtra</p>
                                </div>
                                <div className="pt-4 border-t border-[#0D1B2A]/5 mt-4">
                                    <div className="text-[10px] font-bold uppercase tracking-widest text-[#0D1B2A]/20 mb-1">Match Score</div>
                                    <div className="text-sm italic opacity-20 text-[#0D1B2A]">Login to unlock assessment</div>
                                </div>
                            </div>
                            <Link href="/auth" className="mt-8 text-[11px] font-bold uppercase tracking-widest text-[#0D1B2A]/40 group-hover:text-[#C9A84C] transition-colors flex items-center gap-1">
                                See Match Score <ArrowRight className="w-3 h-3 translate-x-0 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </ScrollReveal>

                        {/* Preview Card 3 (Partially Blurred) */}
                        <ScrollReveal delay={200} className="relative group bg-[#FAF7F2]/30 p-8 rounded-sm border border-[#0D1B2A]/5 flex flex-col justify-between overflow-hidden">
                            <div className="blur-[2px] opacity-40 space-y-4 transition-all group-hover:blur-[1px]">
                                <div className="flex justify-between items-start">
                                    <div className="w-12 h-12 bg-[#0D1B2A] text-[#C9A84C] rounded-sm flex items-center justify-center font-bold font-serif text-xl border border-[#C9A84C]/20">PS</div>
                                    <span className="text-[10px] bg-[#0D1B2A]/5 px-3 py-1 rounded-full uppercase font-bold tracking-wider">NGO</span>
                                </div>
                                <div>
                                    <h4 className="text-2xl font-serif font-bold">Prayas Social Initiative</h4>
                                    <p className="text-sm opacity-50">Focus: Women Empowerment</p>
                                    <p className="text-sm opacity-50">Location: Delhi NCR</p>
                                </div>
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center bg-white/20 backdrop-blur-[1px] opacity-100 transition-opacity">
                                <Link href="/auth" className="bg-[#0D1B2A] text-white px-8 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-[#C9A84C] hover:text-[#0D1B2A] transition-all shadow-xl">Reveal Partner</Link>
                            </div>
                            <div className="mt-8 text-[11px] font-bold uppercase tracking-widest text-[#0D1B2A]/20">See Match Score →</div>
                        </ScrollReveal>

                        {/* Preview Card 4 (Fully Blurred) */}
                        <ScrollReveal delay={300} className="relative bg-[#FAF7F2]/30 p-8 rounded-sm border border-[#0D1B2A]/5 flex flex-col justify-between overflow-hidden">
                            <div className="blur-[8px] opacity-10 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="w-12 h-12 bg-[#0D1B2A] text-[#C9A84C] rounded-sm flex items-center justify-center font-bold font-serif text-xl border border-[#C9A84C]/20">??</div>
                                    <span className="text-[10px] bg-[#0D1B2A]/5 px-3 py-1 rounded-full uppercase font-bold tracking-wider">NGO</span>
                                </div>
                                <div>
                                    <h4 className="text-2xl font-serif font-bold leading-relaxed">Hidden until sign-in</h4>
                                    <p className="text-sm opacity-50">Focus Area: Educational Infrastructure</p>
                                    <p className="text-sm opacity-50">Location Area: Blurred</p>
                                </div>
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-md">
                                <div className="text-center space-y-4">
                                    <div className="text-[#0D1B2A] font-bold text-[10px] uppercase tracking-[0.2em] opacity-50">Premium Feature</div>
                                    <Link href="/auth" className="inline-block border-2 border-[#0D1B2A] px-8 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-[#0D1B2A] hover:text-white transition-all">Sign Up Free</Link>
                                </div>
                            </div>
                            <div className="mt-8 text-[11px] font-bold uppercase tracking-widest text-[#0D1B2A]/10">See Match Score →</div>
                        </ScrollReveal>
                    </div>

                    <ScrollReveal delay={400} className="text-center pt-12 space-y-8">
                        <p className="opacity-40 font-bold uppercase tracking-[0.2em] text-[10px]">
                            + 6 more organizations on Drivya.<br />Sign up free to see all matches and scores.
                        </p>
                        <Link href="/auth" className="inline-block bg-[#C9A84C] text-[#0D1B2A] px-12 py-5 font-bold uppercase tracking-widest rounded-sm hover:scale-105 transition-all shadow-xl shadow-[#C9A84C]/20">
                            Sign Up Free
                        </Link>
                    </ScrollReveal>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-32 px-6 bg-white">
                <div className="max-w-4xl mx-auto text-center bg-[#0D1B2A] text-[#FAF7F2] p-20 rounded-sm relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                        <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] rounded-full bg-[#C9A84C]/20 blur-[120px]" />
                        <div className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] rounded-full bg-[#C9A84C]/10 blur-[100px]" />
                    </div>

                    <ScrollReveal>
                        <h2 className="text-4xl md:text-5xl font-serif font-bold mb-8 italic">Stop discovering problems 30 days in.<br />Start with verified partners.</h2>
                        <p className="text-lg opacity-60 mb-12 font-medium max-w-xl mx-auto">Join the CSR teams, and NGOs who&apos;ve replaced months of manual vetting with automated alignment scoring.</p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <Link href="/auth" className="w-full sm:w-auto px-12 py-5 bg-[#C9A84C] text-[#0D1B2A] rounded-sm text-base font-bold uppercase tracking-widest hover:scale-105 transition-all">
                                Get Started Free
                            </Link>
                            <Link href="/auth" className="w-full sm:w-auto px-12 py-5 border border-white/20 text-white rounded-sm text-base font-bold uppercase tracking-widest hover:bg-white/10 transition-all">
                                Request Demo
                            </Link>
                        </div>
                        <p className="text-[10px] uppercase tracking-widest font-bold opacity-30 mt-12">Free for basic search | Premium unlocked for deep diligence</p>
                    </ScrollReveal>
                </div>
            </section>

            <Footer />
        </div>
    );
}
