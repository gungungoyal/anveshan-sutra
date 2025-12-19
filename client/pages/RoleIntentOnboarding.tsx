import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { useUserStore, getValidIntentsForRole, UserRole, UserIntent } from "@/lib/stores/userStore";
import { Building2, Rocket, Briefcase, Search, Handshake, RefreshCw, Check } from "lucide-react";

export default function RoleIntentOnboarding() {
    const navigate = useNavigate();
    const { role, intent, setRole, setIntent, completeOnboarding } = useUserStore();

    const [selectedRole, setSelectedRole] = useState<UserRole>(role);
    const [selectedIntent, setSelectedIntent] = useState<UserIntent>(intent);
    const [error, setError] = useState<string | null>(null);

    const validIntents = getValidIntentsForRole(selectedRole);

    const handleRoleSelect = (newRole: UserRole) => {
        setSelectedRole(newRole);
        // Reset intent when role changes
        setSelectedIntent(null);
        setError(null);
    };

    const handleIntentSelect = (newIntent: UserIntent) => {
        if (!selectedRole) {
            setError("Please select your role first");
            return;
        }

        const valid = getValidIntentsForRole(selectedRole);
        if (newIntent && valid.includes(newIntent)) {
            setSelectedIntent(newIntent);
            setError(null);
        }
    };

    const handleContinue = () => {
        if (!selectedRole) {
            setError("Please select your role");
            return;
        }
        if (!selectedIntent) {
            setError("Please select what you're here to do");
            return;
        }

        // Save to store
        setRole(selectedRole);
        setIntent(selectedIntent);
        completeOnboarding();

        // Redirect based on role:
        // - CSR can go directly to search (read-only exploration)
        // - NGO/Incubator must create org profile first
        if (selectedRole === 'csr') {
            navigate("/search");
        } else {
            // NGO and Incubator need to set up org profile first
            navigate("/org-submit");
        }
    };

    const roleOptions = [
        {
            value: 'ngo' as UserRole,
            icon: Building2,
            label: 'NGO',
            description: 'Non-profit organization seeking support or partnerships',
        },
        {
            value: 'incubator' as UserRole,
            icon: Rocket,
            label: 'Incubator / Accelerator',
            description: 'Supporting early-stage organizations and social enterprises',
        },
        {
            value: 'csr' as UserRole,
            icon: Briefcase,
            label: 'CSR / Funder',
            description: 'Corporate or foundation providing funding and support',
        },
    ];

    const intentOptions = [
        {
            value: 'seeker' as UserIntent,
            icon: Search,
            label: 'Find partners',
            description: 'Looking for organizations to collaborate with',
            allowedFor: ['ngo', 'incubator'],
        },
        {
            value: 'provider' as UserIntent,
            icon: Handshake,
            label: 'Offer support',
            description: 'Looking to fund or support other organizations',
            allowedFor: ['csr', 'incubator'],
        },
        {
            value: 'both' as UserIntent,
            icon: RefreshCw,
            label: 'Both',
            description: 'Finding partners and offering support',
            allowedFor: ['incubator'],
        },
    ];

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />

            <main className="flex-1 flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-2xl">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-bold text-foreground mb-3">
                            Start your search
                        </h1>
                        <p className="text-muted-foreground">
                            Answer a few questions to see matched organizations.
                        </p>
                    </div>

                    <div className="bg-card rounded-2xl border border-border p-8 shadow-sm">
                        {/* Question 1: Role */}
                        <div className="mb-10">
                            <h2 className="text-lg font-semibold text-foreground mb-2">
                                Who are you?
                            </h2>
                            <p className="text-sm text-muted-foreground mb-4">
                                Select the type of organization you represent.
                            </p>

                            <div className="grid gap-3">
                                {roleOptions.map((option) => {
                                    const Icon = option.icon;
                                    const isSelected = selectedRole === option.value;

                                    return (
                                        <button
                                            key={option.value}
                                            onClick={() => handleRoleSelect(option.value)}
                                            className={`flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all ${isSelected
                                                ? 'border-primary bg-primary/5'
                                                : 'border-border hover:border-primary/50 hover:bg-muted/30'
                                                }`}
                                        >
                                            <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary/10' : 'bg-muted'}`}>
                                                <Icon className={`w-5 h-5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className={`font-medium ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                                                        {option.label}
                                                    </span>
                                                    {isSelected && <Check className="w-4 h-4 text-primary" />}
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-0.5">
                                                    {option.description}
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Question 2: Intent */}
                        <div className="mb-8">
                            <h2 className="text-lg font-semibold text-foreground mb-2">
                                What are you here to do?
                            </h2>
                            <p className="text-sm text-muted-foreground mb-4">
                                {selectedRole
                                    ? "Select your primary purpose."
                                    : "Select your role above first."}
                            </p>

                            <div className="grid gap-3">
                                {intentOptions.map((option) => {
                                    const Icon = option.icon;
                                    const isSelected = selectedIntent === option.value;
                                    const isAllowed = selectedRole && option.allowedFor.includes(selectedRole);
                                    const isDisabled = !selectedRole || !isAllowed;

                                    return (
                                        <button
                                            key={option.value}
                                            onClick={() => handleIntentSelect(option.value)}
                                            disabled={isDisabled}
                                            className={`flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all ${isDisabled
                                                ? 'border-border opacity-40 cursor-not-allowed'
                                                : isSelected
                                                    ? 'border-primary bg-primary/5'
                                                    : 'border-border hover:border-primary/50 hover:bg-muted/30'
                                                }`}
                                        >
                                            <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary/10' : 'bg-muted'}`}>
                                                <Icon className={`w-5 h-5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className={`font-medium ${isSelected ? 'text-primary' : isDisabled ? 'text-muted-foreground' : 'text-foreground'}`}>
                                                        {option.label}
                                                    </span>
                                                    {isSelected && <Check className="w-4 h-4 text-primary" />}
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-0.5">
                                                    {option.description}
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Role-specific hint */}
                            {selectedRole === 'ngo' && (
                                <p className="text-xs text-muted-foreground mt-3 pl-1">
                                    As an NGO, you can find funders and partners to support your work.
                                </p>
                            )}
                            {selectedRole === 'csr' && (
                                <p className="text-xs text-muted-foreground mt-3 pl-1">
                                    As a CSR/Funder, you can discover NGOs aligned with your goals.
                                </p>
                            )}
                            {selectedRole === 'incubator' && (
                                <p className="text-xs text-muted-foreground mt-3 pl-1">
                                    As an Incubator, you can find NGOs to support and CSR partners for collaboration.
                                </p>
                            )}
                        </div>

                        {/* Error message */}
                        {error && (
                            <p className="text-sm text-red-600 mb-4 text-center">
                                {error}
                            </p>
                        )}

                        {/* Continue button */}
                        <button
                            onClick={handleContinue}
                            disabled={!selectedRole || !selectedIntent}
                            className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${selectedRole && selectedIntent
                                ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg'
                                : 'bg-muted text-muted-foreground cursor-not-allowed'
                                }`}
                        >
                            Continue
                        </button>

                        {/* Footer note */}
                        <p className="text-xs text-muted-foreground text-center mt-4">
                            You can change this later in your profile settings.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
