import { Link } from "react-router-dom";
import { 
  LayoutGrid, 
  Twitter, 
  Linkedin, 
  Github, 
  Send, 
  Heart, 
  Globe 
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { label: "Features", href: "/features" },
      { label: "Pricing", href: "/pricing" },
      { label: "Case Studies", href: "/customers" },
      { label: "API Documentation", href: "/docs" },
    ],
    company: [
      { label: "About Us", href: "/about" },
      { label: "Careers", href: "/careers", badge: "Hiring" },
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "/contact" },
    ],
    legal: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "/cookies" },
    ],
  };

  return (
    <footer className="bg-secondary border-t border-border pt-16 pb-8">
      <div className="container mx-auto px-4 sm:px-6">
        
        {/* Top Section: CTA & Newsletter */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16 items-center">
          <div>
            <h2 className="text-2xl font-bold text-secondary-foreground mb-3">
              Stay ahead of the curve.
            </h2>
            <p className="text-secondary-foreground/90 max-w-md">
              Join 10,000+ organizations discovering new opportunities every week. 
              No spam, unsubscribe anytime.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input 
                type="email" 
                placeholder="Enter your email address" 
                className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
            <button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
              Subscribe <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="h-px bg-border mb-16" />

        {/* Middle Section: Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-16">
          
          {/* Brand Column */}
          <div className="col-span-2 lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6 group">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl text-primary-foreground shadow-lg shadow-primary/20">
                <LayoutGrid className="w-5 h-5" />
              </div>
              <span className="font-bold text-xl text-secondary-foreground tracking-tight">
                Anveshan
              </span>
            </Link>
            <p className="text-secondary-foreground/90 mb-6 max-w-sm leading-relaxed">
              The leading platform for discovering, evaluating, and partnering with verified organizations. Built for transparency and trust.
            </p>
            <div className="flex gap-4">
              <SocialLink href="#" icon={Twitter} />
              <SocialLink href="#" icon={Linkedin} />
              <SocialLink href="#" icon={Github} />
              <SocialLink href="#" icon={Globe} />
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h3 className="font-semibold text-secondary-foreground mb-6">Product</h3>
            <ul className="flex flex-col gap-3">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-secondary-foreground/80 hover:text-primary transition-colors text-sm font-medium">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-secondary-foreground mb-6">Company</h3>
            <ul className="flex flex-col gap-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="group flex items-center gap-2 text-secondary-foreground/80 hover:text-primary transition-colors text-sm font-medium">
                    {link.label}
                    {link.badge && (
                      <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-secondary-foreground mb-6">Legal</h3>
            <ul className="flex flex-col gap-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-secondary-foreground/80 hover:text-primary transition-colors text-sm font-medium">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-secondary-foreground/80 text-sm">
            © {currentYear} Anveshan Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-sm text-secondary-foreground/80">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-red-500 fill-red-500/20" />
            <span>by the Anveshan Team</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Helper for social icons to keep code clean
function SocialLink({ href, icon: Icon }: { href: string; icon: any }) {
  return (
    <a 
      href={href} 
      className="w-10 h-10 flex items-center justify-center rounded-lg bg-card hover:bg-primary text-foreground hover:text-primary-foreground border border-border hover:border-primary transition-all duration-300 group shadow-sm hover:shadow-md"
    >
      <Icon className="w-5 h-5 text-foreground group-hover:text-primary-foreground" />
    </a>
  );
}