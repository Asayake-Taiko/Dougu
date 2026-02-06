import { organizationService } from "../../../../src/lib/services/organization";
import { authService } from "../../../../src/lib/services/auth";
import { supabase } from "../../../../src/lib/supabase/supabase";
import { generateUUID } from "../../../../src/lib/utils/UUID";
import { describe, beforeEach, it, expect } from "vitest";

describe("Membership Deletion Tests", () => {
  let owner: { id: string; email: string };
  let member: { id: string; email: string };
  let orgId: string;

  beforeEach(async () => {
    // 1. Create Owner and Org
    const ownerEmail = `owner_${generateUUID()}@test.com`;
    await authService.register(ownerEmail, "Owner", "password123");
    const {
      data: { user: ownerUser },
    } = await supabase.auth.getUser();
    owner = { id: ownerUser!.id, email: ownerEmail };

    const { id } = await organizationService.createOrganization(
      "Member_Test_Org",
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

    // Join Org (manually via DB to save overhead/avoid Access Code)
    await authService.logout();
    await authService.login(owner.email, "password123");
  });

  it("only a manager should be able to delete a membership", async () => {
    // Setup a membership to delete
    const testMemberId = generateUUID();
    await supabase.from("org_memberships").insert({
      id: testMemberId,
      organization_id: orgId,
      user_id: member.id,
      type: "USER",
    });

    // Login as member (non-manager)
    await authService.login(member.email, "password123");
    await expect(
      organizationService.deleteMembership(orgId, testMemberId),
    ).rejects.toThrow("Only managers can delete memberships.");
  });

  it("successfully delete a membership", async () => {
    const testMemberId = generateUUID();
    await supabase.from("org_memberships").insert({
      id: testMemberId,
      organization_id: orgId,
      user_id: member.id,
      type: "USER",
    });

    await authService.login(owner.email, "password123");
    await expect(
      organizationService.deleteMembership(orgId, testMemberId),
    ).resolves.not.toThrow();

    const { data } = await supabase
      .from("org_memberships")
      .select("id")
      .eq("id", testMemberId)
      .maybeSingle();
    expect(data).toBeNull();
  });

  it("manager cannot delete memberships for a different organization", async () => {
    // Create a second org that owner DOES NOT manage
    const otherOwnerEmail = `other_owner_${generateUUID()}@test.com`;
    await authService.register(otherOwnerEmail, "Other Owner", "password123");
    const {
      data: { user: otherUser },
    } = await supabase.auth.getUser();
    const { id: otherOrgId } = await organizationService.createOrganization(
      "Other_Org",
      otherUser!.id,
    );

    // Login as member to join other org
    await authService.login(member.email, "password123");
    const testMemberId = generateUUID();
    await supabase.from("org_memberships").insert({
      id: testMemberId,
      organization_id: otherOrgId,
      user_id: member.id,
      type: "USER",
    });

    // Login as original owner
    await authService.login(owner.email, "password123");
    // Try to delete membership from otherOrgId
    await expect(
      organizationService.deleteMembership(otherOrgId, testMemberId),
    ).rejects.toThrow("Only managers can delete memberships.");
  });

  it("manager cannot delete their own membership", async () => {
    // Find owner's own membership ID
    const { data: membership } = await supabase
      .from("org_memberships")
      .select("id")
      .eq("organization_id", orgId)
      .eq("user_id", owner.id)
      .single();

    await authService.login(owner.email, "password123");
    // This should fail at the DB level (trigger), and service should throw
    await expect(
      organizationService.deleteMembership(orgId, membership!.id),
    ).rejects.toThrow(
      "Cannot delete membership: User is the Organization Manager. Transfer ownership first.",
    );
  });

  it("deleting a membership should cascade delete their equipment and containers", async () => {
    // 1. Setup member: Login as member to join (comply with RLS)
    await authService.login(member.email, "password123");
    const testMemberId = generateUUID();
    await supabase.from("org_memberships").insert({
      id: testMemberId,
      organization_id: orgId,
      user_id: member.id,
      type: "USER",
    });

    // Switch back to Owner to assign resources
    await authService.login(owner.email, "password123");

    // 2. Assign container to member
    const containerId = generateUUID();
    const { error: cErr } = await supabase.from("containers").insert({
      id: containerId,
      name: "Member's Box",
      organization_id: orgId,
      assigned_to: testMemberId,
    });
    if (cErr) console.error("Setup Container Error:", cErr);

    // 3. Assign equipment to member
    const equipmentId = generateUUID();
    await supabase.from("equipment").insert({
      id: equipmentId,
      name: "Member's Laptop",
      organization_id: orgId,
      assigned_to: testMemberId,
    });

    // Verify existence
    const { data: c1 } = await supabase
      .from("containers")
      .select("id")
      .eq("id", containerId)
      .single();
    const { data: e1 } = await supabase
      .from("equipment")
      .select("id")
      .eq("id", equipmentId)
      .single();
    expect(c1).not.toBeNull();
    expect(e1).not.toBeNull();

    // 4. Delete membership
    await authService.login(owner.email, "password123");
    await organizationService.deleteMembership(orgId, testMemberId);

    // 5. Verify cascade
    const { data: c2 } = await supabase
      .from("containers")
      .select("id")
      .eq("id", containerId)
      .maybeSingle();
    const { data: e2 } = await supabase
      .from("equipment")
      .select("id")
      .eq("id", equipmentId)
      .maybeSingle();

    expect(c2).toBeNull();
    expect(e2).toBeNull();
  });
});
