"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    Heart, Search, Building2, FileText, Mail, Star,
    ArrowRight, Users, Target, Sparkles, TrendingUp,
    CheckCircle, Clock, Eye
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

interface MatchedOrg {
    id: string;
    name: string;
    type: string;
    matchScore: number;
    focusAreas: string[];
    region: string;
}

export default function NGODashboardPage() {
    const router = useRouter();
    const { isAuthenticated, user, isLoading } = useAuth();
    const [activeTab, setActiveTab] = useState<'matches' | 'saved' | 'drafts' | 'emails'>('matches');
    const [matchedOrgs, setMatchedOrgs] = useState<MatchedOrg[]>([]);
    const [isLoadingMatches, setIsLoadingMatches] = useState(true);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/auth?returnTo=/ngo-dashboard');
        }
    }, [isLoading, isAuthenticated, router]);

    // Simulate loading matches (in production, this would fetch from API)
    useEffect(() => {
        const loadMatches = async () => {
            setIsLoadingMatches(true);
            // Simulated delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            // In production, fetch from your matching API
            setMatchedOrgs([]);
            setIsLoadingMatches(false);
        };

        if (isAuthenticated) {
            loadMatches();
        }
    }, [isAuthenticated]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const tabs = [
        { id: 'matches', label: 'Matched Organizations', icon: Target, count: matchedOrgs.length },
        { id: 'saved', label: 'Saved', icon: Star, count: 0 },
        { id: 'drafts', label: 'Draft PPTs', icon: FileText, count: 0 },
        { id: 'emails', label: 'Draft Emails', icon: Mail, count: 0 },
    ];

    const getScoreColor = (score: number) => {
        if (score >= 70) return 'text-green-600 bg-green-100 dark:bg-green-900/30';
        if (score >= 50) return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30';
        return 'text-red-600 bg-red-100 dark:bg-red-900/30';
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="container mx-auto px-4 py-8">
                {/* Welcome Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-500 to-emerald-600 p-8 shadow-2xl">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-xl" />

                        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                                    <Heart className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
                                        Welcome to Your NGO Dashboard
                                    </h1>
                                    <p className="text-white/80">
                                        Find CSR partners and incubators aligned with your mission
                                    </p>
                                </div>
                            </div>

                            <Button
                                onClick={() => router.push('/search')}
                                className="bg-white text-green-600 hover:bg-white/90 shadow-lg"
                            >
                                <Search className="w-4 h-4 mr-2" />
                                Find Partners
                            </Button>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Overview */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
                >
                    {[
                        { label: 'Potential Matches', value: matchedOrgs.length, icon: Target, color: 'from-green-500 to-emerald-500' },
                        { label: 'Profile Views', value: 0, icon: Eye, color: 'from-blue-500 to-cyan-500' },
                        { label: 'Saved Organizations', value: 0, icon: Star, color: 'from-amber-500 to-orange-500' },
                        { label: 'Connections', value: 0, icon: Users, color: 'from-purple-500 to-pink-500' },
                    ].map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 + index * 0.05 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg border border-gray-100 dark:border-gray-700"
                        >
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                                <stat.icon className="w-5 h-5 text-white" />
                            </div>
                            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                            <p className="text-sm text-muted-foreground">{stat.label}</p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden"
                >
                    {/* Tab Headers */}
                    <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                                        ? 'text-green-600 border-b-2 border-green-600 bg-green-50 dark:bg-green-950/20'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                                {tab.count > 0 && (
                                    <span className={`px-2 py-0.5 text-xs rounded-full ${activeTab === tab.id
                                            ? 'bg-green-600 text-white'
                                            : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                                        }`}>
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        {activeTab === 'matches' && (
                            <div>
                                {isLoadingMatches ? (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4" />
                                        <p className="text-muted-foreground">Finding your matches...</p>
                                    </div>
                                ) : matchedOrgs.length > 0 ? (
                                    <div className="space-y-4">
                                        {matchedOrgs.map((org) => (
                                            <motion.div
                                                key={org.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                                                        <Building2 className="w-6 h-6 text-white" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-foreground">{org.name}</h3>
                                                        <p className="text-sm text-muted-foreground">{org.type} • {org.region}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(org.matchScore)}`}>
                                                        {org.matchScore}% Match
                                                    </span>
                                                    <Button variant="outline" size="sm">
                                                        View Details
                                                        <ArrowRight className="w-4 h-4 ml-2" />
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                                            <Sparkles className="w-8 h-8 text-green-600" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-foreground mb-2">
                                            We're Finding Your Matches
                                        </h3>
                                        <p className="text-muted-foreground max-w-md mb-6">
                                            Our platform is analyzing your profile to find the best CSR partners and incubators aligned with your mission. Check back soon!
                                        </p>
                                        <Button
                                            onClick={() => router.push('/search')}
                                            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                                        >
                                            <Search className="w-4 h-4 mr-2" />
                                            Browse Organizations
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'saved' && (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4">
                                    <Star className="w-8 h-8 text-amber-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-foreground mb-2">
                                    No Saved Organizations Yet
                                </h3>
                                <p className="text-muted-foreground max-w-md mb-6">
                                    Save organizations you're interested in to easily access them later.
                                </p>
                                <Button
                                    onClick={() => router.push('/search')}
                                    variant="outline"
                                >
                                    <Search className="w-4 h-4 mr-2" />
                                    Find Organizations
                                </Button>
                            </div>
                        )}

                        {activeTab === 'drafts' && (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                                    <FileText className="w-8 h-8 text-blue-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-foreground mb-2">
                                    No Draft Presentations
                                </h3>
                                <p className="text-muted-foreground max-w-md mb-6">
                                    Create presentation drafts for your partnerships to share with potential CSR partners.
                                </p>
                                <Button
                                    onClick={() => router.push('/ppt')}
                                    variant="outline"
                                >
                                    <FileText className="w-4 h-4 mr-2" />
                                    Create Presentation
                                </Button>
                            </div>
                        )}

                        {activeTab === 'emails' && (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4">
                                    <Mail className="w-8 h-8 text-purple-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-foreground mb-2">
                                    No Draft Emails
                                </h3>
                                <p className="text-muted-foreground max-w-md mb-6">
                                    Draft outreach emails to potential partners and keep track of your communication.
                                </p>
                                <Button
                                    onClick={() => router.push('/textmaker')}
                                    variant="outline"
                                >
                                    <Mail className="w-4 h-4 mr-2" />
                                    Compose Email
                                </Button>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-8 grid md:grid-cols-3 gap-4"
                >
                    {[
                        {
                            title: 'Update Profile',
                            description: 'Keep your organization info current',
                            icon: Users,
                            href: '/org-submit',
                            color: 'from-green-500 to-emerald-500'
                        },
                        {
                            title: 'Create Presentation',
                            description: 'Build partnership decks',
                            icon: FileText,
                            href: '/ppt',
                            color: 'from-blue-500 to-cyan-500'
                        },
                        {
                            title: 'Draft Outreach',
                            description: 'Write partnership emails',
                            icon: Mail,
                            href: '/textmaker',
                            color: 'from-purple-500 to-pink-500'
                        },
                    ].map((action, index) => (
                        <motion.button
                            key={action.title}
                            onClick={() => router.push(action.href)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 text-left transition-all hover:shadow-xl"
                        >
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center`}>
                                <action.icon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground">{action.title}</h3>
                                <p className="text-sm text-muted-foreground">{action.description}</p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-muted-foreground ml-auto" />
                        </motion.button>
                    ))}
                </motion.div>
            </main>

            <Footer />
        </div>
    );
}
