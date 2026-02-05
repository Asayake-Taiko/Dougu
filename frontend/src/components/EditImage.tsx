import { Colors } from "../styles/global";
import { ProfileStyles } from "../styles/ProfileStyles";
import { PressableOpacity } from "./PressableOpacity";
import { View } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import DisplayImage from "./DisplayImage";
import { DisplayStyles } from "../styles/Display";

export default function EditImage({
  imageKey,
  color,
  onPress,
}: {
  imageKey?: string;
  color?: string;
  onPress?: () => void;
}) {
  return (
    <PressableOpacity style={ProfileStyles.profile} onPress={onPress}>
      <DisplayImage imageKey={imageKey} style={DisplayStyles.profile} />
      <View style={ProfileStyles.editButton}>
        <FontAwesome name="pencil" size={16} color={Colors.black} />
      </View>
    </PressableOpacity>
  );
}
