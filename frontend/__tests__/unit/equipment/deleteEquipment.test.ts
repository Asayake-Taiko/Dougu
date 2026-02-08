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

  it("should only delete selected equipment records from a batch", async () => {
    // 1. Create a batch of equipment (3 items)
    const timestamp = new Date().toISOString();
    const batchItems = [
      {
        id: generateUUID(),
        name: "Item 1",
        organization_id: orgId,
        assigned_to: memberId,
        image: "default",
        color: "red",
        last_updated_date: timestamp,
      },
      {
        id: generateUUID(),
        name: "Item 2",
        organization_id: orgId,
        assigned_to: memberId,
        image: "default",
        color: "blue",
        last_updated_date: timestamp,
      },
      {
        id: generateUUID(),
        name: "Item 3",
        organization_id: orgId,
        assigned_to: memberId,
        image: "default",
        color: "green",
        last_updated_date: timestamp,
      },
    ];

    await supabase.from("equipment").insert(batchItems);

    // Create Equipment object with all 3 records
    const { data: records } = await supabase
      .from("equipment")
      .select("*")
      .in(
        "id",
        batchItems.map((i) => i.id),
      );

    const equipment = new Equipment(records![0]);
    equipment.addRecord(records![1]);
    equipment.addRecord(records![2]);

    // Select only Item 1 and Item 3 (indices 0 and 2)
    equipment.selectedIndices = new Set([0, 2]);

    // 2. Delete selected equipment
    await equipmentService.deleteEquipment(equipment);

    // 3. Verify Item 1 and Item 3 are gone, but Item 2 remains
    const { data: remainingItems } = await supabase
      .from("equipment")
      .select("id, name")
      .in(
        "id",
        batchItems.map((i) => i.id),
      );

    expect(remainingItems).toHaveLength(1);
    expect(remainingItems![0].name).toBe("Item 2");
  });
});
