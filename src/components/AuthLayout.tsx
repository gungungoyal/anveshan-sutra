import Link from "next/link";

/**
 * Minimal layout for auth pages (/login, /signup, /onboarding)
 * - Logo only (no navigation)
 * - No marketing links (Explore, Features, etc.)
 * - No footer
 * - Clean, distraction-free design
 */
export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Minimal Header - Logo only */}
            <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm">
                <div className="container mx-auto px-4 py-4">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                            <span className="text-primary-foreground font-bold text-lg">D</span>
                        </div>
                        <span className="text-xl font-bold text-foreground">
                            Drivya.AI
                        </span>
                    </Link>
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 flex flex-col">
                {children}
            </main>
        </div>
    );
}
