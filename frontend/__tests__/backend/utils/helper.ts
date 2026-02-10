import { createClient } from "./rls_utils";

const generateUUID = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export async function generateTestUser(name: string = "Test User") {
  const email = `test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
  const password = "password123";

  const authClient = createClient();
  const { data, error } = await authClient.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        profile_image: "default_profile",
      },
    },
  });

  if (error) throw error;
  if (!data.user) throw new Error("User not created");

  const { data: sessionData, error: sessionError } =
    await authClient.auth.signInWithPassword({
      email,
      password,
    });

  if (sessionError) throw sessionError;

  return {
    user: data.user,
    token: sessionData.session.access_token,
    client: createClient(sessionData.session.access_token),
  };
}

export async function waitFor(
  predicate: () => Promise<boolean>,
  timeout = 15000,
  interval = 500,
) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (await predicate()) return;
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
  throw new Error(`Timeout waiting for condition after ${timeout}ms`);
}

// Helper to create an organization via Supabase client (acting as owner)
export async function createOrganization(accessToken: string, orgName: string) {
  const userClient = createClient(accessToken);

  // Get user id first
  const {
    data: { user },
  } = await userClient.auth.getUser();
  if (!user) throw new Error("User not found");

  const { data, error } = await userClient
    .from("organizations")
    .insert({
      name: orgName,
      access_code: generateUUID(),
      manager_id: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Helper to create container in an org
export async function createContainer(
  accessToken: string,
  orgId: string,
  name: string,
) {
  const userClient = createClient(accessToken);

  const { data, error } = await userClient
    .from("containers")
    .insert({
      name: name,
      organization_id: orgId,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Helper to create equipment in an org
export async function createEquipment(
  accessToken: string,
  orgId: string,
  name: string,
) {
  const userClient = createClient(accessToken);

  const { data, error } = await userClient
    .from("equipment")
    .insert({
      name: name,
      organization_id: orgId,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Helper for user to join org
export async function joinOrg(
  userAccessToken: string,
  orgId: string,
  userId: string,
) {
  const userClient = createClient(userAccessToken);

  const { error } = await userClient.from("org_memberships").insert({
    organization_id: orgId,
    user_id: userId,
    type: "USER",
  });

  if (error) throw error;
}

// Helper to get membership ID
export async function getMembershipId(
  accessToken: string,
  orgId: string,
  userId: string,
) {
  const userClient = createClient(accessToken);

  const { data, error } = await userClient
    .from("org_memberships")
    .select("id")
    .eq("organization_id", orgId)
    .eq("user_id", userId)
    .single();

  if (error) throw error;
  return data.id;
}

export async function removeMembership(
  adminAccessToken: string,
  orgId: string,
  userId: string,
) {
  const adminClient = createClient(adminAccessToken);
  const { error } = await adminClient
    .from("org_memberships")
    .delete()
    .eq("organization_id", orgId)
    .eq("user_id", userId);

  if (error) throw error;
}
