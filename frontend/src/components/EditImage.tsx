import { DisplayType } from "../types/other";
import { ProfileStyles } from "../styles/ProfileStyles";
import { PressableOpacity } from "./PressableOpacity";
import { View } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import DisplayImage from "./DisplayImage";
import { DisplayStyles } from "../styles/Display";

export default function EditImage({
  type,
  imageKey,
  color,
  onPress,
}: {
  type: DisplayType;
  imageKey?: string;
  color?: string;
  onPress?: () => void;
}) {
  return (
    <PressableOpacity style={ProfileStyles.profile} onPress={onPress}>
      <DisplayImage
        type={type}
        imageKey={imageKey}
        style={DisplayStyles.profile}
      />
      <View style={ProfileStyles.editButton}>
        <FontAwesome name="pencil" size={20} />
      </View>
    </PressableOpacity>
  );
}
