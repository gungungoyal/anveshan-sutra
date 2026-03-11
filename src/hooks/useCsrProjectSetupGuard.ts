"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useUserStore } from "@/lib/stores/userStore";

const requiredFields = [
    "beneficiaryRange",
    "timelineMonths",
    "geographyType",
    "geographySpread",
    "reportingIntensity",
    "onGroundPresence",
    "programNature",
];

function hasAllRequiredProjectFields(projectSetupData: string | null): boolean {
    if (!projectSetupData) return false;

    try {
        const parsed = JSON.parse(projectSetupData);
        return requiredFields.every(
            (field) =>
                typeof parsed[field] === "string" && parsed[field].trim() !== "",
        );
    } catch (_error) {
        return false;
    }
}

/**
 * Hook to check if CSR user has completed project setup.
 * If not, redirects to /project/setup.
 * 
 * For non-CSR users, this hook has no effect.
 * 
 * @returns {object} { isCheckingSetup, needsProjectSetup }
 */
export function useCsrProjectSetupGuard() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const { role } = useUserStore();
    const [isCheckingSetup, setIsCheckingSetup] = useState(true);
    const [needsProjectSetup, setNeedsProjectSetup] = useState(false);

    useEffect(() => {
        // Wait for auth to complete
        if (authLoading) return;

        // Only check for authenticated CSR users
        if (!isAuthenticated || role !== "csr") {
            setIsCheckingSetup(false);
            setNeedsProjectSetup(false);
            return;
        }

        // Check if project setup data exists in localStorage
        const checkProjectSetup = () => {
            if (!user?.id) {
                setIsCheckingSetup(false);
                return;
            }

            const projectSetupKey = `csr_project_setup_${user.id}`;
            const projectSetupData = localStorage.getItem(projectSetupKey);
            const globalCompletionFlag = localStorage.getItem("projectSetupCompleted") === "true";
            const userCompletionFlag =
                localStorage.getItem(`projectSetupCompleted_${user.id}`) === "true";
            const hasCompletionFlag = globalCompletionFlag || userCompletionFlag;
            const hasValidSetupData = hasAllRequiredProjectFields(projectSetupData);

            // Accept both completion patterns:
            // 1) projectSetupCompleted flag + valid payload
            // 2) valid payload only (backward compatibility)
            if ((hasCompletionFlag && hasValidSetupData) || hasValidSetupData) {
                setNeedsProjectSetup(false);
                setIsCheckingSetup(false);
                return;
            }

            // Missing or invalid setup - redirect to setup page
            setNeedsProjectSetup(true);
            setIsCheckingSetup(false);
            router.push("/project/setup");
        };

        checkProjectSetup();
    }, [authLoading, isAuthenticated, role, user?.id, router]);

    return { isCheckingSetup, needsProjectSetup };
}

/**
 * Helper function to check if CSR user has project setup (synchronous version)
 * Use this for inline checks where hooks aren't available.
 */
export function hasCsrProjectSetup(userId: string | undefined): boolean {
    if (!userId) return false;

    try {
        const projectSetupKey = `csr_project_setup_${userId}`;
        const projectSetupData = localStorage.getItem(projectSetupKey);
        const globalCompletionFlag = localStorage.getItem("projectSetupCompleted") === "true";
        const userCompletionFlag =
            localStorage.getItem(`projectSetupCompleted_${userId}`) === "true";
        const hasCompletionFlag = globalCompletionFlag || userCompletionFlag;
        const hasValidSetupData = hasAllRequiredProjectFields(projectSetupData);

        if ((hasCompletionFlag && hasValidSetupData) || hasValidSetupData) {
            return true;
        }

        return false;
    } catch (_error) {
        return false;
    }
}
