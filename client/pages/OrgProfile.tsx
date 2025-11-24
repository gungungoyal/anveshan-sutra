import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Share2,
  FileText,
  CheckCircle,
  Loader,
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
            <Loader className="w-8 h-8 text-primary animate-spin" />
            <p className="text-muted-foreground">Loading organization...</p>
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
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-8 font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Dashboard
            </Link>
            <div className="text-center p-12">
              <h1 className="text-heading-lg text-foreground mb-2">
                Organization Not Found
              </h1>
              <p className="text-muted-foreground">
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

      <main className="pt-28 pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Back Button */}
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-8 font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </Link>

          {/* Organization Header */}
          <div className="bg-card rounded-xl border border-border p-8 mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-display-md text-foreground">
                    {org.name}
                  </h1>
                  {org.verificationStatus === "verified" && (
                    <div className="px-3 py-1 bg-accent/10 text-accent text-sm rounded-full font-semibold flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Verified
                    </div>
                  )}
                  {org.verificationStatus === "pending" && (
                    <div className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full font-semibold">
                      Pending
                    </div>
                  )}
                </div>
                <p className="text-muted-foreground">
                  {org.type} • {org.headquarters} • {org.region}
                </p>
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                <button className="flex-1 md:flex-none px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold flex items-center justify-center gap-2">
                  <Download className="w-5 h-5" />
                  Generate PPT
                </button>
                <button className="px-6 py-3 border-2 border-border hover:bg-secondary rounded-lg transition-colors font-semibold">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Alignment Score Ring */}
          <div className="bg-card rounded-xl border border-border p-8 mb-8">
            <h2 className="text-heading-md mb-6 text-foreground">
              Alignment Score
            </h2>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="relative w-32 h-32">
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
                  <span className="text-3xl font-bold text-primary">
                    {Math.round(org.alignmentScore)}
                  </span>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-muted-foreground mb-4">
                  Strong alignment with your search criteria. This organization
                  matches on focus areas, geographic regions, and funding type,
                  making it a great collaboration opportunity.
                </p>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">
                      Confidence Score: {org.confidence}%
                    </p>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-accent rounded-full h-2"
                        style={{ width: `${org.confidence}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Organization Details */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-card rounded-xl border border-border p-8">
              <h3 className="text-heading-md mb-4 text-foreground">
                Mission Statement
              </h3>
              <p className="text-foreground mb-4">{org.mission}</p>
              <p className="text-muted-foreground text-sm">{org.description}</p>
            </div>

            <div className="bg-card rounded-xl border border-border p-8">
              <h3 className="text-heading-md mb-4 text-foreground">
                Key Information
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-semibold text-foreground">{org.type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Headquarters</p>
                  <p className="font-semibold text-foreground">
                    {org.headquarters}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Focus Areas</p>
                  <p className="font-semibold text-foreground">
                    {org.focusAreas.join(", ")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Funding Type</p>
                  <p className="font-semibold text-foreground capitalize">
                    {org.fundingType}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-8">
            <div className="bg-card rounded-xl border border-border p-8">
              <h3 className="text-heading-md mb-4 text-foreground">
                Programs & Projects
              </h3>
              <div className="space-y-4">
                {org.projects.map((project, index) => (
                  <div
                    key={index}
                    className="pb-4 border-b border-border last:border-0"
                  >
                    <h4 className="font-semibold text-foreground mb-1">
                      {project.title}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      {project.year}
                    </p>
                    <p className="text-foreground text-sm">
                      {project.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-8">
              <h3 className="text-heading-md mb-4 text-foreground">
                Partnership History
              </h3>
              <div className="flex flex-wrap gap-2">
                {org.partnerHistory.map((partner, index) => (
                  <span
                    key={index}
                    className="px-3 py-2 bg-secondary rounded-lg text-sm text-foreground"
                  >
                    {partner}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-8">
              <h3 className="text-heading-md mb-4 text-foreground">
                Target Beneficiaries
              </h3>
              <div className="flex flex-wrap gap-2">
                {org.targetBeneficiaries.map((beneficiary, index) => (
                  <span
                    key={index}
                    className="px-3 py-2 bg-primary/10 text-primary rounded-lg text-sm"
                  >
                    {beneficiary}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Contact CTA */}
          <div className="mt-12 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-8 text-center">
            <h3 className="text-heading-md mb-2 text-foreground">
              Ready to Connect?
            </h3>
            <p className="text-muted-foreground mb-6">
              Generate a personalized proposal or email draft to start the
              conversation.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold">
                Generate Email Draft
              </button>
              <button className="px-6 py-3 border-2 border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors font-semibold">
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
