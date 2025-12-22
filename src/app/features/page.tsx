"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function FeaturesPage() {
    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="container mx-auto px-4 py-12">
                <h1 className="text-3xl font-bold mb-4">Features</h1>
                <p className="text-muted-foreground">Discover what Drivya.AI offers.</p>
            </main>
            <Footer />
        </div>
    );
}
