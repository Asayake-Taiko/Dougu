import { Image } from "expo-image";
import { DisplayType } from "../types/other";
import {
  iconMapping,
  profileMapping,
  orgMapping,
} from "../lib/utils/ImageMapping";
import { useState, useEffect } from "react";
import { ImageSourcePropType, StyleProp, ImageStyle } from "react-native";

/*
  A wrapper for the expo-image component that consolidates
  handling image keys and sources
*/
export default function DisplayImage({
  type,
  imageKey,
  style,
  uri,
}: {
  type: DisplayType;
  imageKey: string | undefined;
  style?: StyleProp<ImageStyle>;
  uri?: string;
}) {
  const [imageSource, setImageSource] = useState<ImageSourcePropType>(
    iconMapping["default_equipment"],
  );

  useEffect(() => {
    if (type === "User") {
      setImageSource(profileMapping[imageKey ?? "default_profile"]);
    } else if (type === "Org") {
      setImageSource(orgMapping[imageKey ?? "default_org"]);
    } else {
      setImageSource(iconMapping[imageKey ?? "default_equipment"]);
    }
  }, [type, imageKey]);

  return <Image source={imageSource} style={style} />;
}
