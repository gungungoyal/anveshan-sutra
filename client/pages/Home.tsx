import { Link } from "react-router-dom";
import { Search, Zap, Target, ArrowRight, Clock, Users, CheckCircle, Heart, Rocket, Building } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Section 1: Hero - Product-First Layout */}
      <section className="pt-16 pb-20 px-4 sm:px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Headline + CTAs */}
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 leading-tight">
                Find the right NGO, Incubator, or CSR partner.
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-lg">
                Discover aligned organizations faster, with clear reasons before outreach.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4">
                <a
                  href="#for-you"
                  className="group inline-flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl"
                >
                  Get Started
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
                <Link
                  to="/search"
                  className="inline-flex items-center gap-2 px-8 py-4 border-2 border-border text-foreground rounded-xl hover:bg-muted/50 transition-all duration-300 font-semibold text-lg"
                >
                  Browse Organizations
                </Link>
              </div>
            </div>

            {/* Right: Visual Matching Preview */}
            <div className="flex flex-col items-center lg:items-end">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4">
                Sample matching result
              </p>
              <div className="w-full max-w-sm bg-card rounded-2xl p-6 border border-border shadow-lg">
                {/* Organizations */}
                <div className="flex items-center justify-between gap-4 mb-5">
                  <div className="text-center flex-1">
                    <div className="w-14 h-14 bg-muted rounded-xl flex items-center justify-center mx-auto mb-2 border border-border">
                      <span className="text-primary font-bold text-lg">G</span>
                    </div>
                    <p className="text-sm font-medium text-foreground">Green Earth Foundation</p>
                    <p className="text-xs text-muted-foreground">NGO • Environment</p>
                  </div>
                  <div className="text-muted-foreground text-2xl">↔</div>
                  <div className="text-center flex-1">
                    <div className="w-14 h-14 bg-muted rounded-xl flex items-center justify-center mx-auto mb-2 border border-border">
                      <span className="text-orange-500 font-bold text-lg">T</span>
                    </div>
                    <p className="text-sm font-medium text-foreground">Tata CSR Initiative</p>
                    <p className="text-xs text-muted-foreground">CSR • Sustainability</p>
                  </div>
                </div>

                {/* Alignment Score */}
                <div className="text-center py-4 border-t border-border">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Alignment Score</p>
                  <span className="text-4xl font-bold text-green-600">82%</span>
                </div>

                {/* Why This Matches */}
                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Why this matches you</p>
                  <ul className="space-y-1.5 text-sm text-foreground/80">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span>Shared focus: Climate Action</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span>Geography overlap: Maharashtra</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span>Partner type preference matched</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Role Selection - Choose Your Path */}
      <section id="for-you" className="py-16 px-4 sm:px-6 bg-gradient-to-b from-background to-secondary/5">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
              I am a...
            </h2>
            <p className="text-muted-foreground text-lg">
              Select your role to see relevant organizations
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* For NGOs - Green Theme (#16A34A) */}
            <div
              id="for-ngos"
              className="bg-green-50/50 dark:bg-green-950/20 border-2 border-green-200 dark:border-green-800 rounded-2xl p-6 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-green-700 dark:text-green-300">
                  For NGOs
                </h3>
              </div>

              <p className="text-foreground/80 mb-5 leading-relaxed">
                Find aligned partners, funding opportunities, and incubators without wasting weeks on outreach.
              </p>

              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2 text-sm text-foreground/70">
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Discover relevant CSR and incubator partners</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-foreground/70">
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <span>See why an organization aligns before contacting</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-foreground/70">
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Submit your organization for visibility</span>
                </li>
              </ul>

              <Link
                to="/start/ngo"
                className="inline-flex items-center gap-2 w-full justify-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Set Up & Find Partners
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* For Incubators - Sky Blue Theme (#0EA5E9) */}
            <div
              id="for-incubators"
              className="bg-sky-50/50 dark:bg-sky-950/20 border-2 border-sky-200 dark:border-sky-800 rounded-2xl p-6 hover:shadow-lg hover:shadow-sky-500/10 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-sky-100 dark:bg-sky-900/50 rounded-xl flex items-center justify-center">
                  <Rocket className="w-6 h-6 text-sky-500 dark:text-sky-400" />
                </div>
                <h3 className="text-xl font-bold text-sky-700 dark:text-sky-300">
                  For Incubators
                </h3>
              </div>

              <p className="text-foreground/80 mb-5 leading-relaxed">
                Identify NGOs and corporates that align with your focus areas, geography, and stage.
              </p>

              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2 text-sm text-foreground/70">
                  <CheckCircle className="w-4 h-4 text-sky-500 dark:text-sky-400 mt-0.5 flex-shrink-0" />
                  <span>Find NGOs for pilots and programs</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-foreground/70">
                  <CheckCircle className="w-4 h-4 text-sky-500 dark:text-sky-400 mt-0.5 flex-shrink-0" />
                  <span>Identify CSR partners for funding and scale</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-foreground/70">
                  <CheckCircle className="w-4 h-4 text-sky-500 dark:text-sky-400 mt-0.5 flex-shrink-0" />
                  <span>Evaluate alignment before collaboration</span>
                </li>
              </ul>

              <Link
                to="/start/incubator"
                className="inline-flex items-center gap-2 w-full justify-center px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* For CSR Teams - Orange Theme (#F97316) */}
            <div
              id="for-csr"
              className="bg-orange-50/50 dark:bg-orange-950/20 border-2 border-orange-200 dark:border-orange-800 rounded-2xl p-6 hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/50 rounded-xl flex items-center justify-center">
                  <Building className="w-6 h-6 text-orange-500 dark:text-orange-400" />
                </div>
                <h3 className="text-xl font-bold text-orange-700 dark:text-orange-300">
                  For CSR Teams
                </h3>
              </div>

              <p className="text-foreground/80 mb-5 leading-relaxed">
                Reduce CSR discovery risk by finding credible, aligned organizations with verified data.
              </p>

              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2 text-sm text-foreground/70">
                  <CheckCircle className="w-4 h-4 text-orange-500 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                  <span>Discover NGOs aligned with CSR themes</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-foreground/70">
                  <CheckCircle className="w-4 h-4 text-orange-500 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                  <span>Review impact data before outreach</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-foreground/70">
                  <CheckCircle className="w-4 h-4 text-orange-500 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                  <span>Shortlist partners faster</span>
                </li>
              </ul>

              <Link
                to="/start/csr"
                className="inline-flex items-center gap-2 w-full justify-center px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Explore Verified NGOs
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Primary Feature Explanation */}


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

      {/* Section 5: Trust/Credibility (Simple) */}
      <section className="py-16 px-4 sm:px-6">
        <div className="container mx-auto max-w-2xl text-center">
          <p className="text-muted-foreground">
            Drivya.AI helps organizations save time by surfacing verified, aligned partners.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
