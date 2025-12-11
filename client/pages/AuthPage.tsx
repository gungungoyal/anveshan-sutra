import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User, Building2, Heart } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { signIn, signUp } from "@/lib/services/auth";

type AuthMode = "login" | "signup";
type UserRole = "ngo" | "funder";

export default function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>("login");
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup form state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirm, setSignupConfirm] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login form submitted");

    if (!loginEmail || !loginPassword) {
      toast.error("Please enter email and password");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Sending login request");

      const { user, token, error } = await signIn(loginEmail, loginPassword);

      if (error || !user) {
        throw new Error(error || "Login failed");
      }

      console.log("Login successful:", user);

      // Store token
      if (token) {
        localStorage.setItem("auth_token", token);
      }
      localStorage.setItem("user_role", user.role);

      toast.success("Logged in successfully!");

      // Redirect to appropriate dashboard
      setTimeout(() => {
        navigate(user.profile_complete ? `/dashboard/${user.role}` : "/dashboard");
      }, 500);
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error instanceof Error ? error.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Signup form submitted");

    if (!role) {
      toast.error("Please select your user type");
      return;
    }

    if (!signupName || !signupEmail || !signupPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (signupPassword !== signupConfirm) {
      toast.error("Passwords do not match");
      return;
    }

    if (signupPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Sending signup request");

      const { user, error } = await signUp(signupEmail, signupPassword, signupName, role);

      if (error) {
        throw new Error(error);
      }

      console.log("Signup response:", user);

      if (user) {
        toast.success("Account created! Redirecting...");
        localStorage.setItem("user_role", user.role);

        setTimeout(() => {
          navigate("/dashboard");
        }, 500);
        return;
      }

      toast.success("Account created! Please check your email for confirmation.");
      // Switch to login mode
      setMode("login");
      setLoginEmail(signupEmail);
    } catch (error) {
      console.error("Signup error:", error);
      toast.error(error instanceof Error ? error.message : "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-md">
          {/* Logo / Title */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-foreground mb-2">Drivya.AI</h1>
            <p className="text-muted-foreground">
              Connect NGOs with Funders
            </p>
          </div>

          {mode === "login" ? (
            // LOGIN FORM
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="bg-card rounded-xl border border-border p-8 space-y-6">
                <h2 className="text-2xl font-bold text-foreground">
                  Welcome Back
                </h2>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold disabled:opacity-50"
                >
                  {isLoading ? "Logging in..." : "Log In"}
                </button>
              </div>

              <div className="text-center">
                <p className="text-muted-foreground">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("signup");
                      setRole(null);
                    }}
                    className="text-primary hover:underline font-semibold"
                  >
                    Sign Up
                  </button>
                </p>
              </div>
            </form>
          ) : (
            // SIGNUP FORM
            <form onSubmit={handleSignup} className="space-y-6">
              <div className="bg-card rounded-xl border border-border p-8 space-y-6">
                <h2 className="text-2xl font-bold text-foreground">
                  Create Account
                </h2>

                {/* Role Selection */}
                {!role ? (
                  <div className="space-y-3 mb-6">
                    <p className="text-sm font-semibold text-foreground mb-4">
                      What's your role?
                    </p>
                    <button
                      type="button"
                      onClick={() => setRole("ngo")}
                      className="w-full p-4 border-2 border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-left"
                    >
                      <div className="flex items-center gap-3">
                        <Heart className="w-6 h-6 text-primary" />
                        <div>
                          <p className="font-semibold text-foreground">I'm an NGO</p>
                          <p className="text-xs text-muted-foreground">
                            Organization seeking funding
                          </p>
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole("funder")}
                      className="w-full p-4 border-2 border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-left"
                    >
                      <div className="flex items-center gap-3">
                        <Building2 className="w-6 h-6 text-primary" />
                        <div>
                          <p className="font-semibold text-foreground">
                            I'm a Funder
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Foundation, CSR, or Donor
                          </p>
                        </div>
                      </div>
                    </button>
                  </div>
                ) : (
                  <div className="p-3 bg-primary/10 rounded-lg flex items-center gap-2 text-sm text-primary">
                    {role === "ngo" ? (
                      <>
                        <Heart className="w-4 h-4" />
                        <span>Signing up as an NGO</span>
                      </>
                    ) : (
                      <>
                        <Building2 className="w-4 h-4" />
                        <span>Signing up as a Funder</span>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => setRole(null)}
                      className="ml-auto text-primary hover:opacity-70"
                    >
                      Change
                    </button>
                  </div>
                )}

                {role && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="Your name"
                          value={signupName}
                          onChange={(e) => setSignupName(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                        <input
                          type="email"
                          placeholder="your@email.com"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                        <input
                          type="password"
                          placeholder="••••••••"
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        At least 6 characters
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                        <input
                          type="password"
                          placeholder="••••••••"
                          value={signupConfirm}
                          onChange={(e) => setSignupConfirm(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold disabled:opacity-50"
                    >
                      {isLoading ? "Creating account..." : "Create Account"}
                    </button>
                  </>
                )}
              </div>

              <div className="text-center">
                <p className="text-muted-foreground">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className="text-primary hover:underline font-semibold"
                  >
                    Log In
                  </button>
                </p>
              </div>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}