import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { supabase } from "../utils/rls_utils";
import { generateTestUser } from "../utils/helper";
import {
  createCleanupTracker,
  cleanupTestData,
  trackUser,
  trackOrganization,
} from "../utils/cleanup";

describe("Related Org Members Table Tests", () => {
  let userA: any; // In Org 1
  let userB: any; // In Org 1
  let userC: any; // In Org 2
  let org1Id: string;
  let org2Id: string;
  const cleanup = createCleanupTracker();

  beforeAll(async () => {
    userA = await generateTestUser("User A");
    userB = await generateTestUser("User B");
    userC = await generateTestUser("User C");

    trackUser(cleanup, userA.user.id);
    trackUser(cleanup, userB.user.id);
    trackUser(cleanup, userC.user.id);

    // Create Org 1 (User A owner)
    const { data: org1 } = await userA.client
      .from("organizations")
      .insert({
        name: "Org 1",
        access_code: "REL1_" + Math.random().toString(36).substring(7),
        manager_id: userA.user.id,
      })
      .select()
      .single();
    org1Id = org1.id;
    trackOrganization(cleanup, org1Id);

    // User B joins Org 1
    await userB.client.from("org_memberships").insert({
      organization_id: org1Id,
      user_id: userB.user.id,
      type: "USER",
    });

    // Create Org 2 (User C owner)
    const { data: org2 } = await userC.client
      .from("organizations")
      .insert({
        name: "Org 2",
        access_code: "REL2_" + Math.random().toString(36).substring(7),
        manager_id: userC.user.id,
      })
      .select()
      .single();
    org2Id = org2.id;
    trackOrganization(cleanup, org2Id);
  });

  afterAll(async () => {
    await cleanupTestData(cleanup);
  });

  // TRIGGER VERIFICATION (Indirectly via what User A can see)
  /* ------------------------------------------------------------------- */
  it("table should be automatically populated by trigger on membership creation", async () => {
    // User A should have entries where they are the viewer for themselves and User B
    const { data, error } = await userA.client
      .from("related_org_members")
      .select("*")
      .eq("viewer_id", userA.user.id);

    expect(error).toBeNull();
    // Should see at least (Viewer A, Target A) and (Viewer A, Target B)
    expect(data!.length).toBeGreaterThanOrEqual(2);

    const targets = data!.map((r: any) => r.target_user_id);
    expect(targets).toContain(userA.user.id);
    expect(targets).toContain(userB.user.id);
  });

  // READ (RLS)
  /* ------------------------------------------------------------------- */
  it("an authenticated user can read their own related member entries", async () => {
    const { data, error } = await userA.client
      .from("related_org_members")
      .select("*")
      .eq("viewer_id", userA.user.id);

    expect(error).toBeNull();
    // They are indeed viewer_id
    data!.forEach((row: any) => {
      expect(row.viewer_id).toBe(userA.user.id);
    });
  });

  it("an authenticated user cannot read related entries belonging to others", async () => {
    // User A attempts to read entries where User B is the viewer
    const { data } = await userA.client
      .from("related_org_members")
      .select("*")
      .eq("viewer_id", userB.user.id);

    // RLS filters these out, so result is empty
    expect(data).toEqual([]);
  });

  it("an unauthenticated user cannot read any related members", async () => {
    const { data } = await supabase.from("related_org_members").select("*");

    expect(data).toEqual([]);
  });

  // CREATE (Blocked)
  /* ------------------------------------------------------------------- */
  it("users should not be able to manually insert rows", async () => {
    const { error } = await userA.client.from("related_org_members").insert({
      viewer_id: userA.user.id,
      target_user_id: userC.user.id, // User C is in different org
      organization_id: org1Id,
    });

    // RLS blocks because there's no INSERT policy
    expect(error).not.toBeNull();
  });

  // UPDATE (Blocked)
  /* ------------------------------------------------------------------- */
  it("users should not be able to update rows", async () => {
    // Get an existing row
    const { data: existing } = await userA.client
      .from("related_org_members")
      .select("*")
      .limit(1)
      .single();

    const { data, error } = await userA.client
      .from("related_org_members")
      .update({ organization_id: org2Id })
      .eq("viewer_id", existing.viewer_id)
      .eq("target_user_id", existing.target_user_id)
      .eq("organization_id", existing.organization_id)
      .select();

    expect(error).toBeNull();
    // RLS blocks the update, returning 0 rows
    expect(data?.length).toBe(0);

    // Double check it wasn't actually changed
    const { data: check } = await userA.client
      .from("related_org_members")
      .select("organization_id")
      .eq("viewer_id", existing.viewer_id)
      .eq("target_user_id", existing.target_user_id)
      .single();
    expect(check.organization_id).toBe(existing.organization_id);
  });

  // DELETE (Blocked)
  /* ------------------------------------------------------------------- */
  it("users should not be able to delete rows", async () => {
    // Get an existing row
    const { data: existing } = await userA.client
      .from("related_org_members")
      .select("*")
      .limit(1)
      .single();

    const { data: deleteData, error } = await userA.client
      .from("related_org_members")
      .delete()
      .eq("viewer_id", existing.viewer_id)
      .eq("target_user_id", existing.target_user_id)
      .eq("organization_id", existing.organization_id)
      .select();

    expect(error).toBeNull();
    // RLS blocks delete, returning empty array
    expect(deleteData?.length).toBe(0);

    // Double check it still exists
    const { data: check } = await userA.client
      .from("related_org_members")
      .select("*")
      .eq("viewer_id", existing.viewer_id)
      .eq("target_user_id", existing.target_user_id)
      .single();
    expect(check).not.toBeNull();
  });
});
