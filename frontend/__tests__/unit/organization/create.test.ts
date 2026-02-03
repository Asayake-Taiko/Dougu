import { organizationService } from "../../../src/lib/services/organization";
import { authService } from "../../../src/lib/services/auth";
import { supabase } from "../../../src/lib/supabase/supabase";

describe("Create Organization Tests", () => {
  beforeEach(async () => {
    await authService.logout();
    await authService.login("testuser1@gmail.com", "password1");
  });

  it("create organization with valid name should succeed", async () => {
    const randomStr = Math.random().toString(36).substring(7);
    const name = `Test_Organization_${randomStr}`;

    // get the user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    expect(user).not.toBeNull();

    await expect(
      organizationService.createOrganization(name, user!.id),
    ).resolves.not.toThrow();

    // check if the organization was created
    const { data: org } = await supabase
      .from("organizations")
      .select("*")
      .eq("name", name)
      .maybeSingle();
    expect(org).not.toBeNull();
  });

  it("create organization with invalid name should fail", async () => {
    const name = `Test Organization`;

    // get the user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    expect(user).not.toBeNull();

    await expect(
      organizationService.createOrganization(name, user!.id),
    ).rejects.toThrow(
      "Invalid name! Use 1-40 alphanumeric characters, no spaces (_ and - allowed).",
    );

    // check that the organization was not created
    const { data: org } = await supabase
      .from("organizations")
      .select("*")
      .eq("name", name)
      .maybeSingle();
    expect(org).toBeNull();
  });

  it("create organization with an invalid user id should fail", async () => {
    const name = `Test_Organization_${Math.random().toString(36).substring(7)}`;
    const invalidUserId = "invalid-user-id";

    await expect(
      organizationService.createOrganization(name, invalidUserId),
    ).rejects.toThrow("Invalid user id!");

    // check that the organization was not created
    const { data: org } = await supabase
      .from("organizations")
      .select("*")
      .eq("name", name)
      .maybeSingle();
    expect(org).toBeNull();
  });
});
