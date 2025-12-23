import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'ngo' | 'incubator' | 'csr' | null;
export type UserIntent = 'seeker' | 'provider' | 'both' | null;
export type OnboardingStep = 'personal_info' | 'role_selection' | 'org_form' | 'complete';

interface UserState {
    // Role + Intent
    role: UserRole;
    intent: UserIntent;
    onboardingComplete: boolean;
    hasOrganization: boolean;

    // Onboarding flow
    onboardingStep: OnboardingStep;
    userName: string | null;
    userPhone: string | null;

    // Actions
    setRole: (role: UserRole) => void;
    setIntent: (intent: UserIntent) => void;
    completeOnboarding: () => void;
    resetOnboarding: () => void;
    setHasOrganization: (has: boolean) => void;
    setOnboardingStep: (step: OnboardingStep) => void;
    setPersonalInfo: (name: string, phone: string) => void;

    // Helpers
    isOnboarded: () => boolean;
    needsOrgSetup: () => boolean;
    canAccessSearch: () => boolean;
    canAccessDashboard: () => boolean;
}

/**
 * Get valid intents based on role
 */
export function getValidIntentsForRole(role: UserRole): UserIntent[] {
    switch (role) {
        case 'ngo':
            return ['seeker']; // NGOs can only seek
        case 'csr':
            return ['provider']; // CSR can only provide
        case 'incubator':
            return ['seeker', 'provider', 'both']; // Incubators can do both
        default:
            return [];
    }
}

export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            // Initial state
            role: null,
            intent: null,
            onboardingComplete: false,
            hasOrganization: false,
            onboardingStep: 'personal_info' as OnboardingStep,
            userName: null,
            userPhone: null,

            // Actions
            setRole: (role) => set({ role, intent: null }), // Reset intent when role changes
            setIntent: (intent) => set({ intent }),

            completeOnboarding: () => {
                const { role, intent } = get();
                if (role && intent) {
                    set({ onboardingComplete: true });
                }
            },

            resetOnboarding: () => set({
                role: null,
                intent: null,
                onboardingComplete: false,
                hasOrganization: false,
                onboardingStep: 'personal_info' as OnboardingStep,
                userName: null,
                userPhone: null,
            }),

            setHasOrganization: (has) => set({ hasOrganization: has }),
            setOnboardingStep: (step) => set({ onboardingStep: step }),
            setPersonalInfo: (name, phone) => set({ userName: name, userPhone: phone }),

            // Helpers
            isOnboarded: () => {
                const { role, intent, onboardingComplete } = get();
                return Boolean(role && intent && onboardingComplete);
            },

            // NGO and Incubator need org setup before accessing matches
            // CSR can browse in read-only mode
            needsOrgSetup: () => {
                const { role, hasOrganization } = get();
                if (role === 'csr') return false; // CSR doesn't need org
                return !hasOrganization;
            },

            canAccessSearch: () => {
                const state = get();
                if (!state.isOnboarded()) return false;
                // CSR can always access search (read-only)
                if (state.role === 'csr') return true;
                // NGO/Incubator need org profile first
                return state.hasOrganization;
            },

            canAccessDashboard: () => {
                const state = get();
                if (!state.isOnboarded()) return false;
                // CSR can always access dashboard
                if (state.role === 'csr') return true;
                // NGO/Incubator need org profile first
                return state.hasOrganization;
            },
        }),
        {
            name: 'drivya-user-store',
            partialize: (state) => ({
                role: state.role,
                intent: state.intent,
                onboardingComplete: state.onboardingComplete,
                hasOrganization: state.hasOrganization,
                onboardingStep: state.onboardingStep,
                userName: state.userName,
                userPhone: state.userPhone,
            }),
        }
    )
);
