import { ItemStyles } from "../../styles/ItemStyles";
import DisplayImage from "../DisplayImage";
import { PressableOpacity } from "../PressableOpacity";

export default function EquipmentDisplay({
  imageKey,
  color,
  isMini,
}: {
  imageKey: string | undefined;
  color?: string;
  isMini?: boolean;
}) {
  const sizeStyles = isMini ? ItemStyles.sizeMini : ItemStyles.size;
  const radius = isMini
    ? ItemStyles.radiusBackgroundMini
    : ItemStyles.radiusBackground;

  return (
    <PressableOpacity
      style={{
        backgroundColor: color || "#ddd",
        ...ItemStyles.equipment,
        ...sizeStyles,
        ...radius,
      }}
    >
      <DisplayImage type="Item" imageKey={imageKey} style={sizeStyles} />
    </PressableOpacity>
  );
}
