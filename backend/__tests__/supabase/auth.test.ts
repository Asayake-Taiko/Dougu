import { describe, it, expect, beforeAll } from "vitest";
import { supabase } from "../utils/rls_utils";
import { generateTestUser } from "../utils/user";

describe("Auth/Profile RLS Permission Tests", () => {
  let user1: any;
  let user2: any;

  beforeAll(async () => {
    user1 = await generateTestUser("User One");
    user2 = await generateTestUser("User Two");
  });

  it("should fail to read profiles when unauthenticated", async () => {
    const { data } = await supabase.from("profiles").select("*");
    expect(data).toEqual([]);
  });

  it("users should be able to update their own profile", async () => {
    const newName = "User One Updated";
    const { error } = await user1.client
      .from("profiles")
      .update({ name: newName })
      .eq("id", user1.user.id);

    expect(error).toBeNull();

    // Verify update
    const { data } = await user1.client
      .from("profiles")
      .select("*")
      .eq("id", user1.user.id)
      .single();
    expect(data?.name).toBe(newName);
  });

  it("users should not be able to update another user's profile", async () => {
    // Try to update User 2's profile using User 1's client
    await user1.client
      .from("profiles")
      .update({ name: "Hacked Name" })
      .eq("id", user2.user.id);

    // Verify we can't select it with user1
    const { data: readData } = await user1.client
      .from("profiles")
      .select("*")
      .eq("id", user2.user.id);
    expect(readData).toEqual([]);

    // Login as User 2 and verify the profile is still intact
    const { data: verifyData } = await user2.client
      .from("profiles")
      .select("*")
      .eq("id", user2.user.id)
      .single();
    expect(verifyData?.name).toBe("User Two");
  });

  it("users should be able to read profiles of people in the same organization", async () => {
    // 1. User 1 creates an organization
    const { data: org, error: orgError } = await user1.client
      .from("organizations")
      .insert({
        name: "Shared Org",
        access_code: "SHARE_" + Math.random().toString(36).substring(7),
        manager_id: user1.user.id,
      })
      .select()
      .single();

    expect(orgError).toBeNull();

    // 2. Add User 2 to the same organization
    const { error: memberError } = await user2.client.from("org_memberships").insert({
      organization_id: org!.id,
      user_id: user2.user.id,
      type: "USER",
    });

    expect(memberError).toBeNull();

    // 3. Verify User 2 can read User 1's profile
    const { data: profile1 } = await user2.client
      .from("profiles")
      .select("*")
      .eq("id", user1.user.id)
      .single();
    expect(profile1?.name).toBe("User One Updated");

    // 4. Verify User 1 can read User 2's profile
    const { data: profile2 } = await user1.client
      .from("profiles")
      .select("*")
      .eq("id", user2.user.id)
      .single();
    expect(profile2?.name).toBe("User Two");
  });

  it("users should not be able to read profiles of people that don't share an organization", async () => {
    const user3 = await generateTestUser("User Three");

    // User 1 should NOT be able to see User 3 (who is not in Shared Org)
    const { data: profile3 } = await user1.client
      .from("profiles")
      .select("*")
      .eq("id", user3.user.id);
    expect(profile3).toEqual([]);
  });
});
