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

describe("Profile Storage Rules", () => {
  let userA: any;
  let userB: any;
  let userC: any;
  let orgId: string;
  const cleanup = createCleanupTracker();

  beforeAll(async () => {
    // Setup users
    userA = await generateTestUser("User A");
    userB = await generateTestUser("User B");
    userC = await generateTestUser("User C");

    trackUser(cleanup, userA.user.id);
    trackUser(cleanup, userB.user.id);
    trackUser(cleanup, userC.user.id);

    // Create Org with User A
    const { data: orgData } = await userA.client
      .from("organizations")
      .insert({
        name: "Profile Test Org",
        access_code: "PTO_" + Math.random().toString(36).substring(7),
        manager_id: userA.user.id,
      })
      .select()
      .single();
    orgId = orgData!.id;
    trackOrganization(cleanup, orgId);

    // User B joins User A's Org
    await userB.client.from("org_memberships").insert({
      organization_id: orgId,
      user_id: userB.user.id,
      type: "USER",
    });

    // User C is just an outsider
  });

  afterAll(async () => {
    await cleanupTestData(cleanup);
  });

  // CREATE
  /* ------------------------------------------------------------------- */
  it("A user should be able to upload their own profile image", async () => {
    const { error } = await userA.client.storage
      .from("images")
      .upload(
        `profiles/${userA.user.id}/profile.png`,
        decode(createDummyImage()),
        {
          contentType: "image/png",
          upsert: true,
        },
      );
    expect(error).toBeNull();
  });

  it("A user should NOT be able to upload another user's profile image", async () => {
    const { error } = await userB.client.storage
      .from("images")
      .upload(
        `profiles/${userA.user.id}/profile.png`,
        decode(createDummyImage()),
        {
          contentType: "image/png",
          upsert: true,
        },
      );
    expect(error).not.toBeNull();
  });

  // READ
  /* ------------------------------------------------------------------- */
  it("A user should be able to view their own profile image", async () => {
    const { data, error } = await userA.client.storage
      .from("images")
      .createSignedUrl(`profiles/${userA.user.id}/profile.png`, 60);

    expect(error).toBeNull();
    expect(data?.signedUrl).toBeTruthy();
  });

  it("Members that share an organization should be able to view each other's profile image", async () => {
    const { data, error } = await userB.client.storage
      .from("images")
      .createSignedUrl(`profiles/${userA.user.id}/profile.png`, 60);

    expect(error).toBeNull();
    expect(data?.signedUrl).toBeTruthy();
  });

  it("Members that don't share an organization should NOT be able to view each other's profile image", async () => {
    const { error } = await userC.client.storage
      .from("images")
      .download(`profiles/${userA.user.id}/profile.png`);

    expect(error).not.toBeNull();
  });

  // UPDATE
  /* ------------------------------------------------------------------- */
  it("A user should be able to modify their own profile image", async () => {
    const { error } = await userA.client.storage
      .from("images")
      .upload(
        `profiles/${userA.user.id}/profile.png`,
        decode(createDummyImage()),
        {
          contentType: "image/png",
          upsert: true,
        },
      );
    expect(error).toBeNull();
  });

  it("A user should NOT be able to modify another user's profile image", async () => {
    const { error } = await userB.client.storage
      .from("images")
      .upload(
        `profiles/${userA.user.id}/profile.png`,
        decode(createDummyImage()),
        {
          contentType: "image/png",
          upsert: true,
        },
      );
    expect(error).not.toBeNull();
  });

  // DELETE
  /* ------------------------------------------------------------------- */
  it("A user should be able to delete their own profile image", async () => {
    const { error } = await userA.client.storage
      .from("images")
      .remove([`profiles/${userA.user.id}/profile.png`]);
    expect(error).toBeNull();
  });

  it("A user should NOT be able to delete another user's profile image", async () => {
    // First ensure there is an image to delete (upload it as User A)
    await userA.client.storage
      .from("images")
      .upload(
        `profiles/${userA.user.id}/delete_test.png`,
        decode(createDummyImage()),
      );

    // Try to delete as User B
    await userB.client.storage
      .from("images")
      .remove([`profiles/${userA.user.id}/delete_test.png`]);

    // Note: remove might not return an error for non-existent files or RLS blocking,
    // but the file should still exist when checked by User A.

    const { data: listData } = await userA.client.storage
      .from("images")
      .list(`profiles/${userA.user.id}`);

    const found = listData?.find((f: any) => f.name === "delete_test.png");
    expect(found).toBeDefined();
  });
});
