import React from "react";
import { View, Text } from "react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import { EquipmentObj } from "../../types/ModelTypes";
import { useEquipment } from "../../helper/context/EquipmentContext";
import EquipmentDisplay from "./EquipmentDisplay";
import { useItemStyles } from "../../styles/ItemStyles";
/*
  EquipmentItem is a component that displays an equipment object with a label and
  a count. It is used in the DraggableEquipment component to display the equipment
  objects that can be dragged around the screen.
*/
export default function EquipmentItem({
  item,
  count,
}: {
  item: EquipmentObj;
  count: number;
}) {
  const { setVisible, setEquipmentItem } = useEquipment();
  const itemStyles = useItemStyles();

  const tapGesture = Gesture.Tap()
    .onEnd(() => {
      setEquipmentItem(item);
      setVisible(true);
    })
    .runOnJS(true);

  return (
    <GestureDetector gesture={tapGesture}>
      <View style={itemStyles.container}>
        {count > 0 && (
          <>
            <EquipmentDisplay
              imageKey={item.image}
              isMini={false}
              color={item.color}
              source={null}
            />
            <View style={itemStyles.circle}>
              <Text style={itemStyles.count}>{count}</Text>
            </View>
            <View style={itemStyles.textContainer}>
              <Text style={itemStyles.text}>{item.label}</Text>
            </View>
          </>
        )}
      </View>
    </GestureDetector>
  );
}
