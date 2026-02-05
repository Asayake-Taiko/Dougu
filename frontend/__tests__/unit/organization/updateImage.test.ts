import { organizationService } from "../../../src/lib/services/organization";
import { authService } from "../../../src/lib/services/auth";
import { supabase } from "../../../src/lib/supabase/supabase";
import { generateUUID } from "../../../src/lib/utils/UUID";

describe("Update Membership Image Tests", () => {
  beforeEach(async () => {
    const email = `testuser_${generateUUID()}@example.com`;
    const password = "password123";

    await authService.logout();
    await authService.register(email, "Test User", password);
  });

  it("member cannot update a storage image", async () => {
    // 1. Create org and storage as User 1
    const orgName = `UpdateImg_Org_${generateUUID().substring(0, 10)}`;
    const {
      data: { user: user1 },
    } = await supabase.auth.getUser();
    const { id: orgId } = await organizationService.createOrganization(
      orgName,
      user1!.id,
    );

    const storageName = "Room A";
    await organizationService.createStorage(
      orgId,
      storageName,
      "default",
      "#000000",
      "details",
    );

    // Get storage membership ID
    const { data: storage } = await supabase
      .from("org_memberships")
      .select("id")
      .eq("organization_id", orgId)
      .eq("type", "STORAGE")
      .eq("storage_name", storageName)
      .single();

    // 2. Register User 2 (Member)
    const user2Email = `member_${generateUUID()}@test.com`;
    await authService.register(user2Email, "Member User", "password123");

    // 3. Attempt update as member (should fail)
    await expect(
      organizationService.updateMembershipImage(
        orgId,
        storage!.id,
        "new_image",
        "#ffffff",
      ),
    ).rejects.toThrow("Only managers can update membership images.");
  });

  it("manager can update a storage image and color", async () => {
    // 1. Create org and storage as Manager
    const orgName = `UpdateImg_Org_${generateUUID().substring(0, 10)}`;
    const {
      data: { user: manager },
    } = await supabase.auth.getUser();
    const { id: orgId } = await organizationService.createOrganization(
      orgName,
      manager!.id,
    );

    const storageName = "Room B";
    await organizationService.createStorage(
      orgId,
      storageName,
      "default",
      "#000000",
      "details",
    );

    // Get storage membership ID
    const { data: storage } = await supabase
      .from("org_memberships")
      .select("id")
      .eq("organization_id", orgId)
      .eq("type", "STORAGE")
      .eq("storage_name", storageName)
      .single();

    // 2. Update image and color
    const newImage = "updated_image_key";
    const newColor = "#ff0000";
    await organizationService.updateMembershipImage(
      orgId,
      storage!.id,
      newImage,
      newColor,
    );

    // 3. Verify update
    const { data: updatedStorage } = await supabase
      .from("org_memberships")
      .select("profile_image, color")
      .eq("id", storage!.id)
      .single();

    expect(updatedStorage?.profile_image).toBe(newImage);
    expect(updatedStorage?.color).toBe(newColor);
  });

  it("manager cannot update a storage image of another organization", async () => {
    // 1. User 1 creates Org 1
    const orgName1 = `Org1_${generateUUID().substring(0, 10)}`;
    const {
      data: { user: user1 },
    } = await supabase.auth.getUser();
    await organizationService.createOrganization(orgName1, user1!.id);

    // 2. User 2 creates Org 2 and storage
    const user2Email = `user2_${generateUUID()}@test.com`;
    await authService.logout(); // Ensure logout before registering new user context
    await authService.register(user2Email, "User Two", "password123");
    await authService.login(user2Email, "password123");

    const orgName2 = `Org2_${generateUUID().substring(0, 10)}`;
    const {
      data: { user: user2 },
    } = await supabase.auth.getUser();
    const { id: orgId2 } = await organizationService.createOrganization(
      orgName2,
      user2!.id,
    );

    const storageName = "Room C";
    await organizationService.createStorage(
      orgId2,
      storageName,
      "default",
      "#000000",
      "details",
    );

    const { data: storage } = await supabase
      .from("org_memberships")
      .select("id")
      .eq("organization_id", orgId2)
      .eq("type", "STORAGE")
      .eq("storage_name", storageName)
      .single();

    // 3. Switch back to User 1 and attempt to update User 2's storage
    await authService.logout();
    await authService.login(user1!.email!, "password123");

    // Case A: Passing Org 2 ID (User 1 is not manager of Org 2)
    await expect(
      organizationService.updateMembershipImage(
        orgId2,
        storage!.id,
        "hack_image",
        "#000000",
      ),
    ).rejects.toThrow("Only managers can update membership images.");
  });
});
