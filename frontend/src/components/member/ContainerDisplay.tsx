import { Pressable } from "react-native";
import { Hex } from "../../types/other";
import { ItemStyles } from "../../styles/ItemStyles";

export default function ContainerDisplay({ color }: { color: Hex }) {
  return (
    <Pressable
      style={({ pressed }) => [
        {
          opacity: pressed ? 0.7 : 1,
          backgroundColor: color,
        },
        ItemStyles.containerItem,
      ]}
    ></Pressable>
  );
}
