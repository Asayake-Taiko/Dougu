import { authService } from "../../../src/lib/services/auth";
import { supabase } from "../../../src/lib/supabase/supabase";
import { generateUUID } from "../../../src/lib/utils/UUID";

describe("AuthService Profile Update Tests", () => {
  const randomStr = generateUUID();
  const email = `name-update-${randomStr}@example.com`;
  const password = "password123";
  const oldName = `Old Name ${randomStr}`;
  const newName = `New Name ${randomStr}`;
  const newImage = `image-${randomStr}`;

  beforeAll(async () => {
    await authService.logout();
    await authService.register(email, oldName, password);
  });

  it("updateName should update the name in the database", async () => {
    // 1. Get user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    expect(user).not.toBeNull();

    // 2. Update name
    await expect(authService.updateName(newName)).resolves.not.toThrow();

    // 3. Verify name update in DB
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("name, profile_image")
      .eq("id", user!.id)
      .single();

    expect(error).toBeNull();
    expect(profile?.name).toBe(newName);
    expect(profile?.profile_image).toBe("default");
  });

  it("updateProfileImage should update the image in the database", async () => {
    // 1. Fetch current profile to get ID
    const {
      data: { user },
    } = await supabase.auth.getUser();
    expect(user).not.toBeNull();

    // 2. Update profile image
    await expect(
      authService.updateProfileImage(newImage),
    ).resolves.not.toThrow();

    // 3. Verify image update in DB
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("name, profile_image")
      .eq("id", user!.id)
      .single();

    expect(error).toBeNull();
    expect(profile?.name).toBe(newName);
    expect(profile?.profile_image).toBe(newImage);
  });
});
