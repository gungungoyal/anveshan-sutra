import { Link } from "react-router-dom";
import {
  Search,
  Zap,
  Target,
  ArrowRight,
  Sparkles,
  BarChart3,
  Layers,
  MapPin,
  Building2,
} from "lucide-react";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import OrganizationMatching from "@/components/OrganizationMatching";

export default function Home() {

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

  return (

    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section - Clear CTA Focus */}
      <section className="pt-12 pb-20 px-4 sm:px-6 bg-gradient-to-b from-secondary/10 to-background overflow-hidden">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            <div className="order-2 lg:order-1 animate-fade-in">
              <div className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary mb-6 animate-slide-in-up">
                <span className="text-base font-bold">
                  🚀 Partner Discovery for NGOs
                </span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-4 leading-tight">
                Find Your Perfect Partner in Minutes
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-lg">
                AI-powered matching on mission, region & goals — stop spending weeks searching.
              </p>

              {/* Single Primary CTA */}
              <Link
                to="/org-submit"
                className="group inline-flex items-center gap-3 px-10 py-5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all duration-300 font-bold text-lg sm:text-xl shadow-lg hover:shadow-xl hover:scale-[1.02] mb-6"
              >
                Submit Your Organization
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Link>

              {/* Compact Benefits */}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span>✓ Free to join</span>
                <span>✓ Verified orgs only</span>
                <span>✓ Instant matching</span>
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
      </section >

      {/* Organization Matching Demo */}
      < OrganizationMatching />

      {/* What You Can Do Here - Feature Cards */}
      < section className="py-20 px-4 sm:px-6 bg-gradient-to-b from-background to-secondary/5" >
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
              PLATFORM FEATURES
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              What You Can Do Here
            </h2>
            <p className="text-xl text-muted-foreground max-w-xl mx-auto">
              Powerful tools to find and connect with the right organizations
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Sparkles,
                title: "Intelligent Matching",
                description: "AI finds organizations aligned with your mission",
                link: "/search",
              },
              {
                icon: BarChart3,
                title: "Alignment Scores",
                description: "See compatibility at a glance with percentage scores",
                link: "/search",
              },
              {
                icon: Layers,
                title: "Focus-Area Discovery",
                description: "Filter by education, health, environment & more",
                link: "/search?focus=",
              },
              {
                icon: MapPin,
                title: "Region-Wise Search",
                description: "Find partners in your state or across India",
                link: "/search?region=",
              },
              {
                icon: Building2,
                title: "Organization Profiles",
                description: "Detailed info on mission, projects & partners",
                link: "/search",
              },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Link
                  key={index}
                  to={feature.link}
                  className="group p-6 bg-card rounded-2xl border-2 border-border hover:border-primary hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                >
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="mt-4 flex items-center gap-1 text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Explore <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA - Single Action */}
      <section className="py-20 px-4 sm:px-6 bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-muted-foreground mb-10">
            Join hundreds of organizations discovering the right partners
          </p>
          <Link
            to="/org-submit"
            className="group inline-flex items-center gap-3 px-12 py-5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all duration-300 font-bold text-lg sm:text-xl shadow-lg hover:shadow-xl hover:scale-[1.02]"
          >
            Submit Your Organization
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>


      <Footer />
    </div >
  );
}
