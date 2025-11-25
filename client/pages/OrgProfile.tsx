import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Share2,
  Loader,
  CheckCircle,
  AlertCircle,
  Users,
  Target,
  Briefcase,
  MapPin,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";
import { SearchResult } from "@shared/api";

export default function OrgProfile() {
  const { id } = useParams<{ id: string }>();
  const [org, setOrg] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrg = async () => {
      try {
        const response = await fetch(`/api/orgs/${id}`);
        const data: SearchResult = await response.json();
        setOrg(data);
      } catch (error) {
        console.error("Failed to fetch organization:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchOrg();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-28 pb-20 px-4 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader className="w-12 h-12 text-primary animate-spin" />
            <p className="text-lg text-muted-foreground font-medium">
              Loading organization details...
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!org) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-28 pb-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-8 font-semibold text-base"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Search
            </Link>
            <div className="text-center p-16">
              <h1 className="text-4xl font-bold text-foreground mb-3">
                Organization Not Found
              </h1>
              <p className="text-lg text-muted-foreground">
                The organization you're looking for doesn't exist.
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-20 px-4 sm:px-6">
        <div className="container mx-auto max-w-5xl">
          {/* Back Button */}
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-8 font-semibold text-base"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Search
          </Link>

          {/* Step Indicator */}
          <div className="flex items-center gap-2 mb-6">
            <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">
              Step 2 of 3
            </span>
          </div>

          {/* Organization Header - Large and Clear */}
          <div className="mb-10">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <h1 className="text-4xl sm:text-5xl font-bold text-foreground">
                    {org.name}
                  </h1>
                  {org.verificationStatus === "verified" && (
                    <div className="px-4 py-2 bg-accent/10 text-accent rounded-lg font-bold flex items-center gap-1.5">
                      <CheckCircle className="w-5 h-5" />
                      Verified
                    </div>
                  )}
                  {org.verificationStatus === "pending" && (
                    <div className="px-4 py-2 bg-primary/10 text-primary rounded-lg font-bold flex items-center gap-1.5">
                      <AlertCircle className="w-5 h-5" />
                      Pending
                    </div>
                  )}
                </div>
                <p className="text-lg sm:text-xl text-muted-foreground font-medium mb-3">
                  {org.type} • {org.headquarters}
                </p>
              </div>

              {/* Action Buttons - Large and Visible */}
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button className="flex-1 sm:flex-none px-6 sm:px-8 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-bold text-base sm:text-lg flex items-center justify-center gap-2 shadow-lg">
                  <Download className="w-5 h-5" />
                  Generate PPT
                </button>
                <button className="px-6 py-4 border-2 border-border hover:bg-secondary rounded-lg transition-colors font-semibold text-base">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Alignment Score - Large and Prominent */}
          <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl border-2 border-primary/20 p-8 sm:p-10 mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-8">
              Why This Organization Matches
            </h2>
            <div className="grid sm:grid-cols-2 gap-10">
              <div className="flex flex-col items-center gap-6">
                <div className="relative w-40 h-40">
                  <svg className="w-full h-full" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r="55"
                      fill="none"
                      stroke="hsl(var(--muted))"
                      strokeWidth="8"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="55"
                      fill="none"
                      stroke="hsl(var(--primary))"
                      strokeWidth="8"
                      strokeDasharray={`${
                        (org.alignmentScore / 100) * (55 * 2 * Math.PI)
                      } ${55 * 2 * Math.PI}`}
                      strokeLinecap="round"
                      transform="rotate(-90 60 60)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl font-bold text-primary">
                      {Math.round(org.alignmentScore)}
                    </span>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-foreground">Overall Match</p>
                  <p className="text-muted-foreground">
                    Based on focus areas, region, and mission alignment
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-sm text-muted-foreground font-bold mb-2">
                    Data Confidence
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-muted rounded-full h-3">
                      <div
                        className="bg-accent rounded-full h-3"
                        style={{ width: `${org.confidence}%` }}
                      />
                    </div>
                    <span className="font-bold text-foreground text-lg">
                      {org.confidence}%
                    </span>
                  </div>
                </div>

                <div className="space-y-4 bg-background rounded-lg p-6 border border-border">
                  <p className="text-sm text-muted-foreground font-bold">
                    Why they match:
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-base text-foreground">
                        Focus areas align with your search
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-base text-foreground">
                        Active in compatible regions
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-base text-foreground">
                        Verified organization with proven track record
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Mission & Key Details */}
          <div className="grid sm:grid-cols-2 gap-8 mb-10">
            <div className="p-8 bg-card rounded-xl border-2 border-border">
              <h3 className="text-2xl font-bold text-foreground mb-4">Mission</h3>
              <p className="text-lg text-foreground mb-4 leading-relaxed">
                {org.mission}
              </p>
              <p className="text-base text-muted-foreground leading-relaxed">
                {org.description}
              </p>
            </div>

            <div className="p-8 bg-card rounded-xl border-2 border-border">
              <h3 className="text-2xl font-bold text-foreground mb-6">
                Key Details
              </h3>
              <div className="space-y-5">
                <div>
                  <p className="text-sm text-muted-foreground font-bold mb-2">
                    Organization Type
                  </p>
                  <p className="text-lg font-semibold text-foreground">
                    {org.type}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-bold mb-2">
                    Location
                  </p>
                  <p className="text-lg font-semibold text-foreground">
                    {org.headquarters} • {org.region}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-bold mb-2">
                    Funding Type
                  </p>
                  <p className="text-lg font-semibold text-foreground capitalize">
                    {org.fundingType}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-8 mb-10">
            <div className="p-8 bg-card rounded-xl border-2 border-border">
              <div className="flex items-center gap-3 mb-6">
                <Target className="w-7 h-7 text-primary" />
                <h3 className="text-2xl font-bold text-foreground">
                  Focus Areas
                </h3>
              </div>
              <div className="flex flex-wrap gap-3">
                {org.focusAreas.map((area) => (
                  <span
                    key={area}
                    className="px-4 py-2 bg-primary/10 text-primary rounded-lg text-base font-bold"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-8 bg-card rounded-xl border-2 border-border">
              <div className="flex items-center gap-3 mb-6">
                <Briefcase className="w-7 h-7 text-primary" />
                <h3 className="text-2xl font-bold text-foreground">
                  Programs & Projects
                </h3>
              </div>
              <div className="space-y-4">
                {org.projects.map((project, index) => (
                  <div
                    key={index}
                    className="pb-5 border-b border-border last:border-0"
                  >
                    <h4 className="text-xl font-bold text-foreground mb-2">
                      {project.title}
                    </h4>
                    <p className="text-sm text-muted-foreground font-semibold mb-2">
                      {project.year}
                    </p>
                    <p className="text-base text-foreground">
                      {project.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-8 bg-card rounded-xl border-2 border-border">
              <div className="flex items-center gap-3 mb-6">
                <Users className="w-7 h-7 text-primary" />
                <h3 className="text-2xl font-bold text-foreground">
                  Past Partners
                </h3>
              </div>
              <div className="flex flex-wrap gap-3">
                {org.partnerHistory.map((partner, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-secondary rounded-lg text-base font-semibold text-foreground"
                  >
                    {partner}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-8 bg-card rounded-xl border-2 border-border">
              <div className="flex items-center gap-3 mb-6">
                <Users className="w-7 h-7 text-primary" />
                <h3 className="text-2xl font-bold text-foreground">
                  Who They Help
                </h3>
              </div>
              <div className="flex flex-wrap gap-3">
                {org.targetBeneficiaries.map((beneficiary, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-accent/10 text-accent rounded-lg text-base font-bold"
                  >
                    {beneficiary}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Next Steps CTA */}
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl border-2 border-primary/20 p-8 sm:p-10 text-center">
            <div className="flex items-center gap-2 justify-center mb-4">
              <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">
                Step 3 of 3
              </span>
            </div>
            <h3 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Ready to Connect?
            </h3>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Generate personalized outreach materials to begin a partnership
              conversation. Choose from email drafts or a professional presentation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 sm:px-10 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-bold text-lg">
                Generate Email Draft
              </button>
              <button className="px-8 sm:px-10 py-4 border-2 border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors font-bold text-lg">
                Generate Proposal
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
