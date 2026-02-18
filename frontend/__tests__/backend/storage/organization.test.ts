import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { generateTestUser } from "../utils/helper";
import {
  createCleanupTracker,
  cleanupTestData,
  trackUser,
  trackOrganization,
} from "../utils/cleanup";
import { decode } from "base64-arraybuffer";

// Helper to create a dummy 1x1 pixel PNG
const createDummyImage = () => {
  return "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
};

describe("Organization Storage Rules", () => {
  let manager: any;
  let member: any;
  let outsider: any;
  let orgId: string;
  const cleanup = createCleanupTracker();

  beforeAll(async () => {
    // Setup users
    manager = await generateTestUser("Org Manager");
    member = await generateTestUser("Org Member");
    outsider = await generateTestUser("Org Outsider");

    trackUser(cleanup, manager.user.id);
    trackUser(cleanup, member.user.id);
    trackUser(cleanup, outsider.user.id);

    // Create Org
    const { data: orgData } = await manager.client
      .from("organizations")
      .insert({
        name: "Storage Test Org",
        access_code: "STO_" + Math.random().toString(36).substring(7),
        manager_id: manager.user.id,
      })
      .select()
      .single();
    orgId = orgData!.id;
    trackOrganization(cleanup, orgId);

    // Member joins the Org
    await member.client.from("org_memberships").insert({
      organization_id: orgId,
      user_id: member.user.id,
      type: "USER",
    });
  });

  afterAll(async () => {
    await cleanupTestData(cleanup);
  });

  // UPLOAD
  /* ------------------------------------------------------------------- */
  it("Manager should be able to upload organization profile image", async () => {
    const { error } = await manager.client.storage
      .from("images")
      .upload(
        `organizations/${orgId}/profile.png`,
        decode(createDummyImage()),
        {
          contentType: "image/png",
          upsert: true,
        },
      );
    expect(error).toBeNull();
  });

  it("Member should NOT be able to upload organization profile image", async () => {
    const { error } = await member.client.storage
      .from("images")
      .upload(
        `organizations/${orgId}/profile.png`,
        decode(createDummyImage()),
        {
          contentType: "image/png",
          upsert: true,
        },
      );
    expect(error).not.toBeNull();
  });

  it("Manager should be able to upload equipment image", async () => {
    const { error } = await manager.client.storage
      .from("images")
      .upload(
        `organizations/${orgId}/equipment/item1.png`,
        decode(createDummyImage()),
        {
          contentType: "image/png",
          upsert: true,
        },
      );
    expect(error).toBeNull();
  });
  it("Manager should be able to upload storage image", async () => {
    const { error } = await manager.client.storage
      .from("images")
      .upload(
        `organizations/${orgId}/storage/loc1.png`,
        decode(createDummyImage()),
        {
          contentType: "image/png",
          upsert: true,
        },
      );
    expect(error).toBeNull();
  });

  it("Member should NOT be able to upload equipment image", async () => {
    const { error } = await member.client.storage
      .from("images")
      .upload(
        `organizations/${orgId}/equipment/member_upload.png`,
        decode(createDummyImage()),
        {
          contentType: "image/png",
        },
      );
    expect(error).not.toBeNull();
  });

  it("Member should NOT be able to upload storage image", async () => {
    const { error } = await member.client.storage
      .from("images")
      .upload(
        `organizations/${orgId}/storage/member_upload.png`,
        decode(createDummyImage()),
        {
          contentType: "image/png",
        },
      );
    expect(error).not.toBeNull();
  });

  // READ
  /* ------------------------------------------------------------------- */
  it("Member should be able to view organization profile image", async () => {
    const { data, error } = await member.client.storage
      .from("images")
      .createSignedUrl(`organizations/${orgId}/profile.png`, 60);

    expect(error).toBeNull();
    expect(data?.signedUrl).toBeTruthy();
  });

  it("Outsider should NOT be able to view organization images", async () => {
    const { error } = await outsider.client.storage
      .from("images")
      .download(`organizations/${orgId}/profile.png`);

    expect(error).not.toBeNull();
  });
  it("Member should be able to view equipment image", async () => {
    const { data, error } = await member.client.storage
      .from("images")
      .createSignedUrl(`organizations/${orgId}/equipment/item1.png`, 60);

    expect(error).toBeNull();
    expect(data?.signedUrl).toBeTruthy();
  });

  it("Outsider should NOT be able to view equipment image", async () => {
    const { error } = await outsider.client.storage
      .from("images")
      .download(`organizations/${orgId}/equipment/item1.png`);

    expect(error).not.toBeNull();
  });

  it("Member should be able to view storage image", async () => {
    const { data, error } = await member.client.storage
      .from("images")
      .createSignedUrl(`organizations/${orgId}/storage/loc1.png`, 60);

    expect(error).toBeNull();
    expect(data?.signedUrl).toBeTruthy();
  });

  it("Outsider should NOT be able to view storage image", async () => {
    const { error } = await outsider.client.storage
      .from("images")
      .download(`organizations/${orgId}/storage/loc1.png`);

    expect(error).not.toBeNull();
  });

  // LIMITS
  /* ------------------------------------------------------------------- */
  it("Should enforce 50 equipment image limit logic", async () => {
    // 1. Upload 49 images
    const uploadPromises = Array.from({ length: 49 }).map((_, i) => {
      return manager.client.storage
        .from("images")
        .upload(
          `organizations/${orgId}/equipment/limit_test_${i}.png`,
          decode(createDummyImage()),
          {
            contentType: "image/png",
            upsert: true,
          },
        );
    });
    const results = await Promise.all(uploadPromises);
    const errors = results.filter((r) => r.error);
    expect(errors.length).toBe(0);

    // 2. Attempt to upload 50th image
    const { error: error50 } = await manager.client.storage
      .from("images")
      .upload(
        `organizations/${orgId}/equipment/limit_test_50.png`,
        decode(createDummyImage()),
        {
          contentType: "image/png",
          upsert: true,
        },
      );
    expect(error50).not.toBeNull();

    // 3. Cleanup: Remove the 49 images to avoid polluting other tests
    const filenames = Array.from({ length: 49 }).map(
      (_, i) => `organizations/${orgId}/equipment/limit_test_${i}.png`,
    );
    await manager.client.storage.from("images").remove(filenames);
  });

  // DELETE
  /* ------------------------------------------------------------------- */
  it("Manager should be able to delete organization image", async () => {
    const { error } = await manager.client.storage
      .from("images")
      .remove([`organizations/${orgId}/equipment/item1.png`]);
    expect(error).toBeNull();
  });

  it("Member should NOT be able to delete organization image", async () => {
    await manager.client.storage
      .from("images")
      .upload(
        `organizations/${orgId}/equipment/member_delete_test.png`,
        decode(createDummyImage()),
      );

    await member.client.storage
      .from("images")
      .remove([`organizations/${orgId}/equipment/member_delete_test.png`]);

    const { data: listData } = await manager.client.storage
      .from("images")
      .list(`organizations/${orgId}/equipment`);

    const found = listData?.find(
      (f: any) => f.name === "member_delete_test.png",
    );
    expect(found).toBeDefined();
  });

  it("Manager should be able to delete equipment image", async () => {
    const { error: uploadError } = await manager.client.storage
      .from("images")
      .upload(
        `organizations/${orgId}/equipment/delete_test.png`,
        decode(createDummyImage()),
      );
    expect(uploadError).toBeNull();

    const { error } = await manager.client.storage
      .from("images")
      .remove([`organizations/${orgId}/equipment/delete_test.png`]);
    expect(error).toBeNull();
  });

  it("Manager should be able to delete storage image", async () => {
    const { error } = await manager.client.storage
      .from("images")
      .remove([`organizations/${orgId}/storage/loc1.png`]);
    expect(error).toBeNull();
  });

  it("Member should NOT be able to delete equipment image", async () => {
    const filename = "member_delete_test_2.png";
    const path = `organizations/${orgId}/equipment/${filename}`;

    // 1. Manager uploads
    const { error: uploadError } = await manager.client.storage
      .from("images")
      .upload(path, decode(createDummyImage()), {
        upsert: true,
      });
    expect(uploadError).toBeNull();

    // 2. Member tries to delete
    await member.client.storage.from("images").remove([path]);

    // 3. Verify it still exists
    const { data: listData } = await manager.client.storage
      .from("images")
      .list(`organizations/${orgId}/equipment`);

    const found = listData?.find((f: any) => f.name === filename);
    expect(found).toBeDefined();
  });

  it("Member should NOT be able to delete storage image", async () => {
    const filename = "member_delete_test_storage.png";
    const path = `organizations/${orgId}/storage/${filename}`;

    const { error: uploadError } = await manager.client.storage
      .from("images")
      .upload(path, decode(createDummyImage()), {
        upsert: true,
      });
    expect(uploadError).toBeNull();

    await member.client.storage.from("images").remove([path]);

    const { data: listData } = await manager.client.storage
      .from("images")
      .list(`organizations/${orgId}/storage`);

    const found = listData?.find((f: any) => f.name === filename);
    expect(found).toBeDefined();
  });
});
