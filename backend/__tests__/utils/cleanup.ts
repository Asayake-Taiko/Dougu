import { createClient } from "./rls_utils";

/**
 * Cleanup utility to delete test data from the database.
 * This helps prevent test data accumulation.
 */

export interface TestCleanupTracker {
  userIds: string[];
  organizationIds: string[];
}

export function createCleanupTracker(): TestCleanupTracker {
  return {
    userIds: [],
    organizationIds: []
  };
}

/**
 * Cleanup all test data tracked by the cleanup tracker.
 * This should be called in afterAll hooks.
 */
export async function cleanupTestData(tracker: TestCleanupTracker) {
  // Use service role client to bypass RLS for cleanup
  const adminClient = createClient();

  // Delete organizations (this will cascade to memberships, equipment, containers)
  if (tracker.organizationIds.length > 0) {
    await adminClient
      .from('organizations')
      .delete()
      .in('id', tracker.organizationIds);
  }

  // Delete users from auth (this will cascade to profiles)
  if (tracker.userIds.length > 0) {
    for (const userId of tracker.userIds) {
      try {
        await adminClient.auth.admin.deleteUser(userId);
      } catch (e) {
        // Ignore errors during cleanup
        console.warn(`Failed to delete user ${userId}:`, e);
      }
    }
  }
}

/**
 * Track a user for cleanup
 */
export function trackUser(tracker: TestCleanupTracker, userId: string) {
  if (!tracker.userIds.includes(userId)) {
    tracker.userIds.push(userId);
  }
}

/**
 * Track an organization for cleanup
 */
export function trackOrganization(tracker: TestCleanupTracker, orgId: string) {
  if (!tracker.organizationIds.includes(orgId)) {
    tracker.organizationIds.push(orgId);
  }
}
