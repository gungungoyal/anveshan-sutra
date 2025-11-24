import { Link } from "react-router-dom";
import { CheckCircle2, Search, Zap, Award, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Home() {
  const steps = [
    {
      icon: Search,
      title: "Search & Discover",
      description:
        "Find potential partners and funders using advanced filters and intelligent alignment scoring.",
    },
    {
      icon: Zap,
      title: "Auto-Generate Materials",
      description:
        "Generate summaries, proposals, and presentations in seconds using AI-powered tools.",
    },
    {
      icon: Award,
      title: "Build Relationships",
      description:
        "Connect with verified organizations and track partnership opportunities in one place.",
    },
  ];

  const testimonials = [
    {
      name: "Priya Singh",
      role: "Director, Education NGO",
      quote:
        "Anveshan cut our partner discovery time from weeks to hours. The alignment scoring helped us find the perfect CSR partner.",
      avatar: "PS",
    },
    {
      name: "Rajesh Kumar",
      role: "Founder, Social Enterprise",
      quote:
        "The auto-generated PPT presentations saved us countless hours of manual work. Highly recommended!",
      avatar: "RK",
    },
    {
      name: "Anjali Patel",
      role: "Grant Manager, Foundation",
      quote:
        "The verified badge system gives us confidence in the organizations we partner with. Best investment we made.",
      avatar: "AP",
    },
  ];

  const features = [
    "Verified organization profiles",
    "Alignment scoring with visual rings",
    "Auto-generated summaries & PPTs",
    "Smart search & filtering",
    "Email & proposal templates",
    "Admin verification workflow",
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-b from-secondary to-background">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-in-up">
              <div className="inline-block px-4 py-2 rounded-full bg-accent/10 text-accent mb-6">
                <span className="text-sm font-semibold">Discover. Evaluate. Partner.</span>
              </div>
              <h1 className="text-display-lg mb-6 leading-tight text-foreground">
                Find the Right Partners in Minutes
              </h1>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Anveshan helps NGOs, incubators, and innovation centers discover verified organizations,
                evaluate alignment, and generate partnership materials—all in one place.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <Link
                  to="/dashboard"
                  className="px-8 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold flex items-center justify-center gap-2 text-center"
                >
                  Start Exploring
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <button
                  className="px-8 py-4 border-2 border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors font-semibold"
                >
                  Watch Demo
                </button>
              </div>
              <p className="text-sm text-muted-foreground">
                ✓ No credit card required · ✓ Free tier available · ✓ Verified organizations
              </p>
            </div>

            {/* Hero Illustration */}
            <div className="hidden md:block">
              <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl p-8 aspect-square flex items-center justify-center">
                <div className="text-center">
                  <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-16 h-16 text-primary" />
                  </div>
                  <p className="text-primary font-semibold">Intelligent Search & Matching</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-display-md mb-4 text-foreground">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to discover and connect with the right organizations.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={index}
                  className="relative p-8 bg-card rounded-xl border border-border hover:border-primary transition-colors"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="text-3xl font-bold text-primary/30">{index + 1}</div>
                  </div>
                  <h3 className="text-heading-md mb-3 text-foreground">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-secondary">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-display-md mb-4 text-foreground">Powerful Features</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to discover, evaluate, and partner with organizations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3 p-4 bg-background rounded-lg border border-border">
                <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0" />
                <span className="text-foreground font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-display-md mb-4 text-foreground">What Users Say</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Hear from NGO leaders, social entrepreneurs, and foundation managers who use Anveshan.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="p-8 bg-card rounded-xl border border-border hover:border-primary transition-colors">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-foreground italic">"{testimonial.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-display-md mb-4 text-foreground">Ready to Find Your Partners?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Start discovering verified organizations and building meaningful partnerships today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="px-8 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold flex items-center justify-center gap-2"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <button className="px-8 py-4 border-2 border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors font-semibold">
              Schedule a Demo
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
