import Link from "next/link";
import {
    Search, Building2, Star, ArrowRight, Target, Sparkles, Clock, AlertCircle
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { getServerSession } from "@/lib/supabase-server";

interface Organization {
    id: string;
    name: string;
    type: string;
    matchScore: number;
    focusAreas: string[];
    region: string;
    addedAt?: string;
    isSaved?: boolean;
}

// Server-side data fetching (placeholder for now)
async function fetchOrganizations(userId: string | undefined): Promise<Organization[]> {
    // TODO: Implement actual data fetching from Supabase
    // For now, return empty array - real data will be fetched here
    return [];
}

function getScoreColor(score: number): string {
    if (score >= 70) return 'text-green-600 bg-green-100 dark:bg-green-900/30';
    if (score >= 50) return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30';
    return 'text-red-600 bg-red-100 dark:bg-red-900/30';
}

// Organization card component (server-rendered with Link for navigation)
function OrgCard({ org }: { org: Organization }) {
    return (
        <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="font-medium text-foreground">{org.name}</h3>
                    <p className="text-sm text-muted-foreground">{org.type} • {org.region}</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getScoreColor(org.matchScore)}`}>
                    {org.matchScore}%
                </span>
                <Link href={`/org/${org.id}`}>
                    <Button variant="ghost" size="sm">
                        <ArrowRight className="w-4 h-4" />
                    </Button>
                </Link>
            </div>
        </div>
    );
}

// Empty state component
function EmptyState({
    icon: Icon,
    title,
    subtitle,
    action
}: {
    icon: typeof Target;
    title: string;
    subtitle: string;
    action?: { label: string; href: string };
}) {
    return (
        <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
                <Icon className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="font-medium text-foreground mb-1">{title}</p>
            <p className="text-sm text-muted-foreground mb-4">{subtitle}</p>
            {action && (
                <Link href={action.href}>
                    <Button variant="outline" size="sm">
                        {action.label}
                    </Button>
                </Link>
            )}
        </div>
    );
}

// Section wrapper component
function Section({
    title,
    icon: Icon,
    children,
    iconColor
}: {
    title: string;
    icon: typeof Target;
    children: React.ReactNode;
    iconColor: string;
}) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                <Icon className={`w-5 h-5 ${iconColor}`} />
                <h2 className="font-semibold text-foreground">{title}</h2>
            </div>
            <div className="p-4">
                {children}
            </div>
        </div>
    );
}

/**
 * NGO Dashboard - Server Component
 * 
 * Middleware already verified authentication.
 * Data is fetched server-side for instant rendering.
 */
export default async function NGODashboardPage() {
    // Get session for user ID (already verified by middleware)
    const session = await getServerSession();

    // Fetch organizations server-side
    const organizations = await fetchOrganizations(session?.user?.id);

    // Filter organizations by category
    const highFitOrgs = organizations.filter(o => o.matchScore >= 70);
    const recentOrgs = organizations.filter(o => {
        if (!o.addedAt) return false;
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return new Date(o.addedAt) >= sevenDaysAgo;
    });
    const savedOrgs = organizations.filter(o => o.isSaved);
    const lowPriorityOrgs = organizations.filter(o => o.matchScore < 50);

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="container mx-auto px-4 py-8">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-foreground mb-2">
                        What should I look at today?
                    </h1>
                    <p className="text-muted-foreground">
                        Your prioritized list of organizations to review
                    </p>
                </div>

                {/* Dashboard Grid */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* High-fit Organizations */}
                    <Section title="High-fit Organizations" icon={Target} iconColor="text-green-600">
                        {highFitOrgs.length > 0 ? (
                            <div className="space-y-3">
                                {highFitOrgs.map(org => <OrgCard key={org.id} org={org} />)}
                            </div>
                        ) : (
                            <EmptyState
                                icon={Sparkles}
                                title="No high-fit matches yet"
                                subtitle="We're analyzing organizations for you"
                                action={{ label: "Browse All", href: "/explore" }}
                            />
                        )}
                    </Section>

                    {/* Recently Added */}
                    <Section title="Recently Added" icon={Clock} iconColor="text-blue-600">
                        {recentOrgs.length > 0 ? (
                            <div className="space-y-3">
                                {recentOrgs.map(org => <OrgCard key={org.id} org={org} />)}
                            </div>
                        ) : (
                            <EmptyState
                                icon={Clock}
                                title="No new opportunities"
                                subtitle="Check back for newly added organizations"
                            />
                        )}
                    </Section>

                    {/* Saved Organizations */}
                    <Section title="Saved Organizations" icon={Star} iconColor="text-amber-500">
                        {savedOrgs.length > 0 ? (
                            <div className="space-y-3">
                                {savedOrgs.map(org => <OrgCard key={org.id} org={org} />)}
                            </div>
                        ) : (
                            <EmptyState
                                icon={Star}
                                title="Nothing saved yet"
                                subtitle="Save organizations you want to revisit"
                                action={{ label: "Find Organizations", href: "/explore" }}
                            />
                        )}
                    </Section>

                    {/* Low Priority */}
                    <Section title="Low Priority" icon={AlertCircle} iconColor="text-gray-400">
                        {lowPriorityOrgs.length > 0 ? (
                            <div className="space-y-3">
                                {lowPriorityOrgs.map(org => <OrgCard key={org.id} org={org} />)}
                            </div>
                        ) : (
                            <EmptyState
                                icon={AlertCircle}
                                title="All caught up!"
                                subtitle="No low-priority items to review"
                            />
                        )}
                    </Section>
                </div>
            </main>

            <Footer />
        </div>
    );
}
