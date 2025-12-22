"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import footerLinks from "../data/footerLinks.json";
import {
  LayoutGrid,
  Twitter,
  Linkedin,
  Github,
  Send,
  Heart,
  Globe,
  MessageSquare
} from "lucide-react";
import { Instagram } from "lucide-react";
import { Youtube } from "lucide-react";
import { PlatformFeedbackModal } from "@/components/feedback";

export default function Footer() {
  const pathname = usePathname();
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  const socialIcons = {
    linkedin: <Linkedin aria-label="LinkedIn" className="w-5 h-5" />,
    instagram: <Instagram aria-label="Instagram" className="w-5 h-5" />,
    youtube: <Youtube aria-label="YouTube" className="w-5 h-5" />,
  };

  return (
    <footer className="bg-foreground text-background pt-12 pb-6 mt-10">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-5 gap-10">
        {/* Logo + About */}
        <div>
          <Link href="/">
            <h1 className="text-background font-bold text-2xl cursor-pointer">Drivya.ai</h1>
          </Link>
          <p className="text-background/70 mt-3 text-sm">
            Your partner in intelligent organization discovery & CSR alignment.
          </p>
        </div>
        {/* Quick Links */}
        <div>
          <h3 className="text-background font-semibold mb-3">Quick Links</h3>
          <ul className="space-y-2">
            {footerLinks.company.map(item => (
              <li key={item.name}>
                <Link href={item.href} className="text-background/70 hover:text-background transition focus:outline-none focus:ring-2 focus:ring-background">
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        {/* Tools */}
        <div>
          <h3 className="text-background font-semibold mb-3">Tools</h3>
          <ul className="space-y-2">
            {footerLinks.tools.map(item => (
              <li key={item.name}>
                <Link href={item.href} className="text-background/70 hover:text-background transition focus:outline-none focus:ring-2 focus:ring-background">
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        {/* Legal */}
        <div>
          <h3 className="text-background font-semibold mb-3">Legal</h3>
          <ul className="space-y-2">
            {footerLinks.legal.map(item => (
              <li key={item.name}>
                <Link href={item.href} className="text-background/70 hover:text-background transition focus:outline-none focus:ring-2 focus:ring-background">
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        {/* Social */}
        <div>
          <h3 className="text-background font-semibold mb-3">Social</h3>
          <ul className="flex gap-4 mt-1">
            {footerLinks.social.map(item => (
              <li key={item.name}>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.name}
                  className="text-background/70 hover:text-background transition focus:outline-none focus:ring-2 focus:ring-background"
                >
                  {socialIcons[item.icon]}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {/* Contact + Feedback + Back to Top */}
      <div className="container mx-auto px-6 mt-10 flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Contact */}
        <a
          href="mailto:support@drivya.ai"
          className="text-background/70 hover:text-background focus:outline-none focus:ring-2 focus:ring-background"
          aria-label="Email support@drivya.ai"
        >
          support@drivya.ai
        </a>

        {/* Give Feedback Button */}
        <button
          onClick={() => setFeedbackOpen(true)}
          className="inline-flex items-center gap-2 text-background/70 hover:text-background transition focus:outline-none focus:ring-2 focus:ring-background"
          aria-label="Give Feedback"
        >
          <MessageSquare className="w-4 h-4" />
          Give Feedback
        </button>

        {/* Back to Top */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="text-background/70 hover:text-background transition focus:outline-none focus:ring-2 focus:ring-background"
          aria-label="Back to Top"
        >
          Back to Top ↑
        </button>
      </div>
      {/* Copyright */}
      <div className="text-center text-background/50 text-sm mt-6 border-t border-background/20 pt-4">
        © {new Date().getFullYear()} Drivya.ai — All rights reserved.
      </div>

      {/* Platform Feedback Modal */}
      <PlatformFeedbackModal open={feedbackOpen} onOpenChange={setFeedbackOpen} />
    </footer>
  );
}