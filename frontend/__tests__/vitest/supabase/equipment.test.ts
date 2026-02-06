import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { generateTestUser } from "../utils/helper";
import {
  createCleanupTracker,
  cleanupTestData,
  trackUser,
  trackOrganization,
} from "../utils/cleanup";

describe("Equipment RLS Permission Tests", () => {
  let owner: any;
  let member: any;
  let outsider: any;
  let orgId: string;
  let equipmentId: string;
  const cleanup = createCleanupTracker();

  beforeAll(async () => {
    // Setup users
    owner = await generateTestUser("Equip Owner");
    member = await generateTestUser("Equip Member");
    outsider = await generateTestUser("Equip Outsider");

    trackUser(cleanup, owner.user.id);
    trackUser(cleanup, member.user.id);
    trackUser(cleanup, outsider.user.id);

    // Create Org
    const { data: orgData } = await owner.client
      .from("organizations")
      .insert({
        name: "Equipment Test Org",
        access_code: "EQP_" + Math.random().toString(36).substring(7),
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

    // Create Equipment (Owner does it)
    const { data: equipData } = await owner.client
      .from("equipment")
      .insert({
        name: "Drill",
        organization_id: orgId,
      })
      .select()
      .single();
    equipmentId = equipData!.id;
  });

  afterAll(async () => {
    await cleanupTestData(cleanup);
  });

  // CREATE
  /* ------------------------------------------------------------------- */
  it("member should not be able to create equipment", async () => {
    const { error } = await member.client.from("equipment").insert({
      name: "Member New Gear",
      organization_id: orgId,
    });
    expect(error).not.toBeNull();
  });

  it("outsider should not be able to create equipment", async () => {
    const { error } = await outsider.client.from("equipment").insert({
      name: "Outsider New Gear",
      organization_id: orgId,
    });
    expect(error).not.toBeNull();
  });

  it("owner should be able to create equipment", async () => {
    const { data, error } = await owner.client
      .from("equipment")
      .insert({
        name: "Owner New Gear",
        organization_id: orgId,
      })
      .select()
      .single();
    expect(error).toBeNull();
    expect(data.name).toBe("Owner New Gear");
  });

  // READ
  /* ------------------------------------------------------------------- */
  it("Member should be able to read equipment", async () => {
    const { data, error } = await member.client
      .from("equipment")
      .select("*")
      .eq("id", equipmentId)
      .single();
    expect(error).toBeNull();
    expect(data.name).toBe("Drill");
  });

  it("Outsider should NOT be able to read equipment", async () => {
    const { data } = await outsider.client
      .from("equipment")
      .select("*")
      .eq("id", equipmentId);
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
      .from("equipment")
      .update({ assigned_to: memberMembershipId })
      .eq("id", equipmentId);
    expect(error).toBeNull();

    const { data } = await member.client
      .from("equipment")
      .select("assigned_to")
      .eq("id", equipmentId)
      .single();
    expect(data?.assigned_to).toBe(memberMembershipId);
  });

  it("Member should be able to update container_id field", async () => {
    const { data: containerData } = await owner.client
      .from("containers")
      .insert({
        name: "Container",
        organization_id: orgId,
      })
      .select()
      .single();
    const containerId = containerData!.id;

    const { error } = await member.client
      .from("equipment")
      .update({ container_id: containerId })
      .eq("id", equipmentId);
    expect(error).toBeNull();

    const { data } = await member.client
      .from("equipment")
      .select("container_id")
      .eq("id", equipmentId)
      .single();
    expect(data?.container_id).toBe(containerId);
  });

  it("outsiders should not be able to update equipment", async () => {
    await outsider.client
      .from("equipment")
      .update({ name: "Outsider Hacked Drill" })
      .eq("id", equipmentId);

    const { data } = await owner.client
      .from("equipment")
      .select("name")
      .eq("id", equipmentId)
      .single();
    expect(data?.name).not.toBe("Outsider Hacked Drill");
  });

  it("Member should NOT be able to update fields other than assigned_to and container_id", async () => {
    const { error } = await member.client
      .from("equipment")
      .update({ name: "Drill (Updated by Member)" })
      .eq("id", equipmentId);

    expect(error).not.toBeNull();
    expect(error?.message).toContain(
      "Only managers can update equipment details.",
    );
  });

  it("Owner should be able to update all fields", async () => {
    const { error } = await owner.client
      .from("equipment")
      .update({ name: "Drill (Updated by Owner)" })
      .eq("id", equipmentId);
    expect(error).toBeNull();

    const { data } = await owner.client
      .from("equipment")
      .select("name")
      .eq("id", equipmentId)
      .single();
    expect(data?.name).toBe("Drill (Updated by Owner)");
  });

  // DELETE
  /* ------------------------------------------------------------------- */
  it("Member should NOT be able to delete equipment", async () => {
    await member.client.from("equipment").delete().eq("id", equipmentId);

    const { data } = await owner.client
      .from("equipment")
      .select("id")
      .eq("id", equipmentId);
    expect(data?.length).toBe(1);
  });

  it("Outsider should NOT be able to delete equipment", async () => {
    await outsider.client.from("equipment").delete().eq("id", equipmentId);

    const { data } = await owner.client
      .from("equipment")
      .select("id")
      .eq("id", equipmentId);
    expect(data?.length).toBe(1);
  });

  it("Owner SHOULD be able to delete equipment", async () => {
    const { error } = await owner.client
      .from("equipment")
      .delete()
      .eq("id", equipmentId);
    expect(error).toBeNull();

    const { data } = await owner.client
      .from("equipment")
      .select("id")
      .eq("id", equipmentId);
    expect(data?.length).toBe(0);
  });
});
