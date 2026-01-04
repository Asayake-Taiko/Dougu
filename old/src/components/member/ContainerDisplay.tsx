import { Pressable } from "react-native";
import { Hex } from "../../types/ModelTypes";
import { useItemStyles } from "../../styles/ItemStyles";

export default function ContainerDisplay({ color }: { color: Hex }) {
  const itemStyles = useItemStyles();

  return (
    <Pressable
      style={({ pressed }) => [
        {
          opacity: pressed ? 0.7 : 1,
          backgroundColor: color,
        },
        itemStyles.containerItem,
      ]}
    ></Pressable>
  );
}
