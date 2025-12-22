"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function NGODashboardPage() {
    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="container mx-auto px-4 py-12">
                <h1 className="text-3xl font-bold mb-4">NGO Dashboard</h1>
                <p className="text-muted-foreground">Manage your NGO profile and view matches.</p>
            </main>
            <Footer />
        </div>
    );
}
