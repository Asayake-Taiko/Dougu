import { organizationService } from "../../../../src/lib/services/organization";
import { authService } from "../../../../src/lib/services/auth";
import { supabase } from "../../../../src/lib/supabase/supabase";
import { generateUUID } from "../../../../src/lib/utils/UUID";
import { describe, it, expect, beforeEach } from "vitest";

describe("Organization Transfer Tests", () => {
  let owner: { id: string; email: string };
  let member: { id: string; email: string };
  let orgId: string;

  beforeEach(async () => {
    // 1. Create Owner and Org (using valid name)
    const ownerEmail = `owner_${generateUUID()}@test.com`;
    await authService.register(ownerEmail, "Owner", "password123");
    const {
      data: { user: ownerUser },
    } = await supabase.auth.getUser();
    owner = { id: ownerUser!.id, email: ownerEmail };

    const { id } = await organizationService.createOrganization(
      "Transfer_Test_Org",
      owner.id,
    );
    orgId = id;

    // 2. Create Member
    const memberEmail = `member_${generateUUID()}@test.com`;
    await authService.register(memberEmail, "Member", "password123");
    const {
      data: { user: memberUser },
    } = await supabase.auth.getUser();
    member = { id: memberUser!.id, email: memberEmail };

    // Join Org (manually)
    await supabase.from("org_memberships").insert({
      organization_id: orgId,
      user_id: member.id,
      type: "USER",
    });

    await authService.logout();
    await authService.login(owner.email, "password123");
  });

  it("only a manager should be able to transfer an organization", async () => {
    await authService.login(member.email, "password123");
    await expect(
      organizationService.transferOwnership(orgId, member.id),
    ).rejects.toThrow("Only managers can transfer ownership.");
  });

  it("successfully transfer an organization", async () => {
    await authService.login(owner.email, "password123");
    await expect(
      organizationService.transferOwnership(orgId, member.id),
    ).resolves.not.toThrow();

    const { data } = await supabase
      .from("organizations")
      .select("manager_id")
      .eq("id", orgId)
      .single();
    expect(data).not.toBeNull();
    expect(data!.manager_id).toBe(member.id);
  });

  it("manager can transfer an organization to themselves (noop/allowed)", async () => {
    await authService.login(owner.email, "password123");
    await expect(
      organizationService.transferOwnership(orgId, owner.id),
    ).resolves.not.toThrow();

    const { data } = await supabase
      .from("organizations")
      .select("manager_id")
      .eq("id", orgId)
      .single();
    expect(data).not.toBeNull();
    expect(data!.manager_id).toBe(owner.id);
  });

  it("manager cannot transfer an organization to a user who is not a member", async () => {
    const outsiderEmail = `outsider_${generateUUID()}@test.com`;
    await authService.register(outsiderEmail, "Outsider", "password123");
    const {
      data: { user: outsider },
    } = await supabase.auth.getUser();

    await authService.login(owner.email, "password123");

    await expect(
      organizationService.transferOwnership(orgId, outsider!.id),
    ).rejects.toThrow();
  });

  it("manager cannot transfer an organization to a storage", async () => {
    // Create a storage
    const storageId = generateUUID();
    await supabase.from("org_memberships").insert({
      id: storageId,
      organization_id: orgId,
      type: "STORAGE",
      storage_name: "Test Storage",
    });

    await authService.login(owner.email, "password123");

    await expect(
      organizationService.transferOwnership(orgId, storageId),
    ).rejects.toThrow("Only users can be owners.");
  });
});
