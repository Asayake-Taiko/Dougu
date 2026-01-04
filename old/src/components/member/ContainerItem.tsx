import React from "react";
import { View, Text, Pressable } from "react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import { ContainerObj, EquipmentObj } from "../../types/ModelTypes";
import { useEquipment } from "../../helper/context/EquipmentContext";
import { chunkArray } from "../../helper/EquipmentUtils";
import { useItemStyles } from "../../styles/ItemStyles";
import EquipmentDisplay from "./EquipmentDisplay";

/*
  ContainerItem is a component that displays a container object with a label and
  pages of all its equipment objects. Tapping on the container will open the
  ContainerOverlay to display all the equipment objects in the container.
*/
export default function ContainerItem({
  item,
  swapable,
  count,
}: {
  item: ContainerObj;
  swapable: boolean;
  count?: number;
}) {
  const { setContainerItem, setContainerVisible, setSwapContainerVisible } =
    useEquipment();
  const itemStyles = useItemStyles();
  // only display the first 9 equipment items in a 3x3 grid
  const firstNine = item?.equipment.slice(0, 9);
  const chunkedData = chunkArray(firstNine ? firstNine : [], 3);

  // swapable is a boolean that determines if the container opens the swapContainerOverlay
  // since swapContainerOverlay is only used in the swapEquipment screen
  const tapGesture = Gesture.Tap()
    .onEnd(() => {
      setContainerItem(item);
      if (swapable) {
        setSwapContainerVisible(true);
      } else {
        setContainerVisible(true);
      }
    })
    .runOnJS(true);

  return (
    <>
      {item && (
        <GestureDetector gesture={tapGesture}>
          <View style={itemStyles.container}>
            {(count == null || count > 0) && (
              <>
                <Pressable
                  style={({ pressed }) => [
                    {
                      opacity: pressed ? 0.7 : 1,
                      backgroundColor: item.color,
                    },
                    itemStyles.containerItem,
                  ]}
                >
                  <View style={itemStyles.table}>
                    {chunkedData.map((row, index) => (
                      <View key={index} style={itemStyles.equipmentRow}>
                        {row.map((equip) => (
                          <View
                            key={equip.id}
                            style={itemStyles.equipmentItemContainer}
                          >
                            <EquipmentDisplay
                              imageKey={equip.image}
                              isMini={true}
                              color={(equip as EquipmentObj).color}
                              source={null}
                            />
                          </View>
                        ))}
                      </View>
                    ))}
                  </View>
                </Pressable>
                <Text style={itemStyles.text}>{item.label}</Text>
              </>
            )}
          </View>
        </GestureDetector>
      )}
    </>
  );
}
