import { Link } from "react-router-dom";
import { Search, Zap, Target, ArrowRight, Clock, Users, CheckCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MatchingCarousel from "@/components/MatchingCarousel";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Section 1: Hero (Above the fold) */}
      <section className="pt-16 pb-16 px-4 sm:px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
            Find Organizations That Match Your Mission
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Discover aligned partners using intelligent matching — no more endless research.
          </p>
          <Link
            to="/search"
            className="group inline-flex items-center gap-3 px-10 py-5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all duration-300 font-bold text-lg sm:text-xl shadow-lg hover:shadow-xl"
          >
            Explore Matching Organizations
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Matching Demo Carousel - immediately after hero */}
      <MatchingCarousel />

      {/* Section 2: Primary Feature Explanation */}

      <section className="py-16 px-4 sm:px-6 bg-secondary/5">
        <div className="container mx-auto max-w-3xl text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Target className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
            Intelligent Organization Matching
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Drivya.AI helps you discover organizations that align with your mission using intelligent matching based on focus areas, region, and goals.
          </p>
        </div>
      </section>

      {/* Section 3: How It Works (3 steps only) */}
      <section className="py-20 px-4 sm:px-6">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-center mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Search,
                step: "1",
                title: "Explore Organizations",
                description: "Browse our curated network of verified NGOs and partners",
              },
              {
                icon: Zap,
                step: "2",
                title: "See Alignment Matches",
                description: "Get instant compatibility scores based on shared goals",
              },
              {
                icon: Users,
                step: "3",
                title: "Connect with Partners",
                description: "Reach out to organizations that align with your mission",
              },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section 4: Why This Helps You (Short - 3 bullets) */}
      <section className="py-16 px-4 sm:px-6 bg-secondary/5">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-10">
            Why This Helps
          </h2>
          <div className="space-y-4">
            {[
              { icon: Clock, text: "Saves hours of research time" },
              { icon: Target, text: "Reduces mismatched outreach" },
              { icon: CheckCircle, text: "Improves collaboration clarity" },
            ].map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-foreground font-medium">{benefit.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section 5: Single CTA (End of page) */}
      <section className="py-20 px-4 sm:px-6">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Ready to Find Your Partners?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Start exploring aligned organizations today.
          </p>
          <Link
            to="/search"
            className="group inline-flex items-center gap-3 px-10 py-5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl"
          >
            Explore Matching Organizations
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
