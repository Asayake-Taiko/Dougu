import { authService } from "../../../src/lib/services/auth";
import { supabase } from "../../../src/lib/supabase/supabase";

describe("Auth/Profile RLS Permission Tests", () => {
  const randomStr1 = Math.random().toString(36).substring(7);
  const randomStr2 = Math.random().toString(36).substring(7);
  const user1Email = `user1-${randomStr1}@example.com`;
  const user1Password = "password123";
  const user2Email = `user2-${randomStr2}@example.com`;
  const user2Password = "password123";

  beforeAll(async () => {
    await authService.logout();

    // Create two users with unique emails
    await authService.register(user1Email, "User One", user1Password);
    await authService.register(user2Email, "User Two", user2Password);
  });

  beforeEach(async () => {
    await authService.logout();
  });

  it("should fail to read profiles when unauthenticated", async () => {
    const { data } = await supabase.from("profiles").select("*");
    expect(data).toEqual([]);
  });

  it("users should be able to update their own profile", async () => {
    await authService.login(user1Email, user1Password);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    expect(user).toBeDefined();

    const newName = "User One Updated";
    const { error } = await supabase
      .from("profiles")
      .update({ name: newName })
      .eq("id", user!.id);

    expect(error).toBeNull();

    // Verify update
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user!.id)
      .single();
    expect(data?.name).toBe(newName);
  });

  it("users should not be able to update another user's profile", async () => {
    // Login as User 1
    await authService.login(user1Email, user1Password);

    // Get User 2's ID
    await authService.logout();
    await authService.login(user2Email, user2Password);
    const {
      data: { user: user2 },
    } = await supabase.auth.getUser();
    expect(user2).toBeDefined();
    const user2Id = user2!.id;
    await authService.logout();

    // Login as User 1 again
    await authService.login(user1Email, user1Password);

    // Try to update User 2's profile
    await supabase
      .from("profiles")
      .update({ name: "Hacked Name" })
      .eq("id", user2Id);

    // Verify we can't select it
    const { data: readData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user2Id);
    expect(readData).toEqual([]);

    // Login as User 2 and verify the profile is still intact
    await authService.logout();
    await authService.login(user2Email, user2Password);
    const { data: verifyData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user2Id)
      .single();
    expect(verifyData?.name).toBe("User Two");
  });

  it("users should be able to read profiles of people in the same organization", async () => {
    // 1. Setup: Get IDs and create a shared organization
    await authService.login(user1Email, user1Password);
    const {
      data: { user: user1 },
    } = await supabase.auth.getUser();
    const user1Id = user1!.id;

    await authService.logout();
    await authService.login(user2Email, user2Password);
    const {
      data: { user: user2 },
    } = await supabase.auth.getUser();
    const user2Id = user2!.id;

    // 2. User 1 creates an organization
    await authService.logout();
    await authService.login(user1Email, user1Password);
    const { data: org } = await supabase
      .from("organizations")
      .insert({
        name: "Shared Org",
        access_code: "SHARE_" + Math.random().toString(36).substring(7),
        manager_id: user1Id,
      })
      .select()
      .single();

    // 3. Add User 2 to the same organization
    await authService.logout();
    await authService.login(user2Email, user2Password);
    await supabase.from("org_memberships").insert({
      organization_id: org!.id,
      user_id: user2Id,
      type: "USER",
    });

    // 4. Verify User 2 can read User 1's profile
    const { data: profile1 } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user1Id)
      .single();
    expect(profile1?.name).toBe("User One Updated"); // User One was updated in a previous test

    // 5. Verify User 1 can read User 2's profile
    await authService.logout();
    await authService.login(user1Email, user1Password);
    const { data: profile2 } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user2Id)
      .single();
    expect(profile2?.name).toBe("User Two");
  });

  it("users should not be able to read profiles of people that don't share an organization", async () => {
    const user3Email = `user3-${Math.random().toString(36).substring(7)}@example.com`;
    await authService.register(user3Email, "User Three", "password123");

    await authService.login(user3Email, "password123");
    const {
      data: { user: user3 },
    } = await supabase.auth.getUser();
    const user3Id = user3!.id;

    // Login as User 1 (who is in "Shared Org")
    await authService.logout();
    await authService.login(user1Email, user1Password);

    // User 1 should NOT be able to see User 3 (who is not in Shared Org)
    const { data: profile3 } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user3Id);
    expect(profile3).toEqual([]);
  });
});
