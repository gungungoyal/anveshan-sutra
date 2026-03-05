"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageSquare, Search, Send, Phone, Video, Paperclip, MoreHorizontal, ArrowLeft, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";

const sampleConversations = [
    { id: "1", name: "GreenPath Foundation", avatar: "G", lastMessage: "Looking forward to collaborating!", time: "2m", unread: 2, type: "NGO" },
    { id: "2", name: "TechCorp CSR Team", avatar: "T", lastMessage: "Could you share the impact report?", time: "1h", unread: 0, type: "CSR" },
    { id: "3", name: "StartupNest Incubator", avatar: "S", lastMessage: "Let's schedule a call next week.", time: "3h", unread: 1, type: "Incubator" },
    { id: "4", name: "CleanEarth NGO", avatar: "C", lastMessage: "Thank you for the opportunity!", time: "1d", unread: 0, type: "NGO" },
    { id: "5", name: "ImpactVentures", avatar: "I", lastMessage: "We're reviewing your proposal.", time: "2d", unread: 0, type: "CSR" },
];

export default function MessagesPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !user) router.push("/auth?returnTo=/messages");
    }, [user, isLoading, router]);

    if (isLoading) return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
    );

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />
            <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-6">
                {/* Page header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-extrabold text-foreground mb-1">Messages</h1>
                    <p className="text-sm text-muted-foreground">Secure conversations with your partner organizations.</p>
                </div>

                {/* Search bar */}
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search conversations..."
                        className="w-full pl-10 pr-4 py-2.5 text-sm border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                </div>

                {/* Conversation list */}
                <div className="space-y-2">
                    {sampleConversations.map((conv) => (
                        <Link
                            key={conv.id}
                            href={`/messages/${conv.id}`}
                            className="drivya-card flex items-center gap-4 p-4 group hover:border-primary/30"
                        >
                            {/* Avatar */}
                            <div className="w-11 h-11 rounded-2xl gradient-bg flex items-center justify-center text-white font-extrabold text-base flex-shrink-0 shadow-blue">
                                {conv.avatar}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-0.5">
                                    <p className="font-bold text-foreground text-sm">{conv.name}</p>
                                    <span className="text-xs text-muted-foreground flex-shrink-0">{conv.time}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
                                    {conv.unread > 0 && (
                                        <span className="ml-2 w-5 h-5 rounded-full gradient-bg flex items-center justify-center text-[10px] text-white font-bold flex-shrink-0">
                                            {conv.unread}
                                        </span>
                                    )}
                                </div>
                                <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full font-semibold ${conv.type === "NGO" ? "bg-green-100 text-green-700" :
                                        conv.type === "CSR" ? "bg-orange-100 text-orange-700" :
                                            "bg-sky-100 text-sky-700"
                                    }`}>
                                    {conv.type}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Empty state note */}
                <div className="mt-8 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-3">
                        <MessageSquare className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Messages are sent when you connect with an organization from the{" "}
                        <Link href="/explore" className="text-primary hover:underline font-medium">Explore</Link> page.
                    </p>
                </div>
            </main>
        </div>
    );
}
