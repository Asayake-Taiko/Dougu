import { ImageSourcePropType, Pressable } from "react-native";
import { Image } from "expo-image";
import { Hex } from "../../types/ModelTypes";
import { iconMapping } from "../../helper/ImageMapping";
import { useUser } from "../../helper/context/UserContext";
import { useEffect, useState } from "react";
import { getImageUri } from "../../helper/AWS";
import { useItemStyles } from "../../styles/ItemStyles";

/*
  EquipmentDisplay displays the image of an equipment object. It can either
  use a stored image uri or fetch the image from AWS S3.
*/
export default function EquipmentDisplay({
  imageKey,
  color,
  isMini,
  source,
}: {
  imageKey: string;
  color: Hex;
  isMini: boolean;
  source: ImageSourcePropType | null;
}) {
  const itemStyles = useItemStyles();
  const sizeStyles = isMini ? itemStyles.sizeMini : itemStyles.size;
  const radius = isMini
    ? itemStyles.radiusBackgroundMini
    : itemStyles.radiusBackground;
  const [imageSource, setImageSource] = useState<ImageSourcePropType>(
    iconMapping["default"],
  );
  const { org } = useUser();

  // set the image uri
  useEffect(() => {
    const checkCache = async () => {
      const path = await Image.getCachePathAsync(imageKey);
      if (path) {
        setImageSource({ uri: path });
      } else {
        const fetchPath = `public/${org!.id}/equipment/${imageKey}`;
        const fetchImageUri = await getImageUri(fetchPath);
        if (fetchImageUri) setImageSource({ uri: fetchImageUri });
        else setImageSource(iconMapping["default"]);
      }
    };

    if (source) {
      setImageSource(source);
    } else if (imageKey in iconMapping) {
      setImageSource(iconMapping[imageKey]);
    } else {
      checkCache();
    }
  }, [imageKey, org, source]);

  return (
    <Pressable
      style={({ pressed }) => [
        {
          opacity: pressed ? 0.7 : 1,
          backgroundColor: color,
        },
        itemStyles.equipment,
        sizeStyles,
        radius,
      ]}
    >
      <Image
        style={sizeStyles}
        source={
          typeof imageSource === "object" && "uri" in imageSource
            ? { uri: imageSource.uri, cacheKey: imageKey }
            : imageSource
        }
        contentFit="cover"
        placeholder={iconMapping["default"]}
      />
    </Pressable>
  );
}
