import { equipmentService } from "../../../../src/lib/services/equipment";
import { organizationService } from "../../../../src/lib/services/organization";
import { authService } from "../../../../src/lib/services/auth";
import { supabase } from "../../../../src/lib/supabase/supabase";
import { generateUUID } from "../../../../src/lib/utils/UUID";
import { describe, beforeEach, it, expect } from "vitest";

describe("Update Container Tests", () => {
  let managerId: string;
  let managerEmail: string;
  let orgId: string;
  let memberId: string; // manager's member record
  let containerId: string;
  const password = "password123";

  beforeEach(async () => {
    // 1. Setup Manager & Org
    managerEmail = `manager_${generateUUID()}@example.com`;
    await authService.logout();
    await authService.register(managerEmail, "Manager User", password);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    managerId = user!.id;

    const orgName = `Test_Org_${generateUUID().substring(0, 8)}`;
    const org = await organizationService.createOrganization(
      orgName,
      managerId,
    );
    orgId = org.id;

    const { data: membership } = await supabase
      .from("org_memberships")
      .select("id")
      .eq("organization_id", orgId)
      .eq("user_id", managerId)
      .single();
    memberId = membership!.id;

    // 2. Create a Container
    const containerName = "Original Container";
    await equipmentService.createContainer(1, {
      name: containerName,
      organization_id: orgId,
      assigned_to: memberId,
      color: "red",
      details: "Original details",
    });

    const { data: container } = await supabase
      .from("containers")
      .select("id")
      .eq("organization_id", orgId)
      .eq("name", containerName)
      .single();
    containerId = container!.id;
  });

  it("should allow a manager to update container details", async () => {
    const newName = "Updated Container Name";
    const newDetails = "Updated details";
    const newColor = "blue";

    await equipmentService.updateContainer(containerId, {
      name: newName,
      details: newDetails,
      color: newColor,
    });

    const { data: updatedContainer } = await supabase
      .from("containers")
      .select("*")
      .eq("id", containerId)
      .single();

    expect(updatedContainer.name).toBe(newName);
    expect(updatedContainer.details).toBe(newDetails);
    expect(updatedContainer.color).toBe(newColor);
  });

  it("should not allow a manager to update a container of another organization", async () => {
    // Login as another manager
    const otherManagerEmail = `other_${generateUUID()}@test.com`;
    await authService.register(otherManagerEmail, "Other Manager", password);
    const {
      data: { user: otherUser },
    } = await supabase.auth.getUser();

    // Create another org
    await organizationService.createOrganization("Other_Org", otherUser!.id);

    // Try to update the first org's container
    await expect(
      equipmentService.updateContainer(containerId, {
        name: "Hacked Name",
      }),
    ).rejects.toThrow();

    // Verify no change
    await authService.login(managerEmail, password);
    const { data: container } = await supabase
      .from("containers")
      .select("name")
      .eq("id", containerId)
      .single();
    expect(container).not.toBeNull();
    expect(container!.name).toBe("Original Container");
  });

  it("should not allow a regular member to update restricted fields (name, details, color)", async () => {
    // 1. Register Member
    const memberEmail = `member_${generateUUID()}@test.com`;
    await authService.register(memberEmail, "Regular Member", password);
    const {
      data: { user: memberUser },
    } = await supabase.auth.getUser();

    // 2. Login as Member and Join Org (Self-Join)
    await authService.login(memberEmail, password);
    await supabase.from("org_memberships").insert({
      organization_id: orgId,
      user_id: memberUser!.id,
      type: "USER",
      details: "Test Member",
    });

    // Try to update name
    await expect(
      equipmentService.updateContainer(containerId, {
        name: "Member Update",
      }),
    ).rejects.toThrow(/Only managers can update container details./);

    // Verify no change
    await authService.login(managerEmail, password);
    const { data: container } = await supabase
      .from("containers")
      .select("name")
      .eq("id", containerId)
      .single();
    expect(container).not.toBeNull();
    expect(container!.name).toBe("Original Container");
  });

  it("should allow a regular member to update assigned_to", async () => {
    // 1. Register Member
    const memberEmail = `member2_${generateUUID()}@test.com`;
    await authService.register(memberEmail, "Regular Member 2", password);
    const {
      data: { user: memberUser },
    } = await supabase.auth.getUser();

    // 2. Login as Member and Join Org (Self-Join)
    await authService.login(memberEmail, password);

    const { data: newMembership, error } = await supabase
      .from("org_memberships")
      .insert({
        organization_id: orgId,
        user_id: memberUser!.id,
        type: "USER",
        details: "Test Member 2",
      })
      .select("id")
      .single();

    if (error || !newMembership)
      throw new Error("Failed to create membership: " + error?.message);
    const newMemberId = newMembership.id;

    // Update assigned_to
    await equipmentService.updateContainer(containerId, {
      assigned_to: newMemberId,
    });

    // Verify change
    const { data: container } = await supabase
      .from("containers")
      .select("assigned_to")
      .eq("id", containerId)
      .single();
    expect(container).not.toBeNull();
    expect(container!.assigned_to).toBe(newMemberId);
  });

  it("should not allow a non-member to update a container", async () => {
    // Create a random user
    const randomEmail = `random_${generateUUID()}@test.com`;
    await authService.register(randomEmail, "Random User", password);

    await expect(
      equipmentService.updateContainer(containerId, {
        assigned_to: "some-id",
      }),
    ).rejects.toThrow(/Permission denied/);
  });
});
