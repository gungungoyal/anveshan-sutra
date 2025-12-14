import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Zap,
  Target,
  ArrowRight,
  Clock,
  Award,
  FileText,
  Upload,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import OrganizationMatching from "@/components/OrganizationMatching";

export default function Home() {
  const navigate = useNavigate();

  const howItWorksSteps = [
    {
      number: 1,
      icon: Search,
      title: "Search or Submit",
      description: "Find partners or add your organization to the network",
    },
    {
      number: 2,
      icon: Zap,
      title: "AI Analyzes",
      description: "Focus areas, region, and goals are processed instantly",
    },
    {
      number: 3,
      icon: Target,
      title: "View Matches",
      description: "Get alignment scores with matching organizations",
    },
  ];

  const benefits = [
    "✓ No credit card required",
    "✓ All organizations verified",
    "✓ Instant alignment scoring",
    "✓ Auto-generate presentations",
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section - Clear CTA Focus */}
      <section className="pt-32 pb-20 px-4 sm:px-6 bg-gradient-to-b from-secondary/10 to-background overflow-hidden">
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
              className="px-5 py-3 bg-white text-foreground rounded-xl hover:bg-secondary/20 transition-colors font-bold text-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-lg border border-border"
            >
              JOIN
            </Link>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate("/about");
              }}
              className="px-5 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors font-bold text-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-lg"
            >
              About Us
            </button>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 animate-fade-in">
              <div className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary mb-6 animate-slide-in-up">
                <span className="text-base font-bold">
                  🚀 The Partner Discovery Platform for NGOs
                </span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-4 leading-tight">
                Find Your Perfect Partner in Minutes
              </h1>
              <p className="text-lg sm:text-xl text-primary font-semibold mb-6">
                Intelligent matching powered by AI — align on mission, region & goals instantly
              </p>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Stop spending weeks searching for the right collaborators.
              </p>

              {/* Primary CTA - Clear and Prominent */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link
                  to="/search"
                  className="group px-10 py-5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all duration-300 font-bold text-lg sm:text-xl flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:scale-[1.02]"
                >
                  Find Matching Organizations
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/org-submit"
                  className="px-8 py-5 border-2 border-primary/50 text-primary rounded-xl hover:bg-primary/5 hover:border-primary transition-all duration-300 font-semibold text-lg sm:text-xl text-center"
                >
                  Submit Your Organization
                </Link>
              </div>

              {/* Benefits - Compact */}
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {benefits.map((benefit, i) => (
                  <p
                    key={i}
                    className="text-sm text-muted-foreground font-medium"
                  >
                    {benefit}
                  </p>
                ))}
              </div>
            </div>

            {/* Hero Illustration - Animated */}
            <div className="order-1 lg:order-2 animate-fade-in">
              <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-accent/10 rounded-3xl p-12 aspect-square flex items-center justify-center relative overflow-hidden">
                {/* Floating background elements */}
                <div className="absolute top-10 left-10 w-20 h-20 bg-primary/10 rounded-full animate-float" />
                <div className="absolute bottom-20 right-10 w-16 h-16 bg-accent/20 rounded-full animate-float-delayed" />
                <div className="absolute top-1/2 right-20 w-12 h-12 bg-primary/15 rounded-full animate-float" />

                <div className="text-center relative z-10">
                  <div className="w-40 h-40 bg-primary/15 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse-slow">
                    <div className="w-32 h-32 bg-primary/20 rounded-full flex items-center justify-center">
                      <Target className="w-16 h-16 text-primary" />
                    </div>
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

      {/* How It Works - Immediately After Hero */}
      <section className="py-20 px-4 sm:px-6 bg-gradient-to-b from-background to-secondary/5">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
              SIMPLE 3-STEP PROCESS
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-xl mx-auto">
              Discover aligned partners in just three simple steps
            </p>
          </div>

          {/* Steps Grid with Connecting Line */}
          <div className="relative">
            {/* Connecting line - hidden on mobile */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 -translate-y-1/2 z-0" />

            <div className="grid md:grid-cols-3 gap-8 relative z-10">
              {howItWorksSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div
                    key={index}
                    className="group relative bg-card rounded-2xl p-8 border-2 border-border hover:border-primary transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                  >
                    {/* Step Number Badge */}
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                      {step.number}
                    </div>

                    <div className="mt-4 text-center">
                      <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:bg-primary/20 transition-colors">
                        <Icon className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground mb-2">
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick CTA below steps */}
          <div className="text-center mt-12">
            <Link
              to="/search"
              className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-4 transition-all duration-300"
            >
              Get started now
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Organization Matching Demo */}
      <OrganizationMatching />

      {/* About Us Section */}
      <section id="about-us-section" className="py-20 px-4 sm:px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              About Drivya.AI
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Empowering NGOs through research, collaboration, and innovation
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-stretch">
            <div className="p-8 bg-card rounded-2xl border-2 border-border hover:border-primary/50 transition-colors">
              <h3 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                <span className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  🎯
                </span>
                Our Mission
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Make organization discovery effortless. We help NGOs, innovation centres, and CSR teams instantly find aligned partners using intelligent search.
              </p>

              <h3 className="text-xl font-bold text-foreground mb-3 mt-6 flex items-center gap-2">
                <span className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  🔭
                </span>
                Our Vision
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Become the intelligence layer for India's development ecosystem — connecting NGOs, CSR teams, and innovators to accelerate social impact.
              </p>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-8 flex items-center">
              <div className="text-center w-full">
                <h4 className="text-xl font-bold text-foreground mb-4">Phase-1 Beta</h4>
                <div className="bg-card p-6 rounded-xl border border-border">
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    Currently onboarding verified organizations. Impact metrics coming after pilot testing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Drivya.AI - Key Benefits */}
      <section className="py-20 px-4 sm:px-6 bg-secondary/5">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Why NGOs Love Drivya.AI
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built by NGO leaders, for NGO leaders
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Clock,
                title: "Save Time",
                description: "Reduce discovery from weeks to hours",
              },
              {
                icon: Award,
                title: "Verified Partners",
                description: "Every organization is vetted",
              },
              {
                icon: Zap,
                title: "Instant Scoring",
                description: "See alignment at a glance",
              },
              {
                icon: FileText,
                title: "Generate Materials",
                description: "Create proposals in seconds",
              },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group p-6 bg-card rounded-2xl border-2 border-border hover:border-primary transition-all duration-300 hover:shadow-lg"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 sm:px-6 bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Ready to Find Your Partners?
          </h2>
          <p className="text-xl text-muted-foreground mb-10">
            Join NGOs across India discovering the right collaborators with Drivya.AI
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/search"
              className="group px-10 py-5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all duration-300 font-bold text-lg sm:text-xl flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:scale-[1.02]"
            >
              Find Matching Organizations
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/org-submit"
              className="px-8 py-5 border-2 border-primary/50 text-primary rounded-xl hover:bg-primary/5 hover:border-primary transition-all duration-300 font-semibold text-lg sm:text-xl"
            >
              Submit Your Organization
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
