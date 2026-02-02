import { organizationService } from "../../../src/lib/services/organization";
import { authService } from "../../../src/lib/services/auth";
import { supabase } from "../../../src/lib/supabase/supabase";

// test RLS
describe("Organization Permissions", () => {
  let orgId: string;
  let ownerId: string;
  const randomStr = Math.random().toString(36).substring(7);

  beforeAll(async () => {
    // 1. Create owner
    await authService.logout();
    const ownerEmail = `owner-${randomStr}@example.com`;
    await authService.register(ownerEmail, "Owner User", "password123");
    const {
      data: { user: owner },
    } = await supabase.auth.getUser();
    ownerId = owner!.id;

    // 2. Create non-owner user
    await authService.logout();
    const nonOwnerEmail = `nonowner-${randomStr}@example.com`;
    await authService.register(nonOwnerEmail, "Non-Owner User", "password123");
    const {
      data: { user: nonOwner },
    } = await supabase.auth.getUser();
    expect(nonOwner).not.toBeNull();
  });

  beforeEach(async () => {
    // 1. Create a fresh organization as the owner
    await authService.login(`owner-${randomStr}@example.com`, "password123");
    const { id } = await organizationService.createOrganization(
      `Perm_Test_Org_${Math.random().toString(36).substring(7)}`,
      ownerId,
    );
    orgId = id;

    // 2. Login as non-owner for the test
    await authService.login(`nonowner-${randomStr}@example.com`, "password123");
  });

  it("non-owner should not be able to delete the organization", async () => {
    await expect(organizationService.deleteOrganization(orgId)).rejects.toThrow(
      "Only the owner can delete this organization.",
    );
    // Verify it still exists (it shouldn't have been deleted)
    const { data } = await supabase
      .from("organizations")
      .select("id")
      .eq("id", orgId)
      .maybeSingle();
    expect(data).not.toBeNull();
  });

  it("non-owner should not be able to create storage in the organization", async () => {
    await expect(
      organizationService.createStorage(
        orgId,
        "Forbidden Storage",
        "default",
        "details",
      ),
    ).rejects.toThrow("Only the owner can create storage.");

    // Verify it wasn't created
    const { data } = await supabase
      .from("org_memberships")
      .select("id")
      .eq("organization_id", orgId)
      .eq("storage_name", "Forbidden Storage")
      .maybeSingle();
    expect(data).toBeNull();
  });
});
