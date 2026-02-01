'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';

/**
 * Global 404 Not Found Page
 * Styled to match the application theme
 */
export default function NotFound() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                {/* 404 Number */}
                <div className="mb-6">
                    <h1 className="text-8xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        404
                    </h1>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-semibold text-foreground mb-3">
                    Page Not Found
                </h2>

                {/* Description */}
                <p className="text-muted-foreground mb-8">
                    The page you're looking for doesn't exist or has been moved.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href="/">
                        <Button className="w-full sm:w-auto gap-2">
                            <Home className="w-4 h-4" />
                            Go Home
                        </Button>
                    </Link>
                    <Button
                        variant="outline"
                        className="w-full sm:w-auto gap-2"
                        onClick={() => window.history.back()}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Go Back
                    </Button>
                </div>

                {/* Helpful Links */}
                <div className="mt-12 pt-8 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-4">
                        Fast links:
                    </p>
                    <div className="flex flex-wrap justify-center gap-4 text-sm">
                        <Link href="/explore" className="text-primary hover:underline">
                            Explore Organizations
                        </Link>
                        <Link href="/dashboard" className="text-primary hover:underline">
                            Dashboard
                        </Link>
                        <Link href="/auth" className="text-primary hover:underline">
                            Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
