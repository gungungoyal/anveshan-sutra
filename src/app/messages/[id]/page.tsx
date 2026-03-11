"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send, Paperclip, MoreHorizontal, Phone, Video, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";

const sampleMessages = [
    { id: "1", sender: "them", text: "Hi! We're very interested in your NGO's work in environmental education.", time: "10:23 AM" },
    { id: "2", sender: "me", text: "Thank you! We've been running programs across 12 districts for the past 3 years.", time: "10:25 AM" },
    { id: "3", sender: "them", text: "That's impressive. Could you share your annual impact report?", time: "10:26 AM" },
    { id: "4", sender: "me", text: "Of course! I'll send over our 2024 impact report. We reached 45,000 beneficiaries last year.", time: "10:28 AM" },
    { id: "5", sender: "them", text: "Excellent. We'd love to schedule a formal call to discuss a potential partnership for this fiscal year.", time: "10:30 AM" },
];

const quickActions = [
    { label: "📅 Schedule a Call" },
    { label: "📄 Share Report" },
    { label: "🤝 Propose Partnership" },
];

export default function PartnerChatPage({ params }: { params: { id: string } }) {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState(sampleMessages);

    useEffect(() => {
        if (!isLoading && !user) router.push("/auth");
    }, [user, isLoading, router]);

    if (isLoading) return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
    );

    const sendMessage = () => {
        if (!input.trim()) return;
        setMessages(prev => [...prev, { id: Date.now().toString(), sender: "me", text: input.trim(), time: "Just now" }]);
        setInput("");
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />

            <div className="flex-1 max-w-3xl mx-auto w-full flex flex-col" style={{ height: "calc(100vh - 80px)" }}>
                {/* Chat header */}
                <div className="flex items-center gap-3 p-4 border-b border-border bg-background/95 backdrop-blur-sm sticky top-20 z-10">
                    <Link href="/messages" className="p-2 rounded-xl hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div className="w-10 h-10 rounded-2xl gradient-bg flex items-center justify-center text-white font-extrabold flex-shrink-0 shadow-blue">
                        G
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-bold text-foreground text-sm">GreenPath Foundation</p>
                        <p className="text-xs text-green-600 dark:text-green-400 font-medium">● Online</p>
                    </div>
                    <div className="flex items-center gap-1">
                        <button className="p-2 rounded-xl hover:bg-secondary/60 text-muted-foreground transition-colors">
                            <Phone className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-xl hover:bg-secondary/60 text-muted-foreground transition-colors">
                            <Video className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-xl hover:bg-secondary/60 text-muted-foreground transition-colors">
                            <MoreHorizontal className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${msg.sender === "me"
                                    ? "gradient-bg text-white shadow-blue"
                                    : "bg-secondary text-foreground"
                                }`}>
                                <p className="text-sm leading-relaxed">{msg.text}</p>
                                <p className={`text-[10px] mt-1 ${msg.sender === "me" ? "text-white/60" : "text-muted-foreground"}`}>
                                    {msg.time}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="px-4 pb-2 flex gap-2 overflow-x-auto">
                    {quickActions.map((a) => (
                        <button
                            key={a.label}
                            onClick={() => setInput(a.label)}
                            className="flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-full border border-border bg-background hover:border-primary/40 hover:bg-accent transition-colors text-foreground"
                        >
                            {a.label}
                        </button>
                    ))}
                </div>

                {/* Input bar */}
                <div className="p-4 border-t border-border bg-background/95 backdrop-blur-sm">
                    <div className="flex items-center gap-2 bg-secondary/60 rounded-2xl px-4 py-2.5">
                        <button className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0">
                            <Paperclip className="w-4 h-4" />
                        </button>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                            placeholder="Type a message…"
                            className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground"
                        />
                        <button
                            onClick={sendMessage}
                            disabled={!input.trim()}
                            className="w-8 h-8 rounded-xl gradient-bg flex items-center justify-center shadow-blue disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:shadow-blue-lg flex-shrink-0"
                        >
                            <Send className="w-4 h-4 text-white -translate-x-px" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
