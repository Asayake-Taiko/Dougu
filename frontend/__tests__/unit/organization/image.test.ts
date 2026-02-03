import { organizationService } from "../../../src/lib/services/organization";
import { authService } from "../../../src/lib/services/auth";
import { supabase } from "../../../src/lib/supabase/supabase";
import { generateUUID } from "../../../src/lib/utils/UUID";

describe("Organization Image Tests", () => {
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
      "Image_Test_Org",
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

  it("only managers should be able to update organization image", async () => {
    await authService.login(member.email, "password123");
    await expect(
      organizationService.updateOrganizationImage(orgId, "new_image_url"),
    ).rejects.toThrow("Only managers can update organization images.");
  });

  it("successfully update organization image", async () => {
    await authService.login(owner.email, "password123");
    await expect(
      organizationService.updateOrganizationImage(orgId, "new_image_url"),
    ).resolves.not.toThrow();

    const { data } = await supabase
      .from("organizations")
      .select("image")
      .eq("id", orgId)
      .single();
    expect(data).not.toBeNull();
    expect(data!.image).toBe("new_image_url");
  });

  it("manager cannot update image for a different organization", async () => {
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
    await supabase.from("org_memberships").insert({
      organization_id: otherOrgId,
      user_id: member.id,
      type: "USER",
    });

    // Login as original owner
    await authService.login(owner.email, "password123");
    // Try to update image for otherOrgId
    await expect(
      organizationService.updateOrganizationImage(otherOrgId, "new_image_url"),
    ).rejects.toThrow("Only managers can update organization images.");
  });
});
