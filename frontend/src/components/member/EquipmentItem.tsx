import React from "react";
import { View, Text } from "react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import { Equipment } from "../../types/models";
import { Item } from "../../types/other";
import Display from "../Display";
import { ItemStyles } from "../../styles/ItemStyles";
import { useEquipment } from "../../lib/context/EquipmentContext";

/*
  EquipmentItem displays an equipment object with a name and optional count/preview.
*/
export default function EquipmentItem({
  item,
  isFloating = false,
  draggingItem,
}: {
  item: Equipment;
  isFloating?: boolean;
  draggingItem?: Item | null;
}) {
  const { setSelectedEquipment } = useEquipment();

  // Calculate display count and representative record based on drag state
  let displayCount = item.count;
  let repRecord = item.selectedRecord;

  if (isFloating) {
    displayCount = item.selectedCount;
    repRecord = item.selectedRecord;
  } else if (
    draggingItem?.type === "equipment" &&
    draggingItem.id === item.id
  ) {
    displayCount = item.count - item.selectedCount;
    repRecord = item.firstUnselectedRecord;
  }

  const tapGesture = Gesture.Tap()
    .onEnd(() => {
      setSelectedEquipment(item);
    })
    .runOnJS(true);

  return (
    <GestureDetector gesture={tapGesture}>
      <View
        style={[ItemStyles.container, { opacity: displayCount === 0 ? 0 : 1 }]}
      >
        <View>
          <Display
            type="Item"
            imageKey={repRecord.image}
            isMini={false}
            color={repRecord.color}
          />
          <View style={ItemStyles.circle}>
            <Text style={ItemStyles.count}>{displayCount}</Text>
          </View>
        </View>
        <View style={ItemStyles.textContainer}>
          <Text style={ItemStyles.text} numberOfLines={2}>
            {item.name}
          </Text>
        </View>
      </View>
    </GestureDetector>
  );
}
