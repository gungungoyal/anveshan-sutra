import { Link, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Search,
  Zap,
  Award,
  ArrowRight,
  FileText,
  Clock,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Home() {
  const navigate = useNavigate();

  const steps = [
    {
      number: 1,
      icon: Search,
      title: "Search & Discover",
      description:
        "Browse our verified database of 50+ NGOs, foundations, and incubators. Filter by focus area and region to find the right partners.",
    },
    {
      number: 2,
      icon: Zap,
      title: "View Alignment",
      description:
        "See instant compatibility scores showing how well each organization aligns with your mission and goals.",
    },
    {
      number: 3,
      icon: FileText,
      title: "Generate Materials",
      description:
        "Create professional emails, proposals, and presentations with a single click to start conversations.",
    },
  ];

  const benefits = [
    "✓ No credit card required",
    "✓ All organizations verified",
    "✓ Instant alignment scoring",
    "✓ Auto-generate presentations",
  ];

  // Reviews will be added after structured pilot testing with real users

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section - Large and Inviting */}
      <section className="pt-32 pb-20 px-4 sm:px-6 bg-gradient-to-b from-secondary to-background">
        <div className="container mx-auto max-w-6xl">
          {/* Top bar with logo and buttons */}
          <div className="absolute top-3 left-7 z-100">
            <div className="w-39 h-20 rounded-full overflow-hidden">
              <img
                src="/logo.svg"
                alt="Drivya.AI Logo"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="absolute top-8 right-4 z-50 flex gap-2">
            <Link
              to="/login"
              className="px-5 py-3 bg-white text-foreground rounded-xl hover:bg-secondary transition-colors font-bold text-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-lg border border-border"
            >
              JOIN
            </Link>
            <button
              onClick={(e) => {
                e.stopPropagation();
                console.log("About Us button clicked!");
                navigate("/about");
              }}
              className="px-5 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors font-bold text-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-lg"
            >
              About Us
            </button>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="inline-block px-4 py-2 rounded-full bg-accent/10 text-accent mb-6">
                <span className="text-base font-bold">
                  The Partner Discovery Platform for NGOs
                </span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
                Find Your Perfect Partner in Minutes
              </h1>
              <p className="text-xl sm:text-2xl text-muted-foreground mb-8 leading-relaxed">
                Stop spending weeks searching for the right collaborators. Drivya.AI uses intelligent matching to connect you with verified organizations that share your mission and goals.
              </p>

              {/* Big CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <Link
                  to="/org-submit"
                  className="px-8 py-5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors font-bold text-lg sm:text-xl flex items-center justify-center gap-3 shadow-lg"
                >
                  Submit Your Organization
                  <ArrowRight className="w-6 h-6" />
                </Link>
                <Link
                  to="/search"
                  className="px-8 py-5 border-2 border-primary text-primary rounded-xl hover:bg-primary/5 transition-colors font-bold text-lg sm:text-xl text-center"
                >
                  Search Organizations
                </Link>
              </div>

              {/* Benefits */}
              <div className="space-y-2">
                {benefits.map((benefit, i) => (
                  <p
                    key={i}
                    className="text-lg text-foreground font-semibold"
                  >
                    {benefit}
                  </p>
                ))}
              </div>
            </div>

            {/* Hero Illustration */}
            <div className="order-1 lg:order-2">
              <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl p-12 aspect-square flex items-center justify-center">
                <div className="text-center">
                  <div className="w-40 h-40 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="w-20 h-20 text-primary" />
                  </div>
                  <p className="text-2xl font-bold text-primary">
                    Intelligent Matching
                  </p>
                  <p className="text-lg text-primary/70 mt-2">
                    Find the right fit instantly
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about-us-section" className="py-24 px-4 sm:px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="text-5xl sm:text-6xl font-bold text-foreground mb-4">
              About Drivya.AI
            </h2>
            <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Empowering NGOs through research, collaboration, and innovation
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="p-8 bg-card rounded-2xl border-2 border-border">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Our Mission
              </h3>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                Our mission is to make organization discovery effortless. We help NGOs, innovation centres, CSR teams, and ecosystem builders instantly find aligned partners using structured data, automated profiling, and intelligent search — reducing hours of manual research into seconds.
              </p>
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Our Vision
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Our vision is to become the intelligence layer for India's development ecosystem — a unified platform where credible NGOs, CSR teams, academic institutions, and innovators can discover each other, build meaningful collaborations, and accelerate social impact efficiently and transparently.
              </p>
            </div>
            <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl p-8">
              <div className="text-center space-y-4">
                <h4 className="text-2xl font-bold text-foreground">Impact (Phase-1 Beta)</h4>
                <div className="bg-card p-6 rounded-xl border-2 border-border">
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    We are currently onboarding verified organizations.
                  </p>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    Impact numbers will be published after pilot testing with ACIC and partner institutions.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    This platform is in active development — early user insights will shape the roadmap.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Large and Clear */}
      <section className="py-24 px-4 sm:px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="text-5xl sm:text-6xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to discover and connect with the right organizations
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={index}
                  className="relative p-10 bg-card rounded-2xl border-2 border-border hover:border-primary transition-colors"
                >
                  {/* Step Number */}
                  <div className="absolute -top-6 -left-6 w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-2xl shadow-lg">
                    {step.number}
                  </div>

                  <div className="mt-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-3">
                      {step.title}
                    </h3>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Drivya.AI - Key Benefits */}
      <section className="py-24 px-4 sm:px-6 bg-secondary">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="text-5xl sm:text-6xl font-bold text-foreground mb-4">
              Why NGOs Love Drivya.AI
            </h2>
            <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Built by NGO leaders, for NGO leaders
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: Clock,
                title: "Save Time",
                description:
                  "Reduce partner discovery from weeks to hours. Spend less time searching, more time building relationships.",
              },
              {
                icon: Award,
                title: "Find Verified Partners",
                description:
                  "Every organization in our database is verified and vetted. No guesswork, no wasted outreach.",
              },
              {
                icon: Zap,
                title: "Instant Alignment Scoring",
                description:
                  "See at a glance how well each organization aligns with your mission. Make faster, better decisions.",
              },
              {
                icon: FileText,
                title: "Generate Materials Fast",
                description:
                  "Create professional presentations, emails, and proposals in seconds. Start conversations with confidence.",
              },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="p-8 bg-background rounded-2xl border-2 border-border hover:border-primary transition-colors"
                >
                  <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-lg text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Reviews - Coming Soon */}
      <section className="py-24 px-4 sm:px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-5xl sm:text-6xl font-bold text-foreground mb-4">
              Reviews (Coming Soon)
            </h2>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="p-8 bg-card rounded-2xl border-2 border-border text-center">
              <p className="text-lg text-muted-foreground leading-relaxed">
                Real user feedback from NGOs, CSR teams, and innovation centres will appear here once the platform enters structured pilot testing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4 sm:px-6 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-5xl sm:text-6xl font-bold text-foreground mb-6">
            Ready to Join the Network?
          </h2>
          <p className="text-xl sm:text-2xl text-muted-foreground mb-10">
            Join NGOs across India who are discovering the right collaborators with Drivya.AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/org-submit"
              className="px-8 sm:px-10 py-5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors font-bold text-lg sm:text-xl flex items-center justify-center gap-3 shadow-lg"
            >
              Submit Your Organization
              <ArrowRight className="w-6 h-6" />
            </Link>
            <Link
              to="/search"
              className="px-8 sm:px-10 py-5 border-2 border-primary text-primary rounded-xl hover:bg-primary/5 transition-colors font-bold text-lg sm:text-xl"
            >
              Search Organizations
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
