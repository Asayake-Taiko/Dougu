import { Image } from "expo-image";
import { useState, useEffect } from "react";
import { StyleProp, ImageStyle } from "react-native";
import { supabase } from "../lib/supabase/supabase";
import { Logger } from "../lib/utils/Logger";
import { allMappings } from "../lib/utils/ImageMapping";

const signedUrlCache = new Map<string, { url: string; expiresAt: number }>();

/*
  A wrapper for the expo-image component that consolidates
  handling image keys and sources
*/
export default function DisplayImage({
  imageKey,
  style,
  color,
}: {
  imageKey: string | undefined;
  style?: StyleProp<ImageStyle>;
  color?: string;
}) {
  const [signedUrl, setSignedUrl] = useState<string | null>(() => {
    if (!imageKey) return null;

    // Check cache first for immediate synchronous render
    if (imageKey.includes("/")) {
      const cached = signedUrlCache.get(imageKey);
      if (cached && cached.expiresAt > Date.now()) {
        return cached.url;
      }
    }
    return null;
  });

  useEffect(() => {
    let isMounted = true;

    const resolveSource = async () => {
      // If no key provided or if it's a known mapping, we don't need to sign a URL
      if (!imageKey || allMappings[imageKey]) {
        if (isMounted) setSignedUrl(null);
        return;
      }

      // Check if it's a storage path (contains /)
      if (imageKey.includes("/")) {
        // Check cache again in case it was populated
        const cached = signedUrlCache.get(imageKey);
        if (cached && cached.expiresAt > Date.now()) {
          if (isMounted) setSignedUrl(cached.url);
          return;
        }

        try {
          // Generate signed URL valid for 1 hour
          const expiresIn = 3600;
          const { data, error } = await supabase.storage
            .from("images")
            .createSignedUrl(imageKey, expiresIn);

          if (error) throw Error("Failed to sign URL for image: " + imageKey);
          if (data?.signedUrl) {
            // Cache the result (expire slightly before the token does to be safe)
            signedUrlCache.set(imageKey, {
              url: data.signedUrl,
              expiresAt: Date.now() + (expiresIn - 60) * 1000,
            });

            if (isMounted) setSignedUrl(data.signedUrl);
          }
        } catch (e) {
          Logger.error("Error resolving image source:", e);
          if (isMounted) setSignedUrl(null);
        }
        return;
      }

      // For everything else, we don't need to sign a URL
      if (isMounted) setSignedUrl(null);
    };

    resolveSource();

    return () => {
      isMounted = false;
    };
  }, [imageKey]);

  // Priority 1: Direct URL (http/https/file)
  if (
    imageKey &&
    (imageKey.startsWith("http") || imageKey.startsWith("file://"))
  ) {
    return (
      <Image
        source={{ uri: imageKey }}
        style={[style, { backgroundColor: color }]}
        cachePolicy={"memory-disk"}
      />
    );
  }

  // Priority 2: Storage image with a signed URL
  if (imageKey && imageKey.includes("/") && signedUrl) {
    return (
      <Image
        source={{
          uri: signedUrl,
          cacheKey: imageKey,
        }}
        style={[style, { backgroundColor: color }]}
        cachePolicy={"memory-disk"}
      />
    );
  }

  // Priority 3: Known static asset mapping
  if (imageKey && allMappings[imageKey]) {
    return (
      <Image
        source={allMappings[imageKey]}
        style={[style, { backgroundColor: color }]}
        cachePolicy={"memory-disk"}
      />
    );
  }

  // Fallback: Default image
  return (
    <Image
      source={allMappings["default_image"]}
      style={[style, { backgroundColor: color }]}
    />
  );
}
