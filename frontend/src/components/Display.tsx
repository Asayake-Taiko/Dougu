import React, { useEffect, useState } from "react";
import { ImageSourcePropType, Pressable } from "react-native";
import { Image } from "expo-image";
import {
  iconMapping,
  profileMapping,
  orgMapping,
} from "../lib/utils/ImageMapping";
import { ItemStyles } from "../styles/ItemStyles";
import { DisplayStyles } from "../styles/Display";
import { DisplayType } from "../types/other";

/*
  Display is a consolidated component for displaying images (User, Org, Item).
  It handles mapping keys to image sources and applying the correct styles.
*/
export default function Display({
  type,
  imageKey,
  color,
  isMini,
}: {
  type: DisplayType;
  imageKey?: string;
  color?: string;
  isMini?: boolean;
}) {
  const [imageSource, setImageSource] = useState<ImageSourcePropType>(
    iconMapping["default"],
  );

  useEffect(() => {
    let source: ImageSourcePropType;

    switch (type) {
      case "User":
        source =
          imageKey && imageKey in profileMapping
            ? profileMapping[imageKey]
            : profileMapping["default"];
        break;
      case "Org":
        source =
          imageKey && imageKey in orgMapping
            ? orgMapping[imageKey]
            : orgMapping["default"];
        break;
      case "Item":
      default:
        source =
          imageKey && imageKey in iconMapping
            ? iconMapping[imageKey]
            : iconMapping["default"];
        break;
    }
    setImageSource(source);
  }, [type, imageKey]);

  if (type === "User") {
    const styles = isMini ? DisplayStyles.profileMini : DisplayStyles.profile;
    return <Image source={imageSource} style={styles} />;
  }

  // Handle Equipment/Item/Container
  const sizeStyles = isMini ? ItemStyles.sizeMini : ItemStyles.size;
  const radius = isMini
    ? ItemStyles.radiusBackgroundMini
    : ItemStyles.radiusBackground;

  return (
    <Pressable
      style={({ pressed }) => [
        {
          opacity: pressed ? 0.7 : 1,
          backgroundColor: color || "#ddd",
        },
        ItemStyles.equipment,
        sizeStyles,
        radius,
      ]}
    >
      {/* For Containers (Items without imageKey), we might just show the background color */}
      {imageKey && (
        <Image
          style={sizeStyles}
          source={imageSource}
          contentFit="cover"
          placeholder={iconMapping["default"]}
        />
      )}
    </Pressable>
  );
}
