import { Link } from "react-router-dom";
import { 
  Users, 
  Target, 
  Heart, 
  Globe, 
  Award, 
  Calendar,
  ArrowRight
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function About() {
  const values = [
    {
      icon: Heart,
      title: "Social Impact First",
      description: "We prioritize meaningful connections that drive positive change in communities."
    },
    {
      icon: Target,
      title: "Precision Matching",
      description: "Our algorithm ensures you connect with organizations that truly align with your mission."
    },
    {
      icon: Users,
      title: "Community Building",
      description: "We foster genuine partnerships that go beyond transactional relationships."
    },
    {
      icon: Globe,
      title: "Transparency",
      description: "All organizations are verified to ensure trust and authenticity in every connection."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Connecting NGOs for Greater Impact
            </h1>
            <p className="text-xl sm:text-2xl text-muted-foreground mb-10 leading-relaxed">
              Anveshan bridges the gap between NGOs, foundations, and social enterprises to build stronger partnerships for social change.
            </p>
            <Link 
              to="/org-submit"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold"
            >
              Join Our Network
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4 sm:px-6 bg-secondary">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                At Anveshan, we believe that collaboration is the key to solving complex social challenges. 
                Our mission is to empower NGOs by connecting them with the right partners, resources, and opportunities.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We're building a platform where verified organizations can discover each other, assess alignment, 
                and collaborate more effectively than ever before.
              </p>
            </div>
            <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl p-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-border">
                <blockquote className="text-lg text-foreground italic">
                  "Alone we can do so little; together we can do so much."
                </blockquote>
                <cite className="mt-4 block text-muted-foreground not-italic">
                  – Helen Keller
                </cite>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4 sm:px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Our Core Values
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Principles that guide everything we do at Anveshan
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div 
                  key={index}
                  className="p-6 bg-card rounded-xl border border-border hover:border-primary transition-colors"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {value.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Journey Section */}
      <section className="py-20 px-4 sm:px-6 bg-secondary">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Our Journey
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From idea to impact
            </p>
          </div>
          
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-primary transform -translate-x-1/2"></div>
            
            <div className="space-y-12 pl-12 md:pl-0">
              <div className="relative md:w-1/2 md:odd:pr-12 md:even:pl-12 md:even:ml-auto">
                <div className="absolute -left-10 md:-left-4 md:right-auto w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="p-6 bg-card rounded-xl border border-border">
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    2023: The Idea
                  </h3>
                  <p className="text-muted-foreground">
                    Our founders, experienced NGO professionals, recognized the challenge of finding aligned partners. 
                    They envisioned a platform that would make partnership discovery seamless and effective.
                  </p>
                </div>
              </div>
              
              <div className="relative md:w-1/2 md:odd:pr-12 md:even:pl-12 md:even:ml-auto">
                <div className="absolute -left-10 md:-left-4 md:right-auto w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Award className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="p-6 bg-card rounded-xl border border-border">
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    2024: Platform Launch
                  </h3>
                  <p className="text-muted-foreground">
                    After months of development and testing with pilot organizations, we launched Anveshan to the public. 
                    Today, we connect dozens of organizations across various sectors.
                  </p>
                </div>
              </div>
              
              <div className="relative md:w-1/2 md:odd:pr-12 md:even:pl-12 md:even:ml-auto">
                <div className="absolute -left-10 md:-left-4 md:right-auto w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Globe className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="p-6 bg-card rounded-xl border border-border">
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    2025: Scaling Impact
                  </h3>
                  <p className="text-muted-foreground">
                    We're expanding our reach across India, continuously improving our matching algorithms, 
                    and adding new features based on community feedback.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}