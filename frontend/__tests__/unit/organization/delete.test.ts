import { organizationService } from "../../../src/lib/services/organization";
import { authService } from "../../../src/lib/services/auth";
import { supabase } from "../../../src/lib/supabase/supabase";

describe("Delete Organization Tests", () => {
  beforeEach(async () => {
    await authService.logout();
    await authService.login("testuser1@gmail.com", "password1");
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

  it("deleting a non-existent organization should not throw", async () => {
    const nonExistentId = "00000000-0000-0000-0000-000000000000";
    await expect(
      organizationService.deleteOrganization(nonExistentId),
    ).resolves.not.toThrow();
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
    const storageId = "00000000-0000-0000-0000-000000000001";
    await supabase.from("org_memberships").insert({
      id: storageId,
      organization_id: orgId,
      type: "STORAGE",
      storage_name: "Test Storage",
    });

    // 3. Add a container
    const containerId = "00000000-0000-0000-0000-000000000002";
    await supabase.from("containers").insert({
      id: containerId,
      name: "Test Container",
      organization_id: orgId,
    });

    // 4. Add an equipment item
    const equipmentId = "00000000-0000-0000-0000-000000000003";
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
});
