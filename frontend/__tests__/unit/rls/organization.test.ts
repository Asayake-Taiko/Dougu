import { authService } from "../../../src/lib/services/auth";
import { supabase } from "../../../src/lib/supabase/supabase";

describe("Organization RLS Permission Tests", () => {
  const randomStr = Math.random().toString(36).substring(7);
  const ownerEmail = `owner-${randomStr}@example.com`;
  const ownerPassword = "password123";
  const memberEmail = `member-${randomStr}@example.com`;
  const memberPassword = "password123";
  const outsiderEmail = `outsider-${randomStr}@example.com`;
  const outsiderPassword = "password123";

  let ownerId: string;
  let memberId: string;
  let orgId: string;

  beforeAll(async () => {
    await authService.logout();

    // Register Owner
    await authService.register(ownerEmail, "Owner", ownerPassword);
    await authService.login(ownerEmail, ownerPassword);
    const {
      data: { user: owner },
    } = await supabase.auth.getUser();
    ownerId = owner!.id;

    // Create Organization (Owner does this)
    const { data: orgData, error: orgError } = await supabase
      .from("organizations")
      .insert({
        name: "Test Org",
        access_code: "TESTCODE_" + Date.now(),
        manager_id: ownerId,
      })
      .select()
      .single();

    if (orgError) throw orgError;
    orgId = orgData.id;

    await authService.logout();

    // Register Member
    await authService.register(memberEmail, "Member", memberPassword);
    await authService.login(memberEmail, memberPassword);
    const {
      data: { user: member },
    } = await supabase.auth.getUser();
    memberId = member!.id;

    // Member joins Org (Self-service)
    await authService.logout();
    await authService.login(memberEmail, memberPassword);

    await supabase.from("org_memberships").insert({
      organization_id: orgId,
      user_id: memberId,
      type: "USER",
    });

    // Register Outsider
    await authService.logout();
    await authService.register(outsiderEmail, "Outsider", outsiderPassword);
  });

  afterAll(async () => {
    await authService.logout();
  });

  it("Member should be able to read organization", async () => {
    await authService.login(memberEmail, memberPassword);
    const { data, error } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", orgId)
      .single();
    expect(error).toBeNull();
    expect(data.id).toBe(orgId);
  });

  it("Outsider SHOULD be able to read organization (public visibility)", async () => {
    await authService.login(outsiderEmail, outsiderPassword);
    const { data } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", orgId);
    expect(data?.length).toBe(1);
  });

  it("Member should NOT be able to update organization details", async () => {
    await authService.login(memberEmail, memberPassword);
    await supabase
      .from("organizations")
      .update({ name: "Member Hacked Name" })
      .eq("id", orgId);

    await authService.logout();
    await authService.login(ownerEmail, ownerPassword);
    const { data } = await supabase
      .from("organizations")
      .select("name")
      .eq("id", orgId)
      .single();
    expect(data?.name).toBe("Test Org");
  });

  it("Member should NOT be able to delete organization", async () => {
    await authService.login(memberEmail, memberPassword);
    await supabase.from("organizations").delete().eq("id", orgId);

    // Verify it still exists
    await authService.logout();
    await authService.login(ownerEmail, ownerPassword);
    const { data } = await supabase
      .from("organizations")
      .select("id")
      .eq("id", orgId);
    expect(data?.length).toBe(1);
  });

  it("Owner SHOULD be able to update organization", async () => {
    await authService.login(ownerEmail, ownerPassword);
    const { error } = await supabase
      .from("organizations")
      .update({ name: "Owner Updated Name" })
      .eq("id", orgId);
    expect(error).toBeNull();

    const { data } = await supabase
      .from("organizations")
      .select("name")
      .eq("id", orgId)
      .single();
    expect(data?.name).toBe("Owner Updated Name");
  });

  it("member should not be able to delete memberships", async () => {
    await authService.login(memberEmail, memberPassword);

    // Member tries to delete their own membership (or another)
    await supabase
      .from("org_memberships")
      .delete()
      .eq("user_id", memberId)
      .eq("organization_id", orgId);

    // Verify membership still exists
    await authService.login(ownerEmail, ownerPassword);
    const { data } = await supabase
      .from("org_memberships")
      .select("id")
      .eq("user_id", memberId)
      .eq("organization_id", orgId);
    expect(data?.length).toBe(1);
  });

  it("owner should be able to delete memberships", async () => {
    await authService.login(ownerEmail, ownerPassword);

    const { error } = await supabase
      .from("org_memberships")
      .delete()
      .eq("user_id", memberId)
      .eq("organization_id", orgId);

    expect(error).toBeNull();

    // Verify gone
    const { data } = await supabase
      .from("org_memberships")
      .select("id")
      .eq("user_id", memberId)
      .eq("organization_id", orgId);
    expect(data?.length).toBe(0);
  });

  it("owner should be able to delete organization", async () => {
    await authService.login(ownerEmail, ownerPassword);
    const { error } = await supabase
      .from("organizations")
      .delete()
      .eq("id", orgId);

    expect(error).toBeNull();

    // Verify gone
    const { data } = await supabase
      .from("organizations")
      .select("id")
      .eq("id", orgId);
    expect(data?.length).toBe(0);
  });
});
