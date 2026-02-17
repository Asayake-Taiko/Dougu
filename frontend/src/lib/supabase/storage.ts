import { supabase } from "./supabase";
import { File } from "expo-file-system";
import { decode } from "base64-arraybuffer";

/**
 * Uploads an image to Supabase Storage.
 * @param localUri The local URI of the image file (e.g. from ImagePicker).
 * @param folder The folder path within the bucket (e.g. 'profiles', 'organizations').
 * @param filename The desired filename.
 * @returns The public URL of the uploaded image.
 */
export async function uploadImage(
  localUri: string,
  folder: string,
  filename: string,
): Promise<string> {
  try {
    // Read the file as base64 using the new Expo SDK 54 File API
    const file = new File(localUri);
    const base64 = await file.base64();
    const filePath = `${folder}/${filename}`;

    // Upload to Supabase Storage
    const { error } = await supabase.storage
      .from("images")
      .upload(filePath, decode(base64), {
        contentType: "image/png",
        upsert: true,
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from("images")
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
}
