import { organizationService } from "../../../../src/lib/services/organization";
import { authService } from "../../../../src/lib/services/auth";
import { supabase } from "../../../../src/lib/supabase/supabase";
import { generateUUID } from "../../../../src/lib/utils/UUID";
import { describe, beforeEach, it, expect, beforeAll } from "vitest";

describe("Join Organization Tests", () => {
  let testOrgCode: string;
  let joinerId: string;
  const randomStr = generateUUID();

  beforeAll(async () => {
    await authService.logout();

    // 1. Create a creator and an organization
    const creatorEmail = `creator-${randomStr}@example.com`;
    const creatorPassword = "password123";
    await authService.register(creatorEmail, "Creator User", creatorPassword);

    const {
      data: { user: creator },
    } = await supabase.auth.getUser();
    const { code } = await organizationService.createOrganization(
      `Org_${randomStr.substring(0, 20)}`,
      creator!.id,
    );
    testOrgCode = code;
    await authService.logout();

    // 2. Create a joiner user
    const joinerEmail = `joiner-${randomStr}@example.com`;
    const joinerPassword = "password123";
    await authService.register(joinerEmail, "Joiner User", joinerPassword);

    const {
      data: { user: joiner },
    } = await supabase.auth.getUser();
    joinerId = joiner!.id;
  });

  beforeEach(async () => {
    // Login as joiner before each test
    await authService.login(`joiner-${randomStr}@example.com`, "password123");
  });

  it("join organization with valid code should succeed", async () => {
    await expect(
      organizationService.joinOrganization(testOrgCode, joinerId),
    ).resolves.not.toThrow();

    // Verify membership exists
    const { data: membership } = await supabase
      .from("org_memberships")
      .select("*")
      .eq("user_id", joinerId)
      .maybeSingle();
    expect(membership).not.toBeNull();
  });

  it("join organization with invalid code should fail", async () => {
    const invalidCode = "INVALID";
    await expect(
      organizationService.joinOrganization(invalidCode, joinerId),
    ).rejects.toThrow("Organization not found");
  });

  it("join organization with invalid user id should fail", async () => {
    const invalidUserId = "invalid-user-id";
    await expect(
      organizationService.joinOrganization(testOrgCode, invalidUserId),
    ).rejects.toThrow("Invalid ID format.");
  });

  it("joining an organization the user is already a member of should fail", async () => {
    // User already joined in the first test
    await expect(
      organizationService.joinOrganization(testOrgCode, joinerId),
    ).rejects.toThrow("You are already a member of this organization.");
  });
});
