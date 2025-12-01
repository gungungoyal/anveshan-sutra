import { Link } from "react-router-dom";
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

  const testimonials = [
    {
      name: "Priya Singh",
      role: "Director, Education NGO",
      quote:
        "Anveshan cut our partner discovery time from weeks to just hours. The alignment scoring helped us find the perfect CSR partner immediately.",
      avatar: "PS",
    },
    {
      name: "Rajesh Kumar",
      role: "Founder, Social Enterprise",
      quote:
        "The auto-generated PPT presentations saved us countless hours. We were able to present to potential partners the same day we found them.",
      avatar: "RK",
    },
    {
      name: "Anjali Patel",
      role: "Grant Manager",
      quote:
        "The verified badge system gives us confidence in the organizations we partner with. Highly recommended for any NGO.",
      avatar: "AP",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section - Large and Inviting */}
      <section className="pt-32 pb-20 px-4 sm:px-6 bg-gradient-to-b from-secondary to-background">
        <div className="container mx-auto max-w-6xl">
          {/* About Us Component - Positioned in top-right corner of hero section */}
          <div className="absolute top-8 right-4">
            <Link 
              to="/about" 
              className="px-5 py-3 text-foreground font-semibold text-xl hover:underline"
            >
              About Us
            </Link>
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
                Stop spending weeks searching for the right collaborators. Anveshan uses intelligent matching to connect you with verified organizations that share your mission and goals.
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

      {/* Why Anveshan - Key Benefits */}
      <section className="py-24 px-4 sm:px-6 bg-secondary">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="text-5xl sm:text-6xl font-bold text-foreground mb-4">
              Why NGOs Love Anveshan
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

      {/* Testimonials - Large Cards */}
      <section className="py-24 px-4 sm:px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="text-5xl sm:text-6xl font-bold text-foreground mb-4">
              Trusted by NGO Leaders
            </h2>
            <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto">
              See what other organizations are achieving with Anveshan
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="p-8 bg-card rounded-2xl border-2 border-border hover:border-primary transition-colors"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-lg text-foreground">
                      {testimonial.name}
                    </p>
                    <p className="text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
                <p className="text-lg text-foreground italic leading-relaxed">
                  "{testimonial.quote}"
                </p>
              </div>
            ))}
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
            Join NGOs across India who are discovering the right collaborators with Anveshan.
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
