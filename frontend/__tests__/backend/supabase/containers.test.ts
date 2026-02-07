import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { generateTestUser } from "../utils/helper";
import {
  createCleanupTracker,
  cleanupTestData,
  trackUser,
  trackOrganization,
} from "../utils/cleanup";

describe("Containers Table Tests", () => {
  let owner: any;
  let member: any;
  let outsider: any;
  let orgId: string;
  let containerId: string;
  const cleanup = createCleanupTracker();

  beforeAll(async () => {
    // Setup users
    owner = await generateTestUser("Container Owner");
    member = await generateTestUser("Container Member");
    outsider = await generateTestUser("Container Outsider");

    trackUser(cleanup, owner.user.id);
    trackUser(cleanup, member.user.id);
    trackUser(cleanup, outsider.user.id);

    // Create Org
    const { data: orgData } = await owner.client
      .from("organizations")
      .insert({
        name: "Container Test Org",
        access_code: "CON_" + Math.random().toString(36).substring(7),
        manager_id: owner.user.id,
      })
      .select()
      .single();
    orgId = orgData!.id;
    trackOrganization(cleanup, orgId);

    // Member joins the Org
    const { error: joinError } = await member.client
      .from("org_memberships")
      .insert({
        organization_id: orgId,
        user_id: member.user.id,
        type: "USER",
      });
    if (joinError) throw joinError;

    // Create Container (Owner does it)
    const { data: containerData } = await owner.client
      .from("containers")
      .insert({
        name: "Box A",
        organization_id: orgId,
      })
      .select()
      .single();
    containerId = containerData!.id;
  });

  afterAll(async () => {
    await cleanupTestData(cleanup);
  });

  // CREATE
  /* ------------------------------------------------------------------- */
  it("member should not be able to create containers", async () => {
    const { error } = await member.client.from("containers").insert({
      name: "Member New Box",
      organization_id: orgId,
    });
    expect(error).not.toBeNull();
  });

  it("outsider should not be able to create containers", async () => {
    const { error } = await outsider.client.from("containers").insert({
      name: "Outsider New Box",
      organization_id: orgId,
    });
    expect(error).not.toBeNull();
  });

  it("owner should be able to create containers", async () => {
    const { data, error } = await owner.client
      .from("containers")
      .insert({
        name: "Owner New Box",
        organization_id: orgId,
      })
      .select()
      .single();
    expect(error).toBeNull();
    expect(data.name).toBe("Owner New Box");
  });

  // READ
  /* ------------------------------------------------------------------- */
  it("Member should be able to read containers", async () => {
    const { data, error } = await member.client
      .from("containers")
      .select("*")
      .eq("id", containerId)
      .single();
    expect(error).toBeNull();
    expect(data.name).toBe("Box A");
  });

  it("Outsider should NOT be able to read containers", async () => {
    const { data } = await outsider.client
      .from("containers")
      .select("*")
      .eq("id", containerId);
    expect(data).toEqual([]);
  });

  // UPDATE
  /* ------------------------------------------------------------------- */
  it("Member should be able to update assigned_to field", async () => {
    const { data: membershipData } = await member.client
      .from("org_memberships")
      .select("id")
      .eq("user_id", member.user.id)
      .eq("organization_id", orgId)
      .single();
    const memberMembershipId = membershipData!.id;

    const { error } = await member.client
      .from("containers")
      .update({ assigned_to: memberMembershipId })
      .eq("id", containerId);
    expect(error).toBeNull();

    const { data } = await member.client
      .from("containers")
      .select("assigned_to")
      .eq("id", containerId)
      .single();
    expect(data?.assigned_to).toBe(memberMembershipId);
  });

  it("outsiders should not be able to update containers", async () => {
    await outsider.client
      .from("containers")
      .update({ name: "Outsider Hacked Box" })
      .eq("id", containerId);

    const { data } = await owner.client
      .from("containers")
      .select("name")
      .eq("id", containerId)
      .single();
    expect(data?.name).not.toBe("Outsider Hacked Box");
  });

  it("Member should NOT be able to update fields other than assigned_to", async () => {
    const { error } = await member.client
      .from("containers")
      .update({ name: "Box (Updated by Member)" })
      .eq("id", containerId);

    expect(error).not.toBeNull();
    expect(error?.message).toContain(
      "Only managers can update container details.",
    );
  });

  it("Owner should be able to update all fields", async () => {
    const { error } = await owner.client
      .from("containers")
      .update({ name: "Box (Updated by Owner)" })
      .eq("id", containerId);
    expect(error).toBeNull();

    const { data } = await owner.client
      .from("containers")
      .select("name")
      .eq("id", containerId)
      .single();
    expect(data?.name).toBe("Box (Updated by Owner)");
  });

  // DELETE
  /* ------------------------------------------------------------------- */
  // containers should cascade delete equipment
  it("Member should NOT be able to delete containers", async () => {
    await member.client.from("containers").delete().eq("id", containerId);

    const { data } = await owner.client
      .from("containers")
      .select("id")
      .eq("id", containerId);
    expect(data?.length).toBe(1);
  });

  it("Outsider should NOT be able to delete containers", async () => {
    await outsider.client.from("containers").delete().eq("id", containerId);

    const { data } = await owner.client
      .from("containers")
      .select("id")
      .eq("id", containerId);
    expect(data?.length).toBe(1);
  });

  it("Owner SHOULD be able to delete containers", async () => {
    const { error } = await owner.client
      .from("containers")
      .delete()
      .eq("id", containerId);
    expect(error).toBeNull();

    const { data } = await owner.client
      .from("containers")
      .select("id")
      .eq("id", containerId);
    expect(data?.length).toBe(0);
  });
});
