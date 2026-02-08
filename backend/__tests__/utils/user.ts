import { createClient } from "./rls_utils";

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

  const { data: sessionData, error: sessionError } = await authClient.auth.signInWithPassword({
    email,
    password
  });

  if (sessionError) throw sessionError;

  return {
    user: data.user,
    token: sessionData.session.access_token,
    client: createClient(sessionData.session.access_token)
  };
}