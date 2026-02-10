import { generateUUID } from "../utils/UUID";
import { supabase } from "../supabase/supabase";

export interface IOrganizationService {
  createOrganization(
    name: string,
    userId: string,
  ): Promise<{ id: string; name: string; code: string }>;
  joinOrganization(
    code: string,
    userId: string,
  ): Promise<{ id: string; name: string }>;
  deleteOrganization(orgId: string): Promise<void>;
  createStorage(
    orgId: string,
    name: string,
    image: string,
    color: string,
    details: string,
  ): Promise<void>;
  deleteMembership(orgId: string, membershipId: string): Promise<void>;
  transferOwnership(orgId: string, newManagerId: string): Promise<void>;
  updateOrganizationImage(
    orgId: string,
    imageKey: string,
    color: string,
  ): Promise<void>;
  updateMembershipImage(
    orgId: string,
    membershipId: string,
    imageKey: string,
    color: string,
  ): Promise<void>;
}

export class OrganizationService implements IOrganizationService {
  async createOrganization(
    name: string,
    userId: string,
  ): Promise<{ id: string; name: string; code: string }> {
    if (!name.trim()) throw new Error("Please enter an organization name.");
    // Generate a unique code
    const code = await this.generateUniqueCode();
    const orgId = generateUUID();

    const { error } = await supabase.from("organizations").insert({
      id: orgId,
      name,
      access_code: code,
      manager_id: userId,
      image: "default_org",
      color: "#791111",
      created_at: new Date().toISOString(),
    });

    if (error) throw error;
    return { id: orgId, name, code };
  }

  async joinOrganization(
    code: string,
    userId: string,
  ): Promise<{ id: string; name: string }> {
    const trimmedCode = code.trim().toUpperCase();
    if (!trimmedCode) throw new Error("Please enter an access code");

    // find the organization by access code (we still need this to get the ID)
    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .select("*")
      .eq("access_code", trimmedCode)
      .maybeSingle();
    if (orgError) throw orgError;
    if (!org) throw new Error("Organization not found");

    // create the membership
    const membershipId = generateUUID();
    const { error: insertError } = await supabase
      .from("org_memberships")
      .insert({
        id: membershipId,
        organization_id: org.id,
        type: "USER",
        user_id: userId,
      });

    if (insertError) throw insertError;
    return { id: org.id, name: org.name };
  }

  async deleteOrganization(orgId: string): Promise<void> {
    const { error } = await supabase
      .from("organizations")
      .delete()
      .eq("id", orgId);

    if (error) throw error;
  }
  async createStorage(
    orgId: string,
    name: string,
    image: string,
    color: string,
    details: string,
  ): Promise<void> {
    const { error } = await supabase.from("org_memberships").insert({
      id: generateUUID(),
      organization_id: orgId,
      type: "STORAGE",
      storage_name: name,
      profile_image: image,
      color: color,
      details: details,
    });
    if (error) throw error;
  }
  async deleteMembership(membershipId: string): Promise<void> {
    const { error } = await supabase
      .from("org_memberships")
      .delete()
      .eq("id", membershipId);
    if (error) throw error;
  }
  async transferOwnership(orgId: string, newManagerId: string): Promise<void> {
    const { error } = await supabase
      .from("organizations")
      .update({ manager_id: newManagerId })
      .eq("id", orgId);

    if (error) throw error;
  }

  async updateOrganizationImage(
    orgId: string,
    imageKey: string,
    color: string,
  ): Promise<void> {
    const { error } = await supabase
      .from("organizations")
      .update({ image: imageKey, color })
      .eq("id", orgId);
    if (error) throw error;
  }

  async updateMembershipImage(
    membershipId: string,
    imageKey: string,
    color: string,
  ): Promise<void> {
    const { error } = await supabase
      .from("org_memberships")
      .update({ profile_image: imageKey, color })
      .eq("id", membershipId);
    if (error) throw error;
  }

  // Helpers
  private async generateUniqueCode(): Promise<string> {
    while (true) {
      const code = this.generateRandomString(8);
      const { data: existing, error } = await supabase
        .from("organizations")
        .select("id")
        .eq("access_code", code)
        .maybeSingle();

      if (error) throw error;
      if (!existing) return code;
    }
  }

  private generateRandomString(length: number) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

export const organizationService = new OrganizationService();
