"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu, X, Search, User, LogOut, Settings,
  ChevronDown, Sun, Moon, LayoutDashboard,
  Bookmark, MessageSquare, Home
} from "lucide-react";
import { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut } from "@/lib/services/auth";
import { useTheme } from "@/components/ThemeProvider";
import { useUserStore } from "@/lib/stores/userStore";
import { useAuth } from "@/hooks/useAuth";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [solutionsMenuOpen, setSolutionsMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const solutionsMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { user, isLoading: loadingUser } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setUserMenuOpen(false);
    setSolutionsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (solutionsMenuRef.current && !solutionsMenuRef.current.contains(event.target as Node)) {
        setSolutionsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      useUserStore.getState().resetOnboarding();
      setUserMenuOpen(false);
      if (user?.id) {
        localStorage.removeItem(`csr_project_setup_${user.id}`);
      }
      window.location.href = "/";
    } catch (error) {
      console.error("Sign out failed:", error);
      setUserMenuOpen(false);
      window.location.href = "/";
    }
  };

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const isActive = (href: string): boolean => pathname === href || (pathname?.startsWith(href + "/") ?? false);

  // Mobile bottom nav links (for authenticated users)
  const mobileNavLinks = [
    { href: "/dashboard", label: "Home", icon: Home },
    { href: "/explore", label: "Explore", icon: Search },
    { href: "/shortlist", label: "Saved", icon: Bookmark },
    { href: "/profile", label: "Profile", icon: User },
  ];

  return (
    <>
      {/* Spacer - accounts for fixed header height */}
      <div className="h-20" />

      {/* ── Desktop / Mobile Top Header ── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "py-2 bg-background/95 backdrop-blur-xl shadow-sm border-b border-border/50" : "py-3 bg-background/80 backdrop-blur-lg"
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">

          {/* ── Brand ── */}
          <Link
            href={user ? "/dashboard" : "/"}
            className="flex items-center gap-2.5 group flex-shrink-0"
            onClick={() => setIsMenuOpen(false)}
          >
            <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center shadow-blue flex-shrink-0">
              <img
                src="/drivya-ai-logo.png"
                alt="Drivya.AI"
                className="w-6 h-6 object-contain"
              />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-foreground group-hover:text-primary transition-colors">
              Drivya.AI
            </span>
          </Link>

          {/* ── Desktop Navigation ── */}
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center max-w-md">
            {user ? (
              <>
                <NavLink href="/dashboard" active={isActive("/dashboard")}>Dashboard</NavLink>
                <NavLink href="/explore" active={isActive("/explore")}>Explore</NavLink>
                <NavLink href="/shortlist" active={isActive("/shortlist")}>Saved</NavLink>
              </>
            ) : (
              <>
                {/* Solutions dropdown */}
                <div className="relative" ref={solutionsMenuRef}>
                  <button
                    onClick={() => setSolutionsMenuOpen(!solutionsMenuOpen)}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${solutionsMenuOpen ? "text-primary bg-accent" : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                      }`}
                  >
                    Solutions
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${solutionsMenuOpen ? "rotate-180" : ""}`} />
                  </button>

                  {solutionsMenuOpen && (
                    <div
                      className="absolute left-0 top-full mt-2 w-56 bg-background/95 backdrop-blur-xl border border-border rounded-xl shadow-card-hover overflow-hidden animate-scale-in z-50"
                      onMouseLeave={() => setSolutionsMenuOpen(false)}
                    >
                      <div className="p-1.5">
                        <SolutionItem href="/#for-ngos" color="green" label="For NGOs" sub="Find funding & partners" />
                        <SolutionItem href="/#for-incubators" color="sky" label="For Incubators" sub="Discover startups & NGOs" />
                        <SolutionItem href="/#for-csr" color="orange" label="For CSR" sub="Impact partnerships" />
                      </div>
                    </div>
                  )}
                </div>

                <NavLink href="/features" active={isActive("/features")}>Features</NavLink>
              </>
            )}
          </nav>

          {/* ── Right actions ── */}
          <div className="flex items-center gap-2 flex-shrink-0">

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="hidden md:flex p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "light" ? <Moon className="w-4.5 h-4.5" /> : <Sun className="w-4.5 h-4.5" />}
            </button>

            {/* Auth area */}
            {loadingUser ? (
              <div className="w-8 h-8 rounded-full bg-secondary animate-pulse" />
            ) : user ? (
              /* User avatar menu */
              <div className="relative hidden md:block" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1 pr-2.5 rounded-full border border-border hover:border-primary/40 hover:bg-secondary/40 transition-all"
                >
                  <Avatar className="w-7 h-7">
                    <AvatarImage src={user.avatar_url} alt={user.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                      {getInitials(user.name || "U")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-foreground max-w-[80px] truncate hidden lg:block">
                    {user.name?.split(" ")[0]}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Desktop Dropdown */}
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-background/95 backdrop-blur-xl border border-border rounded-xl shadow-card-hover overflow-hidden animate-scale-in z-50">
                    {/* User info header */}
                    <div className="px-4 py-3 bg-gradient-to-br from-primary/5 to-transparent border-b border-border">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 ring-2 ring-primary/20">
                          <AvatarImage src={user.avatar_url} alt={user.name} />
                          <AvatarFallback className="bg-primary text-primary-foreground font-bold text-sm">
                            {getInitials(user.name || "U")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground text-sm truncate">{user.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                          {user.organization_name && (
                            <p className="text-xs text-primary font-medium truncate mt-0.5">{user.organization_name}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Menu items */}
                    <div className="py-1.5">
                      <DropdownItem href="/profile" icon={User} label="Profile" onClick={() => setUserMenuOpen(false)} />
                      <DropdownItem href="/profile" icon={Settings} label="Settings" onClick={() => setUserMenuOpen(false)} />
                    </div>

                    {/* Sign out */}
                    <div className="py-1.5 border-t border-border">
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Public CTA buttons */
              <div className="hidden md:flex items-center gap-2">
                <Link
                  href="/auth"
                  className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/start"
                  className="px-4 py-2 text-sm font-semibold rounded-lg gradient-bg text-white shadow-blue hover:shadow-blue-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg text-foreground hover:bg-secondary/60 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* ── Mobile Slide-down Menu ── */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out border-t border-border/50 ${isMenuOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0 border-transparent"
            }`}
        >
          <div className="px-4 py-4 space-y-1 bg-background/95 backdrop-blur-xl">

            {/* User info - mobile */}
            {user && (
              <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl mb-3">
                <Avatar className="w-10 h-10 ring-2 ring-primary/20">
                  <AvatarImage src={user.avatar_url} alt={user.name} />
                  <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                    {getInitials(user.name || "U")}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground text-sm">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
            )}

            {/* Nav links */}
            {user ? (
              <>
                <MobileLink href="/dashboard" icon={LayoutDashboard} label="Dashboard" active={isActive("/dashboard")} onClick={() => setIsMenuOpen(false)} />
                <MobileLink href="/explore" icon={Search} label="Explore" active={isActive("/explore")} onClick={() => setIsMenuOpen(false)} />
                <MobileLink href="/shortlist" icon={Bookmark} label="Saved" active={isActive("/shortlist")} onClick={() => setIsMenuOpen(false)} />
                <MobileLink href="/profile" icon={User} label="Profile" active={isActive("/profile")} onClick={() => setIsMenuOpen(false)} />
              </>
            ) : (
              <>
                <MobileLink href="/#for-ngos" label="For NGOs" onClick={() => setIsMenuOpen(false)} className="text-green-600 dark:text-green-400" />
                <MobileLink href="/#for-incubators" label="For Incubators" onClick={() => setIsMenuOpen(false)} className="text-sky-500 dark:text-sky-400" />
                <MobileLink href="/#for-csr" label="For CSR Teams" onClick={() => setIsMenuOpen(false)} className="text-orange-500 dark:text-orange-400" />
                <MobileLink href="/features" label="Features" onClick={() => setIsMenuOpen(false)} />
              </>
            )}

            <div className="h-px bg-border my-2" />

            {/* Theme toggle - mobile */}
            <button
              onClick={toggleTheme}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-foreground hover:bg-secondary/60 font-medium text-sm transition-colors"
            >
              {theme === "light" ? <Moon className="w-5 h-5 text-muted-foreground" /> : <Sun className="w-5 h-5 text-muted-foreground" />}
              {theme === "light" ? "Dark Mode" : "Light Mode"}
            </button>

            {/* Public CTA - mobile */}
            {!user && (
              <div className="pt-2 flex flex-col gap-2">
                <Link
                  href="/auth"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full py-2.5 px-4 rounded-xl border border-border text-center text-sm font-medium text-foreground hover:bg-secondary/40 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/start"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full py-2.5 px-4 rounded-xl gradient-bg text-white text-center text-sm font-semibold shadow-blue"
                >
                  Get Started Free
                </Link>
              </div>
            )}

            {/* Sign out - mobile */}
            {user && (
              <button
                onClick={() => { setIsMenuOpen(false); handleSignOut(); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 font-medium text-sm transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Mobile Bottom Navigation Bar (authenticated only) ── */}
      {user && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border">
          <div className="flex items-stretch">
            {mobileNavLinks.map(({ href, label, icon: Icon }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex flex-col items-center justify-center gap-1 flex-1 py-3 text-[10px] font-semibold tracking-wide transition-colors ${active ? "text-primary" : "text-muted-foreground"
                    }`}
                >
                  <Icon className={`w-5 h-5 transition-transform ${active ? "scale-110" : ""}`} />
                  {label}
                  {active && <span className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />}
                </Link>
              );
            })}
          </div>
          {/* Safe area bottom inset */}
          <div className="h-safe-bottom" style={{ height: "env(safe-area-inset-bottom, 0px)" }} />
        </div>
      )}

      {/* Spacer for mobile bottom nav */}
      {user && <div className="md:hidden h-16" />}
    </>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-all ${active
        ? "text-primary bg-primary/8 font-semibold"
        : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
        }`}
    >
      {children}
      {active && (
        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
      )}
    </Link>
  );
}

function SolutionItem({ href, color, label, sub }: { href: string; color: string; label: string; sub: string }) {
  const colorMap: Record<string, string> = {
    green: "bg-green-100 dark:bg-green-900/30 group-hover:bg-green-200 dark:group-hover:bg-green-800/40",
    sky: "bg-sky-100 dark:bg-sky-900/30 group-hover:bg-sky-200 dark:group-hover:bg-sky-800/40",
    orange: "bg-orange-100 dark:bg-orange-900/30 group-hover:bg-orange-200 dark:group-hover:bg-orange-800/40",
  };
  const dotMap: Record<string, string> = {
    green: "bg-green-500", sky: "bg-sky-500", orange: "bg-orange-500",
  };
  const textMap: Record<string, string> = {
    green: "text-green-700 dark:text-green-400",
    sky: "text-sky-600 dark:text-sky-400",
    orange: "text-orange-600 dark:text-orange-400",
  };

  return (
    <a href={href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${colorMap[color]}`}>
      <div className={`w-2 h-2 rounded-full ${dotMap[color]} flex-shrink-0`} />
      <div>
        <p className={`text-sm font-semibold ${textMap[color]}`}>{label}</p>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </div>
    </a>
  );
}

function DropdownItem({ href, icon: Icon, label, onClick }: { href: string; icon: React.ElementType; label: string; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-secondary/50 transition-colors"
    >
      <Icon className="w-4 h-4 text-muted-foreground" />
      <span>{label}</span>
    </Link>
  );
}

function MobileLink({
  href, label, icon: Icon, active, onClick, className = "",
}: {
  href: string; label: string; icon?: React.ElementType; active?: boolean; onClick: () => void; className?: string;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-colors ${active
        ? "text-primary bg-primary/8 font-semibold"
        : `hover:bg-secondary/50 ${className || "text-foreground"}`
        }`}
    >
      {Icon && <Icon className={`w-5 h-5 ${active ? "text-primary" : "text-muted-foreground"}`} />}
      {label}
    </Link>
  );
}