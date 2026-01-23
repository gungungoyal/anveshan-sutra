import AuthLayout from "@/components/AuthLayout";
import Link from "next/link";

/**
 * /signup - Signup page stub
 * TODO: Implement full OTP signup flow from /auth
 */
export default function SignupPage() {
    return (
        <AuthLayout>
            <div className="flex-1 flex items-center justify-center px-4 py-12">
                <div className="max-w-md w-full text-center">
                    <h1 className="text-3xl font-bold text-foreground mb-4">
                        Create Account
                    </h1>
                    <p className="text-muted-foreground mb-8">
                        Signup page is under construction. Please use the existing auth flow for now.
                    </p>
                    <Link
                        href="/auth?mode=signup"
                        className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors"
                    >
                        Go to Auth Page
                    </Link>
                    <p className="mt-6 text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link href="/login" className="text-primary hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </AuthLayout>
    );
}
