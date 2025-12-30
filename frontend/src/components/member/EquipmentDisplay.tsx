import React, { useEffect, useState } from "react";
import { ImageSourcePropType, Pressable } from "react-native";
import { Image } from "expo-image";
import { iconMapping } from "../../lib/ImageMapping";
import { ItemStyles } from "../../styles/ItemStyles";

/*
  EquipmentDisplay displays the image of an equipment object. 
  It uses iconMapping for predefined icons.
*/
export default function EquipmentDisplay({
    imageKey,
    color,
    isMini,
}: {
    imageKey: string;
    color: string;
    isMini: boolean;
}) {
    const sizeStyles = isMini ? ItemStyles.sizeMini : ItemStyles.size;
    const radius = isMini
        ? ItemStyles.radiusBackgroundMini
        : ItemStyles.radiusBackground;

    const [imageSource, setImageSource] = useState<ImageSourcePropType>(
        iconMapping["default"]
    );

    useEffect(() => {
        if (imageKey && imageKey in iconMapping) {
            setImageSource(iconMapping[imageKey]);
        } else {
            setImageSource(iconMapping["default"]);
        }
    }, [imageKey]);

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
            <Image
                style={sizeStyles}
                source={imageSource}
                contentFit="cover"
                placeholder={iconMapping["default"]}
            />
        </Pressable>
    );
}
