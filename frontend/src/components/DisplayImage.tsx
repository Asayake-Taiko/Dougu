import { Image } from "expo-image";
import { allMappings } from "../lib/utils/ImageMapping";
import { useState, useEffect } from "react";
import { ImageSourcePropType, StyleProp, ImageStyle } from "react-native";
import { supabase } from "../lib/supabase/supabase";
import { Logger } from "../lib/utils/Logger";

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
  const [imageSource, setImageSource] = useState<ImageSourcePropType>(
    allMappings["default_image"],
  );

  useEffect(() => {
    let isMounted = true;

    const resolveSource = async () => {
      // If no key provided, use default
      if (!imageKey) {
        if (isMounted) setImageSource(allMappings["default_image"]);
        return;
      }

      // Check if it's a storage path (contains /)
      if (imageKey.includes("/")) {
        try {
          // Generate signed URL valid for 1 hour
          const { data, error } = await supabase.storage
            .from("images")
            .createSignedUrl(imageKey, 3600);

          if (error) throw Error("Failed to sign URL for image: " + imageKey);
          if (data?.signedUrl) {
            if (isMounted) setImageSource({ uri: data.signedUrl });
          }
        } catch (e) {
          Logger.error("Error resolving image source:", e);
          if (isMounted) setImageSource(allMappings["default_image"]);
        }
        return;
      }

      // Otherwise assume it's a local asset key mapping
      if (isMounted)
        setImageSource(allMappings[imageKey] || allMappings["default_image"]);
    };

    resolveSource();

    return () => {
      isMounted = false;
    };
  }, [imageKey]);

  return (
    <Image source={imageSource} style={[style, { backgroundColor: color }]} />
  );
}
