import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { supabase } from "../utils/rls_utils";
import { generateTestUser } from "../utils/helper";
import {
  createCleanupTracker,
  cleanupTestData,
  trackUser,
  trackOrganization,
} from "../utils/cleanup";

describe("Organization Table Tests", () => {
  let owner: any;
  let member: any;
  let outsider: any;
  let orgId: string;
  const cleanup = createCleanupTracker();

  beforeAll(async () => {
    // Register Users
    owner = await generateTestUser("Owner");
    member = await generateTestUser("Member");
    outsider = await generateTestUser("Outsider");

    trackUser(cleanup, owner.user.id);
    trackUser(cleanup, member.user.id);
    trackUser(cleanup, outsider.user.id);

    // Create Organization (Owner does this)
    const { data: orgData, error: orgError } = await owner.client
      .from("organizations")
      .insert({
        name: "Test Org",
        access_code: "TESTCODE_" + Math.random().toString(36).substring(7),
        manager_id: owner.user.id,
      })
      .select()
      .single();

    if (orgError) throw orgError;
    orgId = orgData.id;
    trackOrganization(cleanup, orgId);

    // Member joins Org
    const { error: joinError } = await member.client
      .from("org_memberships")
      .insert({
        organization_id: orgId,
        user_id: member.user.id,
        type: "USER",
      });
    if (joinError) throw joinError;
  });

  afterAll(async () => {
    await cleanupTestData(cleanup);
  });

  // CREATE
  /* ------------------------------------------------------------------- */
  // create with an invalid manager_id should fail
  // creating an org should automatically create an org_membership for the manager
  it("a non-authenticated user should not be able to create an organization", async () => {
    const { error } = await supabase.from("organizations").insert({
      name: "Anon Org",
      access_code: "ANON",
      manager_id: "00000000-0000-0000-0000-000000000000", // Random UUID
    });
    expect(error).not.toBeNull();
  });

  it("an authenticated user should be able to create an organization", async () => {
    const newUser = await generateTestUser("New Creator");
    trackUser(cleanup, newUser.user.id);
    const { data, error } = await newUser.client
      .from("organizations")
      .insert({
        name: "Auth Org",
        access_code: "AUTH_" + Math.random().toString(36).substring(7),
        manager_id: newUser.user.id,
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(data.name).toBe("Auth Org");
    trackOrganization(cleanup, data.id);
  });

  it("an authenticated user should not be able to create an org for someone else", async () => {
    const newUser = await generateTestUser("New Creator");
    trackUser(cleanup, newUser.user.id);
    const { error } = await newUser.client.from("organizations").insert({
      name: "Stolen Org",
      access_code: "STOLEN_" + Math.random().toString(36).substring(7),
      manager_id: owner.user.id, // Trying to make the other owner the manager
    });

    expect(error).not.toBeNull();
  });

  // READ
  /* ------------------------------------------------------------------- */
  it("Member should be able to read organization", async () => {
    const { data, error } = await member.client
      .from("organizations")
      .select("*")
      .eq("id", orgId)
      .single();
    expect(error).toBeNull();
    expect(data.id).toBe(orgId);
  });

  it("Outsider SHOULD be able to read organization (public visibility)", async () => {
    const { data } = await outsider.client
      .from("organizations")
      .select("*")
      .eq("id", orgId);
    expect(data?.length).toBe(1);
  });

  // UPDATE
  /* ------------------------------------------------------------------- */
  // owner should not be able to transfer ownership to a storage type membership
  it("Member should NOT be able to update organization details", async () => {
    await member.client
      .from("organizations")
      .update({ name: "Member Hacked Name" })
      .eq("id", orgId);

    const { data } = await owner.client
      .from("organizations")
      .select("name")
      .eq("id", orgId)
      .single();
    expect(data?.name).toBe("Test Org");
  });

  it("Owner SHOULD be able to update organization", async () => {
    const { error } = await owner.client
      .from("organizations")
      .update({ name: "Owner Updated Name" })
      .eq("id", orgId);
    expect(error).toBeNull();

    const { data } = await owner.client
      .from("organizations")
      .select("name")
      .eq("id", orgId)
      .single();
    expect(data?.name).toBe("Owner Updated Name");
  });

  it("Owner should NOT be able to transfer manager role to a non-member", async () => {
    const nonMember = await generateTestUser("Non Member");
    trackUser(cleanup, nonMember.user.id);

    const { error } = await owner.client
      .from("organizations")
      .update({ manager_id: nonMember.user.id })
      .eq("id", orgId);

    expect(error).not.toBeNull();
  });

  it("Owner SHOULD be able to transfer manager role to an existing member", async () => {
    const { error } = await owner.client
      .from("organizations")
      .update({ manager_id: member.user.id })
      .eq("id", orgId);

    expect(error).toBeNull();

    const { data } = await member.client
      .from("organizations")
      .select("manager_id")
      .eq("id", orgId)
      .single();
    expect(data?.manager_id).toBe(member.user.id);

    await member.client
      .from("organizations")
      .update({ manager_id: owner.user.id })
      .eq("id", orgId);
  });

  // DELETE
  /* ------------------------------------------------------------------- */
  // deleting an org causes a cascading delete of org_memberships, containers, and equipment
  // outsider should not be able to delete org
  it("Member should NOT be able to delete organization", async () => {
    await member.client.from("organizations").delete().eq("id", orgId);

    const { data } = await owner.client
      .from("organizations")
      .select("id")
      .eq("id", orgId);
    expect(data?.length).toBe(1);
  });

  it("owner should be able to delete organization", async () => {
    const { error } = await owner.client
      .from("organizations")
      .delete()
      .eq("id", orgId);

    expect(error).toBeNull();

    const { data } = await owner.client
      .from("organizations")
      .select("id")
      .eq("id", orgId);
    expect(data?.length).toBe(0);
  });
});
