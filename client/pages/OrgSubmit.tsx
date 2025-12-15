import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Upload, Check, Loader2, Edit3 } from "lucide-react";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleNext = () => setCurrentStep((s) => Math.min(s + 1, 4));
  const handlePrevious = () => setCurrentStep((s) => Math.max(s - 1, 0));

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

      setTimeout(() => {
        navigate(isEditMode ? `/organization/${id}` : "/dashboard");
      }, 1500);
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
                  <div className="bg-white rounded-3xl p-10 shadow-lg">
                    <h1 className="text-3xl font-bold mb-4">
                      Let’s set up your organization
                    </h1>
                    <p className="text-muted-foreground mb-8">
                      Takes about 2–3 minutes
                    </p>
                    <button
                      onClick={() => setCurrentStep(0)}
                      className="w-full py-4 bg-primary text-white rounded-xl font-bold"
                    >
                      Start setup
                    </button>
                  </div>
                </div>
              )}

              {currentStep >= 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h1 className="text-2xl font-bold mb-6">
                    {isEditMode ? "Edit Organization" : "Add Organization"}
                  </h1>

                  {currentStep === 0 && (
                    <div className="grid md:grid-cols-2 gap-6">
                      <button
                        onClick={() =>
                          handleInputChange("userRole", "ngo")
                        }
                        className="p-6 border rounded-xl hover:border-primary"
                      >
                        NGO
                      </button>
                      <button
                        onClick={() =>
                          handleInputChange("userRole", "funder")
                        }
                        className="p-6 border rounded-xl hover:border-primary"
                      >
                        Funder
                      </button>
                    </div>
                  )}

                  {currentStep === 4 && (
                    <label className="flex items-center gap-3 mt-6">
                      <input
                        type="checkbox"
                        checked={formData.confirmation}
                        onChange={(e) =>
                          handleInputChange(
                            "confirmation",
                            e.target.checked
                          )
                        }
                      />
                      <span className="text-sm">
                        I confirm the information is accurate
                      </span>
                    </label>
                  )}

                  <div className="flex justify-between mt-10">
                    <button
                      onClick={handlePrevious}
                      disabled={currentStep === 0}
                      className="px-6 py-3 border rounded-xl"
                    >
                      Previous
                    </button>

                    {currentStep < 4 ? (
                      <button
                        onClick={handleNext}
                        className="px-6 py-3 bg-primary text-white rounded-xl"
                      >
                        Continue
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="px-6 py-3 bg-green-600 text-white rounded-xl"
                      >
                        {isSubmitting ? "Submitting..." : "Submit"}
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
