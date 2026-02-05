import { organizationService } from "../../../src/lib/services/organization";
import { authService } from "../../../src/lib/services/auth";
import { supabase } from "../../../src/lib/supabase/supabase";
import { generateUUID } from "../../../src/lib/utils/UUID";

describe("Create Storage Tests", () => {
  beforeEach(async () => {
    const email = `testuser_${generateUUID()}@example.com`;
    const password = "password123";

    await authService.logout();
    await authService.register(email, "Test User", password);
  });

  it("create storage with valid orgId should succeed", async () => {
    // 1. Create an organization
    const orgName = `Storage_Test_Org_${generateUUID().substring(0, 10)}`;
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
        "#894567",
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
    expect(storage?.color).toBe("#894567");
    expect(storage?.details).toBe(storageDetails);
  });

  it("create storage with invalid orgId should fail", async () => {
    const invalidOrgId = "00000000-0000-0000-0000-000000000000";
    await expect(
      organizationService.createStorage(
        invalidOrgId,
        "Fail Storage",
        "default",
        "#123123",
        "details",
      ),
    ).rejects.toThrow("Only managers can create storage.");
  });

  it("only managers should be able to create storages", async () => {
    // 1. User 1 creates an organization
    const orgName = `Manager_Only_Storage_${generateUUID().substring(0, 10)}`;
    const {
      data: { user: user1 },
    } = await supabase.auth.getUser();
    const { id: orgId } = await organizationService.createOrganization(
      orgName,
      user1!.id,
    );

    // 2. Register and Login as User 2
    const user2Email = `user2_${generateUUID()}@test.com`;
    await authService.register(user2Email, "User Two", "password123");
    await authService.login(user2Email, "password123");

    // 3. Try to create storage for User 1's org
    await expect(
      organizationService.createStorage(
        orgId,
        "Hacked Storage",
        "default",
        "#123123",
        "details",
      ),
    ).rejects.toThrow("Only managers can create storage.");
  });

  it("create a storage for a valid organization you are not a part of should fail", async () => {
    // 1. User 1 creates an organization
    const orgName = `Not_Part_Of_Org_${generateUUID().substring(0, 10)}`;
    const {
      data: { user: user1 },
    } = await supabase.auth.getUser();
    const { id: orgId } = await organizationService.createOrganization(
      orgName,
      user1!.id,
    );

    // 2. Register and Login as User 2
    const user2Email = `user2_${generateUUID()}@test.com`;
    await authService.register(user2Email, "User Two", "password123");
    await authService.login(user2Email, "password123");

    // 3. Try to create storage for User 1's org
    // We expect this to fail because User 2 is not a manager (they aren't even a member)
    await expect(
      organizationService.createStorage(
        orgId,
        "Hacked Storage",
        "default",
        "#123123",
        "details",
      ),
    ).rejects.toThrow("Only managers can create storage.");
  });
});
