/**
 * Payment Analytics - Lightweight event stubs
 * 
 * Fires simple events for upgrade prompts.
 * No analytics infrastructure required yet.
 */

export type UpgradeTriggerType =
    | 'org_locked_section'
    | 'explore_limit'
    | 'export_attempt'
    | 'share_attempt';

/**
 * Track when upgrade prompt is shown
 */
export function trackUpgradePromptShown(triggerType: UpgradeTriggerType): void {
    console.log('[Analytics] upgrade_prompt_shown', {
        trigger_type: triggerType,
        timestamp: new Date().toISOString(),
    });
}

/**
 * Track when user clicks upgrade button
 */
export function trackUpgradeClicked(triggerType: UpgradeTriggerType): void {
    console.log('[Analytics] upgrade_clicked', {
        trigger_type: triggerType,
        timestamp: new Date().toISOString(),
    });
}
