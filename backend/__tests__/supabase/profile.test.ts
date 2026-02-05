import { describe, it, expect, beforeAll } from "vitest";
import { supabase } from "../utils/rls_utils";
import { generateTestUser } from "../utils/user";

describe("Profile RLS Permission Tests", () => {
  let userA: any; // In Org 1
  let userB: any; // In Org 1
  let userC: any; // In Org 2
  let org1Id: string;
  let org2Id: string;

  beforeAll(async () => {
    userA = await generateTestUser("User A");
    userB = await generateTestUser("User B");
    userC = await generateTestUser("User C");

    // Create Org 1 (User A owner)
    const { data: org1 } = await userA.client
      .from("organizations")
      .insert({
        name: "Org 1",
        access_code: "ORG1_" + Math.random().toString(36).substring(7),
        manager_id: userA.user.id,
      })
      .select()
      .single();
    org1Id = org1.id;

    // User B joins Org 1
    await userB.client.from("org_memberships").insert({
      organization_id: org1Id,
      user_id: userB.user.id,
      type: "USER"
    });

    // Create Org 2 (User C owner)
    const { data: org2 } = await userC.client
      .from("organizations")
      .insert({
        name: "Org 2",
        access_code: "ORG2_" + Math.random().toString(36).substring(7),
        manager_id: userC.user.id,
      })
      .select()
      .single();
    org2Id = org2.id;
  });

  // CREATE
  /* ------------------------------------------------------------------- */
  it("an authenticated user cannot create a profile (system managed)", async () => {
    // Authenticated user tries to create a random profile
    const { error } = await userA.client
      .from("profiles")
      .insert({
        id: "00000000-0000-0000-0000-000000000000",
        name: "Illegal Profile"
      });
    expect(error).not.toBeNull();
  });

  it("an unauthenticated user cannot create a profile", async () => {
    const { error } = await supabase
      .from("profiles")
      .insert({
        id: "00000000-0000-0000-0000-000000000001",
        name: "Anon Profile"
      });
    expect(error).not.toBeNull();
  });

  // READ
  /* ------------------------------------------------------------------- */
  it("an authenticated user can read their own profile", async () => {
    const { data, error } = await userA.client
      .from("profiles")
      .select("*")
      .eq("id", userA.user.id)
      .single();
    expect(error).toBeNull();
    expect(data.id).toBe(userA.user.id);
  });

  it("an authenticated user can read profiles of other users that share at least one organization", async () => {
    // User A should be able to see User B
    const { data, error } = await userA.client
      .from("profiles")
      .select("*")
      .eq("id", userB.user.id)
      .single();
    expect(error).toBeNull();
    expect(data.id).toBe(userB.user.id);
  });

  it("an authenticated user cannot read profiles of other users that DO NOT share an organization", async () => {
    // User A should NOT be able to see User C
    const { data } = await userA.client
      .from("profiles")
      .select("*")
      .eq("id", userC.user.id);
    expect(data).toEqual([]);
  });

  it("an unauthenticated user cannot read any profiles", async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userA.user.id);
    // Usually via REST it returns [] for no permission read
    expect(data).toEqual([]);
  });

  // UPDATE
  /* ------------------------------------------------------------------- */
  it("an authenticated user can update their own profile", async () => {
    const { error } = await userA.client
      .from("profiles")
      .update({ name: "Updated Name A" })
      .eq("id", userA.user.id);
    expect(error).toBeNull();

    // Verify
    const { data } = await userA.client
      .from("profiles")
      .select("name")
      .eq("id", userA.user.id)
      .single();
    expect(data.name).toBe("Updated Name A");
  });

  it("an authenticated user cannot update profiles of other users", async () => {
    const { error } = await userA.client
      .from("profiles")
      .update({ name: "Hacked B" })
      .eq("id", userB.user.id);

    // Should verify it wasn't updated. 
    // RLS often silently denies updates (modifies 0 rows) rather than throwing error.

    const { data } = await userB.client
      .from("profiles")
      .select("name")
      .eq("id", userB.user.id)
      .single();
    expect(data.name).not.toBe("Hacked B");
  });

  it("an unauthenticated user cannot update any profiles", async () => {
    const { error } = await supabase
      .from("profiles")
      .update({ name: "Anon Hack" })
      .eq("id", userA.user.id);

    // Verify
    const { data } = await userA.client
      .from("profiles")
      .select("name")
      .eq("id", userA.user.id)
      .single();
    expect(data.name).not.toBe("Anon Hack");
  });

  // DELETE
  /* ------------------------------------------------------------------- */
  it("nobody can delete a profile directly via the table", async () => {
    // User A tries to delete their own profile
    const { error } = await userA.client
      .from("profiles")
      .delete()
      .eq("id", userA.user.id);

    // To be sure, verify it still exists.
    const { data } = await userA.client
      .from("profiles")
      .select("id")
      .eq("id", userA.user.id);
    expect(data?.length).toBe(1);
  });
});