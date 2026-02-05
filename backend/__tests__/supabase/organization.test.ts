import { describe, it, expect, beforeAll } from "vitest";
import { generateTestUser } from "../utils/user";

describe("Organization RLS Permission Tests", () => {
  let owner: any;
  let member: any;
  let outsider: any;
  let orgId: string;

  beforeAll(async () => {
    // Register Users
    owner = await generateTestUser("Owner");
    member = await generateTestUser("Member");
    outsider = await generateTestUser("Outsider");

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

    // Member joins Org
    const { error: joinError } = await member.client.from("org_memberships").insert({
      organization_id: orgId,
      user_id: member.user.id,
      type: "USER",
    });
    if (joinError) throw joinError;
  });

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

  it("Member should NOT be able to delete organization", async () => {
    await member.client.from("organizations").delete().eq("id", orgId);

    // Verify it still exists
    const { data } = await owner.client
      .from("organizations")
      .select("id")
      .eq("id", orgId);
    expect(data?.length).toBe(1);
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

  it("member should not be able to delete memberships", async () => {
    // Member tries to delete their own membership (or another)
    await member.client
      .from("org_memberships")
      .delete()
      .eq("user_id", member.user.id)
      .eq("organization_id", orgId);

    // Verify membership still exists
    const { data } = await owner.client
      .from("org_memberships")
      .select("id")
      .eq("user_id", member.user.id)
      .eq("organization_id", orgId);
    expect(data?.length).toBe(1);
  });

  it("owner should be able to delete memberships", async () => {
    const { error } = await owner.client
      .from("org_memberships")
      .delete()
      .eq("user_id", member.user.id)
      .eq("organization_id", orgId);

    expect(error).toBeNull();

    // Verify gone
    const { data } = await owner.client
      .from("org_memberships")
      .select("id")
      .eq("user_id", member.user.id)
      .eq("organization_id", orgId);
    expect(data?.length).toBe(0);
  });

  it("owner should be able to delete organization", async () => {
    const { error } = await owner.client
      .from("organizations")
      .delete()
      .eq("id", orgId);

    expect(error).toBeNull();

    // Verify gone
    const { data } = await owner.client
      .from("organizations")
      .select("id")
      .eq("id", orgId);
    expect(data?.length).toBe(0);
  });
});
