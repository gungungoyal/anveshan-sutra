import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SearchResult } from "@shared/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  ExternalLink,
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Briefcase,
  Award,
} from "lucide-react";

export default function OrgProfileDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [org, setOrg] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isShortlisted, setIsShortlisted] = useState(false);

  useEffect(() => {
    const fetchOrg = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/orgs/${id}`);
        if (!response.ok) throw new Error("Organization not found");

        const data = await response.json();
        setOrg(data);
      } catch (err) {
        setError("Failed to load organization details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrg();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !org) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            {error || "Organization not found"}
          </h1>
          <Button onClick={() => navigate("/search")}>Back to Search</Button>
        </div>
        <Footer />
      </div>
    );
  }

  const getAlignmentColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-amber-600";
    return "text-red-600";
  };

  const getAlignmentBgColor = (score: number) => {
    if (score >= 80) return "bg-green-50";
    if (score >= 60) return "bg-blue-50";
    if (score >= 40) return "bg-amber-50";
    return "bg-red-50";
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate("/search")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Results
        </Button>

        {/* Organization Header */}
        <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-8 mb-8">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-4xl font-bold text-foreground">
                  {org.name}
                </h1>
                {org.verificationStatus === "verified" && (
                  <CheckCircle2 className="w-8 h-8 text-green-600 flex-shrink-0" />
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="default" className="text-base">
                  {org.type}
                </Badge>
                <Badge variant="outline" className="text-base">
                  <MapPin className="w-4 h-4 mr-1" />
                  {org.region}
                </Badge>
                {org.verificationStatus && (
                  <Badge
                    variant={
                      org.verificationStatus === "verified"
                        ? "default"
                        : "secondary"
                    }
                    className="text-base"
                  >
                    {org.verificationStatus === "verified"
                      ? "✓ Verified"
                      : "Pending Verification"}
                  </Badge>
                )}
              </div>

              <p className="text-lg text-foreground font-medium">
                {org.headquarters}
              </p>
            </div>

            {/* Alignment Score Card */}
            <div
              className={`${getAlignmentBgColor(
                org.alignmentScore
              )} rounded-xl p-6 min-w-[180px] text-center`}
            >
              <div className={`text-4xl font-bold mb-2 ${getAlignmentColor(org.alignmentScore)}`}>
                {org.alignmentScore}
              </div>
              <div className="text-sm font-medium text-muted-foreground">
                Alignment Score
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                How well you match
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <Button
              variant={isShortlisted ? "default" : "outline"}
              onClick={() => setIsShortlisted(!isShortlisted)}
              className="flex items-center gap-2"
            >
              <Heart
                className="w-5 h-5"
                fill={isShortlisted ? "currentColor" : "none"}
              />
              {isShortlisted ? "Saved" : "Save to Shortlist"}
            </Button>

            {org.website && (
              <Button variant="outline" asChild>
                <a
                  href={org.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="w-5 h-5" />
                  Visit Website
                </a>
              </Button>
            )}

            <Button asChild>
              <Link to={`/ppt/${org.id}`} className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Generate PPT
              </Link>
            </Button>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Mission & Vision */}
            <Card>
              <CardHeader>
                <CardTitle>Mission & Vision</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-bold text-foreground mb-2">Mission</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {org.mission}
                  </p>
                </div>
                <div className="border-t pt-4">
                  <h3 className="font-bold text-foreground mb-2">Vision</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {org.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Focus Areas */}
            <Card>
              <CardHeader>
                <CardTitle>Focus Areas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {org.focusAreas.map((area) => (
                    <Badge key={area} variant="secondary" className="text-base">
                      {area}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Projects & Impact */}
            {org.projects && org.projects.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Key Projects & Impact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {org.projects.slice(0, 3).map((project, idx) => (
                    <div
                      key={idx}
                      className="border-l-4 border-primary pl-4 py-2"
                    >
                      <h4 className="font-bold text-foreground mb-1">
                        {project.title}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-1">
                        {project.year}
                      </p>
                      <p className="text-foreground">{project.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Partners */}
            {org.partnerHistory && org.partnerHistory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Known Partners</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {org.partnerHistory.map((partner, idx) => (
                      <Badge key={idx} variant="outline">
                        {partner}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Key Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Organization Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                    Type
                  </p>
                  <p className="font-semibold text-foreground">{org.type}</p>
                </div>
                <div className="border-t pt-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                    Region
                  </p>
                  <p className="font-semibold text-foreground">{org.region}</p>
                </div>
                <div className="border-t pt-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                    Headquarters
                  </p>
                  <p className="font-semibold text-foreground">
                    {org.headquarters}
                  </p>
                </div>
                <div className="border-t pt-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                    Funding Type
                  </p>
                  <p className="font-semibold text-foreground">
                    {org.fundingType}
                  </p>
                </div>
                <div className="border-t pt-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                    Data Confidence
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-full rounded-full"
                        style={{ width: `${org.confidence}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {org.confidence}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Target Beneficiaries */}
            {org.targetBeneficiaries && org.targetBeneficiaries.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Target Beneficiaries
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {org.targetBeneficiaries.map((beneficiary, idx) => (
                      <li
                        key={idx}
                        className="text-sm text-foreground flex items-start gap-2"
                      >
                        <span className="text-primary mt-1">•</span>
                        {beneficiary}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
