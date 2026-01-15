"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Search, Plus, LayoutGrid, User, LogOut, Settings, ChevronDown, Sun, Moon } from "lucide-react";
import { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getCurrentUser, signOut, AuthUser } from "@/lib/services/auth";
import { useTheme } from "@/components/ThemeProvider";
import { useUserStore } from "@/lib/stores/userStore";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();


  // Detect scroll to tighten the UI
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const { user } = await getCurrentUser();
        setUser(user);
      } catch (err) {
        setUser(null);
      } finally {
        setLoadingUser(false);
      }
    };
    loadUser();
  }, []);

  // Close user menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const openTextMaker = () => {
    window.open('http://localhost:8081/', '_blank');
  };

  const handleSignOut = async () => {
    await signOut();
    // Clear persisted user store state
    useUserStore.getState().resetOnboarding();
    setUser(null);
    setUserMenuOpen(false);
    router.push("/");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      {/* Spacer to prevent content overlap since header is fixed */}
      <div className="h-24" />

      <header
        className={`fixed top-4 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "px-4" : "px-4 sm:px-8"
          }`}
      >
        <div
          className={`mx-auto max-w-7xl bg-background/90 backdrop-blur-xl border border-border/20 shadow-xl shadow-primary/5 rounded-2xl transition-all duration-300 ${scrolled ? "py-2" : "py-3"
            }`}
        >
          <div className="px-4 sm:px-6 flex items-center justify-between">

            {/* 1. Brand Identity */}
            <Link
              href="/"
              className="flex items-center gap-3 group"
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="relative flex items-center justify-center w-10 h-10">
                <LayoutGrid className="w-5 h-5 text-foreground" />
              </div>
              <span className="font-bold text-2xl tracking-tight text-foreground">
                Drivya.AI
              </span>
            </Link>

            {/* 2. Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              {/* Role-Based Navigation Links */}
              <a
                href="/#for-ngos"
                className="text-sm font-medium text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
              >
                For NGOs
              </a>
              <a
                href="/#for-incubators"
                className="text-sm font-medium text-sky-500 dark:text-sky-400 hover:text-sky-600 dark:hover:text-sky-300 transition-colors"
              >
                For Incubators
              </a>
              <a
                href="/#for-csr"
                className="text-sm font-medium text-orange-500 dark:text-orange-400 hover:text-orange-600 dark:hover:text-orange-300 transition-colors"
              >
                For CSR
              </a>

              {/* Features Link */}
              <Link
                href="/features"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Features
              </Link>

              {/* Explore (Primary CTA) */}
              <Link
                href="/search"
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/20 active:scale-95"
              >
                Explore
              </Link>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-secondary/10 hover:bg-secondary/20 transition-colors"
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? (
                  <Moon className="w-5 h-5 text-foreground" />
                ) : (
                  <Sun className="w-5 h-5 text-foreground" />
                )}
              </button>

              {/* User Menu or Login/Signup */}

              {loadingUser ? (
                /* Skeleton loader to prevent flickering */
                <div className="flex items-center gap-2 px-2 py-1.5">
                  <div className="w-8 h-8 rounded-full bg-secondary animate-pulse" />
                  <div className="hidden lg:block w-20 h-4 bg-secondary animate-pulse rounded" />
                </div>
              ) : user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-secondary/50 transition-colors"
                  >
                    <Avatar className="w-8 h-8 border-2 border-primary/20">
                      <AvatarImage src={user.avatar_url} alt={user.name} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                        {getInitials(user.name || "U")}
                      </AvatarFallback>
                    </Avatar>
                    {/* Always show name and org on desktop */}
                    <div className="hidden lg:block text-left">
                      <p className="text-sm font-medium text-foreground truncate max-w-[140px]">{user.name}</p>
                      {user.organization_name ? (
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${user.organization_type === 'NGO' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                              user.organization_type === 'Incubator' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                user.organization_type === 'CSR' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                                  'bg-secondary text-muted-foreground'
                            }`}>
                            {user.organization_type}
                          </span>
                          <span className="text-xs text-muted-foreground truncate max-w-[80px]">{user.organization_name}</span>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground truncate max-w-[140px]">{user.email}</p>
                      )}
                    </div>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-72 bg-background/95 backdrop-blur-xl border border-border rounded-xl shadow-xl shadow-black/10 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-border bg-secondary/30">
                        <p className="font-semibold text-foreground truncate">{user.name}</p>
                        <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                        {user.organization_name && (
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${user.organization_type === 'NGO' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                user.organization_type === 'Incubator' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                  user.organization_type === 'CSR' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                                    'bg-secondary text-muted-foreground'
                              }`}>
                              {user.organization_type}
                            </span>
                            <span className="text-sm text-foreground truncate">{user.organization_name}</span>
                          </div>
                        )}
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <Link
                          href="/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-foreground hover:bg-secondary/50 transition-colors"
                        >
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span>Profile</span>
                        </Link>
                        <Link
                          href="/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-foreground hover:bg-secondary/50 transition-colors"
                        >
                          <Settings className="w-4 h-4 text-muted-foreground" />
                          <span>Settings</span>
                        </Link>
                      </div>

                      {/* Sign Out */}
                      <div className="py-2 border-t border-border">
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/auth"
                    className="px-4 py-2.5 text-sm font-medium text-foreground hover:text-primary hover:bg-secondary/30 rounded-xl transition-all"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/auth"
                    className="px-4 py-2.5 bg-foreground text-background text-sm font-semibold rounded-xl hover:bg-foreground/90 transition-all active:scale-95"
                  >
                    Sign Up Free
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 text-foreground hover:bg-secondary/10 rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* 4. Mobile Navigation (Collapsible) */}
          <div
            className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
              }`}
          >
            <div className="px-4 pb-6 pt-2 flex flex-col gap-2">
              <div className="h-px bg-border my-2" />

              {/* User Info (Mobile) */}
              {user && (
                <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-xl mb-2">
                  <Avatar className="w-10 h-10 border-2 border-primary/20">
                    <AvatarImage src={user.avatar_url} alt={user.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                      {getInitials(user.name || "U")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-foreground">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
              )}

              {/* Mobile Role-Based Navigation Links */}
              <a
                href="/#for-ngos"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/30 font-medium transition-colors"
              >
                For NGOs
              </a>
              <a
                href="/#for-incubators"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl text-sky-500 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/30 font-medium transition-colors"
              >
                For Incubators
              </a>
              <a
                href="/#for-csr"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl text-orange-500 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/30 font-medium transition-colors"
              >
                For CSR Teams
              </a>

              <div className="h-px bg-border my-1" />

              <Link
                href="/features"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl text-foreground hover:bg-secondary/10 font-medium transition-colors"
              >
                Features
              </Link>

              <Link
                href="/search"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl bg-primary text-primary-foreground font-semibold"
              >
                Explore Organizations
              </Link>

              {/* Mobile Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="flex items-center gap-3 p-3 rounded-xl text-foreground hover:bg-secondary/10 font-medium transition-colors"
              >
                {theme === 'light' ? (
                  <Moon className="w-5 h-5" />
                ) : (
                  <Sun className="w-5 h-5" />
                )}
                {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
              </button>

              {user && (
                <Link
                  href="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-xl text-foreground hover:bg-secondary/10 font-medium transition-colors"
                >
                  <User className="w-5 h-5 text-primary" />
                  Profile Settings
                </Link>
              )}



              <div className="h-px bg-border my-2" />

              {user ? (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleSignOut();
                  }}
                  className="flex items-center gap-3 p-3 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 font-medium transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href="/auth"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex justify-center items-center py-3 rounded-xl border border-border font-semibold text-foreground"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/auth"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex justify-center items-center py-3 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}