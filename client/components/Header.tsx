import { Link, useLocation } from "react-router-dom";
import { Menu, X, Search, Plus, ArrowRight, LayoutGrid } from "lucide-react";
import { useState, useEffect } from "react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Detect scroll to tighten the UI
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Spacer to prevent content overlap since header is fixed */}
      <div className="h-24" />

      <header
        className={`fixed top-4 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "px-4" : "px-4 sm:px-8"
        }`}
      >
        <div
          className={`mx-auto max-w-7xl bg-background/90 backdrop-blur-xl border border-border/20 shadow-xl shadow-primary/5 rounded-2xl transition-all duration-300 ${
            scrolled ? "py-2" : "py-3"
          }`}
        >
          <div className="px-4 sm:px-6 flex items-center justify-between">
            
            {/* 1. Brand Identity */}
            <Link
              to="/"
              className="flex items-center gap-3 group"
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="relative flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl text-primary-foreground shadow-lg shadow-primary/20 group-hover:shadow-primary/30 transition-all duration-300">
                <LayoutGrid className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg tracking-tight text-foreground">
                Anveshan
              </span>
            </Link>

            {/* 2. "Fake" Search Bar - High Conversion Element */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <Link
                to="/search"
                className="w-full flex items-center gap-3 px-4 py-2.5 bg-secondary/10 hover:bg-secondary/20 border border-transparent hover:border-border rounded-xl text-muted-foreground hover:text-foreground transition-all cursor-pointer group"
              >
                <Search className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-sm font-medium">Search for organizations...</span>
                <span className="ml-auto text-xs bg-card px-1.5 py-0.5 rounded border border-border text-muted-foreground font-medium">
                  /
                </span>
              </Link>
            </div>

            {/* 3. Desktop Actions */}
            <div className="hidden md:flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-semibold text-foreground hover:text-primary transition-colors rounded-lg hover:bg-secondary/10"
              >
                Sign In
              </Link>
              
              <Link
                to="/org-submit"
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/20 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Submit Org</span>
              </Link>
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
            className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
              isMenuOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="px-4 pb-6 pt-2 flex flex-col gap-2">
              <div className="h-px bg-border my-2" />
              
              <Link
                to="/search"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl bg-secondary/10 text-foreground font-medium"
              >
                <Search className="w-5 h-5 text-primary" />
                Search Organizations
              </Link>

              <Link
                to="/org-submit"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl text-foreground hover:bg-secondary/10 font-medium transition-colors"
              >
                <Plus className="w-5 h-5 text-primary" />
                Submit Organization
              </Link>

              <div className="h-px bg-border my-2" />

              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex justify-center items-center py-3 rounded-xl border border-border font-semibold text-foreground"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex justify-center items-center py-3 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}