import { useState, useRef, useEffect } from "react";
import { Heart, ExternalLink, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

// Demo/sample match data - clearly marked as sample data
const SAMPLE_MATCHES = [
    {
        id: "1",
        orgA: { name: "Green Earth Foundation", website: "https://example.com/gef" },
        orgB: { name: "Climate Action Network", website: "https://example.com/can" },
        alignmentScore: 81,
    },
    {
        id: "2",
        orgA: { name: "Rural Education Trust", website: "https://example.com/ret" },
        orgB: { name: "Digital Literacy Initiative", website: "https://example.com/dli" },
        alignmentScore: 58,
    },
    {
        id: "3",
        orgA: { name: "Urban Healthcare NGO", website: "https://example.com/uhn" },
        orgB: { name: "Mobile Clinics Project", website: "https://example.com/mcp" },
        alignmentScore: 32,
    },
    {
        id: "4",
        orgA: { name: "Women Empowerment Org", website: "https://example.com/weo" },
        orgB: { name: "Skill Development Foundation", website: "https://example.com/sdf" },
        alignmentScore: 74,
    },
    {
        id: "5",
        orgA: { name: "Child Welfare Society", website: "https://example.com/cws" },
        orgB: { name: "Safe Childhood Initiative", website: "https://example.com/sci" },
        alignmentScore: 89,
    },
    {
        id: "6",
        orgA: { name: "Water Conservation Trust", website: "https://example.com/wct" },
        orgB: { name: "Sustainable Farming Collective", website: "https://example.com/sfc" },
        alignmentScore: 45,
    },
];

// Circular progress ring component for score visualization
function ScoreRing({ score, size = 80 }: { score: number; size?: number }) {
    const radius = (size - 8) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = (score / 100) * circumference;

    // Color based on score
    const getColor = () => {
        if (score >= 80) return "stroke-green-500";
        if (score >= 50) return "stroke-primary";
        return "stroke-amber-500";
    };

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg className="transform -rotate-90" width={size} height={size}>
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    className="stroke-muted/30 fill-none"
                    strokeWidth="6"
                />
                {/* Progress circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    className={`${getColor()} fill-none transition-all duration-500`}
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference - progress}
                />
            </svg>
            {/* Score text in center */}
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-foreground">{score}%</span>
            </div>
        </div>
    );
}

// Single match card component
function MatchCard({
    match,
    isPaused,
    onMouseEnter,
    onMouseLeave,
}: {
    match: (typeof SAMPLE_MATCHES)[0];
    isPaused: boolean;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
}) {
    const [saved, setSaved] = useState(false);

    return (
        <div
            className="group flex-shrink-0 w-[340px] bg-card rounded-2xl border-2 border-border p-6 shadow-lg hover:shadow-xl hover:border-primary/50 transition-all duration-300 cursor-pointer"
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            {/* Header with score ring */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                        Match Preview
                    </div>
                    <div className="flex items-center gap-1 text-primary/60">
                        <Sparkles className="w-3 h-3" />
                        <span className="text-xs font-medium">Sample Data</span>
                    </div>
                </div>
                <ScoreRing score={match.alignmentScore} size={70} />
            </div>

            {/* Organizations */}
            <div className="space-y-3 mb-5">
                <div className="bg-primary/5 rounded-xl p-3">
                    <div className="text-xs text-muted-foreground mb-1">Organization A</div>
                    <div className="font-semibold text-foreground truncate">{match.orgA.name}</div>
                </div>
                <div className="flex justify-center">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary text-lg">↔</span>
                    </div>
                </div>
                <div className="bg-secondary/10 rounded-xl p-3">
                    <div className="text-xs text-muted-foreground mb-1">Organization B</div>
                    <div className="font-semibold text-foreground truncate">{match.orgB.name}</div>
                </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
                <Button
                    variant={saved ? "default" : "outline"}
                    size="sm"
                    className="flex-1"
                    onClick={(e) => {
                        e.stopPropagation();
                        setSaved(!saved);
                    }}
                >
                    <Heart className="w-4 h-4 mr-1" fill={saved ? "currentColor" : "none"} />
                    {saved ? "Saved" : "Save"}
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    onClick={(e) => e.stopPropagation()}
                    asChild
                >
                    <a href={match.orgA.website} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Website
                    </a>
                </Button>
            </div>
        </div>
    );
}

export default function OrganizationMatching() {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [isPaused, setIsPaused] = useState(false);
    const [scrollPosition, setScrollPosition] = useState(0);
    const animationRef = useRef<number | undefined>(undefined);

    // Calculate animation speed based on average score
    // Lower scores = faster animation
    const avgScore =
        SAMPLE_MATCHES.reduce((sum, m) => sum + m.alignmentScore, 0) / SAMPLE_MATCHES.length;
    const baseSpeed = avgScore >= 50 ? 0.5 : 1; // pixels per frame

    // Auto-scroll animation
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const animate = () => {
            if (!isPaused && container) {
                setScrollPosition((prev) => {
                    const newPos = prev + baseSpeed;
                    // Reset when reaching half (since we duplicate cards)
                    const maxScroll = container.scrollWidth / 2;
                    return newPos >= maxScroll ? 0 : newPos;
                });
            }
            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isPaused, baseSpeed]);

    // Apply scroll position
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (container) {
            container.scrollLeft = scrollPosition;
        }
    }, [scrollPosition]);

    // Manual navigation
    const scrollBy = (direction: "left" | "right") => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const cardWidth = 340 + 24; // card width + gap
        const newPosition =
            direction === "left"
                ? scrollPosition - cardWidth
                : scrollPosition + cardWidth;

        setScrollPosition(Math.max(0, newPosition));
    };

    // Duplicate matches for seamless loop
    const displayMatches = [...SAMPLE_MATCHES, ...SAMPLE_MATCHES];

    return (
        <section className="py-20 px-4 sm:px-6 bg-gradient-to-b from-secondary/5 to-background overflow-hidden">
            <div className="container mx-auto max-w-6xl">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
                        AI-POWERED MATCHING
                    </span>
                    <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
                        See Matching in Action
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Watch how our AI finds aligned organizations based on mission, region, and goals
                    </p>
                </div>

                {/* Carousel Container */}
                <div className="relative">
                    {/* Left Arrow */}
                    <button
                        onClick={() => scrollBy("left")}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-card rounded-full shadow-lg border-2 border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 -ml-6"
                        aria-label="Previous matches"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>

                    {/* Right Arrow */}
                    <button
                        onClick={() => scrollBy("right")}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-card rounded-full shadow-lg border-2 border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 -mr-6"
                        aria-label="Next matches"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>

                    {/* Scrolling Cards Container */}
                    <div
                        ref={scrollContainerRef}
                        className="flex gap-6 overflow-x-hidden py-4 px-2"
                        style={{ scrollBehavior: "auto" }}
                    >
                        {displayMatches.map((match, index) => (
                            <MatchCard
                                key={`${match.id}-${index}`}
                                match={match}
                                isPaused={isPaused}
                                onMouseEnter={() => setIsPaused(true)}
                                onMouseLeave={() => setIsPaused(false)}
                            />
                        ))}
                    </div>

                    {/* Gradient Overlays for fade effect */}
                    <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent pointer-events-none z-5" />
                    <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent pointer-events-none z-5" />
                </div>

                {/* Speed indicator */}
                <div className="text-center mt-8">
                    <p className="text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            Cards with higher alignment scores move slower
                        </span>
                    </p>
                </div>
            </div>
        </section>
    );
}
