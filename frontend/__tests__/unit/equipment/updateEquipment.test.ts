import { equipmentService } from "../../../src/lib/services/equipment";
import { organizationService } from "../../../src/lib/services/organization";
import { authService } from "../../../src/lib/services/auth";
import { supabase } from "../../../src/lib/supabase/supabase";
import { generateUUID } from "../../../src/lib/utils/UUID";

describe("Update Equipment Tests", () => {
  let managerId: string;
  let managerEmail: string;
  let orgId: string;
  let memberId: string;
  let equipmentIds: string[] = [];
  const password = "password123";

  beforeEach(async () => {
    // 1. Setup Manager & Org
    managerEmail = `manager_${generateUUID()}@example.com`;
    await authService.logout();
    await authService.register(managerEmail, "Manager User", password);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    managerId = user!.id;

    const orgName = `Test_Org_${generateUUID().substring(0, 8)}`;
    const org = await organizationService.createOrganization(
      orgName,
      managerId,
    );
    orgId = org.id;

    // Get Manager's membership ID
    const { data: membership } = await supabase
      .from("org_memberships")
      .select("id")
      .eq("organization_id", orgId)
      .eq("user_id", managerId)
      .single();
    memberId = membership!.id;

    // 2. Create Equipment (Batch of 3)
    await equipmentService.createEquipment(3, {
      name: "Original Equipment",
      organization_id: orgId,
      assigned_to: memberId,
      image: "default_image.png",
      color: "red",
      details: "Original details",
    });

    const { data: items } = await supabase
      .from("equipment")
      .select("id")
      .eq("organization_id", orgId)
      .eq("name", "Original Equipment");

    if (!items || items.length === 0)
      throw new Error("Failed to create equipment");
    equipmentIds = items.map((i) => i.id);
  });

  it("should allow a manager to update all fields for multiple equipment", async () => {
    const newName = "Batch Updated Name";
    const newColor = "blue";

    await equipmentService.updateEquipment(equipmentIds, {
      name: newName,
      color: newColor,
    });

    const { data: updatedItems } = await supabase
      .from("equipment")
      .select("name, color")
      .in("id", equipmentIds);

    expect(updatedItems).toHaveLength(3);
    updatedItems!.forEach((item) => {
      expect(item.name).toBe(newName);
      expect(item.color).toBe(newColor);
    });
  });

  it("should not allow a regular member to update restricted fields (name, image, details, color)", async () => {
    // 1. Register Member
    const memberEmail = `member_${generateUUID()}@test.com`;
    await authService.register(memberEmail, "Regular Member", password);
    const {
      data: { user: memberUser },
    } = await supabase.auth.getUser();

    // 2. Join Org (Self-Join)
    await authService.login(memberEmail, password);
    await supabase.from("org_memberships").insert({
      organization_id: orgId,
      user_id: memberUser!.id,
      type: "USER",
      details: "Test Member",
    });

    // Try to update name
    await expect(
      equipmentService.updateEquipment(equipmentIds, {
        name: "Member Hacked Name",
      }),
    ).rejects.toThrow(/Only managers can update equipment details./);

    // Verify no change
    await authService.login(managerEmail, password);
    const { data: items } = await supabase
      .from("equipment")
      .select("name")
      .in("id", equipmentIds);
    items!.forEach((item) => expect(item.name).toBe("Original Equipment"));
  });

  it("should allow a regular member to update assigned_to (batch assignment)", async () => {
    // 1. Register Member
    const memberEmail = `member2_${generateUUID()}@test.com`;
    await authService.register(memberEmail, "Regular Member 2", password);
    const {
      data: { user: memberUser },
    } = await supabase.auth.getUser();

    // 2. Join Org
    await authService.login(memberEmail, password);
    const { data: newMembership, error } = await supabase
      .from("org_memberships")
      .insert({
        organization_id: orgId,
        user_id: memberUser!.id,
        type: "USER",
        details: "Test Member 2",
      })
      .select("id")
      .single();

    if (error || !newMembership) throw new Error("Membership creation failed");
    const newMemberId = newMembership.id;

    // Update assigned_to
    await equipmentService.updateEquipment(equipmentIds, {
      assigned_to: newMemberId,
    });

    // Verify change
    const { data: items } = await supabase
      .from("equipment")
      .select("assigned_to")
      .in("id", equipmentIds);
    items!.forEach((item) => expect(item.assigned_to).toBe(newMemberId));
  });

  it("should not allow a non-member to update equipment", async () => {
    const randomEmail = `random_${generateUUID()}@test.com`;
    await authService.register(randomEmail, "Random User", password);

    await expect(
      equipmentService.updateEquipment(equipmentIds, {
        assigned_to: "some-id",
      }),
    ).rejects.toThrow(/Permission denied/);
  });

  it("should ensure updating one field doesn't affect others (atomicity check)", async () => {
    // Manager updates color only
    await equipmentService.updateEquipment(equipmentIds, {
      color: "green",
    });

    const { data: items } = await supabase
      .from("equipment")
      .select("name, color, details")
      .in("id", equipmentIds);

    items!.forEach((item) => {
      expect(item.color).toBe("green");
      expect(item.name).toBe("Original Equipment"); // unchanged
      expect(item.details).toBe("Original details"); // unchanged
    });
  });

  it("should batch update name, details, image, and color for all selected items", async () => {
    const newName = "New Batch Name";
    const newDetails = "New batch details";
    const newImage = "new_image.png";
    const newColor = "blue";

    await equipmentService.updateEquipment(equipmentIds, {
      name: newName,
      details: newDetails,
      image: newImage,
      color: newColor,
    });

    const { data: updatedItems } = await supabase
      .from("equipment")
      .select("name, details, image, color")
      .in("id", equipmentIds);

    expect(updatedItems).toHaveLength(3);
    updatedItems!.forEach((item) => {
      expect(item.name).toBe(newName);
      expect(item.details).toBe(newDetails);
      expect(item.image).toBe(newImage);
      expect(item.color).toBe(newColor);
    });
  });
});
