/**
 * Plan Definitions:
 * Defines which permissions are available for each subscription tier.
 */

export const PLAN_PERMISSIONS: Record<string, string[]> = {
  BASIC: [
    'view_students',
    'manage_admission',
    'view_fees',
    'collect_fees',
    'manage_academic',
  ],
  PRO: [
    'view_students',
    'edit_students',
    'manage_admission',
    'view_fees',
    'collect_fees',
    'manage_academic',
    'view_exams',
    'manage_exams',
    'manage_transport',
  ],
  ENTERPRISE: [
    'view_students',
    'edit_students',
    'manage_admission',
    'view_fees',
    'collect_fees',
    'manage_academic',
    'view_exams',
    'manage_exams',
    'manage_transport',
    'manage_settings',
    'manage_staff',
    'view_reports',
  ]
};

/**
 * Checks if a specific action is allowed under a given plan.
 */
export function isActionAllowedInPlan(plan: string, action: string): boolean {
  const allowedActions = PLAN_PERMISSIONS[plan.toUpperCase()] || PLAN_PERMISSIONS.BASIC;
  return allowedActions.includes(action);
}

/**
 * Returns the list of permission actions allowed for a plan.
 */
export function getAllowedActionsForPlan(plan: string): string[] {
  return PLAN_PERMISSIONS[plan.toUpperCase()] || PLAN_PERMISSIONS.BASIC;
}
