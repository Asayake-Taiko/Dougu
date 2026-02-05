import { Image } from "expo-image";
import { allMappings } from "../lib/utils/ImageMapping";
import { useState, useEffect } from "react";
import { ImageSourcePropType, StyleProp, ImageStyle } from "react-native";

/*
  A wrapper for the expo-image component that consolidates
  handling image keys and sources
*/
export default function DisplayImage({
  imageKey,
  style,
  uri,
}: {
  imageKey: string | undefined;
  style?: StyleProp<ImageStyle>;
  uri?: string;
}) {
  const [imageSource, setImageSource] = useState<ImageSourcePropType>(
    allMappings["default_image"],
  );

  useEffect(() => {
    setImageSource(allMappings[imageKey ?? "default_image"]);
  }, [imageKey]);

  return <Image source={imageSource} style={style} />;
}
