import { supabase } from "./supabase";
import { File } from "expo-file-system";
import { decode } from "base64-arraybuffer";

/**
 * Uploads an image to Supabase Storage.
 * @param localUri The local URI of the image file (e.g. from ImagePicker).
 * @param path The full path within the bucket (e.g. 'profiles/user_123/profile.png').
 * @returns The file path of the uploaded image in the bucket (not the public URL).
 */
export async function uploadImage(
  localUri: string,
  path: string,
): Promise<string> {
  try {
    // Read the file as base64 using the new Expo SDK 54 File API
    const file = new File(localUri);
    const base64 = await file.base64();

    // Upload to Supabase Storage
    const { error } = await supabase.storage
      .from("images")
      .upload(path, decode(base64), {
        contentType: "image/png",
        upsert: true,
      });

    if (error) {
      throw error;
    }

    // For secure/private buckets, we return the path.
    return path;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
}
