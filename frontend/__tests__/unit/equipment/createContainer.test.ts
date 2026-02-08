import { equipmentService } from "../../../src/lib/services/equipment";
import { organizationService } from "../../../src/lib/services/organization";
import { authService } from "../../../src/lib/services/auth";
import { supabase } from "../../../src/lib/supabase/supabase";
import { generateUUID } from "../../../src/lib/utils/UUID";

describe("Create Container Tests", () => {
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

  it("should successfully create 1 container as a manager", async () => {
    const containerName = "New Container 1";
    await equipmentService.createContainer(1, {
      name: containerName,
      organization_id: orgId,
      assigned_to: memberId,
      color: "red",
    });

    const { data: container } = await supabase
      .from("containers")
      .select("*")
      .eq("organization_id", orgId)
      .eq("name", containerName)
      .single();

    expect(container).not.toBeNull();
    expect(container.name).toBe(containerName);
  });

  it("should successfully create multiple containers", async () => {
    const containerName = "Bulk Container";
    await equipmentService.createContainer(3, {
      name: containerName,
      organization_id: orgId,
      assigned_to: memberId,
      color: "blue",
    });

    const { data: containerList } = await supabase
      .from("containers")
      .select("*")
      .eq("organization_id", orgId)
      .eq("name", containerName);

    expect(containerList).toHaveLength(3);
  });

  it("should throw error if non-manager tries to create container", async () => {
    // Login as another user
    const user2Email = `user2_${generateUUID()}@test.com`;
    await authService.register(user2Email, "User Two", "password123");
    await authService.login(user2Email, "password123");

    await expect(
      equipmentService.createContainer(1, {
        name: "Unauthorized Container",
        organization_id: orgId,
        assigned_to: memberId,
        color: "red",
      }),
    ).rejects.toThrow("Only managers can create containers.");

    // Verify it wasn't created
    await authService.login(user1Email, password);
    const { data: container } = await supabase
      .from("containers")
      .select("*")
      .eq("name", "Unauthorized Container")
      .maybeSingle();
    expect(container).toBeNull();
  });

  it("should not allow a manager to create container for another organization", async () => {
    // User 2 creates their own org
    const user2Email = `user2_${generateUUID()}@test.com`;
    await authService.register(user2Email, "User Two", "password123");
    const {
      data: { user: user2 },
    } = await supabase.auth.getUser();
    await organizationService.createOrganization("Org_B", user2!.id);

    // User 2 tries to create container in Org 1
    await expect(
      equipmentService.createContainer(1, {
        name: "Cross Org Container",
        organization_id: orgId,
        assigned_to: memberId,
        color: "red",
      }),
    ).rejects.toThrow("Only managers can create containers.");

    // Verify failure
    await authService.login(user1Email, password);
    const { data: container } = await supabase
      .from("containers")
      .select("*")
      .eq("name", "Cross Org Container")
      .maybeSingle();
    expect(container).toBeNull();
  });
});
