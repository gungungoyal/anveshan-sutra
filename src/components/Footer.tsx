"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, ArrowUp, Mail } from "lucide-react";
import { PlatformFeedbackModal } from "@/components/feedback";

const links = {
  company: [
    { name: "About", href: "/about" },
    { name: "Features", href: "/features" },
    { name: "Contact", href: "/contact" },
  ],
  tools: [
    { name: "Explore Partners", href: "/explore" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "Saved", href: "/shortlist" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Terms & Conditions", href: "/terms-and-conditions" },
  ],
};

const socials = [
  {
    name: "LinkedIn",
    href: "https://linkedin.com",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    name: "Instagram",
    href: "https://instagram.com",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    name: "YouTube",
    href: "https://youtube.com",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
];

export default function Footer() {
  const pathname = usePathname();
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  return (
    <footer className="bg-foreground text-background mt-16">
      {/* Main content */}
      <div className="max-w-7xl mx-auto px-6 pt-12 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">

          {/* Brand column (spans 2 cols on md) */}
          <div className="col-span-2 md:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-4 group">
              <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
                <span className="text-white font-extrabold text-sm">D</span>
              </div>
              <span className="font-extrabold text-xl text-background group-hover:text-white/80 transition-colors">
                Drivya.AI
              </span>
            </Link>
            <p className="text-background/60 text-sm leading-relaxed max-w-xs">
              Intelligent partner discovery for NGOs, CSR teams, and incubators — powered by AI alignment scoring.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-3 mt-6">
              {socials.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.name}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-background/70 hover:text-background transition-all"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-background font-semibold text-sm mb-4 uppercase tracking-wide">Company</h3>
            <ul className="space-y-2.5">
              {links.company.map(item => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-background/60 hover:text-background text-sm transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tools */}
          <div>
            <h3 className="text-background font-semibold text-sm mb-4 uppercase tracking-wide">Platform</h3>
            <ul className="space-y-2.5">
              {links.tools.map(item => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-background/60 hover:text-background text-sm transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-background font-semibold text-sm mb-4 uppercase tracking-wide">Legal</h3>
            <ul className="space-y-2.5">
              {links.legal.map(item => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-background/60 hover:text-background text-sm transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-background/40 text-sm">
            © {new Date().getFullYear()} Drivya.AI — All rights reserved.
          </p>

          <div className="flex items-center gap-4">
            <a
              href="mailto:support@drivya.ai"
              className="flex items-center gap-1.5 text-background/60 hover:text-background text-sm transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              support@drivya.ai
            </a>

            <button
              onClick={() => setFeedbackOpen(true)}
              className="flex items-center gap-1.5 text-background/60 hover:text-background text-sm transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Feedback
            </button>

            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="flex items-center gap-1.5 text-background/60 hover:text-background text-sm transition-colors"
              aria-label="Back to top"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              Top
            </button>
          </div>
        </div>
      </div>

      <PlatformFeedbackModal open={feedbackOpen} onOpenChange={setFeedbackOpen} />
    </footer>
  );
}