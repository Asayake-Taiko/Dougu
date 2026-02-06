import { equipmentService } from "../../../../src/lib/services/equipment";
import { organizationService } from "../../../../src/lib/services/organization";
import { authService } from "../../../../src/lib/services/auth";
import { supabase } from "../../../../src/lib/supabase/supabase";
import { generateUUID } from "../../../../src/lib/utils/UUID";
import { describe, it, expect, beforeEach } from "vitest";

describe("Create Equipment Tests", () => {
  let user1Id: string;
  let user1Email: string;
  let orgId: string;
  let memberId: string;
  const password = "password123";

  beforeEach(async () => {
    user1Email = `testuser_${generateUUID()}@example.com`;

    await authService.logout();
    await authService.register(user1Email, "Test User", password);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    user1Id = user!.id;

    const orgName = `Test_Org_${generateUUID().substring(0, 8)}`;
    const org = await organizationService.createOrganization(orgName, user1Id);
    orgId = org.id;

    const { data: membership } = await supabase
      .from("org_memberships")
      .select("id")
      .eq("organization_id", orgId)
      .eq("user_id", user1Id)
      .single();
    memberId = membership!.id;
  });

  it("should successfully create 1 equipment item as a manager", async () => {
    const equipName = "New Equipment 1";
    await equipmentService.createEquipment(1, {
      name: equipName,
      organization_id: orgId,
      assigned_to: memberId,
      image: "default",
      color: "red",
    });

    const { data: equipment } = await supabase
      .from("equipment")
      .select("*")
      .eq("organization_id", orgId)
      .eq("name", equipName)
      .single();

    expect(equipment).not.toBeNull();
    expect(equipment.name).toBe(equipName);
  });

  it("should successfully create multiple equipment items", async () => {
    const equipName = "Bulk Equipment";
    await equipmentService.createEquipment(3, {
      name: equipName,
      organization_id: orgId,
      assigned_to: memberId,
      image: "default",
      color: "blue",
    });

    const { data: equipmentList } = await supabase
      .from("equipment")
      .select("*")
      .eq("organization_id", orgId)
      .eq("name", equipName);

    expect(equipmentList).toHaveLength(3);
  });

  it("should throw error if non-manager tries to create equipment", async () => {
    // Login as another user
    const user2Email = `user2_${generateUUID()}@test.com`;
    await authService.register(user2Email, "User Two", "password123");
    await authService.login(user2Email, "password123");

    await expect(
      equipmentService.createEquipment(1, {
        name: "Unauthorized Equipment",
        organization_id: orgId,
        assigned_to: memberId, // Trying to assign to existing member
        image: "default",
        color: "red",
      }),
    ).rejects.toThrow("Only managers can create equipment.");

    // Verify it wasn't created (check as manager)
    await authService.login(user1Email, password);
    const { data: equipment } = await supabase
      .from("equipment")
      .select("*")
      .eq("name", "Unauthorized Equipment")
      .maybeSingle();
    expect(equipment).toBeNull();
  });

  it("should not allow a manager to create equipment for another organization", async () => {
    // User 2 creates their own org
    const user2Email = `user2_${generateUUID()}@test.com`;
    await authService.register(user2Email, "User Two", "password123");
    const {
      data: { user: user2 },
    } = await supabase.auth.getUser();
    await organizationService.createOrganization("Org_B", user2!.id);

    // User 2 tries to create equipment in Org 1
    await expect(
      equipmentService.createEquipment(1, {
        name: "Cross Org Equipment",
        organization_id: orgId,
        assigned_to: memberId,
        image: "default",
        color: "red",
      }),
    ).rejects.toThrow("Only managers can create equipment.");

    // Verify failure
    await authService.login(user1Email, password);
    const { data: equipment } = await supabase
      .from("equipment")
      .select("*")
      .eq("name", "Cross Org Equipment")
      .maybeSingle();
    expect(equipment).toBeNull();
  });
});
