import { equipmentService } from "../../../src/lib/services/equipment";
import { organizationService } from "../../../src/lib/services/organization";
import { authService } from "../../../src/lib/services/auth";
import { supabase } from "../../../src/lib/supabase/supabase";
import { generateUUID } from "../../../src/lib/utils/UUID";
import { Equipment } from "../../../src/types/models";

describe("Equipment Delete Tests", () => {
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

    // Get the membership ID for the creator
    const { data: membership } = await supabase
      .from("org_memberships")
      .select("id")
      .eq("organization_id", orgId)
      .eq("user_id", user1Id)
      .single();
    memberId = membership!.id;
  });

  it("should successfully delete equipment as a manager", async () => {
    // 1. Create equipment
    const equipmentId = generateUUID();
    await supabase.from("equipment").insert({
      id: equipmentId,
      name: "Test Equipment",
      organization_id: orgId,
      assigned_to: memberId,
      image: "default",
      color: "red",
      last_updated_date: new Date().toISOString(),
    });

    const { data: equipmentRecord } = await supabase
      .from("equipment")
      .select("*")
      .eq("id", equipmentId)
      .single();
    const equipment = new Equipment(equipmentRecord);

    // 2. Delete equipment
    await expect(
      equipmentService.deleteEquipment(equipment),
    ).resolves.not.toThrow();

    // 3. Verify it's gone
    const { data: deletedEquipment } = await supabase
      .from("equipment")
      .select("*")
      .eq("id", equipmentId)
      .maybeSingle();
    expect(deletedEquipment).toBeNull();
  });

  it("should throw error if non-manager tries to delete equipment", async () => {
    // 1. Create equipment
    const equipmentId = generateUUID();
    await supabase.from("equipment").insert({
      id: equipmentId,
      name: "Test Equipment",
      organization_id: orgId,
      assigned_to: memberId,
      image: "default",
      color: "red",
      last_updated_date: new Date().toISOString(),
    });

    const { data: equipmentRecord } = await supabase
      .from("equipment")
      .select("*")
      .eq("id", equipmentId)
      .single();
    const equipment = new Equipment(equipmentRecord);

    // 2. Login as another user
    const user2Email = `user2_${generateUUID()}@test.com`;
    await authService.register(user2Email, "User Two", "password123");
    await authService.login(user2Email, "password123");

    // 3. Try to delete (should fail)
    await expect(equipmentService.deleteEquipment(equipment)).rejects.toThrow(
      "Only managers can delete equipment.",
    );

    // 4. Verify it still exists (need to be user 1 to see it due to RLS)
    await authService.login(user1Email, password);
    const { data: existingEquipment } = await supabase
      .from("equipment")
      .select("*")
      .eq("id", equipmentId)
      .maybeSingle();
    expect(existingEquipment).not.toBeNull();
  });

  it("should not allow a manager to delete equipment from another organization", async () => {
    // 1. User 1 creates Org A and equipment
    const equipmentId = generateUUID();
    await supabase.from("equipment").insert({
      id: equipmentId,
      name: "Org A Equipment",
      organization_id: orgId,
      assigned_to: memberId,
      image: "default",
      color: "red",
      last_updated_date: new Date().toISOString(),
    });
    const { data: equipmentRecord } = await supabase
      .from("equipment")
      .select("*")
      .eq("id", equipmentId)
      .single();
    const equipment = new Equipment(equipmentRecord);

    // 2. Register User 2 and create Org B (User 2 is now a manager, but of Org B)
    const user2Email = `user2_${generateUUID()}@test.com`;
    await authService.register(user2Email, "User Two", "password123");
    const {
      data: { user: user2 },
    } = await supabase.auth.getUser();
    await organizationService.createOrganization("Org_B", user2!.id);

    // 3. User 2 tries to delete User 1's equipment
    await expect(equipmentService.deleteEquipment(equipment)).rejects.toThrow(
      "Only managers can delete equipment.",
    );

    // 4. Verify equipment still exists (as user 1)
    await authService.login(user1Email, password);
    const { data: existingEquipment } = await supabase
      .from("equipment")
      .select("*")
      .eq("id", equipmentId)
      .maybeSingle();
    expect(existingEquipment).not.toBeNull();
  });
});
