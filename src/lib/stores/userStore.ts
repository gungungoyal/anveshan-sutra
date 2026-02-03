import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'ngo' | 'incubator' | 'csr' | null;
export type UserIntent = 'seeker' | 'provider' | 'both' | null;
export type OnboardingStep = 'personal_info' | 'role_selection' | 'interest_selection' | 'org_form' | 'complete';

// =============================================================================
// PAYMENT CONFIG - Product policy constants (not store responsibility)
// =============================================================================
export const MAX_DAILY_ORG_VIEWS = 5;

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
    interestAreas: string[];

    // Daily view tracking
    dailyOrgViewCount: number;
    lastViewDate: string | null;

    // Unlock tracking (for future payment integration)
    unlockedOrgIds: string[];

    // Actions
    setRole: (role: UserRole) => void;
    setIntent: (intent: UserIntent) => void;
    completeOnboarding: () => void;
    resetOnboarding: () => void;
    setHasOrganization: (has: boolean) => void;
    setOnboardingStep: (step: OnboardingStep) => void;
    setPersonalInfo: (name: string, phone: string) => void;
    setInterestAreas: (areas: string[]) => void;
    incrementViewCount: () => void;
    resetDailyViews: () => void;
    unlockOrganization: (orgId: string) => void;
    isOrgUnlocked: (orgId: string) => boolean;

    // Helpers
    isOnboarded: () => boolean;
    needsOrgSetup: () => boolean;
    canAccessSearch: () => boolean;
    canAccessDashboard: () => boolean;

    // Capability flags (answers "allowed or not?")
    isNGO: () => boolean;
    isCSR: () => boolean;
    isIncubator: () => boolean;
    canViewDeepAnalysis: () => boolean;
    canExportData: () => boolean;
    canViewPremiumContent: (orgId: string) => boolean;
    hasReachedViewLimit: () => boolean;
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

/**
 * Get today's date string for daily reset tracking
 */
function getTodayDateString(): string {
    return new Date().toISOString().split('T')[0];
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
            interestAreas: [],
            dailyOrgViewCount: 0,
            lastViewDate: null,
            unlockedOrgIds: [],

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
                dailyOrgViewCount: 0,
                lastViewDate: null,
            }),

            setHasOrganization: (has) => set({ hasOrganization: has }),
            setOnboardingStep: (step) => set({ onboardingStep: step }),
            setPersonalInfo: (name, phone) => set({ userName: name, userPhone: phone }),
            setInterestAreas: (areas) => set({ interestAreas: areas }),

            incrementViewCount: () => {
                const { lastViewDate, dailyOrgViewCount, role } = get();
                const today = getTodayDateString();

                // NGO users are never tracked
                if (role === 'ngo') return;

                // Reset count if it's a new day
                if (lastViewDate !== today) {
                    set({ dailyOrgViewCount: 1, lastViewDate: today });
                } else {
                    set({ dailyOrgViewCount: dailyOrgViewCount + 1 });
                }
            },

            resetDailyViews: () => set({ dailyOrgViewCount: 0, lastViewDate: null }),

            unlockOrganization: (orgId) => {
                const { unlockedOrgIds } = get();
                if (!unlockedOrgIds.includes(orgId)) {
                    set({ unlockedOrgIds: [...unlockedOrgIds, orgId] });
                }
            },

            isOrgUnlocked: (orgId) => {
                const { unlockedOrgIds } = get();
                return unlockedOrgIds.includes(orgId);
            },

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

            // =================================================================
            // CAPABILITY FLAGS - "Allowed or not?" answers
            // =================================================================

            isNGO: () => get().role === 'ngo',
            isCSR: () => get().role === 'csr',
            isIncubator: () => get().role === 'incubator',

            // NGO can always view deep analysis, others cannot
            canViewDeepAnalysis: () => get().role === 'ngo',

            // NGO can always export, others cannot
            canExportData: () => get().role === 'ngo',

            // Check if user can view premium content for a specific org
            // NGO users always can, others need to have unlocked it
            canViewPremiumContent: (orgId) => {
                const { role } = get();
                if (role === 'ngo') return true;
                return get().isOrgUnlocked(orgId);
            },

            // Check if user has reached view limit (NGO never reaches limit)
            hasReachedViewLimit: () => {
                const { role, dailyOrgViewCount, lastViewDate } = get();

                // NGO users never hit limits
                if (role === 'ngo') return false;

                // Reset check for new day
                const today = getTodayDateString();
                if (lastViewDate !== today) return false;

                return dailyOrgViewCount >= MAX_DAILY_ORG_VIEWS;
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
                interestAreas: state.interestAreas,
                dailyOrgViewCount: state.dailyOrgViewCount,
                lastViewDate: state.lastViewDate,
                unlockedOrgIds: state.unlockedOrgIds,
            }),
        }
    )
);

