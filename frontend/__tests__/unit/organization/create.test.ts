import { organizationService } from "../../../src/lib/services/organization";
import { authService } from "../../../src/lib/services/auth";
import { supabase } from "../../../src/lib/supabase/supabase";
import { generateUUID } from "../../../src/lib/utils/UUID";

describe("Create Organization Tests", () => {
  let testUser: { email: string; id: string };

  beforeEach(async () => {
    // Create a fresh user for each test
    const email = `testuser_${generateUUID()}@example.com`;
    const password = "password123";

    await authService.logout();
    await authService.register(email, "Test User", password);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    testUser = { email, id: user!.id };
  });

  it("create organization with valid name should succeed", async () => {
    const name = `Test_Org_${generateUUID().substring(0, 10)}`;

    expect(testUser).toBeDefined();
    expect(testUser.id).toBeDefined();

    await expect(
      organizationService.createOrganization(name, testUser.id),
    ).resolves.not.toThrow();

    // check if the organization was created
    const { data: org } = await supabase
      .from("organizations")
      .select("*")
      .eq("name", name)
      .maybeSingle();
    expect(org).not.toBeNull();
    expect(org).not.toBeNull();
    expect(org.manager_id).toBe(testUser.id);

    // check that the user membership was created
    const { data: membership } = await supabase
      .from("org_memberships")
      .select("*")
      .eq("user_id", testUser.id)
      .eq("organization_id", org!.id)
      .maybeSingle();
    expect(membership).not.toBeNull();
    expect(membership!.type).toBe("USER");
  });

  it("create organization with invalid name should fail", async () => {
    const name = `Test Organization`;

    await expect(
      organizationService.createOrganization(name, testUser.id),
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
    const name = `Test_Org_${generateUUID().substring(0, 10)}`;
    const invalidUserId = "invalid-user-id";

    await expect(
      organizationService.createOrganization(name, invalidUserId),
    ).rejects.toThrow("Invalid ID format.");

    // check that the organization was not created
    const { data: org } = await supabase
      .from("organizations")
      .select("*")
      .eq("name", name)
      .maybeSingle();
    expect(org).toBeNull();
  });
});
