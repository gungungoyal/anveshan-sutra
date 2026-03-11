"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { upsertProjectExpectation } from "@/lib/services/projectExpectations";

const beneficiaryRangeOptions = [
    { value: "100-500", label: "100-500" },
    { value: "500-2000", label: "500-2,000" },
    { value: "2000-10000", label: "2,000-10,000" },
    { value: "10000+", label: "10,000+" },
];

const timelineOptions = [
    { value: "3-6", label: "3-6 months" },
    { value: "6-12", label: "6-12 months" },
    { value: "12-24", label: "12-24 months" },
    { value: "24+", label: "24+ months" },
];

const geographyTypeOptions = [
    { value: "urban", label: "Urban" },
    { value: "rural", label: "Rural" },
    { value: "tribal", label: "Tribal" },
    { value: "remote", label: "Remote" },
];

const geographySpreadOptions = [
    { value: "single-district", label: "Single district" },
    { value: "multi-district", label: "Multi-district" },
    { value: "multi-state", label: "Multi-state" },
];

const reportingIntensityOptions = [
    { value: "simple", label: "Simple (basic reporting)" },
    { value: "moderate", label: "Moderate (monthly reporting)" },
    { value: "heavy", label: "Heavy (strict CSR compliance, audits, dashboards)" },
];

const programNatureOptions = [
    { value: "education", label: "Education" },
    { value: "health", label: "Health" },
    { value: "livelihood", label: "Livelihood" },
    { value: "environment", label: "Environment" },
    { value: "mixed", label: "Mixed" },
];

export default function ProjectSetupPage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [beneficiaryRange, setBeneficiaryRange] = useState("");
    const [timelineMonths, setTimelineMonths] = useState("");
    const [geographyType, setGeographyType] = useState("");
    const [geographySpread, setGeographySpread] = useState("");
    const [reportingIntensity, setReportingIntensity] = useState("");
    const [onGroundPresence, setOnGroundPresence] = useState("");
    const [programNature, setProgramNature] = useState("");

    const isFormValid =
        beneficiaryRange &&
        timelineMonths &&
        geographyType &&
        geographySpread &&
        reportingIntensity &&
        onGroundPresence &&
        programNature;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isFormValid) {
            toast.error("Please fill in all fields");
            return;
        }

        if (!user?.id) {
            toast.error("User not found");
            return;
        }

        setIsSubmitting(true);

        try {
            const projectSetupPayload = {
                beneficiaryRange,
                timelineMonths,
                geographyType,
                geographySpread,
                reportingIntensity,
                onGroundPresence,
                programNature,
            };

            await upsertProjectExpectation(user.id, projectSetupPayload);

            localStorage.setItem("projectSetupCompleted", "true");
            localStorage.setItem(`projectSetupCompleted_${user.id}`, "true");
            localStorage.setItem(
                `csr_project_setup_${user.id}`,
                JSON.stringify(projectSetupPayload),
            );

            toast.success("Project expectations saved!");
            router.push("/dashboard");
        } catch (error) {
            console.error("Failed to save project expectations:", error);
            toast.error("Failed to save. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!isAuthenticated) {
        router.push("/auth?returnTo=/project/setup");
        return null;
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />

            <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-foreground">
                        Define Your Project Expectations
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        This helps us evaluate NGOs realistically.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="beneficiary-range" className="text-sm font-medium">
                            Beneficiary Range
                        </Label>
                        <Select value={beneficiaryRange} onValueChange={setBeneficiaryRange}>
                            <SelectTrigger id="beneficiary-range" className="h-12 rounded-xl">
                                <SelectValue placeholder="Select beneficiary range" />
                            </SelectTrigger>
                            <SelectContent>
                                {beneficiaryRangeOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="timeline-months" className="text-sm font-medium">
                            Timeline
                        </Label>
                        <Select value={timelineMonths} onValueChange={setTimelineMonths}>
                            <SelectTrigger id="timeline-months" className="h-12 rounded-xl">
                                <SelectValue placeholder="Select timeline" />
                            </SelectTrigger>
                            <SelectContent>
                                {timelineOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="geography-type" className="text-sm font-medium">
                            Geography Type
                        </Label>
                        <Select value={geographyType} onValueChange={setGeographyType}>
                            <SelectTrigger id="geography-type" className="h-12 rounded-xl">
                                <SelectValue placeholder="Select geography type" />
                            </SelectTrigger>
                            <SelectContent>
                                {geographyTypeOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="geography-spread" className="text-sm font-medium">
                            Geography Spread
                        </Label>
                        <Select value={geographySpread} onValueChange={setGeographySpread}>
                            <SelectTrigger id="geography-spread" className="h-12 rounded-xl">
                                <SelectValue placeholder="Select geography spread" />
                            </SelectTrigger>
                            <SelectContent>
                                {geographySpreadOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="reporting-intensity" className="text-sm font-medium">
                            Reporting Intensity
                        </Label>
                        <Select value={reportingIntensity} onValueChange={setReportingIntensity}>
                            <SelectTrigger id="reporting-intensity" className="h-12 rounded-xl">
                                <SelectValue placeholder="Select reporting intensity" />
                            </SelectTrigger>
                            <SelectContent>
                                {reportingIntensityOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="on-ground-presence" className="text-sm font-medium block">
                            On-Ground Presence Required
                        </Label>
                        <div
                            id="on-ground-presence"
                            className="h-12 rounded-xl border border-input p-1 grid grid-cols-2 gap-1"
                        >
                            <button
                                type="button"
                                onClick={() => setOnGroundPresence("yes")}
                                className={`rounded-lg text-sm transition-colors ${onGroundPresence === "yes"
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                    }`}
                            >
                                Yes
                            </button>
                            <button
                                type="button"
                                onClick={() => setOnGroundPresence("no")}
                                className={`rounded-lg text-sm transition-colors ${onGroundPresence === "no"
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                    }`}
                            >
                                No
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="program-nature" className="text-sm font-medium">
                            Program Nature
                        </Label>
                        <Select value={programNature} onValueChange={setProgramNature}>
                            <SelectTrigger id="program-nature" className="h-12 rounded-xl">
                                <SelectValue placeholder="Select program nature" />
                            </SelectTrigger>
                            <SelectContent>
                                {programNatureOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Button
                        type="submit"
                        size="lg"
                        className="w-full"
                        disabled={isSubmitting || !isFormValid}
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            "Save & Continue"
                        )}
                    </Button>
                </form>
            </main>

            <Footer />
        </div>
    );
}
