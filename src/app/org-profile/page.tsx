"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

// ─── Constants ───────────────────────────────────────────────────────────────

const FOCUS_AREAS = [
    "Education", "Healthcare", "Agriculture", "Technology",
    "Environment", "Livelihood", "Women Empowerment",
    "Skill Development", "Rural Development", "Other",
];

const GEOGRAPHIES = [
    "Pan India", "North India", "South India", "East India", "West India",
    "Maharashtra", "Uttar Pradesh", "Delhi NCR", "Rajasthan", "International",
];

const ORG_SIZES = [
    { label: "Small", range: "1–20" },
    { label: "Mid", range: "21–100" },
    { label: "Large", range: "101–500" },
    { label: "Enterprise", range: "500+" },
];

const PARTNERSHIP_TYPES = [
    { emoji: "💰", label: "Funding / Grants" },
    { emoji: "🤝", label: "Implementation Partner" },
    { emoji: "🏗️", label: "Incubation Support" },
    { emoji: "📋", label: "CSR Compliance Partner" },
    { emoji: "🌍", label: "Geographic Expansion" },
    { emoji: "📣", label: "Advocacy & Awareness" },
    { emoji: "🔬", label: "Research Collaboration" },
    { emoji: "🎓", label: "Capacity Building" },
];

const BUDGETS = ["Under ₹5L", "₹5L – ₹25L", "₹25L – ₹1Cr", "₹1Cr – ₹5Cr", "₹5Cr+"];

const TIMELINES = [
    { emoji: "🚀", label: "Immediately", sub: "within 1 month" },
    { emoji: "📅", label: "Soon", sub: "1–3 months" },
    { emoji: "🗓️", label: "Planning ahead", sub: "3–6 months" },
];

const ROLES = [
    { id: "incubator", emoji: "🏗️", label: "Incubator", badge: "Free to Join", badgeStyle: { bg: "rgba(201,168,76,0.1)", color: "#C9A84C" }, desc: "I run or work at an incubation center looking for CSR funding or NGO collaboration." },
    { id: "csr", emoji: "🏢", label: "CSR", badge: "Premium Access", badgeStyle: { bg: "#0D1B2A", color: "#C9A84C" }, desc: "I manage CSR initiatives and need credible, impact-aligned NGO or incubator partners." },
    { id: "ngo", emoji: "🤝", label: "NGO", badge: "Always Free", badgeStyle: { bg: "rgba(201,168,76,0.1)", color: "#C9A84C" }, desc: "I work at an NGO looking for CSR funding or corporate partnerships." },
];

// ─── Progress Indicator ───────────────────────────────────────────────────────

function ProgressBar({ current }: { current: 1 | 2 | 3 }) {
    return (
        <div className="flex items-center gap-6">
            {[{ label: "Your Role" }, { label: "Your Profile" }, { label: "Your Goals" }].map((s, i) => {
                const step = i + 1;
                const done = step < current;
                const active = step === current;
                return (
                    <div key={i} className="flex flex-col items-center gap-2">
                        {i > 0 && (
                            <div className="hidden" />
                        )}
                        <div
                            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all"
                            style={{
                                background: done ? "transparent" : active ? "#C9A84C" : "transparent",
                                border: done ? "1px solid #C9A84C" : active ? "none" : "1px solid rgba(13,27,42,0.1)",
                                color: done ? "#C9A84C" : active ? "#0D1B2A" : "rgba(13,27,42,0.2)",
                            }}
                        >
                            {done ? <CheckCircle className="w-4 h-4" /> : step}
                        </div>
                        <span
                            className="text-[9px] uppercase tracking-[0.2em] font-bold"
                            style={{ color: active ? "#C9A84C" : done ? "rgba(13,27,42,0.4)" : "rgba(13,27,42,0.2)" }}
                        >
                            {s.label}
                        </span>
                        {i < 2 && (
                            <div className="hidden" />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

function ProgressBarWithLines({ current }: { current: 1 | 2 | 3 }) {
    return (
        <div className="flex items-start gap-0">
            {[{ label: "Your Role" }, { label: "Your Profile" }, { label: "Your Goals" }].map((s, i) => {
                const step = i + 1;
                const done = step < current;
                const active = step === current;
                return (
                    <div key={i} className="flex items-center">
                        <div className="flex flex-col items-center gap-2">
                            <div
                                className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all"
                                style={{
                                    background: done ? "transparent" : active ? "#C9A84C" : "transparent",
                                    border: done ? "1px solid #C9A84C" : active ? "none" : "1px solid rgba(13,27,42,0.1)",
                                    color: done ? "#C9A84C" : active ? "#0D1B2A" : "rgba(13,27,42,0.2)",
                                    boxShadow: active ? "0 4px 12px rgba(201,168,76,0.3)" : "none",
                                }}
                            >
                                {done ? <CheckCircle className="w-4 h-4" /> : step}
                            </div>
                            <span
                                className="text-[9px] uppercase tracking-[0.2em] font-bold"
                                style={{ color: active ? "#C9A84C" : done ? "rgba(13,27,42,0.4)" : "rgba(13,27,42,0.2)" }}
                            >
                                {s.label}
                            </span>
                        </div>
                        {i < 2 && (
                            <div
                                className="h-[1px] w-12 mb-5"
                                style={{ background: done ? "rgba(201,168,76,0.4)" : "rgba(13,27,42,0.08)" }}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type Step = "role" | "profile" | "goals" | "complete";

export default function OrgProfilePage() {
    const router = useRouter();
    const { user, isLoading: authLoading, isAuthenticated, refreshUser } = useAuth();

    const [step, setStep] = useState<Step>("role");
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Step 1 — Role
    const [role, setRole] = useState<"incubator" | "csr" | "ngo" | "">("");

    // Step 2 — Profile
    const [orgName, setOrgName] = useState("");
    const [description, setDescription] = useState("");
    const [selectedFocus, setSelectedFocus] = useState<string[]>([]);
    const [selectedGeo, setSelectedGeo] = useState<string[]>([]);
    const [orgSize, setOrgSize] = useState("");
    const [website, setWebsite] = useState("");
    const [matches, setMatches] = useState<any[]>([]);

    // Step 3 — Goals
    const [partnershipTypes, setPartnershipTypes] = useState<string[]>([]);
    const [budgetRange, setBudgetRange] = useState("");
    const [timeline, setTimeline] = useState("");
    const [partnerNotes, setPartnerNotes] = useState("");

    // Auth guards — skip when already on the success screen to prevent stale-state redirect loop
    useEffect(() => {
        if (authLoading) return;
        if (step === "complete") return; // never bounce away from the success screen
        if (!isAuthenticated) { router.push("/auth?returnTo=/org-profile"); return; }
        if (user?.form_filled) { window.location.href = "/dashboard"; }
    }, [authLoading, isAuthenticated, user, router, step]);

    const validateProfile = () => {
        const errs: Record<string, string> = {};
        if (!orgName.trim()) errs.orgName = "Organization name is required";
        if (!description.trim()) errs.description = "Description is required";
        if (selectedFocus.length === 0) errs.focusAreas = "Select at least one focus area";
        if (selectedGeo.length === 0) errs.geography = "Select at least one geography";
        if (!orgSize) errs.orgSize = "Select an organization size";
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const validateGoals = () => {
        const errs: Record<string, string> = {};
        if (partnershipTypes.length === 0) errs.partnershipTypes = "Select at least one partnership type";
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSaveAll = async () => {
        if (!user?.id) { router.push("/auth"); return; }
        setIsLoading(true);
        try {
            const res = await fetch("/api/save-org-profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user.id,
                    role,
                    orgName,
                    description,
                    focusAreas: selectedFocus,
                    geography: selectedGeo,
                    orgSize,
                    website,
                    partnershipTypes,
                    budgetRange,
                    timeline,
                    partnerNotes,
                }),
            });
            const data = await res.json();
            if (!res.ok) { setErrors({ submit: data.error || "Failed to save. Please try again." }); return; }
            // Fetch dynamic matches right after profile save
            try {
                const matchRes = await fetch("/api/matches");
                if (matchRes.ok) {
                    const matchData = await matchRes.json();
                    if (matchData.matches) {
                        setMatches(matchData.matches.slice(0, 3));
                    }
                }
            } catch (e) {
                console.error("Failed to fetch matches:", e);
            }

            // Refresh auth context so profile_complete=true before navigating to dashboard
            await refreshUser();
            setStep("complete");
        } catch (err: any) {
            setErrors({ submit: err.message || "Something went wrong." });
        } finally {
            setIsLoading(false);
        }
    };

    if (authLoading || !isAuthenticated) {
        return <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#C9A84C]" /></div>;
    }

    if (step !== "complete" && user?.form_filled) {
        return <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#C9A84C] mb-4" /><p style={{ color: "rgba(13,27,42,0.5)" }}>Taking you to dashboard...</p></div>;
    }

    return (
        <div className="min-h-screen" style={{ fontFamily: "'DM Sans', sans-serif", backgroundColor: "#FAF7F2", color: "#0D1B2A" }}>
            <AnimatePresence mode="wait">

                {/* ──────────────── STEP 1: ROLE SELECTION ──────────────── */}
                {step === "role" && (
                    <motion.div
                        key="role"
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                        className="min-h-screen flex flex-col items-center justify-center px-6 py-16"
                    >
                        {/* Logo */}
                        <h1 className="text-4xl font-bold tracking-tight mb-12" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                            Driv<span style={{ color: "#C9A84C" }}>ya</span>
                        </h1>

                        {/* Progress line */}
                        <div className="w-full max-w-xl mb-16">
                            <div className="relative flex justify-between">
                                <div className="absolute -top-8 left-0 text-[10px] uppercase tracking-widest font-bold" style={{ color: "#C9A84C" }}>Your Role</div>
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-widest font-bold" style={{ color: "rgba(13,27,42,0.3)" }}>Your Profile</div>
                                <div className="absolute -top-8 right-0 text-[10px] uppercase tracking-widest font-bold" style={{ color: "rgba(13,27,42,0.3)" }}>Your Goals</div>
                                <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-[1px]" style={{ background: "rgba(13,27,42,0.08)" }} />
                                <div className="absolute top-1/2 -translate-y-1/2 left-0 w-1/2 h-[1px]" style={{ background: "#C9A84C" }} />
                                <div className="z-10 w-3 h-3 rounded-full ring-4" style={{ background: "#C9A84C", border: "4px solid #FAF7F2", boxShadow: "0 0 0 4px rgba(201,168,76,0.15)" }} />
                                <div className="z-10 w-3 h-3 rounded-full" style={{ background: "rgba(13,27,42,0.1)", border: "4px solid #FAF7F2" }} />
                                <div className="z-10 w-3 h-3 rounded-full" style={{ background: "rgba(13,27,42,0.1)", border: "4px solid #FAF7F2" }} />
                            </div>
                        </div>

                        {/* Heading */}
                        <div className="text-center mb-16 max-w-2xl">
                            <h2 className="text-5xl md:text-6xl font-semibold mb-6" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                                First, tell us who you are.
                            </h2>
                            <p className="text-lg" style={{ color: "rgba(13,27,42,0.6)" }}>
                                This helps Drivya show you the most relevant matches from day one.
                            </p>
                        </div>

                        {/* Role Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
                            {ROLES.map((r) => (
                                <button
                                    key={r.id}
                                    onClick={() => { setRole(r.id as any); setStep("profile"); }}
                                    className="group cursor-pointer bg-white p-10 rounded-sm flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-2"
                                    style={{
                                        border: "1px solid rgba(13,27,42,0.05)",
                                        boxShadow: "none",
                                    }}
                                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#C9A84C"; (e.currentTarget as HTMLElement).style.boxShadow = "0 20px 40px rgba(13,27,42,0.08)"; }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(13,27,42,0.05)"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
                                >
                                    <div className="text-6xl mb-8 transition-transform duration-500 group-hover:scale-110">{r.emoji}</div>
                                    <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4" style={{ background: r.badgeStyle.bg, color: r.badgeStyle.color }}>
                                        {r.badge}
                                    </span>
                                    <h3 className="text-3xl font-medium mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{r.label}</h3>
                                    <p className="text-sm leading-relaxed" style={{ color: "rgba(13,27,42,0.6)" }}>{r.desc}</p>
                                </button>
                            ))}
                        </div>

                        <p className="mt-16 text-xs uppercase tracking-[0.2em] font-bold" style={{ color: "rgba(13,27,42,0.4)" }}>Step 1 of 3</p>
                    </motion.div>
                )}

                {/* ──────────────── STEP 2: ORG PROFILE ──────────────── */}
                {step === "profile" && (
                    <motion.div
                        key="profile"
                        initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
                        className="min-h-screen flex"
                    >
                        {/* Left Panel */}
                        <aside className="hidden lg:flex w-[40%] flex-col justify-between p-16 xl:p-20 relative overflow-hidden" style={{ background: "#0D1B2A", color: "#FAF7F2" }}>
                            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(#FAF7F2 1px,transparent 1px),linear-gradient(90deg,#FAF7F2 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
                            <div className="relative z-10">
                                <h1 className="text-3xl font-bold tracking-tight mb-16" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                                    Driv<span style={{ color: "#C9A84C" }}>ya</span>
                                </h1>
                                <div className="mb-16">
                                    <ProgressBarWithLines current={2} />
                                </div>
                                <div className="max-w-xs">
                                    <h2 className="text-4xl xl:text-5xl font-medium mb-6 leading-tight" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                                        Tell us about your organization.
                                    </h2>
                                    <p className="text-lg leading-relaxed" style={{ color: "rgba(250,247,242,0.6)" }}>
                                        The more we know, the better your matches.
                                    </p>
                                </div>
                            </div>
                            <div className="relative z-10 p-6 rounded-sm" style={{ border: "1px solid rgba(201,168,76,0.2)", background: "rgba(201,168,76,0.05)" }}>
                                <p className="text-sm leading-relaxed">
                                    <span className="font-bold mr-2" style={{ color: "#C9A84C" }}>💡 Tip:</span>
                                    Organizations with complete profiles get 3× more relevant matches.
                                </p>
                            </div>
                        </aside>

                        {/* Right Panel */}
                        <main className="flex-1 p-8 sm:p-12 lg:p-16 xl:p-24 overflow-y-auto">
                            <div className="lg:hidden mb-10 flex items-center justify-between">
                                <h1 className="text-2xl font-bold" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Driv<span style={{ color: "#C9A84C" }}>ya</span></h1>
                                <ProgressBarWithLines current={2} />
                            </div>

                            <div className="max-w-2xl mx-auto">
                                <div className="mb-10">
                                    <h2 className="text-3xl font-bold mb-1" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Organization Profile</h2>
                                    <p className="text-sm" style={{ color: "#666e75" }}>Fill in the details to get matched with the right partners.</p>
                                </div>

                                {errors.submit && <div className="mb-6 p-4 rounded-sm text-red-600 text-sm" style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>{errors.submit}</div>}

                                <div className="space-y-10">
                                    {/* Org Name */}
                                    <div className="space-y-2">
                                        <label className="text-[11px] uppercase tracking-[0.2em] font-bold" style={{ color: "rgba(13,27,42,0.6)" }}>Organization Name *</label>
                                        <input type="text" value={orgName} onChange={e => { setOrgName(e.target.value); setErrors(er => ({ ...er, orgName: "" })); }}
                                            placeholder="Enter your organization's full name"
                                            className="w-full px-0 py-4 bg-transparent text-xl font-medium outline-none placeholder:opacity-20"
                                            style={{ borderBottom: `1px solid ${errors.orgName ? "#EF4444" : "rgba(13,27,42,0.1)"}` }} />
                                        {errors.orgName && <p className="text-red-500 text-xs">{errors.orgName}</p>}
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-2">
                                        <label className="text-[11px] uppercase tracking-[0.2em] font-bold" style={{ color: "rgba(13,27,42,0.6)" }}>What does your org do? *</label>
                                        <textarea value={description} onChange={e => { setDescription(e.target.value); setErrors(er => ({ ...er, description: "" })); }}
                                            placeholder="Briefly describe your work and mission (2–3 sentences)"
                                            rows={3} className="w-full px-0 py-4 bg-transparent text-lg outline-none resize-none placeholder:opacity-20"
                                            style={{ borderBottom: `1px solid ${errors.description ? "#EF4444" : "rgba(13,27,42,0.1)"}` }} />
                                        {errors.description && <p className="text-red-500 text-xs">{errors.description}</p>}
                                    </div>

                                    {/* Focus Areas */}
                                    <div className="space-y-4">
                                        <label className="text-[11px] uppercase tracking-[0.2em] font-bold" style={{ color: "rgba(13,27,42,0.6)" }}>Focus Areas *</label>
                                        <div className="flex flex-wrap gap-2">
                                            {FOCUS_AREAS.map(item => (
                                                <button key={item} type="button"
                                                    onClick={() => { setSelectedFocus(p => p.includes(item) ? p.filter(x => x !== item) : [...p, item]); setErrors(er => ({ ...er, focusAreas: "" })); }}
                                                    className="px-5 py-2.5 rounded-full border text-sm font-medium transition-all"
                                                    style={{ background: selectedFocus.includes(item) ? "#C9A84C" : "transparent", borderColor: selectedFocus.includes(item) ? "#C9A84C" : "rgba(13,27,42,0.1)" }}>
                                                    {item}
                                                </button>
                                            ))}
                                        </div>
                                        {errors.focusAreas && <p className="text-red-500 text-xs">{errors.focusAreas}</p>}
                                    </div>

                                    {/* Geography */}
                                    <div className="space-y-4">
                                        <label className="text-[11px] uppercase tracking-[0.2em] font-bold" style={{ color: "rgba(13,27,42,0.6)" }}>Geography *</label>
                                        <div className="flex flex-wrap gap-2">
                                            {GEOGRAPHIES.map(item => (
                                                <button key={item} type="button"
                                                    onClick={() => { setSelectedGeo(p => p.includes(item) ? p.filter(x => x !== item) : [...p, item]); setErrors(er => ({ ...er, geography: "" })); }}
                                                    className="px-5 py-2.5 rounded-full border text-sm font-medium transition-all"
                                                    style={{ background: selectedGeo.includes(item) ? "#C9A84C" : "transparent", borderColor: selectedGeo.includes(item) ? "#C9A84C" : "rgba(13,27,42,0.1)" }}>
                                                    {item}
                                                </button>
                                            ))}
                                        </div>
                                        {errors.geography && <p className="text-red-500 text-xs">{errors.geography}</p>}
                                    </div>

                                    {/* Org Size */}
                                    <div className="space-y-4">
                                        <label className="text-[11px] uppercase tracking-[0.2em] font-bold" style={{ color: "rgba(13,27,42,0.6)" }}>Organization Size *</label>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            {ORG_SIZES.map(s => (
                                                <button key={s.label} type="button"
                                                    onClick={() => { setOrgSize(s.range); setErrors(er => ({ ...er, orgSize: "" })); }}
                                                    className="p-5 border text-left rounded-sm transition-all bg-white"
                                                    style={{ borderColor: orgSize === s.range ? "#C9A84C" : "rgba(13,27,42,0.05)", boxShadow: orgSize === s.range ? "0 10px 20px rgba(201,168,76,0.1)" : "none" }}>
                                                    <p className="text-[10px] font-bold uppercase mb-1" style={{ color: "rgba(13,27,42,0.4)" }}>{s.label}</p>
                                                    <p className="text-sm font-medium">{s.range}</p>
                                                </button>
                                            ))}
                                        </div>
                                        {errors.orgSize && <p className="text-red-500 text-xs">{errors.orgSize}</p>}
                                    </div>

                                    {/* Website */}
                                    <div className="space-y-2">
                                        <label className="text-[11px] uppercase tracking-[0.2em] font-bold" style={{ color: "rgba(13,27,42,0.6)" }}>Website URL (Optional)</label>
                                        <input type="url" value={website} onChange={e => setWebsite(e.target.value)}
                                            placeholder="https://yourorganization.com"
                                            className="w-full px-0 py-4 bg-transparent text-lg outline-none placeholder:opacity-20"
                                            style={{ borderBottom: "1px solid rgba(13,27,42,0.1)" }} />
                                    </div>

                                    {/* Nav */}
                                    <div className="pt-4 flex items-center justify-between">
                                        <button onClick={() => setStep("role")} className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-colors hover:opacity-60" style={{ color: "rgba(13,27,42,0.4)" }}>
                                            <ArrowLeft className="w-4 h-4" /> Back
                                        </button>
                                        <button onClick={() => { if (validateProfile()) setStep("goals"); }}
                                            className="px-10 py-5 rounded-sm font-bold text-sm uppercase tracking-widest transition-all active:scale-[0.98]"
                                            style={{ background: "#C9A84C", color: "#0D1B2A" }}>
                                            Continue →
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </main>
                    </motion.div>
                )}

                {/* ──────────────── STEP 3: GOALS/EXPECTATIONS ──────────────── */}
                {step === "goals" && (
                    <motion.div
                        key="goals"
                        initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
                        className="min-h-screen py-20 px-6 flex flex-col items-center"
                    >
                        {/* Logo + Progress */}
                        <div className="w-full max-w-4xl flex flex-col items-center mb-16">
                            <h1 className="text-3xl font-bold tracking-tight mb-12" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                                Driv<span style={{ color: "#C9A84C" }}>ya</span>
                            </h1>
                            <ProgressBarWithLines current={3} />
                        </div>

                        <main className="w-full max-w-4xl">
                            <div className="text-center mb-16">
                                <h2 className="text-5xl md:text-6xl font-semibold mb-6" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                                    What are you looking for in a partner?
                                </h2>
                                <p className="text-lg max-w-xl mx-auto" style={{ color: "rgba(13,27,42,0.6)" }}>
                                    Select everything that applies. This shapes your Drivya Match Score.
                                </p>
                            </div>

                            {errors.submit && <div className="mb-8 p-4 rounded-sm text-red-600 text-sm text-center" style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>{errors.submit}</div>}

                            <div className="space-y-20">
                                {/* Partnership Types */}
                                <div className="space-y-6">
                                    <label className="text-[11px] uppercase tracking-[0.2em] font-bold block mb-8" style={{ color: "rgba(13,27,42,0.6)" }}>I am looking for...</label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {PARTNERSHIP_TYPES.map(pt => {
                                            const selected = partnershipTypes.includes(pt.label);
                                            return (
                                                <button key={pt.label} type="button"
                                                    onClick={() => { setPartnershipTypes(p => p.includes(pt.label) ? p.filter(x => x !== pt.label) : [...p, pt.label]); setErrors(er => ({ ...er, partnershipTypes: "" })); }}
                                                    className="p-6 bg-white border rounded-sm flex flex-col items-center justify-center text-center gap-3 transition-all"
                                                    style={{
                                                        borderColor: selected ? "#C9A84C" : "rgba(13,27,42,0.05)",
                                                        background: selected ? "rgba(201,168,76,0.05)" : "#fff",
                                                        transform: selected ? "scale(0.98)" : "scale(1)",
                                                    }}>
                                                    <span className="text-2xl">{pt.emoji}</span>
                                                    <span className="text-xs font-bold leading-tight">{pt.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {errors.partnershipTypes && <p className="text-red-500 text-xs font-bold uppercase tracking-widest">{errors.partnershipTypes}</p>}
                                </div>

                                {/* Budget */}
                                <div className="space-y-8">
                                    <label className="text-[11px] uppercase tracking-[0.2em] font-bold block" style={{ color: "rgba(13,27,42,0.6)" }}>Expected collaboration budget</label>
                                    <div className="flex flex-wrap gap-2">
                                        {BUDGETS.map(b => (
                                            <button key={b} type="button" onClick={() => setBudgetRange(b === budgetRange ? "" : b)}
                                                className="px-6 py-3 rounded-full border text-xs font-bold transition-all"
                                                style={{ background: budgetRange === b ? "#C9A84C" : "transparent", borderColor: budgetRange === b ? "#C9A84C" : "rgba(13,27,42,0.1)", color: budgetRange === b ? "#0D1B2A" : "inherit" }}>
                                                {b}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Timeline */}
                                <div className="space-y-8">
                                    <label className="text-[11px] uppercase tracking-[0.2em] font-bold block" style={{ color: "rgba(13,27,42,0.6)" }}>When do you want to start?</label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {TIMELINES.map(t => {
                                            const selected = timeline === t.label;
                                            return (
                                                <button key={t.label} type="button" onClick={() => setTimeline(selected ? "" : t.label)}
                                                    className="p-6 bg-white border rounded-sm text-left group transition-all"
                                                    style={{ borderColor: selected ? "#C9A84C" : "rgba(13,27,42,0.05)", background: selected ? "rgba(201,168,76,0.03)" : "#fff" }}>
                                                    <span className="text-2xl mb-4 block transition-transform group-hover:scale-110">{t.emoji}</span>
                                                    <p className="text-sm font-bold mb-1">{t.label}</p>
                                                    <p className="text-[11px]" style={{ color: "rgba(13,27,42,0.4)" }}>{t.sub}</p>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Optional notes */}
                                <div className="space-y-4">
                                    <label className="text-[11px] uppercase tracking-[0.2em] font-bold block" style={{ color: "rgba(13,27,42,0.6)" }}>Anything specific you want in a partner? (Optional)</label>
                                    <textarea rows={3} value={partnerNotes} onChange={e => setPartnerNotes(e.target.value)}
                                        placeholder="E.g. Must have worked in rural UP, looking for 3 year commitment..."
                                        className="w-full px-0 py-4 bg-transparent text-lg outline-none resize-none placeholder:opacity-20"
                                        style={{ borderBottom: "1px solid rgba(13,27,42,0.1)" }} />
                                </div>

                                {/* Nav */}
                                <div className="pt-20 flex flex-col md:flex-row items-center justify-between gap-12">
                                    <button onClick={() => setStep("profile")} className="text-sm font-bold uppercase tracking-widest transition-colors hover:opacity-70" style={{ color: "rgba(13,27,42,0.4)" }}>
                                        ← Back
                                    </button>
                                    <div className="flex flex-col items-center md:items-end gap-4">
                                        <button onClick={() => { if (validateGoals()) handleSaveAll(); }} disabled={isLoading}
                                            className="px-12 py-6 rounded-sm font-bold text-sm uppercase tracking-widest transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
                                            style={{ background: "linear-gradient(90deg,#C9A84C 0%,#d4bb73 25%,#C9A84C 50%,#d4bb73 75%,#C9A84C 100%)", backgroundSize: "200% auto", color: "#0D1B2A", boxShadow: "0 20px 40px rgba(201,168,76,0.25)" }}>
                                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Show My Matches →"}
                                        </button>
                                        <p className="text-[10px] font-medium" style={{ color: "rgba(13,27,42,0.3)" }}>You can update your preferences anytime from your profile.</p>
                                    </div>
                                </div>
                            </div>
                        </main>
                    </motion.div>
                )}

                {/* ──────────────── SUCCESS SCREEN ──────────────── */}
                {step === "complete" && (
                    <motion.div
                        key="complete"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="min-h-screen flex items-center justify-center p-6 md:p-12"
                        style={{ background: "#0D1B2A", color: "#FAF7F2" }}
                    >
                        <div className="max-w-5xl w-full flex flex-col items-center text-center space-y-12 py-12">

                            {/* Animated SVG Checkmark */}
                            <div className="relative">
                                <svg width="80" height="80" viewBox="0 0 52 52" style={{ overflow: "visible" }}>
                                    <circle cx="26" cy="26" r="25" fill="none" stroke="#C9A84C" strokeWidth="2"
                                        style={{ strokeDasharray: 166, strokeDashoffset: 166, animation: "checkCircle 0.6s cubic-bezier(0.65,0,0.45,1) 0.2s forwards" }} />
                                    <path fill="none" stroke="#C9A84C" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                                        d="M14.1 27.2l7.1 7.2 16.7-16.8"
                                        style={{ strokeDasharray: 48, strokeDashoffset: 48, animation: "checkMark 0.3s cubic-bezier(0.65,0,0.45,1) 0.9s forwards" }} />
                                </svg>
                                <style>{`
                                    @keyframes checkCircle { to { stroke-dashoffset: 0; } }
                                    @keyframes checkMark { to { stroke-dashoffset: 0; } }
                                `}</style>
                            </div>

                            {/* Heading */}
                            <div className="space-y-4 max-w-2xl">
                                <motion.h1
                                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }}
                                    className="text-4xl md:text-6xl font-bold" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                                    Your profile is live.
                                </motion.h1>
                                <motion.p
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
                                    className="text-lg md:text-xl font-light leading-relaxed" style={{ color: "rgba(250,247,242,0.6)" }}>
                                    Drivya has found your first matches based on your profile.<br className="hidden md:block" />
                                    Unlock full details to start connecting.
                                </motion.p>
                            </div>

                            {/* Blurred Match Previews */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2 }}
                                className="w-full space-y-6 pt-4"
                            >
                                <p className="text-xs font-bold uppercase tracking-[0.3em]" style={{ color: "#C9A84C" }}>Your Top Matches</p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {(matches.length > 0 ? matches : [
                                        { initials: "TF", name: "TCS Foundation", type: "CSR Partner", score: 87, matchFactors: ["Pan India", "Education"] },
                                        { initials: "IF", name: "Infosys Foundation", type: "CSR Partner", score: 79, matchFactors: ["Karnataka", "Health"] },
                                        { initials: "JF", name: "Jacob Foundation", type: "International NGO", score: 71, matchFactors: ["Global", "Research"] },
                                    ]).map((card, i) => {
                                        const isLocked = i > 0;
                                        const blurPx = i === 1 ? 5 : i === 2 ? 9 : 0;
                                        return (
                                        <div key={i} className="relative rounded-sm overflow-hidden group"
                                            style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${!isLocked ? "rgba(201,168,76,0.4)" : "rgba(255,255,255,0.1)"}`, backdropFilter: "blur(8px)", transition: "all 0.4s ease" }}>
                                            {/* Card content */}
                                            <div className="p-8 space-y-6" style={{ filter: isLocked ? `blur(${blurPx}px)` : "none" }}>
                                                <div className="flex items-center justify-between">
                                                    <div className="w-12 h-12 flex items-center justify-center font-bold text-lg" style={{ background: !isLocked ? "#C9A84C" : "#0D1B2A", color: !isLocked ? "#0D1B2A" : "#FAF7F2", border: "1px solid rgba(255,255,255,0.1)", fontFamily: "'Cormorant Garamond', serif" }}>{card.initials}</div>
                                                    {!isLocked && <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-full" style={{ background: "rgba(201,168,76,0.2)", color: "#C9A84C" }}>✓ Unlocked</span>}
                                                </div>
                                                <div className="text-left space-y-2">
                                                    <h4 className="text-xl" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{card.name}</h4>
                                                    <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded-sm" style={{ background: "rgba(201,168,76,0.1)", color: "#C9A84C" }}>{card.type}</span>
                                                </div>
                                                {!isLocked && card.matchFactors && (
                                                    <div className="flex flex-wrap gap-2 pt-2">
                                                        {card.matchFactors.map((factor: string, idx: number) => (
                                                             <span key={idx} className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-sm" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(250,247,242,0.6)" }}>
                                                                 {factor}
                                                             </span>
                                                        ))}
                                                    </div>
                                                )}
                                                <div className="flex items-center justify-between pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                                                    <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Match Score</span>
                                                    <span className="text-2xl font-bold" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#C9A84C" }}>{card.score}%</span>
                                                </div>
                                                {!isLocked && (
                                                    <button className="w-full text-[10px] font-bold uppercase tracking-widest py-3 rounded-sm transition-all hover:brightness-110"
                                                        style={{ background: "#C9A84C", color: "#0D1B2A" }}
                                                        onClick={() => window.location.href = "/dashboard"}>
                                                        View Full Profile →
                                                    </button>
                                                )}
                                            </div>
                                            {/* Lock Overlay — only for locked cards */}
                                            {isLocked && (
                                                <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: `rgba(13,27,42,${0.3 + i * 0.15})`, backdropFilter: `blur(${i * 2}px)` }}>
                                                    <div className="px-4 py-2 rounded-full flex items-center gap-2"
                                                        style={{ background: "rgba(13,27,42,0.8)", border: "1px solid rgba(255,255,255,0.1)" }}>
                                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" style={{ color: "#C9A84C" }}>
                                                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                                        </svg>
                                                        <span className="text-[10px] uppercase font-bold tracking-widest" style={{ color: "rgba(255,255,255,0.8)" }}>Unlock to view</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        );
                                    })}
                                </div>
                            </motion.div>

                            {/* CTA */}
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3 }}
                                className="w-full flex flex-col items-center gap-6 pt-12"
                            >
                                <button onClick={() => { window.location.href = "/dashboard"; }}
                                    className="w-full max-w-[400px] font-bold text-sm uppercase tracking-[0.2em] py-5 rounded-sm active:scale-[0.98] transition-all"
                                    style={{ background: "#C9A84C", color: "#0D1B2A", animation: "pulse 2s infinite ease-in-out", boxShadow: "0 0 0 0 rgba(201,168,76,0.4)" }}>
                                    Go to My Dashboard →
                                </button>
                                <style>{`@keyframes pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(201,168,76,0.4); } 70% { box-shadow: 0 0 0 15px rgba(201,168,76,0); } }`}</style>
                            </motion.div>

                            <p className="text-[10px] uppercase tracking-widest pt-4" style={{ color: "rgba(255,255,255,0.2)" }}>
                                Your data is private. Only organizations you unlock can see your contact details.
                            </p>
                        </div>
                    </motion.div>
                )}

            </AnimatePresence>
        </div>
    );
}
