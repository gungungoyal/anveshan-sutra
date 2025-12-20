import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserStore } from "@/lib/stores/userStore";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Rocket, Search, Building2, Heart } from "lucide-react";
import { Loader2 } from "lucide-react";

type RoleType = "ngo" | "incubator" | "csr";

/**
 * Role Entry Page
 * Handles role-specific onboarding flows:
 * - NGO: Mandatory setup before search
 * - Incubator: Choice between setup or explore
 * - CSR: Direct to explore
 */
export default function RoleEntry() {
    const { role } = useParams<{ role: RoleType }>();
    const navigate = useNavigate();
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const { setRole, setIntent, hasOrganization, completeOnboarding } = useUserStore();

    // Redirect to auth if not logged in
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate(`/auth?returnTo=/start/${role}`);
        }
    }, [authLoading, isAuthenticated, role, navigate]);

    // Set role in store when authenticated
    useEffect(() => {
        if (isAuthenticated && role) {
            setRole(role as RoleType);
            // Set default intent based on role
            if (role === "ngo") {
                setIntent("seeker");
            } else if (role === "csr") {
                setIntent("provider");
            }
            // Incubator will choose later
        }
    }, [isAuthenticated, role, setRole, setIntent]);

    // Loading state
    if (authLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        );
    }

    // Not authenticated - will redirect
    if (!isAuthenticated) {
        return null;
    }

    // NGO Flow: Mandatory setup
    if (role === "ngo") {
        // If already has organization, go to search
        if (hasOrganization) {
            completeOnboarding();
            navigate("/search?role=ngo");
            return null;
        }

        // Force setup
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Header />
                <main className="flex-1 flex items-center justify-center px-4 py-16">
                    <Card className="max-w-lg w-full">
                        <CardContent className="p-8 text-center">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Heart className="w-8 h-8 text-green-600" />
                            </div>
                            <h1 className="text-2xl font-bold text-foreground mb-3">
                                Set Up Your NGO Profile
                            </h1>
                            <p className="text-muted-foreground mb-6">
                                Tell us about your organization so we can find CSR partners and incubators that align with your mission.
                            </p>
                            <p className="text-sm text-muted-foreground mb-8 p-4 bg-muted/50 rounded-xl">
                                <strong>Why this matters:</strong> Without your focus areas, geography, and goals, we can't show you relevant matches.
                            </p>
                            <Button
                                size="lg"
                                className="w-full bg-green-600 hover:bg-green-700"
                                onClick={() => navigate("/org-submit")}
                            >
                                Set Up Organization
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        </CardContent>
                    </Card>
                </main>
                <Footer />
            </div>
        );
    }

    // Incubator Flow: Choice screen
    if (role === "incubator") {
        // If already has organization, go to search
        if (hasOrganization) {
            completeOnboarding();
            navigate("/search?role=incubator");
            return null;
        }

        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Header />
                <main className="flex-1 flex items-center justify-center px-4 py-16">
                    <div className="max-w-2xl w-full">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-sky-100 dark:bg-sky-900/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Rocket className="w-8 h-8 text-sky-500" />
                            </div>
                            <h1 className="text-2xl font-bold text-foreground mb-3">
                                Welcome, Incubator!
                            </h1>
                            <p className="text-muted-foreground">
                                Choose how you'd like to get started with Drivya.AI
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            {/* Option 1: Setup (Recommended) */}
                            <Card className="border-2 border-sky-200 dark:border-sky-800 hover:shadow-lg transition-shadow">
                                <CardContent className="p-6">
                                    <div className="text-xs font-semibold text-sky-600 uppercase tracking-wide mb-2">
                                        Recommended
                                    </div>
                                    <h3 className="text-lg font-bold text-foreground mb-2">
                                        Set Up Your Incubator
                                    </h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Get personalized matches, alignment scores, and full access to all features.
                                    </p>
                                    <Button
                                        className="w-full bg-sky-500 hover:bg-sky-600"
                                        onClick={() => navigate("/org-submit")}
                                    >
                                        Set Up Now
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Option 2: Explore First */}
                            <Card className="hover:shadow-lg transition-shadow">
                                <CardContent className="p-6">
                                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                                        Quick Start
                                    </div>
                                    <h3 className="text-lg font-bold text-foreground mb-2">
                                        Explore First
                                    </h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Browse NGOs and CSR partners. Setup required later for full features.
                                    </p>
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => {
                                            setIntent("both");
                                            completeOnboarding();
                                            navigate("/search?role=incubator");
                                        }}
                                    >
                                        Browse Organizations
                                        <Search className="w-4 h-4 ml-2" />
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>

                        <p className="text-center text-xs text-muted-foreground mt-6">
                            You can always set up your profile later from settings.
                        </p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    // CSR Flow: Direct to explore
    if (role === "csr") {
        // CSR can explore immediately
        completeOnboarding();
        navigate("/search?role=csr");
        return null;
    }

    // Invalid role
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />
            <main className="flex-1 flex items-center justify-center px-4">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-foreground mb-4">
                        Invalid Role
                    </h1>
                    <Button onClick={() => navigate("/")}>Go Home</Button>
                </div>
            </main>
            <Footer />
        </div>
    );
}
