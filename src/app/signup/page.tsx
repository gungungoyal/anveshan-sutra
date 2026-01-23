import { redirect } from "next/navigation";

/**
 * /signup - Redirects to /auth?mode=signup
 * Server-side redirect, no intermediate UI shown
 */
export default function SignupPage() {
    redirect("/auth?mode=signup");
}
