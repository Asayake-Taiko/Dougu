import { organizationService } from "../../../src/lib/services/organization";
import { authService } from "../../../src/lib/services/auth";
import { supabase } from "../../../src/lib/supabase/supabase";

describe("Create Storage Tests", () => {
  beforeEach(async () => {
    await authService.logout();
    await authService.login("testuser1@gmail.com", "password1");
  });

  it("create storage with valid orgId should succeed", async () => {
    // 1. Create an organization
    const orgName = `Storage_Test_Org_${Math.random().toString(36).substring(7)}`;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { id: orgId } = await organizationService.createOrganization(
      orgName,
      user!.id,
    );

    // 2. Create storage
    const storageName = "Room A";
    const storageImage = "closet";
    const storageDetails = "Main storage area";

    await expect(
      organizationService.createStorage(
        orgId,
        storageName,
        storageImage,
        storageDetails,
      ),
    ).resolves.not.toThrow();

    // 3. Verify membership exists
    const { data: storage } = await supabase
      .from("org_memberships")
      .select("*")
      .eq("organization_id", orgId)
      .eq("type", "STORAGE")
      .eq("storage_name", storageName)
      .maybeSingle();

    expect(storage).not.toBeNull();
    expect(storage?.storage_name).toBe(storageName);
    expect(storage?.profile_image).toBe(storageImage);
    expect(storage?.details).toBe(storageDetails);
  });

  it("create storage with invalid orgId should fail", async () => {
    const invalidOrgId = "00000000-0000-0000-0000-000000000000";
    await expect(
      organizationService.createStorage(
        invalidOrgId,
        "Fail Storage",
        "default",
        "details",
      ),
    ).rejects.toThrow("Organization not found");
  });
});
