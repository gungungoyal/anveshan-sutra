"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function DashboardPage() {
    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="container mx-auto px-4 py-12">
                <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
                <p className="text-muted-foreground">Your organization dashboard will appear here.</p>
            </main>
            <Footer />
        </div>
    );
}
