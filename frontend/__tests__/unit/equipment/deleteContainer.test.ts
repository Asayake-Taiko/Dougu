import { equipmentService } from "../../../src/lib/services/equipment";
import { organizationService } from "../../../src/lib/services/organization";
import { authService } from "../../../src/lib/services/auth";
import { supabase } from "../../../src/lib/supabase/supabase";
import { generateUUID } from "../../../src/lib/utils/UUID";
import { Container } from "../../../src/types/models";

describe("Container Delete Tests", () => {
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

  it("should successfully delete a container and cascade delete its equipment", async () => {
    // 1. Create a container
    const containerId = generateUUID();
    await supabase.from("containers").insert({
      id: containerId,
      name: "Test Container",
      organization_id: orgId,
      assigned_to: memberId,
      color: "blue",
      last_updated_date: new Date().toISOString(),
    });

    // 2. Create equipment inside the container
    const equipmentId = generateUUID();
    await supabase.from("equipment").insert({
      id: equipmentId,
      name: "Inside Equipment",
      organization_id: orgId,
      assigned_to: memberId,
      container_id: containerId,
      image: "default",
      color: "green",
      last_updated_date: new Date().toISOString(),
    });

    const { data: containerRecord } = await supabase
      .from("containers")
      .select("*")
      .eq("id", containerId)
      .single();
    const container = new Container(containerRecord);

    // 3. Delete the container
    await expect(
      equipmentService.deleteContainer(container),
    ).resolves.not.toThrow();

    // 4. Verify container is gone
    const { data: deletedContainer } = await supabase
      .from("containers")
      .select("*")
      .eq("id", containerId)
      .maybeSingle();
    expect(deletedContainer).toBeNull();

    // 5. Verify equipment is also gone (cascade)
    const { data: deletedEquipment } = await supabase
      .from("equipment")
      .select("*")
      .eq("id", equipmentId)
      .maybeSingle();
    expect(deletedEquipment).toBeNull();
  });

  it("should throw error if non-manager tries to delete container", async () => {
    // 1. Create a container
    const containerId = generateUUID();
    await supabase.from("containers").insert({
      id: containerId,
      name: "Test Container",
      organization_id: orgId,
      assigned_to: memberId,
      color: "blue",
      last_updated_date: new Date().toISOString(),
    });
    const { data: containerRecord } = await supabase
      .from("containers")
      .select("*")
      .eq("id", containerId)
      .single();
    const container = new Container(containerRecord);

    // 2. Login as another user
    const user2Email = `user2_${generateUUID()}@test.com`;
    await authService.register(user2Email, "User Two", "password123");
    await authService.login(user2Email, "password123");

    // 3. Try to delete (should fail)
    await expect(equipmentService.deleteContainer(container)).rejects.toThrow(
      "Only managers can delete containers.",
    );

    // 4. Verify it still exists (as user 1)
    await authService.login(user1Email, password);
    const { data: existingContainer } = await supabase
      .from("containers")
      .select("*")
      .eq("id", containerId)
      .maybeSingle();
    expect(existingContainer).not.toBeNull();
  });
  it("should not allow a manager to delete container from another organization", async () => {
    // 1. User 1 creates Org A and container
    const containerId = generateUUID();
    await supabase.from("containers").insert({
      id: containerId,
      name: "Org A Container",
      organization_id: orgId,
      assigned_to: memberId,
      color: "blue",
      last_updated_date: new Date().toISOString(),
    });
    const { data: containerRecord } = await supabase
      .from("containers")
      .select("*")
      .eq("id", containerId)
      .single();
    const container = new Container(containerRecord);

    // 2. Register User 2 and create Org B (User 2 is now a manager, but of Org B)
    const user2Email = `user2_${generateUUID()}@test.com`;
    await authService.register(user2Email, "User Two", "password123");
    const {
      data: { user: user2 },
    } = await supabase.auth.getUser();
    await organizationService.createOrganization("Org_B", user2!.id);

    // 3. User 2 tries to delete User 1's container
    await expect(equipmentService.deleteContainer(container)).rejects.toThrow(
      "Only managers can delete containers.",
    );

    // 4. Verify container still exists (as user 1)
    await authService.login(user1Email, password);
    const { data: existingContainer } = await supabase
      .from("containers")
      .select("*")
      .eq("id", containerId)
      .maybeSingle();
    expect(existingContainer).not.toBeNull();
  });
});
