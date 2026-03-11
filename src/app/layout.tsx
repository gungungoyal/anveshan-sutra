import type { Metadata } from "next";
import { Manrope, Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const manrope = Manrope({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700", "800"],
    variable: "--font-manrope",
});

const cormorant = Cormorant_Garamond({
    subsets: ["latin"],
    weight: ["400", "600"],
    style: ["normal", "italic"],
    variable: "--font-serif",
});

const dmSans = DM_Sans({
    subsets: ["latin"],
    weight: ["400", "500", "700"],
    variable: "--font-sans-dm",
});

export const metadata: Metadata = {
    title: "Drivya.AI - Partner Matching Platform",
    description: "Find matching partners for NGOs, Incubators, and CSR teams",
    keywords: ["NGO", "CSR", "Incubator", "Partnership", "Social Impact"],
    icons: {
        icon: "/drivya-ai-logo.png",
        shortcut: "/drivya-ai-logo.png",
        apple: "/drivya-ai-logo.png",
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${manrope.variable} ${cormorant.variable} ${dmSans.variable} font-sans antialiased text-foreground bg-background`}>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
