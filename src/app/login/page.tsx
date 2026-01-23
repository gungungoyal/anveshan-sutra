import AuthLayout from "@/components/AuthLayout";
import Link from "next/link";

/**
 * /login - Login page stub
 * TODO: Implement full OTP login flow from /auth
 */
export default function LoginPage() {
    return (
        <AuthLayout>
            <div className="flex-1 flex items-center justify-center px-4 py-12">
                <div className="max-w-md w-full text-center">
                    <h1 className="text-3xl font-bold text-foreground mb-4">
                        Sign In
                    </h1>
                    <p className="text-muted-foreground mb-8">
                        Login page is under construction. Please use the existing auth flow for now.
                    </p>
                    <Link
                        href="/auth"
                        className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors"
                    >
                        Go to Auth Page
                    </Link>
                    <p className="mt-6 text-sm text-muted-foreground">
                        Don't have an account?{" "}
                        <Link href="/signup" className="text-primary hover:underline">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </AuthLayout>
    );
}
