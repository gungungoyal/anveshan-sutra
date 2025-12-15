import { Link } from "react-router-dom";
import {
    Sparkles,
    BarChart3,
    Layers,
    MapPin,
    Building2,
    FileText,
    ArrowRight,
    ArrowLeft
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Features() {
    const features = [
        {
            icon: Sparkles,
            title: "Intelligent Matching",
            description: "AI finds organizations aligned with your mission, focus areas, and goals automatically.",
        },
        {
            icon: BarChart3,
            title: "Alignment Scores",
            description: "See compatibility at a glance with percentage scores showing how well organizations match.",
        },
        {
            icon: Layers,
            title: "Focus-Area Discovery",
            description: "Filter by education, health, environment, livelihoods, and 50+ other focus areas.",
        },
        {
            icon: MapPin,
            title: "Region-Wise Search",
            description: "Find partners in your state or across India with location-based filtering.",
        },
        {
            icon: Building2,
            title: "Organization Profiles",
            description: "Detailed information on mission, projects, beneficiaries, and partnership history.",
        },
        {
            icon: FileText,
            title: "AI Summarizer",
            description: "Generate professional summaries and proposals from organization data instantly.",
        },
    ];

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="pt-8 pb-20 px-4 sm:px-6">
                <div className="container mx-auto max-w-5xl">
                    {/* Back Link */}
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </Link>

                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
                            Platform Features
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Everything you need to discover and connect with aligned organizations
                        </p>
                    </div>

                    {/* Features Grid */}
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <div
                                    key={index}
                                    className="p-6 bg-card rounded-2xl border border-border hover:border-primary/50 transition-colors"
                                >
                                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                                        <Icon className="w-6 h-6 text-primary" />
                                    </div>
                                    <h3 className="text-lg font-bold text-foreground mb-2">
                                        {feature.title}
                                    </h3>
                                    <p className="text-muted-foreground text-sm leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>

                    {/* CTA */}
                    <div className="text-center">
                        <Link
                            to="/search"
                            className="group inline-flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all font-bold text-lg shadow-lg hover:shadow-xl"
                        >
                            Explore Organizations
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
