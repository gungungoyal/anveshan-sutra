import { useState, useEffect } from "react";

// Sample matching data - demo/preview only
const SAMPLE_MATCHES = [
    { orgA: "Green Earth Foundation", orgB: "Climate Action Network", score: 92 },
    { orgA: "Rural Education Trust", orgB: "Literacy Bridge India", score: 87 },
    { orgA: "Women Empowerment NGO", orgB: "Tech Skills Academy", score: 64 },
    { orgA: "Youth Innovation Hub", orgB: "Startup Incubator Fund", score: 76 },
    { orgA: "Clean Water Project", orgB: "Sanitation Alliance", score: 89 },
];

export default function MatchingCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    // Auto-advance every 4.5 seconds with fade transition
    useEffect(() => {
        const timer = setInterval(() => {
            // Fade out
            setIsVisible(false);

            // Change card after fade out
            setTimeout(() => {
                setCurrentIndex((prev) => (prev + 1) % SAMPLE_MATCHES.length);
                setIsVisible(true);
            }, 400);
        }, 4500);

        return () => clearInterval(timer);
    }, []);

    const currentMatch = SAMPLE_MATCHES[currentIndex];

    return (
        <section className="py-16 bg-background">
            <div className="container mx-auto max-w-2xl px-4">
                {/* Label */}
                <p className="text-center text-sm text-muted-foreground mb-10">
                    Example of how matching organizations will appear
                </p>

                {/* Single Card - Centered */}
                <div className="flex justify-center">
                    <div
                        className={`w-full max-w-sm bg-gradient-to-br from-primary/8 via-primary/5 to-accent/8 rounded-3xl p-8 border border-primary/10 transition-all duration-400 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                            }`}
                    >
                        {/* Organization Names */}
                        <div className="flex items-center justify-between gap-4 mb-8">
                            <div className="flex-1 text-center">
                                <div className="w-14 h-14 bg-background rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm border border-border">
                                    <span className="text-primary font-bold text-lg">
                                        {currentMatch.orgA.charAt(0)}
                                    </span>
                                </div>
                                <p className="text-sm font-medium text-foreground leading-tight">
                                    {currentMatch.orgA}
                                </p>
                            </div>

                            <div className="text-muted-foreground/50 text-2xl font-light">↔</div>

                            <div className="flex-1 text-center">
                                <div className="w-14 h-14 bg-background rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm border border-border">
                                    <span className="text-foreground font-bold text-lg">
                                        {currentMatch.orgB.charAt(0)}
                                    </span>
                                </div>
                                <p className="text-sm font-medium text-foreground leading-tight">
                                    {currentMatch.orgB}
                                </p>
                            </div>
                        </div>

                        {/* Alignment Score - Main Focus */}
                        <div className="text-center py-5 rounded-2xl bg-background/80 backdrop-blur-sm border border-border/50">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                                Alignment Score
                            </p>
                            <span className="text-4xl font-bold text-foreground">
                                {currentMatch.score}%
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
