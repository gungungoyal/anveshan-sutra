/**
 * Fit Score Display Utilities
 * 
 * Fit score is a comparative signal, not a promise.
 * Scores are rendered as bands with appropriate visual cues.
 */

export interface FitScoreDisplay {
    score: number;
    label: string;
    colorClass: string;
    bgClass: string;
}

/**
 * Get display properties for a fit score.
 * 
 * Score Bands:
 * - 85-100: Excellent fit (green)
 * - 70-84:  Good fit (emerald)
 * - 55-69:  Moderate fit (amber)
 * - 40-54:  Low fit (orange)
 * - 0-39:   Weak fit (gray)
 */
export function getFitScoreDisplay(score: number): FitScoreDisplay {
    // Clamp score to 0-100
    const clampedScore = Math.max(0, Math.min(100, Math.round(score)));

    if (clampedScore >= 85) {
        return {
            score: clampedScore,
            label: "Excellent",
            colorClass: "text-green-600 dark:text-green-400",
            bgClass: "bg-green-100 dark:bg-green-900/30",
        };
    }

    if (clampedScore >= 70) {
        return {
            score: clampedScore,
            label: "Good",
            colorClass: "text-emerald-600 dark:text-emerald-400",
            bgClass: "bg-emerald-100 dark:bg-emerald-900/30",
        };
    }

    if (clampedScore >= 55) {
        return {
            score: clampedScore,
            label: "Moderate",
            colorClass: "text-amber-600 dark:text-amber-400",
            bgClass: "bg-amber-100 dark:bg-amber-900/30",
        };
    }

    if (clampedScore >= 40) {
        return {
            score: clampedScore,
            label: "Low",
            colorClass: "text-orange-600 dark:text-orange-400",
            bgClass: "bg-orange-100 dark:bg-orange-900/30",
        };
    }

    return {
        score: clampedScore,
        label: "Weak",
        colorClass: "text-gray-500 dark:text-gray-400",
        bgClass: "bg-gray-100 dark:bg-gray-800",
    };
}

/**
 * Format score for display.
 * Shows integer percentage without decimals.
 */
export function formatFitScore(score: number): string {
    return `${Math.round(score)}%`;
}
