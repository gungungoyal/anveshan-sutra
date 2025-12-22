"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Building2, Heart, Rocket, MapPin, Globe, Mail, Phone, Users,
    Target, DollarSign, CheckCircle, ArrowRight, ArrowLeft, Sparkles,
    FileText, Calendar, Award, Briefcase, TrendingUp
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useUserStore } from "@/lib/stores/userStore";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const focusAreas = [
    "Education", "Healthcare", "Environment", "Women Empowerment",
    "Rural Development", "Child Welfare", "Skill Development",
    "Livelihood", "Disability", "Elderly Care", "Sanitation",
    "Water Conservation", "Agriculture", "Technology", "Arts & Culture"
];

const regions = [
    "Pan India", "North India", "South India", "East India",
    "West India", "Central India", "Northeast India"
];

const fundingTypes = [
    { value: "grant", label: "Grant Funding" },
    { value: "csr", label: "CSR Funding" },
    { value: "impact_investment", label: "Impact Investment" },
    { value: "donation", label: "Donations" },
    { value: "self_funded", label: "Self-Funded" }
];

const orgSizes = [
    { value: "startup", label: "Startup (1-10)" },
    { value: "small", label: "Small (11-50)" },
    { value: "medium", label: "Medium (51-200)" },
    { value: "large", label: "Large (200+)" }
];

type FormStep = 1 | 2 | 3;

export default function OrgSubmitPage() {
    const router = useRouter();
    const { isAuthenticated, user } = useAuth();
    const { role, setHasOrganization } = useUserStore();
    const [step, setStep] = useState<FormStep>(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        // Step 1: Basic Info
        name: "",
        email: "",
        phone: "",
        website: "",
        // Step 2: Organization Details
        mission: "",
        description: "",
        focusAreas: [] as string[],
        region: "",
        // Step 3: Additional Info
        fundingType: "",
        annualBudget: "",
        teamSize: "",
        yearEstablished: "",
        registrationNumber: "",
        // Role-specific
        csrBudget: "",
        portfolioSize: "",
        successStories: ""
    });

    const roleConfig = {
        ngo: {
            icon: Heart,
            color: "from-green-500 to-emerald-600",
            bgGradient: "from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20",
            title: "NGO Registration",
            subtitle: "Tell us about your organization to find aligned partners"
        },
        incubator: {
            icon: Rocket,
            color: "from-sky-500 to-blue-600",
            bgGradient: "from-sky-50 to-blue-50 dark:from-sky-950/20 dark:to-blue-950/20",
            title: "Incubator Profile",
            subtitle: "Share your incubator details to connect with NGOs and CSR teams"
        },
        csr: {
            icon: Building2,
            color: "from-orange-500 to-amber-600",
            bgGradient: "from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20",
            title: "CSR Team Setup",
            subtitle: "Set up your CSR profile to discover verified NGOs"
        }
    };

    const currentRole = role || "ngo";
    const config = roleConfig[currentRole as keyof typeof roleConfig] || roleConfig.ngo;
    const Icon = config.icon;

    const handleInputChange = (field: string, value: string | string[]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const toggleFocusArea = (area: string) => {
        setFormData(prev => ({
            ...prev,
            focusAreas: prev.focusAreas.includes(area)
                ? prev.focusAreas.filter(a => a !== area)
                : [...prev.focusAreas, area]
        }));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            setHasOrganization(true);
            toast.success("Organization registered successfully!");
            router.push("/search");
        } catch (error) {
            toast.error("Failed to register organization. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const nextStep = () => setStep(prev => Math.min(prev + 1, 3) as FormStep);
    const prevStep = () => setStep(prev => Math.max(prev - 1, 1) as FormStep);

    const stepProgress = (step / 3) * 100;

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="container mx-auto px-4 py-8 max-w-4xl">
                {/* 3D Header Card */}
                <motion.div
                    initial={{ opacity: 0, y: -20, rotateX: -10 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{ duration: 0.6 }}
                    className="relative mb-8"
                    style={{ perspective: "1000px" }}
                >
                    <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${config.color} p-8 shadow-2xl`}>
                        {/* 3D Floating Elements */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-xl" />

                        <div className="relative flex items-center gap-6">
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: 0.3, type: "spring" }}
                                className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg"
                                style={{ transform: "translateZ(20px)" }}
                            >
                                <Icon className="w-10 h-10 text-white" />
                            </motion.div>
                            <div>
                                <h1 className="text-3xl font-bold text-white mb-2">{config.title}</h1>
                                <p className="text-white/80">{config.subtitle}</p>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-8">
                            <div className="flex justify-between text-sm text-white/70 mb-2">
                                <span>Step {step} of 3</span>
                                <span>{Math.round(stepProgress)}% Complete</span>
                            </div>
                            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-white rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${stepProgress}%` }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* 3D Form Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className={`relative bg-gradient-to-br ${config.bgGradient} rounded-3xl border border-white/50 dark:border-white/10 shadow-xl overflow-hidden`}
                    style={{
                        boxShadow: "0 25px 50px -12px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.1) inset"
                    }}
                >
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-primary/5 to-transparent rounded-full blur-2xl" />

                    <div className="relative p-8">
                        <AnimatePresence mode="wait">
                            {/* Step 1: Basic Info */}
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center`}>
                                            <Building2 className="w-5 h-5 text-white" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-foreground">Basic Information</h2>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium flex items-center gap-2">
                                                <Building2 className="w-4 h-4" />
                                                Organization Name *
                                            </Label>
                                            <Input
                                                value={formData.name}
                                                onChange={(e) => handleInputChange("name", e.target.value)}
                                                placeholder="Enter organization name"
                                                className="h-12 rounded-xl border-2 focus:border-primary transition-all"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium flex items-center gap-2">
                                                <Mail className="w-4 h-4" />
                                                Email Address *
                                            </Label>
                                            <Input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => handleInputChange("email", e.target.value)}
                                                placeholder="contact@organization.org"
                                                className="h-12 rounded-xl border-2 focus:border-primary transition-all"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium flex items-center gap-2">
                                                <Phone className="w-4 h-4" />
                                                Phone Number
                                            </Label>
                                            <Input
                                                value={formData.phone}
                                                onChange={(e) => handleInputChange("phone", e.target.value)}
                                                placeholder="+91 XXXXX XXXXX"
                                                className="h-12 rounded-xl border-2 focus:border-primary transition-all"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium flex items-center gap-2">
                                                <Globe className="w-4 h-4" />
                                                Website
                                            </Label>
                                            <Input
                                                value={formData.website}
                                                onChange={(e) => handleInputChange("website", e.target.value)}
                                                placeholder="https://www.organization.org"
                                                className="h-12 rounded-xl border-2 focus:border-primary transition-all"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 2: Organization Details */}
                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center`}>
                                            <Target className="w-5 h-5 text-white" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-foreground">Mission & Focus</h2>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium flex items-center gap-2">
                                                <Sparkles className="w-4 h-4" />
                                                Mission Statement *
                                            </Label>
                                            <Textarea
                                                value={formData.mission}
                                                onChange={(e) => handleInputChange("mission", e.target.value)}
                                                placeholder="Describe your organization's mission in 2-3 sentences..."
                                                className="min-h-[100px] rounded-xl border-2 focus:border-primary transition-all resize-none"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium flex items-center gap-2">
                                                <FileText className="w-4 h-4" />
                                                Description
                                            </Label>
                                            <Textarea
                                                value={formData.description}
                                                onChange={(e) => handleInputChange("description", e.target.value)}
                                                placeholder="Tell us more about your organization, programs, and impact..."
                                                className="min-h-[120px] rounded-xl border-2 focus:border-primary transition-all resize-none"
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <Label className="text-sm font-medium flex items-center gap-2">
                                                <Target className="w-4 h-4" />
                                                Focus Areas * (Select all that apply)
                                            </Label>
                                            <div className="flex flex-wrap gap-2">
                                                {focusAreas.map((area) => (
                                                    <motion.button
                                                        key={area}
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => toggleFocusArea(area)}
                                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${formData.focusAreas.includes(area)
                                                                ? `bg-gradient-to-r ${config.color} text-white shadow-lg`
                                                                : "bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-primary"
                                                            }`}
                                                    >
                                                        {formData.focusAreas.includes(area) && (
                                                            <CheckCircle className="w-4 h-4 inline mr-1" />
                                                        )}
                                                        {area}
                                                    </motion.button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium flex items-center gap-2">
                                                <MapPin className="w-4 h-4" />
                                                Operating Region *
                                            </Label>
                                            <Select
                                                value={formData.region}
                                                onValueChange={(value) => handleInputChange("region", value)}
                                            >
                                                <SelectTrigger className="h-12 rounded-xl border-2">
                                                    <SelectValue placeholder="Select your primary region" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {regions.map((region) => (
                                                        <SelectItem key={region} value={region}>
                                                            {region}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 3: Additional Info */}
                            {step === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center`}>
                                            <Award className="w-5 h-5 text-white" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-foreground">Additional Details</h2>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                Year Established
                                            </Label>
                                            <Input
                                                type="number"
                                                value={formData.yearEstablished}
                                                onChange={(e) => handleInputChange("yearEstablished", e.target.value)}
                                                placeholder="e.g., 2010"
                                                className="h-12 rounded-xl border-2 focus:border-primary transition-all"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium flex items-center gap-2">
                                                <Users className="w-4 h-4" />
                                                Team Size
                                            </Label>
                                            <Select
                                                value={formData.teamSize}
                                                onValueChange={(value) => handleInputChange("teamSize", value)}
                                            >
                                                <SelectTrigger className="h-12 rounded-xl border-2">
                                                    <SelectValue placeholder="Select team size" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {orgSizes.map((size) => (
                                                        <SelectItem key={size.value} value={size.value}>
                                                            {size.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium flex items-center gap-2">
                                                <DollarSign className="w-4 h-4" />
                                                {currentRole === "csr" ? "Annual CSR Budget" : "Annual Budget"}
                                            </Label>
                                            <Select
                                                value={formData.annualBudget}
                                                onValueChange={(value) => handleInputChange("annualBudget", value)}
                                            >
                                                <SelectTrigger className="h-12 rounded-xl border-2">
                                                    <SelectValue placeholder="Select budget range" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="under_10l">Under ₹10 Lakhs</SelectItem>
                                                    <SelectItem value="10l_50l">₹10-50 Lakhs</SelectItem>
                                                    <SelectItem value="50l_1cr">₹50 Lakhs - 1 Crore</SelectItem>
                                                    <SelectItem value="1cr_5cr">₹1-5 Crores</SelectItem>
                                                    <SelectItem value="above_5cr">Above ₹5 Crores</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {currentRole !== "csr" && (
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium flex items-center gap-2">
                                                    <Briefcase className="w-4 h-4" />
                                                    Funding Type
                                                </Label>
                                                <Select
                                                    value={formData.fundingType}
                                                    onValueChange={(value) => handleInputChange("fundingType", value)}
                                                >
                                                    <SelectTrigger className="h-12 rounded-xl border-2">
                                                        <SelectValue placeholder="Primary funding source" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {fundingTypes.map((type) => (
                                                            <SelectItem key={type.value} value={type.value}>
                                                                {type.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}

                                        <div className="space-y-2 md:col-span-2">
                                            <Label className="text-sm font-medium flex items-center gap-2">
                                                <FileText className="w-4 h-4" />
                                                Registration Number (Optional)
                                            </Label>
                                            <Input
                                                value={formData.registrationNumber}
                                                onChange={(e) => handleInputChange("registrationNumber", e.target.value)}
                                                placeholder="NGO DARPAN ID / 12A / 80G Number"
                                                className="h-12 rounded-xl border-2 focus:border-primary transition-all"
                                            />
                                        </div>

                                        {currentRole === "incubator" && (
                                            <div className="space-y-2 md:col-span-2">
                                                <Label className="text-sm font-medium flex items-center gap-2">
                                                    <TrendingUp className="w-4 h-4" />
                                                    Portfolio Size (Organizations Supported)
                                                </Label>
                                                <Input
                                                    value={formData.portfolioSize}
                                                    onChange={(e) => handleInputChange("portfolioSize", e.target.value)}
                                                    placeholder="e.g., 25 startups, 10 NGOs"
                                                    className="h-12 rounded-xl border-2 focus:border-primary transition-all"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Navigation Buttons */}
                        <div className="flex justify-between mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <Button
                                variant="outline"
                                onClick={prevStep}
                                disabled={step === 1}
                                className="px-6 py-3 rounded-xl"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Previous
                            </Button>

                            {step < 3 ? (
                                <Button
                                    onClick={nextStep}
                                    className={`px-8 py-3 rounded-xl bg-gradient-to-r ${config.color} hover:opacity-90 text-white shadow-lg`}
                                >
                                    Continue
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className={`px-8 py-3 rounded-xl bg-gradient-to-r ${config.color} hover:opacity-90 text-white shadow-lg`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                                            />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="w-5 h-5 mr-2" />
                                            Complete Registration
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                </motion.div>
            </main>

            <Footer />
        </div>
    );
}
