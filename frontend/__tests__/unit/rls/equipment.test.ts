import { authService } from "../../../src/lib/services/auth";
import { supabase } from "../../../src/lib/supabase/supabase";

describe("Equipment RLS Permission Tests", () => {
  const randomStr = Math.random().toString(36).substring(7);
  const ownerEmail = `equip_owner-${randomStr}@example.com`;
  const ownerPassword = "password123";
  const memberEmail = `equip_member-${randomStr}@example.com`;
  const memberPassword = "password123";
  const outsiderEmail = `equip_outsider-${randomStr}@example.com`;
  const outsiderPassword = "password123";

  let ownerId: string;
  let memberId: string;
  let orgId: string;
  let equipmentId: string;

  beforeAll(async () => {
    // Setup users and org
    await authService.logout();

    // Owner
    await authService.register(ownerEmail, "Equip Owner", ownerPassword);
    await authService.login(ownerEmail, ownerPassword);
    const {
      data: { user: owner },
    } = await supabase.auth.getUser();
    ownerId = owner!.id;

    // Org
    const { data: orgData } = await supabase
      .from("organizations")
      .insert({
        name: "Equipment Test Org",
        access_code: "EQP_" + Date.now(),
        manager_id: ownerId,
      })
      .select()
      .single();
    orgId = orgData!.id;

    // Member
    await authService.logout();
    await authService.register(memberEmail, "Equip Member", memberPassword);
    await authService.login(memberEmail, memberPassword);
    const {
      data: { user: member },
    } = await supabase.auth.getUser();
    memberId = member!.id;

    // Member joins the Org (Self-service per new RLS)
    await authService.logout();
    await authService.login(memberEmail, memberPassword);
    await supabase.from("org_memberships").insert({
      organization_id: orgId,
      user_id: memberId,
      type: "USER",
    });

    // Create Equipment (Owner does it)
    await authService.logout();
    await authService.login(ownerEmail, ownerPassword);

    const { data: equipData } = await supabase
      .from("equipment")
      .insert({
        name: "Drill",
        organization_id: orgId,
      })
      .select()
      .single();
    equipmentId = equipData!.id;

    // Outsider
    await authService.logout();
    await authService.register(
      outsiderEmail,
      "Equip Outsider",
      outsiderPassword,
    );
  });

  afterAll(async () => {
    await authService.logout();
  });

  it("Member should be able to read equipment", async () => {
    await authService.login(memberEmail, memberPassword);
    const { data, error } = await supabase
      .from("equipment")
      .select("*")
      .eq("id", equipmentId)
      .single();
    expect(error).toBeNull();
    expect(data.name).toBe("Drill");
  });

  it("Outsider should NOT be able to read equipment", async () => {
    await authService.login(outsiderEmail, outsiderPassword);
    const { data } = await supabase
      .from("equipment")
      .select("*")
      .eq("id", equipmentId);
    expect(data).toEqual([]);
  });

  it("Member SHOULD be able to update equipment", async () => {
    await authService.login(memberEmail, memberPassword);
    // User requested "members can update equipment" (relaxed rule)
    const { error } = await supabase
      .from("equipment")
      .update({ name: "Drill (Updated by Member)" })
      .eq("id", equipmentId);
    expect(error).toBeNull();

    // Verify
    const { data } = await supabase
      .from("equipment")
      .select("name")
      .eq("id", equipmentId)
      .single();
    expect(data?.name).toBe("Drill (Updated by Member)");
  });

  it("Member should NOT be able to delete equipment", async () => {
    await authService.login(memberEmail, memberPassword);
    await supabase.from("equipment").delete().eq("id", equipmentId);

    // Verify still exists
    const { data } = await supabase
      .from("equipment")
      .select("id")
      .eq("id", equipmentId);
    expect(data?.length).toBe(1);
  });

  it("outsiders should not be able to update equipment", async () => {
    await authService.login(outsiderEmail, outsiderPassword);
    await supabase
      .from("equipment")
      .update({ name: "Outsider Hacked Drill" })
      .eq("id", equipmentId);

    // Verify
    await authService.login(ownerEmail, ownerPassword);
    const { data } = await supabase
      .from("equipment")
      .select("name")
      .eq("id", equipmentId)
      .single();
    expect(data?.name).not.toBe("Outsider Hacked Drill");
  });

  it("member should not be able to create equipment", async () => {
    await authService.login(memberEmail, memberPassword);
    const { error } = await supabase.from("equipment").insert({
      name: "Member New Gear",
      organization_id: orgId,
    });
    expect(error).not.toBeNull();
  });

  it("owner should be able to create equipment", async () => {
    await authService.login(ownerEmail, ownerPassword);
    const { data, error } = await supabase
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

  it("Owner SHOULD be able to delete equipment", async () => {
    await authService.login(ownerEmail, ownerPassword);
    const { error } = await supabase
      .from("equipment")
      .delete()
      .eq("id", equipmentId);
    expect(error).toBeNull();

    // Verify gone
    const { data } = await supabase
      .from("equipment")
      .select("id")
      .eq("id", equipmentId);
    expect(data?.length).toBe(0);
  });
});
