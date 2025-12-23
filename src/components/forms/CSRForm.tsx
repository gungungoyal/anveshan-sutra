"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    Building2, MapPin, Mail, Users,
    Target, CheckCircle, ArrowRight, ArrowLeft,
    DollarSign, FileCheck, Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// Options for dropdowns and multi-selects
const industries = [
    "Manufacturing",
    "IT / Technology",
    "FMCG",
    "Automotive",
    "Energy",
    "Infrastructure",
    "BFSI",
    "Pharma / Healthcare",
    "Other"
];

const csrContactRoles = [
    "CSR Head",
    "CSR Manager",
    "CSR Officer",
    "Foundation Representative"
];

const csrFocusAreas = [
    "Education",
    "Health",
    "Skill Development",
    "Livelihood",
    "Women & Child Welfare",
    "Environment / Sustainability",
    "Rural Development",
    "Digital Inclusion"
];

const geographyPreferences = [
    "Pan India",
    "State Level",
    "District Level"
];

const indianStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
    "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
    "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "All States"
];

const complianceRequirements = [
    "12A Registration",
    "80G Registration",
    "CSR-1 Registration",
    "Minimum 3 years of operations"
];

const engagementTypes = [
    "One-time project",
    "Long-term partnership",
    "Pilot / Proof of Concept",
    "Employee volunteering"
];

const budgetRanges = [
    "₹5–10 Lakhs",
    "₹10–25 Lakhs",
    "₹25–50 Lakhs",
    "₹50 Lakhs+"
];

const csrPlatformExpectations = [
    "Shortlisted NGOs only",
    "Compliance-ready NGO profiles",
    "Impact reporting support",
    "Draft MoU / Agreement templates",
    "Due diligence checklist"
];

const pointOfContactRoles = [
    "CSR Manager",
    "Foundation Lead",
    "Program Officer",
    "Other"
];

interface CSRFormProps {
    onSubmit: (data: CSRFormData) => Promise<void>;
    isSubmitting: boolean;
}

export interface CSRFormData {
    companyName: string;
    industry: string;
    csrContactRole: string;
    csrEmail: string;
    csrFocusAreas: string[];
    geographyPreference: string;
    preferredStates: string[];
    complianceRequirements: string[];
    engagementTypes: string[];
    budgetRange: string;
    requiresPastExperience: boolean;
    platformExpectations: string[];
    contactPersonRole: string;
    contactEmail: string;
}

type FormStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export default function CSRForm({ onSubmit, isSubmitting }: CSRFormProps) {
    const [step, setStep] = useState<FormStep>(1);
    const [formData, setFormData] = useState<CSRFormData>({
        companyName: "",
        industry: "",
        csrContactRole: "",
        csrEmail: "",
        csrFocusAreas: [],
        geographyPreference: "",
        preferredStates: [],
        complianceRequirements: [],
        engagementTypes: [],
        budgetRange: "",
        requiresPastExperience: false,
        platformExpectations: [],
        contactPersonRole: "",
        contactEmail: "",
    });

    const totalSteps = 9;
    const stepProgress = (step / totalSteps) * 100;

    const toggleArrayItem = (field: keyof CSRFormData, item: string) => {
        const currentArray = formData[field] as string[];
        if (currentArray.includes(item)) {
            setFormData({ ...formData, [field]: currentArray.filter(i => i !== item) });
        } else {
            setFormData({ ...formData, [field]: [...currentArray, item] });
        }
    };

    const handleSubmit = async () => {
        await onSubmit(formData);
    };

    const nextStep = () => setStep(prev => Math.min(prev + 1, 9) as FormStep);
    const prevStep = () => setStep(prev => Math.max(prev - 1, 1) as FormStep);

    const renderMultiSelect = (
        options: string[],
        selected: string[],
        field: keyof CSRFormData
    ) => (
        <div className="flex flex-wrap gap-2">
            {options.map((option) => (
                <button
                    key={option}
                    type="button"
                    onClick={() => toggleArrayItem(field, option)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selected.includes(option)
                        ? "bg-orange-500 text-white"
                        : "bg-muted text-foreground hover:bg-orange-100 dark:hover:bg-orange-900/30"
                        }`}
                >
                    {option}
                </button>
            ))}
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Progress Header */}
            <div className="mb-6">
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                    <span>Step {step} of {totalSteps}</span>
                    <span>{Math.round(stepProgress)}% Complete</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-orange-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${stepProgress}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
            </div>

            {/* Step 1: Organization Details */}
            {step === 1 && (
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground">Organization Details</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="companyName">Company Name *</Label>
                            <Input
                                id="companyName"
                                value={formData.companyName}
                                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                placeholder="Enter company name"
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label>Industry *</Label>
                            <Select
                                value={formData.industry}
                                onValueChange={(value) => setFormData({ ...formData, industry: value })}
                            >
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select industry" />
                                </SelectTrigger>
                                <SelectContent>
                                    {industries.map((industry) => (
                                        <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>CSR Contact Role *</Label>
                            <Select
                                value={formData.csrContactRole}
                                onValueChange={(value) => setFormData({ ...formData, csrContactRole: value })}
                            >
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {csrContactRoles.map((role) => (
                                        <SelectItem key={role} value={role}>{role}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="csrEmail">Official CSR Email ID *</Label>
                            <Input
                                id="csrEmail"
                                type="email"
                                value={formData.csrEmail}
                                onChange={(e) => setFormData({ ...formData, csrEmail: e.target.value })}
                                placeholder="csr@company.com"
                                className="mt-1"
                            />
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Step 2: CSR Focus Areas */}
            {step === 2 && (
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center">
                            <Target className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground">CSR Focus Areas</h2>
                    </div>

                    <div>
                        <Label className="mb-3 block">Primary CSR Focus Areas *</Label>
                        {renderMultiSelect(csrFocusAreas, formData.csrFocusAreas, 'csrFocusAreas')}
                    </div>
                </motion.div>
            )}

            {/* Step 3: Geography of Intervention */}
            {step === 3 && (
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground">Geography of Intervention</h2>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <Label>Preferred Geography for CSR Projects *</Label>
                            <Select
                                value={formData.geographyPreference}
                                onValueChange={(value) => setFormData({ ...formData, geographyPreference: value })}
                            >
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select preference" />
                                </SelectTrigger>
                                <SelectContent>
                                    {geographyPreferences.map((pref) => (
                                        <SelectItem key={pref} value={pref}>{pref}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {formData.geographyPreference && formData.geographyPreference !== "Pan India" && (
                            <div>
                                <Label className="mb-3 block">Preferred States / Regions (optional)</Label>
                                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 border rounded-lg">
                                    {indianStates.map((state) => (
                                        <button
                                            key={state}
                                            type="button"
                                            onClick={() => toggleArrayItem('preferredStates', state)}
                                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${formData.preferredStates.includes(state)
                                                ? "bg-orange-500 text-white"
                                                : "bg-muted text-foreground hover:bg-orange-100 dark:hover:bg-orange-900/30"
                                                }`}
                                        >
                                            {state}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}

            {/* Step 4: Compliance Requirements */}
            {step === 4 && (
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center">
                            <FileCheck className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground">Compliance Requirements</h2>
                    </div>

                    <div>
                        <Label className="mb-3 block">Mandatory NGO Compliance Criteria *</Label>
                        {renderMultiSelect(complianceRequirements, formData.complianceRequirements, 'complianceRequirements')}
                    </div>
                </motion.div>
            )}

            {/* Step 5: Engagement Type */}
            {step === 5 && (
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center">
                            <Briefcase className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground">Engagement Type</h2>
                    </div>

                    <div>
                        <Label className="mb-3 block">Preferred Type of Engagement *</Label>
                        {renderMultiSelect(engagementTypes, formData.engagementTypes, 'engagementTypes')}
                    </div>
                </motion.div>
            )}

            {/* Step 6: Budget Range */}
            {step === 6 && (
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground">Budget Range (Annual)</h2>
                    </div>

                    <div>
                        <Label>Indicative CSR Budget per Project *</Label>
                        <Select
                            value={formData.budgetRange}
                            onValueChange={(value) => setFormData({ ...formData, budgetRange: value })}
                        >
                            <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select budget range" />
                            </SelectTrigger>
                            <SelectContent>
                                {budgetRanges.map((range) => (
                                    <SelectItem key={range} value={range}>{range}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </motion.div>
            )}

            {/* Step 7: Experience Preference */}
            {step === 7 && (
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground">Experience Preference</h2>
                    </div>

                    <div>
                        <Label className="mb-3 block">Past CSR Experience Required? *</Label>
                        <div className="flex gap-4">
                            {[{ value: true, label: "Yes" }, { value: false, label: "No" }].map((option) => (
                                <button
                                    key={option.label}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, requiresPastExperience: option.value })}
                                    className={`flex-1 py-3 px-4 rounded-xl border-2 font-medium transition-all ${formData.requiresPastExperience === option.value
                                        ? "border-orange-500 bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300"
                                        : "border-border hover:border-orange-300"
                                        }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Step 8: Expectations from Platform */}
            {step === 8 && (
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center">
                            <Target className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground">Expectations from Platform</h2>
                    </div>

                    <div>
                        <Label className="mb-3 block">What Do You Want From Drivya? *</Label>
                        {renderMultiSelect(csrPlatformExpectations, formData.platformExpectations, 'platformExpectations')}
                    </div>
                </motion.div>
            )}

            {/* Step 9: Contact Details */}
            {step === 9 && (
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center">
                            <Mail className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground">Contact Details</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <Label>Primary Point of Contact Role *</Label>
                            <Select
                                value={formData.contactPersonRole}
                                onValueChange={(value) => setFormData({ ...formData, contactPersonRole: value })}
                            >
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {pointOfContactRoles.map((role) => (
                                        <SelectItem key={role} value={role}>{role}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="contactEmail">Official Contact Email *</Label>
                            <Input
                                id="contactEmail"
                                type="email"
                                value={formData.contactEmail}
                                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                                placeholder="contact@company.com"
                                className="mt-1"
                            />
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Navigation */}
            <div className="flex gap-4 pt-4">
                {step > 1 && (
                    <Button
                        variant="outline"
                        onClick={prevStep}
                        className="flex-1"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                )}
                {step < 9 ? (
                    <Button
                        onClick={nextStep}
                        className="flex-1 bg-orange-500 hover:bg-orange-600"
                    >
                        Continue
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                ) : (
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex-1 bg-orange-500 hover:bg-orange-600"
                    >
                        {isSubmitting ? "Submitting..." : "Submit CSR Preferences"}
                        {!isSubmitting && <ArrowRight className="w-4 h-4 ml-2" />}
                    </Button>
                )}
            </div>
        </div>
    );
}
