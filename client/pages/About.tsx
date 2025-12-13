import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { Users, Target, TrendingUp, Award, ChevronRight, BookOpen, Globe, Heart } from 'lucide-react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export function AboutPlaceholder() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
      <h1 className="text-3xl font-bold mb-4">About</h1>
      <p className="text-gray-600">This is the About page placeholder.</p>
    </div>
  );
}

export default function About() {
  const [activeTab, setActiveTab] = useState('mission');

  // Impact stats - to be updated after pilot testing with ACIC and partner institutions
  const showImpactPlaceholder = true; // Early-stage indicator

  const values = [
    {
      icon: Target,
      title: 'Evidence-Based Research',
      description: 'We employ rigorous methodologies to ensure our findings are credible, actionable, and grounded in empirical data.'
    },
    {
      icon: Heart,
      title: 'Social Impact Focus',
      description: 'Every research initiative is designed to amplify the effectiveness of NGOs working toward positive social change.'
    },
    {
      icon: Users,
      title: 'Collaborative Approach',
      description: 'We partner with NGOs, academia, and communities to create research that reflects diverse perspectives and real-world needs.'
    },
    {
      icon: TrendingUp,
      title: 'Innovation & Growth',
      description: 'We constantly evolve our research methods to address emerging challenges in the nonprofit sector.'
    }
  ];

  const tabContent = {
    mission: {
      title: 'Our Mission',
      content: "Our mission is to make organization discovery effortless. We help NGOs, innovation centres, CSR teams, and ecosystem builders instantly find aligned partners using structured data, automated profiling, and intelligent search \u2014 reducing hours of manual research into seconds."
    },
    vision: {
      title: 'Our Vision',
      content: "Our vision is to become the intelligence layer for India's development ecosystem \u2014 a unified platform where credible NGOs, CSR teams, academic institutions, and innovators can discover each other, build meaningful collaborations, and accelerate social impact efficiently and transparently."
    },
    approach: {
      title: 'Our Approach',
      content: 'We combine quantitative analysis, qualitative field research, and participatory methods to understand the complexities of the nonprofit sector. Our interdisciplinary team works closely with NGOs throughout the research process, ensuring our findings are relevant, practical, and actionable for organizations of all sizes.'
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-primary to-secondary text-primary-foreground">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="relative max-w-7xl mx-auto px-6 py-24 sm:py-32">
            <div className="text-center">
              <h1 className="text-5xl sm:text-6xl font-bold mb-6 tracking-tight">
                Empowering NGOs Through Research
              </h1>
              <p className="text-xl sm:text-2xl text-primary-foreground/90 max-w-3xl mx-auto leading-relaxed">
                Transforming data into insights that drive social impact and organizational excellence
              </p>
            </div>
            {/* Top bar with logo and buttons */}
            <div className="absolute top-8 left-8 z-50">
              <div className="w-20 h-20 rounded-full overflow-hidden">
                <img
                  src="/logo.svg"
                  alt="Drivya.AI Logo"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="absolute top-8 right-8 flex gap-2">
              <Link
                to="/login"
                className="px-5 py-3 bg-white text-foreground rounded-xl hover:bg-secondary transition-colors font-bold text-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-lg border border-border"
              >
                JOIN
              </Link>
              <button
                onClick={() => window.location.hash = '#about-us-section'}
                className="px-5 py-3 bg-primary-foreground text-primary rounded-xl hover:bg-primary-foreground/90 transition-colors font-bold text-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-foreground/50 shadow-lg"
              >
                About Us
              </button>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background"></div>
        </div>

        {/* Impact - Early Stage Placeholder */}
        <div className="max-w-7xl mx-auto px-6 -mt-12 relative z-10">
          <div className="bg-card rounded-2xl shadow-lg p-8 text-center border border-border">
            <h3 className="text-2xl font-bold text-foreground mb-4">Impact (Phase-1 Beta)</h3>
            <div className="space-y-3 max-w-2xl mx-auto">
              <p className="text-muted-foreground">
                We are currently onboarding verified organizations.
              </p>
              <p className="text-muted-foreground">
                Impact numbers will be published after pilot testing with ACIC and partner institutions.
              </p>
              <p className="text-muted-foreground">
                This platform is in active development — early user insights will shape the roadmap.
              </p>
            </div>
          </div>
        </div>

        {/* Mission/Vision/Approach Tabs */}
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="bg-card rounded-3xl shadow-xl overflow-hidden border border-border">
            <div className="flex border-b border-border">
              {Object.keys(tabContent).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-4 px-6 text-center font-semibold transition-all duration-300 ${activeTab === tab
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-secondary'
                    }`}
                >
                  {tabContent[tab].title}
                </button>
              ))}
            </div>
            <div className="p-8 sm:p-12">
              <h2 className="text-3xl font-bold text-foreground mb-6">
                {tabContent[activeTab].title}
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {tabContent[activeTab].content}
              </p>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="max-w-7xl mx-auto px-6 pb-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Our Core Values
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The principles that guide our research and partnerships
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-card rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-border group hover:border-primary"
              >
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <value.icon className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-foreground mb-3">
                      {value.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-primary/20 to-secondary/20">
          <div className="max-w-5xl mx-auto px-6 py-16 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
              Partner With Us
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join the growing network of NGOs leveraging our research to amplify their impact
            </p>
            <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 inline-flex items-center gap-2 shadow-lg hover:shadow-xl">
              Get In Touch
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}