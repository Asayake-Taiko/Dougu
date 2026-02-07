import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { supabase } from "../utils/rls_utils";
import { generateTestUser } from "../utils/helper";
import {
  createCleanupTracker,
  cleanupTestData,
  trackUser,
  trackOrganization,
} from "../utils/cleanup";

describe("Membership Table Tests", () => {
  let owner: any;
  let member: any;
  let outsider: any;
  let orgId: string;
  let otherOrgId: string;
  const cleanup = createCleanupTracker();

  beforeAll(async () => {
    // Setup users
    owner = await generateTestUser("Org Owner");
    member = await generateTestUser("Org Member");
    outsider = await generateTestUser("Org Outsider");

    trackUser(cleanup, owner.user.id);
    trackUser(cleanup, member.user.id);
    trackUser(cleanup, outsider.user.id);

    // Create Main Org
    const { data: orgData } = await owner.client
      .from("organizations")
      .insert({
        name: "Membership Test Org",
        access_code: "MEM_" + Math.random().toString(36).substring(7),
        manager_id: owner.user.id,
      })
      .select()
      .single();
    orgId = orgData!.id;
    trackOrganization(cleanup, orgId);

    // Create Other Org
    const otherOwner = await generateTestUser("Other Owner");
    trackUser(cleanup, otherOwner.user.id);
    const { data: otherOrgData } = await otherOwner.client
      .from("organizations")
      .insert({
        name: "Other Org",
        access_code: "OTHER_" + Math.random().toString(36).substring(7),
        manager_id: otherOwner.user.id,
      })
      .select()
      .single();
    otherOrgId = otherOrgData!.id;
    trackOrganization(cleanup, otherOrgId);

    // member joins Main Org
    await member.client.from("org_memberships").insert({
      organization_id: orgId,
      user_id: member.user.id,
      type: "USER",
    });
  });

  afterAll(async () => {
    await cleanupTestData(cleanup);
  });

  // CREATE
  /* ------------------------------------------------------------------- */
  // user should not be able to join an org they are already in
  it("a non-authenticated user should not be able to create a membership", async () => {
    const { error } = await supabase.from("org_memberships").insert({
      organization_id: orgId,
      user_id: "00000000-0000-0000-0000-000000000000",
      type: "USER",
    });
    expect(error).not.toBeNull();
  });

  it("an authenticated user should be able to create a membership (join self)", async () => {
    const newUser = await generateTestUser("Self Joiner");
    trackUser(cleanup, newUser.user.id);
    const { error } = await newUser.client.from("org_memberships").insert({
      organization_id: orgId,
      user_id: newUser.user.id,
      type: "USER",
    });
    expect(error).toBeNull();
  });

  it("an authenticated user should not be able to create a membership with an invalid organization id", async () => {
    const newUser = await generateTestUser("Invalid Org");
    trackUser(cleanup, newUser.user.id);
    const { error } = await newUser.client.from("org_memberships").insert({
      organization_id: "00000000-0000-0000-0000-000000000000",
      user_id: newUser.user.id,
      type: "USER",
    });
    expect(error).not.toBeNull();
  });

  it("an authenticated user should not be able to create a membership with an invalid user id (someone else)", async () => {
    const newUser = await generateTestUser("Impersonator");
    const victim = await generateTestUser("Victim");
    trackUser(cleanup, newUser.user.id);
    trackUser(cleanup, victim.user.id);
    const { error } = await newUser.client.from("org_memberships").insert({
      organization_id: orgId,
      user_id: victim.user.id,
      type: "USER",
    });
    expect(error).not.toBeNull();
  });

  it("an authenticated user should not be able to create a membership with an invalid type (STORAGE as non-manager)", async () => {
    const newUser = await generateTestUser("Fake Storage");
    trackUser(cleanup, newUser.user.id);
    const { error } = await newUser.client.from("org_memberships").insert({
      organization_id: orgId,
      type: "STORAGE",
      storage_name: "My Locker",
    });
    expect(error).not.toBeNull();
  });

  // READ
  /* ------------------------------------------------------------------- */
  it("a member of an organization should be able to read memberships of other members in the same organization", async () => {
    const { data, error } = await member.client
      .from("org_memberships")
      .select("*")
      .eq("organization_id", orgId);
    expect(error).toBeNull();
    // Should see at least owner and themselves
    expect(data!.length).toBeGreaterThanOrEqual(2);
  });

  it("a member of an organization should not be able to read memberships of other members in different organizations", async () => {
    const { data } = await member.client
      .from("org_memberships")
      .select("*")
      .eq("organization_id", otherOrgId);
    expect(data).toEqual([]);
  });

  it("an outsider should not be able to read memberships of any members", async () => {
    const { data } = await outsider.client
      .from("org_memberships")
      .select("*")
      .eq("organization_id", orgId);
    expect(data).toEqual([]);
  });

  // UPDATE
  /* ------------------------------------------------------------------- */
  it("an outsider should not be able to update memberships of any members", async () => {
    // Get member's membership id and current details
    const { data: mem } = await owner.client
      .from("org_memberships")
      .select("id, details")
      .eq("user_id", member.user.id)
      .single();

    await outsider.client
      .from("org_memberships")
      .update({ details: "Hacked" })
      .eq("id", mem.id);

    // Verify it wasn't updated
    const { data: finalMem } = await owner.client
      .from("org_memberships")
      .select("details")
      .eq("id", mem.id)
      .single();
    expect(finalMem.details).not.toBe("Hacked");
  });

  it("a member should not be able to update memberships", async () => {
    // Get owner's membership id and current details
    const { data: ownMem } = await owner.client
      .from("org_memberships")
      .select("id, details")
      .eq("user_id", owner.user.id)
      .single();

    await member.client
      .from("org_memberships")
      .update({ details: "I'm the boss now" })
      .eq("id", ownMem.id);

    // Verify it wasn't updated
    const { data: finalMem } = await owner.client
      .from("org_memberships")
      .select("details")
      .eq("id", ownMem.id)
      .single();
    expect(finalMem.details).not.toBe("I'm the boss now");
  });

  it("an owner should be able to update memberships", async () => {
    // Create a storage member first
    const { data: storage } = await owner.client
      .from("org_memberships")
      .insert({
        organization_id: orgId,
        type: "STORAGE",
        storage_name: "Locker to Update",
      })
      .select()
      .single();

    const { error } = await owner.client
      .from("org_memberships")
      .update({ details: "New Locker Secret" })
      .eq("id", storage.id);
    expect(error).toBeNull();
  });

  // DELETE
  /* ------------------------------------------------------------------- */
  // a member cannot delete their own membership
  // the org owner should not be able to their own membership
  // deleting a membership cascade deletes all equipment and containers assigned to that membership
  it("an outsider should not be able to delete memberships of any members", async () => {
    const { data: mem } = await owner.client
      .from("org_memberships")
      .select("id")
      .eq("user_id", member.user.id)
      .single();

    await outsider.client.from("org_memberships").delete().eq("id", mem.id);

    // Verify still exists
    const { data } = await owner.client
      .from("org_memberships")
      .select("id")
      .eq("id", mem.id);
    expect(data?.length).toBe(1);
  });

  it("a member should not be able to delete memberships", async () => {
    const { data: ownMem } = await owner.client
      .from("org_memberships")
      .select("id")
      .eq("user_id", owner.user.id)
      .single();

    await member.client.from("org_memberships").delete().eq("id", ownMem.id);

    // Verify still exists
    const { data } = await owner.client
      .from("org_memberships")
      .select("id")
      .eq("id", ownMem.id);
    expect(data?.length).toBe(1);
  });

  it("an owner should be able to delete memberships", async () => {
    const { data: victim } = await owner.client
      .from("org_memberships")
      .select("id")
      .eq("user_id", member.user.id)
      .single();

    const { error } = await owner.client
      .from("org_memberships")
      .delete()
      .eq("id", victim.id);
    expect(error).toBeNull();

    // Verify gone
    const { data } = await owner.client
      .from("org_memberships")
      .select("id")
      .eq("id", victim.id);
    expect(data?.length).toBe(0);
  });
});
