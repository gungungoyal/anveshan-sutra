"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    Rocket, MapPin, Globe, Mail, Users,
    Target, CheckCircle, ArrowRight, ArrowLeft,
    GraduationCap, Building2, Briefcase, DollarSign
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
const incubatorTypes = [
    "Academic",
    "Government",
    "Corporate",
    "Private / Independent"
];

const focusAreas = [
    "EdTech",
    "HealthTech",
    "Climate / Sustainability",
    "AgriTech",
    "FinTech",
    "DeepTech",
    "Social Impact",
    "Sector-agnostic"
];

const stagesAccepted = [
    "Idea",
    "Prototype",
    "MVP",
    "Early Revenue",
    "Scale-up"
];

const orgTypesSupported = [
    "Startups",
    "NGOs",
    "Social Enterprises",
    "Student Founders"
];

const supportOffered = [
    "Mentorship",
    "Structured Incubation Programs",
    "Seed Funding",
    "Office / Lab Space",
    "Corporate Pilot Opportunities",
    "Investor Connections",
    "Capacity Building & Training"
];

const selectionCriteria = [
    "Strong founding team",
    "Clear problem–solution fit",
    "Early traction",
    "Impact alignment",
    "Scalability potential"
];

const programDurations = [
    "3 Months",
    "6 Months",
    "12 Months"
];

const platformExpectations = [
    "Quality deal flow",
    "NGO partnerships",
    "CSR introductions",
    "Pilot opportunities",
    "Visibility & discovery"
];

const contactRoles = [
    "Program Manager",
    "Incubation Lead",
    "Operations Head",
    "Other"
];

interface IncubatorFormProps {
    onSubmit: (data: IncubatorFormData) => Promise<void>;
    isSubmitting: boolean;
}

export interface IncubatorFormData {
    name: string;
    incubatorType: string;
    city: string;
    state: string;
    website: string;
    focusAreas: string[];
    stagesAccepted: string[];
    orgTypesSupported: string[];
    supportOffered: string[];
    programIntakeType: string;
    programDuration: string;
    selectionCriteria: string[];
    takesEquity: boolean;
    equityRange: string;
    hasProgramFee: boolean;
    platformExpectations: string[];
    contactPersonRole: string;
    contactEmail: string;
}

type FormStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export default function IncubatorForm({ onSubmit, isSubmitting }: IncubatorFormProps) {
    const [step, setStep] = useState<FormStep>(1);
    const [formData, setFormData] = useState<IncubatorFormData>({
        name: "",
        incubatorType: "",
        city: "",
        state: "",
        website: "",
        focusAreas: [],
        stagesAccepted: [],
        orgTypesSupported: [],
        supportOffered: [],
        programIntakeType: "",
        programDuration: "",
        selectionCriteria: [],
        takesEquity: false,
        equityRange: "",
        hasProgramFee: false,
        platformExpectations: [],
        contactPersonRole: "",
        contactEmail: "",
    });

    const totalSteps = 10;
    const stepProgress = (step / totalSteps) * 100;

    const toggleArrayItem = (field: keyof IncubatorFormData, item: string) => {
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

    const nextStep = () => setStep(prev => Math.min(prev + 1, 10) as FormStep);
    const prevStep = () => setStep(prev => Math.max(prev - 1, 1) as FormStep);

    const renderMultiSelect = (
        options: string[],
        selected: string[],
        field: keyof IncubatorFormData
    ) => (
        <div className="flex flex-wrap gap-2">
            {options.map((option) => (
                <button
                    key={option}
                    type="button"
                    onClick={() => toggleArrayItem(field, option)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selected.includes(option)
                        ? "bg-sky-500 text-white"
                        : "bg-muted text-foreground hover:bg-sky-100 dark:hover:bg-sky-900/30"
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
                        className="h-full bg-sky-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${stepProgress}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
            </div>

            {/* Step 1: Incubator Details */}
            {step === 1 && (
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center">
                            <Rocket className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground">Incubator Details</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="name">Incubator Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Enter incubator name"
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label>Incubator Type *</Label>
                            <Select
                                value={formData.incubatorType}
                                onValueChange={(value) => setFormData({ ...formData, incubatorType: value })}
                            >
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {incubatorTypes.map((type) => (
                                        <SelectItem key={type} value={type}>{type}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="city">City *</Label>
                                <Input
                                    id="city"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    placeholder="City"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="state">State *</Label>
                                <Input
                                    id="state"
                                    value={formData.state}
                                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                    placeholder="State"
                                    className="mt-1"
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="website">Official Website (optional)</Label>
                            <Input
                                id="website"
                                value={formData.website}
                                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                placeholder="https://"
                                className="mt-1"
                            />
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Step 2: Focus Areas */}
            {step === 2 && (
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center">
                            <Target className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground">Focus Areas</h2>
                    </div>

                    <div>
                        <Label className="mb-3 block">Primary Focus Areas *</Label>
                        {renderMultiSelect(focusAreas, formData.focusAreas, 'focusAreas')}
                    </div>
                </motion.div>
            )}

            {/* Step 3: Stage Accepted */}
            {step === 3 && (
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center">
                            <GraduationCap className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground">Stage Accepted</h2>
                    </div>

                    <div>
                        <Label className="mb-3 block">Stage of Organizations Accepted *</Label>
                        {renderMultiSelect(stagesAccepted, formData.stagesAccepted, 'stagesAccepted')}
                    </div>
                </motion.div>
            )}

            {/* Step 4: Who You Support */}
            {step === 4 && (
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center">
                            <Users className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground">Who You Support</h2>
                    </div>

                    <div>
                        <Label className="mb-3 block">Types of Organizations You Support *</Label>
                        {renderMultiSelect(orgTypesSupported, formData.orgTypesSupported, 'orgTypesSupported')}
                    </div>
                </motion.div>
            )}

            {/* Step 5: What You Provide */}
            {step === 5 && (
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center">
                            <Briefcase className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground">What You Provide</h2>
                    </div>

                    <div>
                        <Label className="mb-3 block">Support Offered by Your Incubator *</Label>
                        {renderMultiSelect(supportOffered, formData.supportOffered, 'supportOffered')}
                    </div>
                </motion.div>
            )}

            {/* Step 6: Program Structure */}
            {step === 6 && (
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground">Program Structure</h2>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <Label className="mb-3 block">Program Intake Type *</Label>
                            <div className="flex gap-4">
                                {["Cohort-based", "Rolling Intake"].map((type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, programIntakeType: type })}
                                        className={`flex-1 py-3 px-4 rounded-xl border-2 font-medium transition-all ${formData.programIntakeType === type
                                            ? "border-sky-500 bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300"
                                            : "border-border hover:border-sky-300"
                                            }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <Label>Typical Program Duration *</Label>
                            <Select
                                value={formData.programDuration}
                                onValueChange={(value) => setFormData({ ...formData, programDuration: value })}
                            >
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select duration" />
                                </SelectTrigger>
                                <SelectContent>
                                    {programDurations.map((duration) => (
                                        <SelectItem key={duration} value={duration}>{duration}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Step 7: Selection Expectations */}
            {step === 7 && (
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground">Selection Expectations</h2>
                    </div>

                    <div>
                        <Label className="mb-3 block">Key Selection Criteria *</Label>
                        {renderMultiSelect(selectionCriteria, formData.selectionCriteria, 'selectionCriteria')}
                    </div>
                </motion.div>
            )}

            {/* Step 8: Commercial Terms */}
            {step === 8 && (
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground">Commercial Terms</h2>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <Label className="mb-3 block">Do You Take Equity? *</Label>
                            <div className="flex gap-4">
                                {[{ value: true, label: "Yes" }, { value: false, label: "No" }].map((option) => (
                                    <button
                                        key={option.label}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, takesEquity: option.value })}
                                        className={`flex-1 py-3 px-4 rounded-xl border-2 font-medium transition-all ${formData.takesEquity === option.value
                                            ? "border-sky-500 bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300"
                                            : "border-border hover:border-sky-300"
                                            }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {formData.takesEquity && (
                            <div>
                                <Label>Equity Range</Label>
                                <Select
                                    value={formData.equityRange}
                                    onValueChange={(value) => setFormData({ ...formData, equityRange: value })}
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select range" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1-3%">1–3%</SelectItem>
                                        <SelectItem value="3-5%">3–5%</SelectItem>
                                        <SelectItem value="5%+">5%+</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div>
                            <Label className="mb-3 block">Is There Any Program Fee? *</Label>
                            <div className="flex gap-4">
                                {[{ value: true, label: "Yes" }, { value: false, label: "No" }].map((option) => (
                                    <button
                                        key={option.label}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, hasProgramFee: option.value })}
                                        className={`flex-1 py-3 px-4 rounded-xl border-2 font-medium transition-all ${formData.hasProgramFee === option.value
                                            ? "border-sky-500 bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300"
                                            : "border-border hover:border-sky-300"
                                            }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Step 9: Expectations from Drivya */}
            {step === 9 && (
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center">
                            <Target className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground">Expectations from Drivya</h2>
                    </div>

                    <div>
                        <Label className="mb-3 block">What Are You Looking For Through Drivya? *</Label>
                        {renderMultiSelect(platformExpectations, formData.platformExpectations, 'platformExpectations')}
                    </div>
                </motion.div>
            )}

            {/* Step 10: Contact Details */}
            {step === 10 && (
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center">
                            <Mail className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground">Contact Details</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <Label>Contact Person Role *</Label>
                            <Select
                                value={formData.contactPersonRole}
                                onValueChange={(value) => setFormData({ ...formData, contactPersonRole: value })}
                            >
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {contactRoles.map((role) => (
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
                                placeholder="contact@incubator.com"
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
                {step < 10 ? (
                    <Button
                        onClick={nextStep}
                        className="flex-1 bg-sky-500 hover:bg-sky-600"
                    >
                        Continue
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                ) : (
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex-1 bg-sky-500 hover:bg-sky-600"
                    >
                        {isSubmitting ? "Submitting..." : "Submit Incubator Profile"}
                        {!isSubmitting && <ArrowRight className="w-4 h-4 ml-2" />}
                    </Button>
                )}
            </div>
        </div>
    );
}
