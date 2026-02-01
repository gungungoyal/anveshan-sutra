'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertCircle, Home, RefreshCw } from 'lucide-react';

/**
 * Global Error Page
 * Handles unexpected runtime errors with retry functionality
 */
export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log error to console (could be extended to error tracking service)
        console.error('Application error:', error);
    }, [error]);

    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                {/* Error Icon */}
                <div className="mb-6 flex justify-center">
                    <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
                        <AlertCircle className="w-10 h-10 text-destructive" />
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-2xl font-semibold text-foreground mb-3">
                    Something Went Wrong
                </h1>

                {/* Description */}
                <p className="text-muted-foreground mb-2">
                    We encountered an unexpected error. This has been logged and we'll look into it.
                </p>

                {/* Error digest (if available) for support */}
                {error.digest && (
                    <p className="text-xs text-muted-foreground/60 mb-6 font-mono">
                        Error ID: {error.digest}
                    </p>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
                    <Button onClick={reset} className="w-full sm:w-auto gap-2">
                        <RefreshCw className="w-4 h-4" />
                        Try Again
                    </Button>
                    <Link href="/">
                        <Button variant="outline" className="w-full sm:w-auto gap-2">
                            <Home className="w-4 h-4" />
                            Go Home
                        </Button>
                    </Link>
                </div>

                {/* Development Mode - Show Error Details */}
                {process.env.NODE_ENV === 'development' && (
                    <details className="mt-8 text-left">
                        <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground mb-2">
                            Show Error Details (Development Only)
                        </summary>
                        <div className="p-4 rounded-lg bg-muted text-xs font-mono overflow-auto max-h-60">
                            <div className="text-destructive font-semibold mb-2">{error.name}</div>
                            <div className="text-foreground mb-2">{error.message}</div>
                            <div className="text-muted-foreground whitespace-pre-wrap">{error.stack}</div>
                        </div>
                    </details>
                )}
            </div>
        </div>
    );
}
