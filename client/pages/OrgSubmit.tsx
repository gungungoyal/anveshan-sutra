import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Upload, Check, Loader2, Edit3, GraduationCap, Heart, Leaf, Briefcase, Lightbulb, Users } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { SubmitOrganizationRequest } from "@shared/api";
import {
  submitOrganization,
  updateOrganization,
  getOrganizationById,
} from "@/lib/services/organizations";
import { useUserStore } from "@/lib/stores/userStore";

// Domain to sub-areas mapping
const DOMAIN_SUBAREAS: Record<string, { icon: any; label: string; helper: string; subareas: string[] }> = {
  education: {
    icon: GraduationCap,
    label: "Education",
    helper: "Schools, literacy, scholarships",
    subareas: ["School Education", "Digital Education", "Scholarships", "Teacher Training", "Adult Literacy"],
  },
  health: {
    icon: Heart,
    label: "Health",
    helper: "Healthcare, nutrition, sanitation",
    subareas: ["Preventive Healthcare", "Maternal & Child Health", "Nutrition", "Sanitation & Hygiene", "Medical Camps"],
  },
  environment: {
    icon: Leaf,
    label: "Environment",
    helper: "Climate, conservation, energy",
    subareas: ["Waste Management", "Water Conservation", "Climate Action", "Renewable Energy"],
  },
  livelihood: {
    icon: Briefcase,
    label: "Livelihood",
    helper: "Skills, jobs, entrepreneurship",
    subareas: ["Skill Development", "Vocational Training", "Entrepreneurship", "Rural Livelihood", "Urban Livelihood"],
  },
  technology: {
    icon: Lightbulb,
    label: "Technology & Innovation",
    helper: "R&D, incubation, digital",
    subareas: ["Incubation Support", "R&D Projects", "Social Innovation", "Digital Transformation"],
  },
  community: {
    icon: Users,
    label: "Community & Governance",
    helper: "Development, relief, civic",
    subareas: ["Community Development", "Disaster Relief", "Civic Engagement", "Digital Governance"],
  },
};

interface FormData extends SubmitOrganizationRequest {
  confirmation: boolean;
  userRole?: "ngo" | "funder";
  grantBudget?: string;
  maxGrantSize?: string;
  preferredNGOTypes?: string[];
  minYearsOperation?: number;
}

const initialFormData: FormData = {
  name: "",
  type: "NGO",
  website: "",
  headquarters: "",
  region: "",
  focusAreas: [],
  mission: "",
  description: "",
  fundingType: "mixed",
  targetBeneficiaries: [],
  partnerHistory: [],
  projects: [],
  confirmation: false,
  userRole: undefined,
};

export default function OrgSubmit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [currentStep, setCurrentStep] = useState(-1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedOrgId, setSubmittedOrgId] = useState<string | null>(null);


  useEffect(() => {
    if (!id) return;

    const loadOrganization = async () => {
      setIsLoading(true);
      try {
        const org = await getOrganizationById(id);
        if (!org) {
          toast.error("Organization not found");
          navigate("/org-submit");
          return;
        }

        setFormData({
          name: org.name,
          type: org.type,
          website: org.website || "",
          headquarters: org.headquarters,
          region: org.region,
          focusAreas: org.focusAreas,
          mission: org.mission,
          description: org.description,
          fundingType: org.fundingType,
          targetBeneficiaries: org.targetBeneficiaries || [],
          partnerHistory: org.partnerHistory || [],
          projects: org.projects || [],
          confirmation: false,
          userRole:
            org.type === "Foundation" || org.type === "CSR"
              ? "funder"
              : "ngo",
        });

        setCurrentStep(1);
      } catch (err) {
        toast.error("Failed to load organization");
        navigate("/org-submit");
      } finally {
        setIsLoading(false);
      }
    };

    loadOrganization();
  }, [id, navigate]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Toggle domain selection (max 3)
  const toggleDomain = (domain: string) => {
    setSelectedDomains((prev) => {
      if (prev.includes(domain)) {
        // Remove domain and clear its subareas from focusAreas
        const subareas = DOMAIN_SUBAREAS[domain].subareas;
        setFormData((f) => ({
          ...f,
          focusAreas: f.focusAreas.filter((a) => !subareas.includes(a)),
        }));
        return prev.filter((d) => d !== domain);
      }
      if (prev.length >= 3) return prev; // Max 3 domains
      return [...prev, domain];
    });
  };

  // Toggle subarea selection
  const toggleSubarea = (subarea: string) => {
    setFormData((prev) => ({
      ...prev,
      focusAreas: prev.focusAreas.includes(subarea)
        ? prev.focusAreas.filter((a) => a !== subarea)
        : [...prev.focusAreas, subarea],
    }));
  };

  // Step definitions
  const STEPS = [
    { num: 1, label: "Who you are" },
    { num: 2, label: "What you work on" },
    { num: 3, label: "Organization details" },
    { num: 4, label: "Review & submit" },
  ];

  const handleNext = () => setCurrentStep((s) => Math.min(s + 1, 4));
  const handlePrevious = () => setCurrentStep((s) => Math.max(s - 1, 1));


  const handleSubmit = async () => {
    if (!formData.confirmation) {
      toast.error("Please confirm before submitting");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        type: formData.type,
        website: formData.website,
        headquarters: formData.headquarters,
        region: formData.region,
        focusAreas: formData.focusAreas,
        mission: formData.mission,
        description: formData.description,
        fundingType: formData.fundingType,
      };

      const result =
        isEditMode && id
          ? await updateOrganization(id, payload)
          : await submitOrganization(payload);

      if (!result.success) throw new Error(result.error);

      toast.success(
        isEditMode
          ? "Organization updated successfully"
          : "Organization submitted successfully"
      );

      // For edit mode, redirect; for new submission, show confirmation
      if (isEditMode) {
        setTimeout(() => {
          navigate(`/organization/${id}`);
        }, 1500);
      } else {
        // Mark that user now has an organization profile
        useUserStore.getState().setHasOrganization(true);
        setSubmittedOrgId(result.organization?.id || null);
        setIsSubmitted(true);
      }
    } catch (err: any) {
      toast.error(err?.message || "Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="pt-28 pb-20 px-4">
        <div className="container mx-auto max-w-5xl">
          {isLoading ? (
            <div className="flex flex-col items-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">
                Loading organization data...
              </p>
            </div>
          ) : isSubmitted ? (
            /* Confirmation Screen */
            <div className="max-w-lg mx-auto text-center py-12">
              <div className="bg-card rounded-3xl p-10 border border-border shadow-lg">
                {/* Success icon */}
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="w-8 h-8 text-green-600" />
                </div>

                {/* Title */}
                <h1 className="text-2xl font-bold text-foreground mb-3">
                  Your organization is set up
                </h1>

                {/* Supporting text */}
                <p className="text-muted-foreground mb-8">
                  Your information is saved. We'll start finding relevant matches for you.
                </p>

                {/* Next steps */}
                <div className="text-left bg-muted/50 rounded-xl p-5 mb-8">
                  <p className="text-sm font-medium text-foreground mb-3">What happens next:</p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">✓</span>
                      We'll start identifying relevant matches
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">✓</span>
                      You'll see matching organizations in your dashboard
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">✓</span>
                      You can edit your organization anytime
                    </li>
                  </ul>
                </div>

                {/* CTAs */}
                <div className="space-y-3">
                  <Link
                    to="/search"
                    className="block w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold text-lg hover:bg-primary/90 transition-colors"
                  >
                    View matching organizations
                  </Link>
                  <Link
                    to={submittedOrgId ? `/organization/${submittedOrgId}/edit` : "/org-submit"}
                    className="block w-full py-3 border border-border text-foreground rounded-xl font-medium hover:bg-muted/50 transition-colors"
                  >
                    Edit organization details
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <>
              <Link
                to={isEditMode ? `/organization/${id}` : "/home"}
                className="inline-flex items-center gap-2 mb-8 text-slate-600 hover:text-primary"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Link>

              {currentStep === -1 && (
                <div className="max-w-lg mx-auto text-center py-12">
                  <div className="bg-card rounded-3xl p-10 border border-border shadow-lg">
                    {/* Friendly wave */}
                    <div className="text-5xl mb-6">👋</div>

                    {/* Title */}
                    <h1 className="text-3xl font-bold text-foreground mb-4">
                      Start your search
                    </h1>

                    {/* Explanation */}
                    <p className="text-muted-foreground mb-8">
                      Answer a few questions to see matched organizations.
                    </p>

                    {/* What we'll ask - bullet points */}
                    <div className="text-left bg-muted/50 rounded-xl p-6 mb-8">
                      <p className="text-sm font-medium text-foreground mb-4">We'll ask about:</p>
                      <ul className="space-y-3 text-sm text-muted-foreground">
                        <li className="flex items-center gap-3">
                          <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                          Organization basics
                        </li>
                        <li className="flex items-center gap-3">
                          <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                          Focus areas
                        </li>
                        <li className="flex items-center gap-3">
                          <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                          Location
                        </li>
                        <li className="flex items-center gap-3">
                          <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                          Verification details
                        </li>
                      </ul>
                    </div>

                    {/* Time estimate */}
                    <p className="text-sm text-muted-foreground mb-8">
                      ⏱️ Takes about 2–3 minutes
                    </p>

                    {/* Start button */}
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold text-lg hover:bg-primary/90 transition-colors shadow-lg"
                    >
                      Start setup
                    </button>
                  </div>
                </div>
              )}

              {currentStep >= 1 && (
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  {/* Section Header */}
                  <div className="mb-8">
                    <h1 className="text-2xl font-bold text-foreground">
                      {isEditMode ? "Edit Organization" : "Set up your organization"}
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                      Tell us about your organization so we can find the right matches.
                    </p>
                  </div>

                  {/* Step Indicator */}
                  <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
                    {STEPS.map((step, idx) => (
                      <div
                        key={step.num}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap ${currentStep === step.num
                          ? "bg-primary/10 text-primary font-semibold"
                          : currentStep > step.num
                            ? "text-green-600"
                            : "text-muted-foreground"
                          }`}
                      >
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${currentStep === step.num
                          ? "bg-primary text-white"
                          : currentStep > step.num
                            ? "bg-green-500 text-white"
                            : "bg-muted text-muted-foreground"
                          }`}>
                          {currentStep > step.num ? <Check className="w-3 h-3" /> : step.num}
                        </span>
                        <span className="hidden sm:inline">{step.label}</span>
                        {idx < STEPS.length - 1 && (
                          <span className="text-muted-foreground/30 ml-2">→</span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Progress reassurance */}
                  <p className="text-xs text-muted-foreground mb-6">
                    You can edit this anytime after submitting.
                  </p>

                  {/* Step 1: Who you are */}
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-lg font-semibold">Are you an NGO or a Funder?</h2>
                        <p className="text-sm text-muted-foreground mt-1">This helps us show you the most relevant matches.</p>
                      </div>
                      <div className="grid md:grid-cols-2 gap-6">

                        <button
                          onClick={() =>
                            handleInputChange("userRole", "ngo")
                          }
                          className={`p-6 border-2 rounded-xl transition-all ${formData.userRole === "ngo"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                            }`}
                        >
                          <div className="text-3xl mb-2">🏢</div>
                          <div className="font-bold">NGO</div>
                          <p className="text-sm text-muted-foreground mt-1">Looking for partners & funding</p>
                          {formData.userRole === "ngo" && (
                            <div className="mt-3 text-primary text-sm font-medium flex items-center justify-center gap-1">
                              <Check className="w-4 h-4" /> Selected
                            </div>
                          )}
                        </button>
                        <button
                          onClick={() =>
                            handleInputChange("userRole", "funder")
                          }
                          className={`p-6 border-2 rounded-xl transition-all ${formData.userRole === "funder"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                            }`}
                        >
                          <div className="text-3xl mb-2">💰</div>
                          <div className="font-bold">Funder</div>
                          <p className="text-sm text-muted-foreground mt-1">Looking for NGOs to support</p>
                          {formData.userRole === "funder" && (
                            <div className="mt-3 text-primary text-sm font-medium flex items-center justify-center gap-1">
                              <Check className="w-4 h-4" /> Selected
                            </div>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Focus Areas - Two-level guided selection */}
                  {currentStep === 2 && (
                    <div className="space-y-8">
                      {/* Step header */}
                      <div>
                        <h2 className="text-lg font-semibold mb-1">
                          What areas does your organization work in?
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          This is the most important factor for matching. Choose up to 3 domains.
                        </p>
                      </div>

                      {/* Domain Cards Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {Object.entries(DOMAIN_SUBAREAS).map(([key, domain]) => {
                          const Icon = domain.icon;
                          const isSelected = selectedDomains.includes(key);
                          const isDisabled = !isSelected && selectedDomains.length >= 3;

                          return (
                            <button
                              key={key}
                              onClick={() => toggleDomain(key)}
                              disabled={isDisabled}
                              className={`p-5 rounded-xl border-2 text-left transition-all ${isSelected
                                ? "border-primary bg-primary/5"
                                : isDisabled
                                  ? "border-border opacity-50 cursor-not-allowed"
                                  : "border-border hover:border-primary/50 hover:bg-muted/30"
                                }`}
                            >
                              <Icon className={`w-6 h-6 mb-3 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                              <p className={`font-semibold text-sm ${isSelected ? "text-primary" : "text-foreground"}`}>
                                {domain.label}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {domain.helper}
                              </p>
                              {isSelected && (
                                <div className="mt-2 text-primary text-xs flex items-center gap-1">
                                  <Check className="w-3 h-3" /> Selected
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Max selection hint */}
                      {selectedDomains.length >= 3 && (
                        <p className="text-sm text-muted-foreground text-center">
                          ✓ You can choose up to 3
                        </p>
                      )}

                      {/* Sub-areas section - only show if domains selected */}
                      {selectedDomains.length > 0 && (
                        <div className="space-y-6 pt-6 border-t border-border">
                          <p className="text-sm font-medium text-foreground">
                            Be more specific (this improves matching accuracy)
                          </p>

                          {selectedDomains.map((domainKey) => {
                            const domain = DOMAIN_SUBAREAS[domainKey];
                            return (
                              <div key={domainKey} className="space-y-3">
                                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                  {domain.label}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {domain.subareas.map((subarea) => {
                                    const isSelected = formData.focusAreas.includes(subarea);
                                    return (
                                      <button
                                        key={subarea}
                                        onClick={() => toggleSubarea(subarea)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${isSelected
                                          ? "bg-primary text-primary-foreground"
                                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                                          }`}
                                      >
                                        {subarea}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Validation hint */}
                      {selectedDomains.length > 0 && formData.focusAreas.length === 0 && (
                        <p className="text-sm text-amber-600 text-center">
                          Select at least one specific area to continue
                        </p>
                      )}
                    </div>
                  )}

                  {/* Step 3: Organization Details */}
                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-lg font-semibold mb-1">Tell us a bit more about your organization</h2>
                        <p className="text-sm text-muted-foreground">This information helps partners understand who you are.</p>
                      </div>

                      {/* Organization Name */}
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          What's your organization called?
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          placeholder="e.g., Green Earth Foundation"
                          className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Use your official registered name.</p>
                      </div>

                      {/* Headquarters */}
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Where are you based?
                        </label>
                        <input
                          type="text"
                          value={formData.headquarters}
                          onChange={(e) => handleInputChange("headquarters", e.target.value)}
                          placeholder="e.g., Mumbai, Maharashtra"
                          className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>

                      {/* Website */}
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Website <span className="text-muted-foreground font-normal">(optional)</span>
                        </label>
                        <input
                          type="url"
                          value={formData.website}
                          onChange={(e) => handleInputChange("website", e.target.value)}
                          placeholder="https://yourorg.org"
                          className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>

                      {/* Mission / Description */}
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          In a sentence, what do you do?
                        </label>
                        <textarea
                          value={formData.mission}
                          onChange={(e) => handleInputChange("mission", e.target.value)}
                          placeholder="e.g., We provide clean water access to rural communities in Western India."
                          rows={3}
                          className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Keep it short — this appears in your profile.</p>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Review & Submit */}
                  {currentStep === 4 && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-lg font-semibold mb-1">Submit organization for matching</h2>
                        <p className="text-sm text-muted-foreground">Review your details and submit to start finding partners.</p>
                      </div>

                      {/* Summary */}
                      <div className="bg-muted/50 rounded-xl p-6 space-y-4">
                        <div className="flex justify-between border-b border-border pb-3">
                          <span className="text-muted-foreground text-sm">Organization</span>
                          <span className="font-medium text-sm">{formData.name || "—"}</span>
                        </div>
                        <div className="flex justify-between border-b border-border pb-3">
                          <span className="text-muted-foreground text-sm">Type</span>
                          <span className="font-medium text-sm">{formData.userRole === "funder" ? "Funder" : "NGO"}</span>
                        </div>
                        <div className="flex justify-between border-b border-border pb-3">
                          <span className="text-muted-foreground text-sm">Location</span>
                          <span className="font-medium text-sm">{formData.headquarters || "—"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground text-sm">Focus areas</span>
                          <span className="font-medium text-sm">{formData.focusAreas.length} selected</span>
                        </div>
                      </div>

                      {/* Confirmation checkbox */}
                      <label className="flex items-start gap-3 p-4 bg-muted/30 rounded-xl cursor-pointer hover:bg-muted/50 transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.confirmation}
                          onChange={(e) => handleInputChange("confirmation", e.target.checked)}
                          className="w-5 h-5 rounded border-border mt-0.5"
                        />
                        <span className="text-sm text-foreground">
                          I confirm the information is accurate and I agree to the terms.
                        </span>
                      </label>
                    </div>
                  )}

                  {/* Matching Summary - Only show during steps 1-3 */}
                  {currentStep >= 1 && currentStep <= 3 && (
                    <div className="mt-8 p-5 bg-muted/30 rounded-xl border border-border">
                      <p className="text-sm font-medium text-foreground mb-3">
                        We'll use this to find matches
                      </p>
                      <div className="text-sm text-muted-foreground space-y-2">
                        {/* Show what we know so far */}
                        {formData.userRole || formData.focusAreas.length > 0 || formData.headquarters ? (
                          <>
                            <p className="text-xs text-muted-foreground/80 mb-2">Based on your inputs, we'll look for:</p>
                            <ul className="space-y-1.5 text-sm">
                              {formData.userRole && (
                                <li className="flex items-start gap-2">
                                  <span className="text-primary mt-0.5">–</span>
                                  <span>
                                    {formData.userRole === "ngo"
                                      ? "Funders & partners interested in supporting NGOs"
                                      : "NGOs seeking funding & collaboration"}
                                  </span>
                                </li>
                              )}
                              {formData.focusAreas.length > 0 && (
                                <li className="flex items-start gap-2">
                                  <span className="text-primary mt-0.5">–</span>
                                  <span>
                                    Organizations working in {formData.focusAreas.slice(0, 2).join(" & ")}
                                    {formData.focusAreas.length > 2 && ` +${formData.focusAreas.length - 2} more`}
                                  </span>
                                </li>
                              )}
                              {formData.headquarters && (
                                <li className="flex items-start gap-2">
                                  <span className="text-primary mt-0.5">–</span>
                                  <span>Partners active in or near {formData.headquarters}</span>
                                </li>
                              )}
                            </ul>
                          </>
                        ) : (
                          <p className="text-muted-foreground/70 italic">
                            Add your details to see how we'll match you.
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between mt-10 pt-6 border-t border-border">

                    <button
                      onClick={handlePrevious}
                      disabled={currentStep === 1}
                      className="px-6 py-3 border border-border rounded-xl text-foreground hover:bg-muted/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>

                    {currentStep < 4 ? (
                      <button
                        onClick={handleNext}
                        className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors"
                      >
                        {currentStep === 3 ? "Review" : "Continue"}
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !formData.confirmation}
                        className="px-8 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? "Submitting..." : "Submit organization"}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
