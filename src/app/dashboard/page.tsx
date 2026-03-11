"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/lib/services/auth";

import { getOrganizations } from "@/lib/services/organizations";
import { getSavedOrganizations } from "@/lib/services/shortlist";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MatchOrg {
    id: string;
    initials: string;
    name: string;
    type: string;
    focus: string[];
    geo: string;
    score: number;
    bars: { focus: number; geo: number; past: number };
    locked: boolean;
}

const ALL_TYPES = ["All", "CSR Partner", "NGO", "Incubator"];

// ─── Count-up Hook ────────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 1500, suffix = "") {
    const [value, setValue] = useState(0);
    const started = useRef(false);
    useEffect(() => {
        if (started.current) return;
        started.current = true;
        const step = (target / duration) * 10;
        let current = 0;
        const timer = setInterval(() => {
            current += step;
            if (current >= target) { setValue(target); clearInterval(timer); }
            else setValue(Math.floor(current));
        }, 10);
        return () => clearInterval(timer);
    }, [target, duration]);
    return `${value}${suffix}`;
}

// ─── Components ───────────────────────────────────────────────────────────────

function StatCard({ label, value, isGold = false, bar }: { label: string; value: string | number; isGold?: boolean; bar?: number }) {
    return (
        <div className="bg-white p-8 rounded-sm border border-navy/5 shadow-sm" style={{ animation: "countUp 0.6s ease forwards" }}>
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold mb-3" style={{ color: "rgba(13,27,42,0.4)" }}>{label}</p>
            {bar !== undefined ? (
                <div className="flex items-end gap-3">
                    <h3 className="text-4xl font-bold" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#0D1B2A" }}>{value}</h3>
                    <div className="flex-1 h-2 rounded-full overflow-hidden mb-2" style={{ background: "rgba(13,27,42,0.05)" }}>
                        <div className="bg-[#C9A84C] h-full rounded-full transition-all duration-1000" style={{ width: `${bar}%` }} />
                    </div>
                </div>
            ) : (
                <h3 className="text-4xl font-bold" style={{ fontFamily: "'Cormorant Garamond', serif", color: isGold ? "#C9A84C" : "#0D1B2A" }}>{value}</h3>
            )}
        </div>
    );
}

function MiniScoreBars({ bars }: { bars: { focus: number; geo: number; past: number } }) {
    return (
        <div className="flex flex-col gap-1 w-24">
            {[bars.focus, bars.geo, bars.past].map((w, i) => (
                <div key={i} className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(13,27,42,0.05)" }}>
                    <div className="h-full rounded-full" style={{ width: `${w}%`, background: "#C9A84C" }} />
                </div>
            ))}
        </div>
    );
}

function FreeMatchCard({ org, onSave, saved }: { org: MatchOrg; onSave: () => void; saved: boolean }) {
    return (
        <div className="bg-white p-8 rounded-sm border border-navy/5 shadow-sm hover:border-gold/30 hover:shadow-md transition-all flex flex-col lg:flex-row items-center gap-12"
            style={{ '--gold-border': 'rgba(201,168,76,0.3)' } as any}>
            <div className="w-20 h-20 rounded-sm shrink-0 flex items-center justify-center text-3xl font-bold"
                style={{ background: "#0D1B2A", color: "#C9A84C", fontFamily: "'Cormorant Garamond', serif" }}>
                {org.initials}
            </div>
            <div className="flex-1 text-center lg:text-left space-y-4 w-full">
                <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                    <h4 className="text-2xl font-bold" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{org.name}</h4>
                    <span className="w-fit mx-auto lg:mx-0 text-[9px] uppercase tracking-[0.2em] font-bold px-2.5 py-1 rounded-sm"
                        style={{ color: "rgba(13,27,42,0.4)", border: "1px solid rgba(13,27,42,0.1)" }}>{org.type}</span>
                </div>
                <div className="flex flex-wrap justify-center lg:justify-start gap-4 text-xs font-bold">
                    {org.focus.map(f => (
                        <span key={f} className="px-2 py-1 rounded-sm" style={{ background: "rgba(13,27,42,0.05)", color: "rgba(13,27,42,0.6)" }}>{f}</span>
                    ))}
                    <span style={{ color: "rgba(13,27,42,0.4)" }}>📍 {org.geo}</span>
                </div>
            </div>
            <div className="flex items-center gap-12 shrink-0 w-full lg:w-auto justify-center">
                <div className="text-center space-y-4">
                    <div className="text-5xl font-bold" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#C9A84C" }}>{org.score}</div>
                    <MiniScoreBars bars={org.bars} />
                </div>
                <div className="flex flex-col gap-3">
                    <button onClick={onSave}
                        className="p-4 border rounded-sm transition-all"
                        style={{ borderColor: saved ? "#C9A84C" : "rgba(13,27,42,0.1)", color: saved ? "#C9A84C" : "inherit" }}>
                        {saved ? "📌" : "🔖"}
                    </button>
                    <button onClick={() => window.location.href = `/org/${org.id}`} className="px-8 py-4 text-white text-[11px] font-bold uppercase tracking-widest rounded-sm hover:opacity-90 transition-all"
                        style={{ background: "#0D1B2A" }}>
                        View Profile
                    </button>
                </div>
            </div>
        </div>
    );
}

function LockedMatchCard({ org, onUnlock }: { org: MatchOrg; onUnlock: () => void }) {
    return (
        <div className="relative bg-white p-8 rounded-sm border border-navy/5 shadow-sm overflow-hidden group cursor-pointer" onClick={onUnlock}>
            {/* Blurred content */}
            <div className="w-full flex flex-col lg:flex-row items-center gap-12 transition-all" style={{ filter: "blur(6px)", opacity: 0.4 }}>
                <div className="w-20 h-20 rounded-sm shrink-0 flex items-center justify-center text-3xl font-bold"
                    style={{ background: "#0D1B2A", color: "#C9A84C", fontFamily: "'Cormorant Garamond', serif" }}>
                    {org.initials}
                </div>
                <div className="flex-1 text-center lg:text-left space-y-4">
                    <h4 className="text-2xl font-bold uppercase tracking-wider" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{org.name}</h4>
                    <div className="flex gap-4 text-xs font-bold">
                        <span className="px-2 py-1 rounded-sm" style={{ background: "rgba(13,27,42,0.05)" }}>••••••••</span>
                        <span className="px-2 py-1 rounded-sm" style={{ background: "rgba(13,27,42,0.05)" }}>••••••••</span>
                    </div>
                </div>
                <div className="text-5xl font-bold opacity-50" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#C9A84C" }}>{org.score}</div>
            </div>
            {/* Lock overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4"
                style={{ background: "rgba(13,27,42,0.05)", backdropFilter: "blur(2px)" }}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl group-hover:scale-110 transition-transform"
                    style={{ background: "rgba(255,255,255,0.9)", border: "1px solid #C9A84C", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", color: "#C9A84C" }}>
                    🔒
                </div>
                <p className="text-[11px] font-bold uppercase tracking-[0.25em] group-hover:text-navy transition-colors"
                    style={{ color: "rgba(13,27,42,0.6)" }}>Unlock to View Full Profile</p>
            </div>
        </div>
    );
}

// ─── Upgrade Modal ────────────────────────────────────────────────────────────

function UpgradeModal({ onClose }: { onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <div className="absolute inset-0" onClick={onClose} style={{ background: "rgba(13,27,42,0.8)", backdropFilter: "blur(4px)" }} />
            <div className="relative bg-white w-full max-w-4xl rounded-sm shadow-2xl overflow-hidden animate-scale-in">
                <button onClick={onClose} className="absolute top-6 right-6 text-2xl transition-colors hover:opacity-60" style={{ color: "rgba(13,27,42,0.2)" }}>✕</button>
                <div className="p-12 text-center space-y-12">
                    <div className="space-y-4">
                        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: "rgba(201,168,76,0.1)" }}>
                            <svg className="w-10 h-10" fill="none" stroke="#C9A84C" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-4xl font-bold" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Unlock this profile</h2>
                        <p className="max-w-xl mx-auto text-sm leading-relaxed" style={{ color: "rgba(13,27,42,0.6)" }}>
                            Get full access to org details, past projects, contact information and direct messaging to accelerate your partnerships.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                        {/* Tier 1 */}
                        <div className="p-10 border border-navy/5 rounded-sm flex flex-col space-y-8 hover:border-gold/30 transition-all group">
                            <div className="space-y-2">
                                <h4 className="text-xl font-bold" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Tier 1 — Profile Unlock</h4>
                                <p className="text-3xl font-bold">₹999<span className="text-sm font-normal" style={{ color: "rgba(13,27,42,0.4)" }}>/month</span></p>
                            </div>
                            <ul className="space-y-4 text-xs font-bold" style={{ color: "rgba(13,27,42,0.6)" }}>
                                {["Full org profiles", "Past project history", "Contact details"].map(f => (
                                    <li key={f} className="flex items-center gap-3"><span>✓</span> {f}</li>
                                ))}
                            </ul>
                            <button className="w-full border-2 py-4 text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-gold hover:text-navy"
                                style={{ borderColor: "#C9A84C", color: "#C9A84C" }}>
                                Choose Tier 1
                            </button>
                        </div>
                        {/* Tier 2 */}
                        <div className="p-10 border-2 rounded-sm flex flex-col space-y-8 relative overflow-hidden"
                            style={{ borderColor: "#C9A84C", background: "rgba(201,168,76,0.02)" }}>
                            <div className="absolute top-0 right-0 text-[8px] font-bold uppercase tracking-widest px-4 py-1"
                                style={{ background: "#C9A84C", color: "#0D1B2A" }}>Recommended</div>
                            <div className="space-y-2">
                                <h4 className="text-xl font-bold" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Tier 2 — Full Access</h4>
                                <p className="text-3xl font-bold">₹2,499<span className="text-sm font-normal" style={{ color: "rgba(13,27,42,0.4)" }}>/month</span></p>
                            </div>
                            <ul className="space-y-4 text-xs font-bold" style={{ color: "rgba(13,27,42,0.8)" }}>
                                {[{ text: "Everything in Tier 1", gold: true }, { text: "Direct messaging" }, { text: "Collaboration requests" }, { text: "Priority support" }].map(f => (
                                    <li key={f.text} className="flex items-center gap-3" style={{ color: f.gold ? "#C9A84C" : undefined }}><span>✓</span> {f.text}</li>
                                ))}
                            </ul>
                            <button className="w-full py-4 text-[10px] font-bold uppercase tracking-widest hover:brightness-110 transition-all"
                                style={{ background: "#C9A84C", color: "#0D1B2A", boxShadow: "0 8px 24px rgba(201,168,76,0.2)" }}>
                                Choose Tier 2
                            </button>
                        </div>
                    </div>
                    <p className="text-[10px] uppercase font-bold tracking-[0.2em]" style={{ color: "rgba(13,27,42,0.2)" }}>Cancel anytime. No hidden fees.</p>
                </div>
            </div>
        </div>
    );
}

// ─── Main Dashboard Page ──────────────────────────────────────────────────────

export default function DashboardPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading: authLoading, user } = useAuth();

    const [filter, setFilter] = useState("All");
    const [sortBy, setSortBy] = useState("score");
    const [matches, setMatches] = useState<MatchOrg[]>([]);
    const [stats, setStats] = useState({ total: 0, highCompat: 0, saved: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [savedOrgs, setSavedOrgs] = useState<string[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [profileStrength] = useState(72);

    // Fetch dynamic data
    useEffect(() => {
        if (!user || !isAuthenticated) return;

        async function loadDashboard() {
            try {
                // Fetch recommended organizations
                const { organizations } = await getOrganizations();
                const userFocus = (user?.preferences as any)?.focusAreas || [];
                
                const mapped: MatchOrg[] = organizations.map(org => {
                    let matchScore = org.alignmentScore || Math.floor(Math.random() * 40 + 40);
                    // Boost based on profile overlap
                    if (userFocus.length > 0 && org.focusAreas.length > 0) {
                        const overlap = org.focusAreas.filter(f => userFocus.includes(f)).length;
                        matchScore = Math.min(99, matchScore + (overlap * 5));
                    }
                    
                    return {
                        id: org.id,
                        initials: org.name.charAt(0).toUpperCase(),
                        name: org.name,
                        type: org.type === 'CSR' ? 'CSR Partner' : org.type === 'NGO' ? 'NGO' : org.type,
                        focus: org.focusAreas || [],
                        geo: org.region || "Pan India",
                        score: matchScore,
                        bars: { 
                            focus: Math.min(100, matchScore + 5), 
                            geo: Math.min(100, matchScore - 2), 
                            past: Math.min(100, matchScore + 1) 
                        },
                        // In a real app, 'locked' would securely be checked via a backend purchase table (e.g. usePurchaseCheck)
                        // For the demo showcase, top 3 matches are free, rest are locked
                        locked: false 
                    };
                });
                
                // Sort by score
                mapped.sort((a, b) => b.score - a.score);
                
                // Demo logic: lock anything beyond top 2
                mapped.forEach((m, idx) => {
                    if (idx > 1) m.locked = true;
                });
                
                setMatches(mapped);
                
                // Fetch saved orgs
                const savedResult = await getSavedOrganizations(user!.id);
                const savedNames = savedResult.organizations.map(o => o.name);
                setSavedOrgs(savedNames);
                
                setStats({
                    total: mapped.length,
                    highCompat: mapped.filter(m => m.score >= 80).length,
                    saved: savedNames.length
                });
                
            } catch (err) {
                console.error("Failed to load dashboard data:", err);
            } finally {
                setIsLoading(false);
            }
        }
        
        loadDashboard();
    }, [user, isAuthenticated]);

    const totalMatches = useCountUp(!isLoading ? stats.total : 0);
    const highCompat = useCountUp(!isLoading ? stats.highCompat : 0);
    const savedCount = useCountUp(!isLoading ? stats.saved : 0);
    const profileStr = useCountUp(profileStrength, 1500, "%");

    // Auth + profile guard
    useEffect(() => {
        if (authLoading) return;
        if (!isAuthenticated) { router.push("/auth?returnTo=/dashboard"); return; }
        if (user && !user.form_filled) { window.location.href = "/org-profile"; }
    }, [authLoading, isAuthenticated, user, router]);

    const handleSignOut = async () => {
        await signOut();
        router.push("/auth");
    };

    const filtered = filter === "All" ? matches : matches.filter(m => m.type === filter);
    const sorted = [...filtered].sort((a, b) => sortBy === "score" ? b.score - a.score : 0);

    const firstName = user?.name?.split(" ")[0] || "there";
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
    const initials = user?.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "U";

    const navItems = [
        { icon: "🏠", label: "Dashboard", active: true, href: "/dashboard" },
        { icon: "🔍", label: "Browse All", active: false, href: "/explore" },
        { icon: "💾", label: "Saved", active: false, href: "#" },
        { icon: "💬", label: "Messages", active: false, href: "#", locked: true },
        { icon: "👤", label: "My Profile", active: false, href: "/profile" },
    ];

    const roleLabels: Record<string, string> = { csr: "CSR", ngo: "NGO", incubator: "Incubator" };
    const roleLabel = roleLabels[user?.role || ""] || "Member";

    if (authLoading || !isAuthenticated) {
        return <div className="min-h-screen flex items-center justify-center" style={{ background: "#FAF7F2" }}><Loader2 className="w-8 h-8 animate-spin" style={{ color: "#C9A84C" }} /></div>;
    }

    return (
        <div className="min-h-screen" style={{ background: "#FAF7F2", color: "#0D1B2A", fontFamily: "'DM Sans', sans-serif", WebkitFontSmoothing: "antialiased" }}>
            <style>{`
                @keyframes countUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
                .sidebar { width: 240px; height: 100vh; position: fixed; left: 0; top: 0; z-index: 50; }
                .main-content { margin-left: 240px; min-height: 100vh; }
                .nav-link-active { color: #C9A84C; border-left: 3px solid #C9A84C; background: rgba(201,168,76,0.05); }
                ::-webkit-scrollbar { width: 6px; }
                ::-webkit-scrollbar-track { background: #f1f1f1; }
                ::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 10px; }
                ::-webkit-scrollbar-thumb:hover { background: #C9A84C; }
                @media (max-width: 768px) {
                    .sidebar { width:100%; height:60px; bottom:0; top:auto; left:0; flex-direction:row; padding:0; }
                    .sidebar-logo,.sidebar-user,.sidebar-upgrade { display:none; }
                    .sidebar-nav { width:100%; flex-direction:row !important; justify-content:space-around; align-items:center; height:100%; }
                    .main-content { margin-left:0; padding-bottom:80px; }
                }
            `}</style>

            {/* ─── SIDEBAR ─── */}
            <aside className="sidebar bg-navy text-white flex flex-col p-6 shadow-2xl" style={{ background: "#0D1B2A" }}>
                {/* Logo */}
                <div className="sidebar-logo mb-10 cursor-pointer" onClick={() => router.push("/")}>
                    <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                        Driv<span style={{ color: "#C9A84C" }}>ya</span>
                    </h1>
                </div>

                {/* User Info */}
                <div className="sidebar-user mb-12 flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl border-4"
                        style={{ background: "#C9A84C", color: "#0D1B2A", borderColor: "#0D1B2A", boxShadow: "0 4px 14px rgba(0,0,0,0.2)" }}>
                        {initials}
                    </div>
                    <div>
                        <h4 className="font-bold text-sm text-white">{user?.name || "User"}</h4>
                        <span className="text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-sm"
                            style={{ background: "rgba(201,168,76,0.2)", color: "#C9A84C" }}>{roleLabel}</span>
                    </div>
                </div>

                {/* Nav */}
                <nav className="sidebar-nav flex-1 flex flex-col space-y-2 -mx-6">
                    {navItems.map(item => (
                        <a key={item.label} href={item.href}
                            className={`px-6 py-4 flex items-center space-x-4 text-xs font-bold uppercase tracking-widest transition-colors hover:text-gold ${item.active ? "nav-link-active" : ""}`}
                            style={{ color: item.active ? "#C9A84C" : "rgba(255,255,255,0.4)" }}>
                            <span>{item.icon}</span>
                            <span className="md:block hidden">{item.label}</span>
                            {item.locked && <span className="ml-auto">🔒</span>}
                        </a>
                    ))}
                    <button onClick={handleSignOut}
                        className="px-6 py-4 flex items-center space-x-4 text-xs font-bold uppercase tracking-widest transition-colors hover:text-gold w-full text-left"
                        style={{ color: "rgba(255,255,255,0.4)" }}>
                        <span>🚪</span>
                        <span className="md:block hidden">Log Out</span>
                    </button>
                </nav>

                {/* Upgrade Card */}
                <div className="sidebar-upgrade mt-auto pt-8">
                    <div className="p-4 rounded-sm space-y-4 text-center"
                        style={{ background: "#0D1B2A", border: "1px solid rgba(201,168,76,0.3)" }}>
                        <p className="text-[10px] leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>Unlock full profiles & messaging</p>
                        <button onClick={() => setShowModal(true)}
                            className="w-full text-navy font-bold text-[10px] uppercase tracking-widest py-2.5 rounded-sm hover:brightness-110 transition-all"
                            style={{ background: "#C9A84C", color: "#0D1B2A" }}>
                            Upgrade Now
                        </button>
                    </div>
                </div>
            </aside>

            {/* ─── MAIN CONTENT ─── */}
            <main className="main-content">

                {/* Header */}
                <header className="sticky top-0 z-40 px-8 py-6 flex items-center justify-between"
                    style={{ background: "rgba(255,255,255,0.8)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(13,27,42,0.05)" }}>
                    <h2 className="text-3xl font-semibold" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                        {greeting}, {firstName} 👋
                    </h2>
                    <div className="flex items-center space-x-6">
                        <button className="relative p-2 transition-colors hover:text-gold" style={{ color: "rgba(13,27,42,0.4)" }}>
                            <span>🔔</span>
                            <span className="absolute top-2 right-2 w-2 h-2 rounded-full border-2 border-white" style={{ background: "#C9A84C" }} />
                        </button>
                        <div className="w-10 h-10 rounded-full overflow-hidden cursor-pointer hover:border-gold transition-all flex items-center justify-center font-bold text-xs"
                            style={{ background: "rgba(13,27,42,0.05)", border: "1px solid rgba(13,27,42,0.1)", color: "rgba(13,27,42,0.4)" }}>
                            {initials}
                        </div>
                    </div>
                </header>

                {/* Dashboard Content */}
                <div className="p-8 space-y-12 max-w-7xl mx-auto">

                    {/* Stats Row */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard label="Total Matches" value={totalMatches} isGold />
                        <StatCard label="High Compatibility (80%+)" value={highCompat} />
                        <StatCard label="Saved Partners" value={savedCount} />
                        <StatCard label="Profile Strength" value={profileStr} bar={profileStrength} />
                    </div>

                    {/* Match Section */}
                    <div className="space-y-8">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div className="space-y-4">
                                <h2 className="text-4xl font-semibold" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Your Top Matches</h2>
                                <div className="flex flex-wrap gap-2">
                                    {ALL_TYPES.map(t => (
                                        <button key={t} onClick={() => setFilter(t)}
                                            className="px-6 py-2 rounded-full border text-[11px] font-bold uppercase tracking-widest transition-all"
                                            style={{
                                                background: filter === t ? "#C9A84C" : "#fff",
                                                borderColor: filter === t ? "#C9A84C" : "rgba(13,27,42,0.1)",
                                                color: filter === t ? "#0D1B2A" : "rgba(13,27,42,0.6)",
                                            }}>
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center space-x-6">
                                <div className="text-right space-y-1">
                                    <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "rgba(13,27,42,0.4)" }}>{sorted.length} matches found</p>
                                    <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                                        className="bg-transparent border-none text-xs font-bold focus:ring-0 p-0 cursor-pointer outline-none" style={{ color: "#0D1B2A" }}>
                                        <option value="score">Sort by: Match Score ↓</option>
                                        <option value="recent">Sort by: Recent</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Match List */}
                        <div className="space-y-4">
                            {isLoading ? (
                                <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-gold" /></div>
                            ) : sorted.length === 0 ? (
                                <p className="text-center py-12 text-muted-foreground">No matches found for this category.</p>
                            ) : (
                                sorted.map((org, i) =>
                                    org.locked ? (
                                        <LockedMatchCard key={i} org={org} onUnlock={() => setShowModal(true)} />
                                    ) : (
                                        <FreeMatchCard key={i} org={org}
                                            saved={savedOrgs.includes(org.name)}
                                            onSave={() => setSavedOrgs(p => p.includes(org.name) ? p.filter(n => n !== org.name) : [...p, org.name])} />
                                    )
                                )
                            )}
                        </div>
                    </div>

                    {/* Recently Saved */}
                    <div className="pt-12 space-y-8" style={{ borderTop: "1px solid rgba(13,27,42,0.05)" }}>
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-semibold" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Recently Saved</h2>
                            <a href="#" className="text-[11px] font-bold uppercase tracking-widest inline-block hover:translate-x-1 transition-transform"
                                style={{ color: "#C9A84C" }}>View All Saved →</a>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {savedOrgs.length > 0 ? matches.filter(m => savedOrgs.includes(m.name)).slice(0, 3).map(org => (
                                <div key={org.name} className="bg-white p-6 rounded-sm border border-navy/5 flex items-center gap-6 group cursor-pointer hover:border-gold/30 transition-all"
                                    onClick={() => window.location.href = `/org/${org.id}`}
                                    style={{ borderColor: "rgba(13,27,42,0.05)" }}>
                                    <div className="w-12 h-12 rounded-sm shrink-0 flex items-center justify-center font-bold text-lg"
                                        style={{ background: "#0D1B2A", color: "#C9A84C", fontFamily: "'Cormorant Garamond', serif" }}>
                                        {org.initials}
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-lg" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{org.name}</h5>
                                        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(13,27,42,0.4)" }}>{org.type}</p>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-sm text-muted-foreground col-span-3">You haven't saved any organizations yet.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="p-8 text-center text-[10px] uppercase tracking-[0.3em]" style={{ color: "rgba(13,27,42,0.2)" }}>
                    Drivya Platform © 2026 | Verified Partnerships
                </footer>
            </main>

            {/* Upgrade Modal */}
            {showModal && <UpgradeModal onClose={() => setShowModal(false)} />}
        </div>
    );
}
