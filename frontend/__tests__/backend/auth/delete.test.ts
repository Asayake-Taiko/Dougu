import { authService } from "../../../src/lib/services/auth";
import { organizationService } from "../../../src/lib/services/organization";
import { supabase } from "../../../src/lib/supabase/supabase";
import { generateUUID } from "../../../src/lib/utils/UUID";
import { describe, it, expect, beforeEach } from "vitest";

describe("AuthService Delete Account Tests", () => {
  beforeEach(async () => {
    await authService.logout();
  });

  it("an organization owner cannot delete their account", async () => {
    const randomStr = generateUUID();
    const email = `owner-${randomStr}@example.com`;
    const password = "password123";
    const name = `Owner ${randomStr}`;

    // Register and login
    await authService.register(email, name, password);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not found after registration");

    // Create an organization (this makes the user a manager)
    await organizationService.createOrganization(`Org-${randomStr}`, user.id);

    // Attempt to delete account - should fail with specific error
    await expect(authService.deleteAccount()).rejects.toThrow();
  });

  it("a regular user can delete their account and items are reassigned", async () => {
    const randomStr = generateUUID();

    // 1. Create a Manager and an Org (to have an org to join)
    const ownerEmail = `owner2-${randomStr}@example.com`;
    await authService.register(ownerEmail, "Owner 2", "password123");
    const {
      data: { user: owner },
    } = await supabase.auth.getUser();
    const { code: orgCode } = await organizationService.createOrganization(
      `Org2-${randomStr}`,
      owner!.id,
    );
    await authService.logout();

    // 2. Create a Regular User
    const memberEmail = `member-${randomStr}@example.com`;
    const memberName = `Member ${randomStr}`;
    await authService.register(memberEmail, memberName, "password123");
    const {
      data: { user: member },
    } = await supabase.auth.getUser();
    if (!member) throw new Error("Member not found");

    // 3. Join Organization
    await organizationService.joinOrganization(orgCode, member.id);

    // Get membership ID
    const { data: membership } = await supabase
      .from("org_memberships")
      .select("id")
      .eq("user_id", member.id)
      .single();

    const membershipId = membership!.id;

    // 4. Create Equipment assigned to Member (MUST BE DONE AS OWNER DUE TO RLS)
    await authService.logout();
    await authService.login(ownerEmail, "password123");

    const equipmentId = generateUUID();
    const { error: equipErr } = await supabase.from("equipment").insert({
      id: equipmentId,
      name: "Test Drill",
      organization_id: (
        await supabase
          .from("organizations")
          .select("id")
          .eq("access_code", orgCode)
          .single()
      ).data!.id,
      assigned_to: membershipId,
    });
    if (equipErr) throw equipErr;

    // Switch back to member
    await authService.logout();
    await authService.login(memberEmail, "password123");

    // 5. Delete Account
    await expect(authService.deleteAccount()).resolves.not.toThrow();

    // 6. Verify Deletion and Reassignment

    // Log back in as owner to verify (since member is deleted and we are signed out)
    await authService.login(ownerEmail, "password123");

    // Verify membership reassigned to deleted@dougu.app
    const { data: deletedUserId } = await supabase.rpc("get_user_id_by_email", {
      p_email: "deleted@dougu.app",
    });

    const { data: updatedMembership } = await supabase
      .from("org_memberships")
      .select("*")
      .eq("id", membershipId)
      .single();

    expect(updatedMembership!.user_id).toBe(deletedUserId);
    expect(updatedMembership!.details).toBe("Reassigned from deleted user");

    // Verify equipment still exists and is assigned to the reassigned membership
    const { data: updatedEquipment } = await supabase
      .from("equipment")
      .select("*")
      .eq("id", equipmentId)
      .single();

    expect(updatedEquipment!.assigned_to).toBe(membershipId);
  });
});
