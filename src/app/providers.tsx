"use client";

import { ThemeProvider } from "@/components/ThemeProvider";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/hooks/useAuth";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "@/lib/queryClient";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider>
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <TooltipProvider>
                        <Toaster />
                        <Sonner />
                        {children}
                    </TooltipProvider>
                </AuthProvider>
            </QueryClientProvider>
        </ThemeProvider>
    );
}
