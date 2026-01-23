import { redirect } from "next/navigation";

/**
 * /login - Redirects to /auth
 * Server-side redirect, no intermediate UI shown
 */
export default function LoginPage() {
    redirect("/auth");
}
