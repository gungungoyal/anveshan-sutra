"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, Zap, Target, ArrowRight, Clock, Users, CheckCircle, Heart, Rocket, Building, ChevronLeft, ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Role carousel slide data
const roleSlides = [
    {
        id: "ngo",
        title: "For NGOs",
        icon: Heart,
        description: "Find aligned partners, funding opportunities, and incubators without wasting weeks on outreach.",
        benefits: [
            "Discover relevant CSR and incubator partners",
            "See why an organization aligns before contacting",
            "Submit your organization for visibility",
        ],
        ctaText: "Set Up & Find Partners",
        ctaLink: "/start/ngo",
        theme: {
            bg: "bg-gradient-to-br from-green-50 via-green-50/80 to-emerald-100/50 dark:from-green-950/40 dark:via-green-900/20 dark:to-emerald-950/30",
            border: "border-green-300 dark:border-green-700",
            iconBg: "bg-green-100 dark:bg-green-900/60",
            iconColor: "text-green-600 dark:text-green-400",
            titleColor: "text-green-700 dark:text-green-300",
            checkColor: "text-green-600 dark:text-green-400",
            buttonBg: "bg-green-600 hover:bg-green-700",
            glow: "shadow-green-500/20",
            indicator: "bg-green-500",
        },
    },
    {
        id: "incubator",
        title: "For Incubators",
        icon: Rocket,
        description: "Identify NGOs and corporates that align with your focus areas, geography, and stage.",
        benefits: [
            "Find NGOs for pilots and programs",
            "Identify CSR partners for funding and scale",
            "Evaluate alignment before collaboration",
        ],
        ctaText: "Get Started",
        ctaLink: "/start/incubator",
        theme: {
            bg: "bg-gradient-to-br from-sky-50 via-sky-50/80 to-blue-100/50 dark:from-sky-950/40 dark:via-sky-900/20 dark:to-blue-950/30",
            border: "border-sky-300 dark:border-sky-700",
            iconBg: "bg-sky-100 dark:bg-sky-900/60",
            iconColor: "text-sky-500 dark:text-sky-400",
            titleColor: "text-sky-700 dark:text-sky-300",
            checkColor: "text-sky-500 dark:text-sky-400",
            buttonBg: "bg-sky-500 hover:bg-sky-600",
            glow: "shadow-sky-500/20",
            indicator: "bg-sky-500",
        },
    },
    {
        id: "csr",
        title: "For CSR Teams",
        icon: Building,
        description: "Reduce CSR discovery risk by finding credible, aligned organizations with verified data.",
        benefits: [
            "Discover NGOs aligned with CSR themes",
            "Review impact data before outreach",
            "Shortlist partners faster",
        ],
        ctaText: "Explore Verified NGOs",
        ctaLink: "/start/csr",
        theme: {
            bg: "bg-gradient-to-br from-orange-50 via-orange-50/80 to-amber-100/50 dark:from-orange-950/40 dark:via-orange-900/20 dark:to-amber-950/30",
            border: "border-orange-300 dark:border-orange-700",
            iconBg: "bg-orange-100 dark:bg-orange-900/60",
            iconColor: "text-orange-500 dark:text-orange-400",
            titleColor: "text-orange-700 dark:text-orange-300",
            checkColor: "text-orange-500 dark:text-orange-400",
            buttonBg: "bg-orange-500 hover:bg-orange-600",
            glow: "shadow-orange-500/20",
            indicator: "bg-orange-500",
        },
    },
];

export default function Home() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    const goToSlide = useCallback((index: number) => {
        if (isAnimating) return;
        setIsAnimating(true);
        setCurrentSlide(index);
        setTimeout(() => setIsAnimating(false), 500);
    }, [isAnimating]);

    const nextSlide = useCallback(() => {
        goToSlide((currentSlide + 1) % roleSlides.length);
    }, [currentSlide, goToSlide]);

    const prevSlide = useCallback(() => {
        goToSlide((currentSlide - 1 + roleSlides.length) % roleSlides.length);
    }, [currentSlide, goToSlide]);

    // Auto-play functionality
    useEffect(() => {
        if (isPaused) return;
        const interval = setInterval(nextSlide, 5000);
        return () => clearInterval(interval);
    }, [isPaused, nextSlide]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft") prevSlide();
            if (e.key === "ArrowRight") nextSlide();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [nextSlide, prevSlide]);

    const slide = roleSlides[currentSlide];
    const Icon = slide.icon;

    return (
        <div className="min-h-screen bg-background">
            <Header />

            {/* Section 1: Hero - Product-First Layout */}
            <section className="pt-16 pb-20 px-4 sm:px-6">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left: Headline + CTAs */}
                        <div>
                            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 leading-tight">
                                Find the right NGO, Incubator, or CSR partner.
                            </h1>
                            <p className="text-lg text-muted-foreground mb-8 max-w-lg">
                                Discover aligned organizations faster, with clear reasons before outreach.
                            </p>

                            {/* CTAs */}
                            <div className="flex flex-wrap gap-4">
                                <a
                                    href="#for-you"
                                    className="group inline-flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl"
                                >
                                    Get Started
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </a>
                                <Link
                                    href="/search"
                                    className="inline-flex items-center gap-2 px-8 py-4 border-2 border-border text-foreground rounded-xl hover:bg-muted/50 transition-all duration-300 font-semibold text-lg"
                                >
                                    Browse Organizations
                                </Link>
                            </div>
                        </div>

                        {/* Right: Visual Matching Preview */}
                        <div className="flex flex-col items-center lg:items-end">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4">
                                Sample matching result
                            </p>
                            <div className="w-full max-w-sm bg-card rounded-2xl p-6 border border-border shadow-lg">
                                {/* Organizations */}
                                <div className="flex items-center justify-between gap-4 mb-5">
                                    <div className="text-center flex-1">
                                        <div className="w-14 h-14 bg-muted rounded-xl flex items-center justify-center mx-auto mb-2 border border-border">
                                            <span className="text-primary font-bold text-lg">G</span>
                                        </div>
                                        <p className="text-sm font-medium text-foreground">Green Earth Foundation</p>
                                        <p className="text-xs text-muted-foreground">NGO • Environment</p>
                                    </div>
                                    <div className="text-muted-foreground text-2xl">↔</div>
                                    <div className="text-center flex-1">
                                        <div className="w-14 h-14 bg-muted rounded-xl flex items-center justify-center mx-auto mb-2 border border-border">
                                            <span className="text-orange-500 font-bold text-lg">T</span>
                                        </div>
                                        <p className="text-sm font-medium text-foreground">Tata CSR Initiative</p>
                                        <p className="text-xs text-muted-foreground">CSR • Sustainability</p>
                                    </div>
                                </div>

                                {/* Alignment Score */}
                                <div className="text-center py-4 border-t border-border">
                                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Alignment Score</p>
                                    <span className="text-4xl font-bold text-green-600">82%</span>
                                </div>

                                {/* Why This Matches */}
                                <div className="pt-4 border-t border-border">
                                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Why this matches you</p>
                                    <ul className="space-y-1.5 text-sm text-foreground/80">
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                                            <span>Shared focus: Climate Action</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                                            <span>Geography overlap: Maharashtra</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                                            <span>Partner type preference matched</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 2: Role Selection Carousel */}
            <section id="for-you" className="py-16 px-4 sm:px-6 bg-gradient-to-b from-background to-secondary/5 overflow-hidden">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
                            I am a...
                        </h2>
                        <p className="text-muted-foreground text-lg">
                            Select your role to see relevant organizations
                        </p>
                    </div>

                    {/* Carousel Container */}
                    <div
                        className="relative"
                        onMouseEnter={() => setIsPaused(true)}
                        onMouseLeave={() => setIsPaused(false)}
                    >
                        {/* Navigation Arrows */}
                        <button
                            onClick={prevSlide}
                            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-border flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-110 hidden md:flex"
                            aria-label="Previous slide"
                        >
                            <ChevronLeft className="w-6 h-6 text-foreground" />
                        </button>
                        <button
                            onClick={nextSlide}
                            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-border flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-110 hidden md:flex"
                            aria-label="Next slide"
                        >
                            <ChevronRight className="w-6 h-6 text-foreground" />
                        </button>

                        {/* Slide Content */}
                        <div className="max-w-2xl mx-auto px-8">
                            <div
                                key={slide.id}
                                className={`${slide.theme.bg} border-2 ${slide.theme.border} rounded-3xl p-8 md:p-10 shadow-xl ${slide.theme.glow} transition-all duration-500 transform ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
                            >
                                {/* Role Badge */}
                                <div className="flex items-center justify-center gap-4 mb-6">
                                    <div className={`w-16 h-16 ${slide.theme.iconBg} rounded-2xl flex items-center justify-center shadow-inner`}>
                                        <Icon className={`w-8 h-8 ${slide.theme.iconColor}`} />
                                    </div>
                                    <h3 className={`text-2xl md:text-3xl font-bold ${slide.theme.titleColor}`}>
                                        {slide.title}
                                    </h3>
                                </div>

                                {/* Description */}
                                <p className="text-foreground/80 text-lg md:text-xl text-center mb-8 leading-relaxed max-w-lg mx-auto">
                                    {slide.description}
                                </p>

                                {/* Benefits List */}
                                <ul className="space-y-4 mb-8 max-w-md mx-auto">
                                    {slide.benefits.map((benefit, index) => (
                                        <li
                                            key={index}
                                            className="flex items-center gap-3 text-foreground/80 text-base md:text-lg"
                                            style={{
                                                animation: !isAnimating ? `fadeInUp 0.5s ease-out ${index * 0.1}s both` : 'none'
                                            }}
                                        >
                                            <div className={`w-6 h-6 ${slide.theme.iconBg} rounded-full flex items-center justify-center flex-shrink-0`}>
                                                <CheckCircle className={`w-4 h-4 ${slide.theme.checkColor}`} />
                                            </div>
                                            <span>{benefit}</span>
                                        </li>
                                    ))}
                                </ul>

                                {/* CTA Button */}
                                <div className="flex justify-center">
                                    <Link
                                        href={slide.ctaLink}
                                        className={`inline-flex items-center gap-3 px-8 py-4 ${slide.theme.buttonBg} text-white font-bold text-lg rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 hover:-translate-y-1`}
                                    >
                                        {slide.ctaText}
                                        <ArrowRight className="w-5 h-5" />
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Dot Indicators */}
                        <div className="flex items-center justify-center gap-3 mt-8">
                            {roleSlides.map((s, index) => (
                                <button
                                    key={s.id}
                                    onClick={() => goToSlide(index)}
                                    className={`group relative transition-all duration-300 ${index === currentSlide ? 'scale-110' : 'hover:scale-105'
                                        }`}
                                    aria-label={`Go to ${s.title}`}
                                >
                                    {/* Outer ring for active */}
                                    <div
                                        className={`absolute inset-0 rounded-full transition-all duration-300 ${index === currentSlide
                                            ? `${s.theme.indicator} opacity-30 scale-150`
                                            : 'opacity-0 scale-100'
                                            }`}
                                    />
                                    {/* Inner dot */}
                                    <div
                                        className={`relative w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide
                                            ? s.theme.indicator
                                            : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>

                        {/* Role Labels Under Dots */}
                        <div className="flex items-center justify-center gap-8 mt-4">
                            {roleSlides.map((s, index) => {
                                const RoleIcon = s.icon;
                                return (
                                    <button
                                        key={s.id}
                                        onClick={() => goToSlide(index)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${index === currentSlide
                                            ? `${s.theme.bg} ${s.theme.border} border`
                                            : 'hover:bg-muted/50'
                                            }`}
                                    >
                                        <RoleIcon className={`w-4 h-4 ${index === currentSlide ? s.theme.iconColor : 'text-muted-foreground'}`} />
                                        <span className={`text-sm font-medium ${index === currentSlide ? s.theme.titleColor : 'text-muted-foreground'}`}>
                                            {s.title.replace('For ', '')}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Progress Bar */}
                        <div className="max-w-md mx-auto mt-6">
                            <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${slide.theme.indicator} transition-all duration-300`}
                                    style={{
                                        width: isPaused ? '100%' : '0%',
                                        animation: isPaused ? 'none' : 'progressFill 5s linear forwards'
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CSS Animation Keyframes */}
            <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes progressFill {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>

            {/* Section 3: Primary Feature Explanation */}
            <section className="py-16 px-4 sm:px-6 bg-secondary/5">
                <div className="container mx-auto max-w-3xl text-center">
                    <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Target className="w-10 h-10 text-primary" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                        Intelligent Organization Matching
                    </h2>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        Drivya.AI helps you discover organizations that align with your mission using intelligent matching based on focus areas, region, and goals.
                    </p>
                </div>
            </section>

            {/* Section 3: How It Works (3 steps only) */}
            <section className="py-20 px-4 sm:px-6">
                <div className="container mx-auto max-w-4xl">
                    <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-center mb-12">
                        How It Works
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Search,
                                step: "1",
                                title: "Explore Organizations",
                                description: "Browse our curated network of verified NGOs and partners",
                            },
                            {
                                icon: Zap,
                                step: "2",
                                title: "See Alignment Matches",
                                description: "Get instant compatibility scores based on shared goals",
                            },
                            {
                                icon: Users,
                                step: "3",
                                title: "Connect with Partners",
                                description: "Reach out to organizations that align with your mission",
                            },
                        ].map((item, index) => {
                            const StepIcon = item.icon;
                            return (
                                <div key={index} className="text-center">
                                    <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                                        <StepIcon className="w-7 h-7 text-primary" />
                                    </div>
                                    <h3 className="text-lg font-bold text-foreground mb-2">
                                        {item.title}
                                    </h3>
                                    <p className="text-muted-foreground text-sm">
                                        {item.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Section 4: Why This Helps You (Short - 3 bullets) */}
            <section className="py-16 px-4 sm:px-6 bg-secondary/5">
                <div className="container mx-auto max-w-3xl">
                    <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-10">
                        Why This Helps
                    </h2>
                    <div className="space-y-4">
                        {[
                            { icon: Clock, text: "Saves hours of research time" },
                            { icon: Target, text: "Reduces mismatched outreach" },
                            { icon: CheckCircle, text: "Improves collaboration clarity" },
                        ].map((benefit, index) => {
                            const BenefitIcon = benefit.icon;
                            return (
                                <div key={index} className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border">
                                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <BenefitIcon className="w-5 h-5 text-primary" />
                                    </div>
                                    <p className="text-foreground font-medium">{benefit.text}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Section 5: Trust/Credibility (Simple) */}
            <section className="py-16 px-4 sm:px-6">
                <div className="container mx-auto max-w-2xl text-center">
                    <p className="text-muted-foreground">
                        Drivya.AI helps organizations save time by surfacing verified, aligned partners.
                    </p>
                </div>
            </section>

            <Footer />
        </div>
    );
}
