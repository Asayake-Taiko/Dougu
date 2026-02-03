import { organizationService } from "../../../src/lib/services/organization";
import { authService } from "../../../src/lib/services/auth";
import { supabase } from "../../../src/lib/supabase/supabase";
import { generateUUID } from "../../../src/lib/utils/UUID";

describe("Delete Organization Tests", () => {
  beforeEach(async () => {
    const timestamp = Date.now();
    const email = `testuser_${timestamp}@example.com`;
    const password = "password123";

    await authService.logout();
    await authService.register(email, "Test User", password);
  });

  it("delete organization should succeed and remove from database", async () => {
    // 1. Create an organization
    const name = `Delete_Test_Org_${Math.random().toString(36).substring(7)}`;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { id: orgId } = await organizationService.createOrganization(
      name,
      user!.id,
    );

    // Verify it exists first
    const { data: initialOrg } = await supabase
      .from("organizations")
      .select("id")
      .eq("id", orgId)
      .single();
    expect(initialOrg).not.toBeNull();

    // 2. Delete the organization
    await expect(
      organizationService.deleteOrganization(orgId),
    ).resolves.not.toThrow();

    // 3. Verify it's gone
    const { data: deletedOrg } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", orgId)
      .maybeSingle();

    expect(deletedOrg).toBeNull();
  });

  it("deleting a non-existent organization should throw", async () => {
    const nonExistentId = "00000000-0000-0000-0000-000000000000";
    await expect(
      organizationService.deleteOrganization(nonExistentId),
    ).rejects.toThrow("Only managers can delete organizations.");
  });

  it("delete organization should cascade delete related entities", async () => {
    // 1. Create an organization
    const orgName = `Cascade_Test_Org_${Math.random().toString(36).substring(7)}`;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { id: orgId } = await organizationService.createOrganization(
      orgName,
      user!.id,
    );

    // 2. Add extra membership (storage)
    const storageId = generateUUID();
    await supabase.from("org_memberships").insert({
      id: storageId,
      organization_id: orgId,
      type: "STORAGE",
      storage_name: "Test Storage",
    });

    // 3. Add a container
    const containerId = generateUUID();
    await supabase.from("containers").insert({
      id: containerId,
      name: "Test Container",
      organization_id: orgId,
    });

    // 4. Add an equipment item
    const equipmentId = generateUUID();
    await supabase.from("equipment").insert({
      id: equipmentId,
      name: "Test Equipment",
      organization_id: orgId,
      container_id: containerId,
    });

    // Verify everything exists
    const { data: memberBefore } = await supabase
      .from("org_memberships")
      .select("id")
      .eq("id", storageId)
      .single();
    const { data: containerBefore } = await supabase
      .from("containers")
      .select("id")
      .eq("id", containerId)
      .single();
    const { data: equipmentBefore } = await supabase
      .from("equipment")
      .select("id")
      .eq("id", equipmentId)
      .single();

    expect(memberBefore).not.toBeNull();
    expect(containerBefore).not.toBeNull();
    expect(equipmentBefore).not.toBeNull();

    // 5. Delete the organization
    await organizationService.deleteOrganization(orgId);

    // 6. Verify everything is gone
    const { data: orgAfter } = await supabase
      .from("organizations")
      .select("id")
      .eq("id", orgId)
      .maybeSingle();
    const { data: memberAfter } = await supabase
      .from("org_memberships")
      .select("id")
      .eq("id", storageId)
      .maybeSingle();
    const { data: containerAfter } = await supabase
      .from("containers")
      .select("id")
      .eq("id", containerId)
      .maybeSingle();
    const { data: equipmentAfter } = await supabase
      .from("equipment")
      .select("id")
      .eq("id", equipmentId)
      .maybeSingle();

    expect(orgAfter).toBeNull();
    expect(memberAfter).toBeNull();
    expect(containerAfter).toBeNull();
    expect(equipmentAfter).toBeNull();
  });
  it("only the org manager should be able to delete an organization", async () => {
    // 1. Create an organization as User 1
    const orgName = `Manager_Only_Delete_${Math.random().toString(36).substring(7)}`;
    const {
      data: { user: user1 },
    } = await supabase.auth.getUser();
    const { id: orgId } = await organizationService.createOrganization(
      orgName,
      user1!.id,
    );

    // 2. Register and Login as User 2
    const user2Email = `user2_${Math.random().toString(36).substring(7)}@test.com`;
    await authService.register(user2Email, "User Two", "password123");
    await authService.login(user2Email, "password123");

    // 3. Try to delete the organization
    await expect(organizationService.deleteOrganization(orgId)).rejects.toThrow(
      "Only managers can delete organizations.",
    );

    // 4. Verify organization still exists
    const { data: orgAfter } = await supabase
      .from("organizations")
      .select("id")
      .eq("id", orgId)
      .maybeSingle();

    expect(orgAfter).not.toBeNull();
  });
});
