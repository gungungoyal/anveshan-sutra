import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SearchResult } from "@shared/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Copy,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";

interface PPTSlide {
  slide_number: number;
  title: string;
  content: string;
  notes?: string;
}

export default function PPTViewer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [org, setOrg] = useState<SearchResult | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [slides, setSlides] = useState<PPTSlide[]>([]);
  const [copyStatus, setCopyStatus] = useState<number | null>(null);

  useEffect(() => {
    const fetchOrgAndGenerateSlides = async () => {
      if (!id) return;

      try {
        setLoading(true);

        // Fetch organization
        const response = await fetch(`/api/orgs/${id}`);
        if (!response.ok) throw new Error("Organization not found");

        const data = await response.json();
        setOrg(data);

        // Generate slides from organization data
        const generatedSlides = generateSlides(data);
        setSlides(generatedSlides);
      } catch (err) {
        setError("Failed to load presentation");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrgAndGenerateSlides();
  }, [id]);

  const generateSlides = (org: SearchResult): PPTSlide[] => {
    return [
      {
        slide_number: 1,
        title: org.name,
        content: `${org.type}\n${org.mission}`,
        notes: "Opening slide - introduce the organization",
      },
      {
        slide_number: 2,
        title: "Mission & Vision",
        content: `MISSION\n${org.mission}\n\nVISION\n${org.description}`,
        notes: "Core mission and vision of the organization",
      },
      {
        slide_number: 3,
        title: "What We Do",
        content: `Focus Areas:\n${org.focusAreas.map((a) => `• ${a}`).join("\n")}`,
        notes: "Primary areas of focus and impact",
      },
      {
        slide_number: 4,
        title: "Where We Work",
        content: `Geographic Presence\n\nHeadquarters: ${org.headquarters}\nRegion: ${org.region}`,
        notes: "Geographic scope of operations",
      },
      {
        slide_number: 5,
        title: "Our Impact",
        content: `Projects Completed: ${org.projects?.length || 0}\nTarget Beneficiaries: ${org.targetBeneficiaries?.join(", ") || "N/A"}\n\nData Confidence: ${org.confidence}%`,
        notes: "Key impact metrics and reach",
      },
      {
        slide_number: 6,
        title: "Known Partners",
        content:
          org.partnerHistory && org.partnerHistory.length > 0
            ? org.partnerHistory.map((p) => `• ${p}`).join("\n")
            : "Various NGOs, foundations, and organizations",
        notes: "Organizations we have worked with",
      },
      {
        slide_number: 7,
        title: "Why This Match?",
        content: `ALIGNMENT SCORE: ${org.alignmentScore}/100\n\nWhy we matched:\n• Focus area compatibility\n• Geographic alignment\n• Complementary missions`,
        notes: "Explanation of partnership potential",
      },
      {
        slide_number: 8,
        title: "Get in Touch",
        content: org.website
          ? `Website: ${org.website}\n\nLearn more about our work`
          : "Contact the organization directly\n\nLearn more about our work",
        notes: "Call to action and next steps",
      },
    ];
  };

  const handleNextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handlePrevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const copyToClipboard = (text: string, slideNumber: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopyStatus(slideNumber);
      setTimeout(() => setCopyStatus(null), 2000);
    });
  };

  const downloadPPT = () => {
    // In a real app, this would generate an actual PPTX file
    alert(
      "PPT download feature will be implemented with server-side PPTX generation"
    );
  };

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

  if (error || !org || slides.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            {error || "Could not generate presentation"}
          </h1>
          <Button onClick={() => navigate(`/org-profile/${id}`)}>
            Back to Organization
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const slide = slides[currentSlide];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-6xl flex-1">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Button
              variant="ghost"
              className="mb-4"
              onClick={() => navigate(`/org-profile/${id}`)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-foreground">
              Presentation: {org.name}
            </h1>
            <p className="text-muted-foreground mt-2">
              Slide {currentSlide + 1} of {slides.length}
            </p>
          </div>
          <Button
            onClick={downloadPPT}
            className="flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Download PPTX
          </Button>
        </div>

        {/* Slide Viewer */}
        <Card className="mb-8 overflow-hidden">
          <div className="bg-gradient-to-br from-primary/10 to-secondary/10 aspect-video flex flex-col items-center justify-center p-12 relative">
            {/* Slide Content */}
            <div className="text-center w-full">
              <h2 className="text-5xl font-bold text-primary mb-6">
                {slide.title}
              </h2>
              <div className="text-xl text-foreground whitespace-pre-line leading-relaxed">
                {slide.content}
              </div>
            </div>

            {/* Verification Badge if needed */}
            {org.verificationStatus === "verified" && currentSlide === 1 && (
              <div className="absolute top-6 right-6 flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full">
                <CheckCircle2 className="w-5 h-5" />
                Verified Organization
              </div>
            )}
          </div>
        </Card>

        {/* Slide Details & Copy */}
        <Card className="mb-8 p-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <h3 className="font-bold text-lg text-foreground mb-3">
                Slide Content
              </h3>
              <p className="text-muted-foreground mb-4 whitespace-pre-wrap">
                {slide.content}
              </p>
              {slide.notes && (
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Speaker Notes
                  </p>
                  <p className="text-foreground">{slide.notes}</p>
                </div>
              )}
            </div>
            <div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => copyToClipboard(slide.content, slide.slide_number)}
              >
                {copyStatus === slide.slide_number ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Text
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="outline"
            onClick={handlePrevSlide}
            disabled={currentSlide === 0}
            size="lg"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Previous
          </Button>

          <div className="flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentSlide
                    ? "bg-primary w-8"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          <Button
            variant="outline"
            onClick={handleNextSlide}
            disabled={currentSlide === slides.length - 1}
            size="lg"
          >
            Next
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>

        {/* Slide Grid View */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-foreground mb-4">
            All Slides
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {slides.map((s, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`relative aspect-video rounded-lg border-2 transition-all p-3 text-left ${
                  index === currentSlide
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="text-xs font-bold text-foreground truncate">
                  {s.title}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Slide {index + 1}
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
