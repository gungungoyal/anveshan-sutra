import Link from "next/link";

/**
 * Split-screen layout for auth pages (/login, /signup)
 * - LEFT: Dark Navy branding panel with trust signals
 * - RIGHT: Cream form panel for user interaction
 */
export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#FAF7F2] flex flex-col lg:flex-row overflow-x-hidden">
            {/* Left Panel - Dark Navy Brand Area (Hidden on mobile or stacked) */}
            <div className="lg:w-1/2 bg-[#0D1B2A] text-[#FAF7F2] p-8 lg:p-16 flex flex-col justify-between relative overflow-hidden order-2 lg:order-1 min-h-[400px] lg:min-h-screen">
                {/* Grid Overlay */}
                <div className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{
                        backgroundImage: 'linear-gradient(#C9A84C 1px, transparent 1px), linear-gradient(90deg, #C9A84C 1px, transparent 1px)',
                        backgroundSize: '40px 40px'
                    }}
                />

                {/* Logo */}
                <Link href="/" className="logo font-serif text-3xl font-semibold relative z-10 w-fit">
                    Driv<span className="text-[#C9A84C]">ya</span>
                </Link>

                {/* Brand Content */}
                <div className="max-w-md relative z-10 py-12 lg:py-0">
                    <h1 className="font-serif text-4xl lg:text-6xl font-semibold leading-tight mb-6">
                        Where the right partnerships begin.
                    </h1>
                    <p className="text-lg opacity-80 font-sans-dm leading-relaxed">
                        Matching Incubators, CSRs, and NGOs based on real compatibility — not guesswork.
                    </p>
                </div>

                {/* Trust Signals */}
                <div className="flex flex-wrap gap-6 text-sm opacity-70 relative z-10 font-sans-dm">
                    <div className="flex items-center gap-2">
                        <span className="text-[#C9A84C] font-bold">✓</span> Verified Organizations
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[#C9A84C] font-bold">✓</span> Real Match Scores
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[#C9A84C] font-bold">✓</span> Compliance Ready
                    </div>
                </div>
            </div>

            {/* Right Panel - Form Area */}
            <div className="lg:w-1/2 bg-[#FAF7F2] relative flex flex-col order-1 lg:order-2">
                <main className="flex-1 flex items-center justify-center p-8 lg:p-16 relative z-10">
                    {children}
                </main>
            </div>
        </div>
    );
}
