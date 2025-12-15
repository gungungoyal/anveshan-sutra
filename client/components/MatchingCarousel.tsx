import { useState, useEffect } from "react";

// Sample matching data - demo preview only
const SAMPLE_MATCHES = [
    { orgA: "Green Earth Foundation", orgB: "Climate Action Network", score: 92 },
    { orgA: "Rural Education Trust", orgB: "Literacy Bridge India", score: 87 },
    { orgA: "Women Empowerment NGO", orgB: "Tech Skills Academy", score: 64 },
    { orgA: "Youth Innovation Hub", orgB: "Startup Incubator Fund", score: 76 },
    { orgA: "Clean Water Project", orgB: "Sanitation Alliance", score: 83 },
];

export default function MatchingCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    // Auto-advance every 4.5 seconds with smooth fade
    useEffect(() => {
        const timer = setInterval(() => {
            setIsVisible(false);

            setTimeout(() => {
                setCurrentIndex((prev) => (prev + 1) % SAMPLE_MATCHES.length);
                setIsVisible(true);
            }, 400);
        }, 4500);

        return () => clearInterval(timer);
    }, []);

    const match = SAMPLE_MATCHES[currentIndex];

    return (
        <section className="py-16 bg-background">
            <div className="container mx-auto max-w-md px-4">
                {/* Section Label */}
                <p className="text-center text-sm text-muted-foreground mb-10">
                    Example of how matching organizations will appear
                </p>

                {/* Single Centered Card */}
                <div
                    className={`
            bg-muted
            rounded-2xl p-8
            border border-border
            shadow-lg shadow-primary/5
            transition-opacity duration-400 ease-out
            ${isVisible ? "opacity-100" : "opacity-0"}
          `}
                >
                    {/* Organizations */}
                    <div className="flex items-start justify-between gap-6 mb-8">
                        {/* Org A */}
                        <div className="flex-1 text-center">
                            <div className="w-14 h-14 bg-card rounded-xl flex items-center justify-center mx-auto mb-3 border border-border">
                                <span className="text-primary font-semibold text-lg">
                                    {match.orgA.charAt(0)}
                                </span>
                            </div>
                            <p className="text-sm font-medium text-foreground leading-snug">
                                {match.orgA}
                            </p>
                        </div>

                        {/* Connector */}
                        <div className="pt-4 text-muted-foreground text-xl">↔</div>

                        {/* Org B */}
                        <div className="flex-1 text-center">
                            <div className="w-14 h-14 bg-card rounded-xl flex items-center justify-center mx-auto mb-3 border border-border">
                                <span className="text-secondary font-semibold text-lg">
                                    {match.orgB.charAt(0)}
                                </span>
                            </div>
                            <p className="text-sm font-medium text-foreground leading-snug">
                                {match.orgB}
                            </p>
                        </div>
                    </div>

                    {/* Alignment Score */}
                    <div className="text-center pt-6 border-t border-border">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                            Alignment Score
                        </p>
                        <span className="text-4xl font-bold text-foreground">
                            {match.score}%
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}
