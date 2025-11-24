import { Link } from "react-router-dom";
import { Mail, Lock, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Login() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-28 pb-20 px-4">
        <div className="container mx-auto max-w-md">
          <div className="bg-card rounded-xl border border-border p-8">
            <div className="text-center mb-8">
              <h1 className="text-heading-lg text-foreground mb-2">Welcome Back</h1>
              <p className="text-muted-foreground">Sign in to your Anveshan account</p>
            </div>

            <form className="space-y-6">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="w-full pl-12 pr-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-border" />
                  <span className="text-sm text-foreground">Remember me</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                className="w-full py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold flex items-center justify-center gap-2"
              >
                Sign In
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-border" />
              <span className="text-sm text-muted-foreground">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* OAuth Buttons */}
            <button className="w-full py-3 border-2 border-border rounded-lg hover:bg-secondary transition-colors font-semibold text-foreground">
              Continue with Google
            </button>

            {/* Sign Up Link */}
            <div className="text-center mt-8">
              <p className="text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/signup" className="text-primary hover:text-primary/80 transition-colors font-semibold">
                  Sign up
                </Link>
              </p>
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-8 p-6 bg-secondary rounded-xl border border-border">
            <h3 className="font-semibold text-foreground mb-2">Demo Credentials</h3>
            <p className="text-sm text-muted-foreground mb-3">
              For testing purposes, you can use:
            </p>
            <div className="space-y-1 text-sm font-mono text-foreground">
              <p>Email: demo@anveshan.com</p>
              <p>Password: demo123</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
