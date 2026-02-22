/**
 * Fit Score Utilities for CSR Users
 * Until mismatch logic is implemented, CSR users see qualitative labels instead of percentages
 */

export type FitLabel = 'Good fit' | 'Risky' | 'Avoid';

export interface FitScoreDisplay {
    label: FitLabel;
    color: string;
    bgColor: string;
}

/**
 * Convert numeric alignment score to qualitative label for CSR users
 * @param score - Alignment score (0-100)
 * @returns Fit label
 */
export function getFitLabel(score: number): FitLabel {
    if (score >= 70) return 'Good fit';
    if (score >= 40) return 'Risky';
    return 'Avoid';
}

/**
 * Get display properties for fit label
 * @param score - Alignment score (0-100)
 * @returns Display properties with label and colors
 */
export function getFitScoreDisplay(score: number): FitScoreDisplay {
    const label = getFitLabel(score);

    switch (label) {
        case 'Good fit':
            return {
                label,
                color: 'text-green-600 dark:text-green-500',
                bgColor: 'bg-green-100 dark:bg-green-900/30',
            };
        case 'Risky':
            return {
                label,
                color: 'text-orange-600 dark:text-orange-500',
                bgColor: 'bg-orange-100 dark:bg-orange-900/30',
            };
        case 'Avoid':
            return {
                label,
                color: 'text-red-600 dark:text-red-500',
                bgColor: 'bg-red-100 dark:bg-red-900/30',
            };
    }
}

/**
 * Get color classes for score badge (for non-CSR users)
 * @param score - Alignment score (0-100)
 * @returns Tailwind color classes
 */
export function getScoreColor(score: number): string {
    if (score >= 70) return "text-green-600 bg-green-100 dark:bg-green-900/30";
    if (score >= 50) return "text-orange-600 bg-orange-100 dark:bg-orange-900/30";
    return "text-red-600 bg-red-100 dark:bg-red-900/30";
}
