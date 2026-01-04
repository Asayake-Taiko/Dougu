import React, { useState } from "react";
import {
  View,
  Text,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import {
  ScrollView,
  GestureDetector,
  Gesture,
} from "react-native-gesture-handler";
import Animated, {
  ZoomIn,
  ZoomOut,
  FadeIn,
  FadeOut,
} from "react-native-reanimated";

import { useEquipment } from "../../helper/context/EquipmentContext";
import { chunkArray } from "../../helper/EquipmentUtils";
import EquipmentItem from "./EquipmentItem";
import { EquipmentObj } from "../../types/ModelTypes";
import PaginationDots from "./PaginationDots";
import { useContainerStyles } from "../../styles/ContainerOverlay";
import { useDimensions } from "../../helper/context/DimensionsContext";

/*
    This overlay is what is shown when the user taps
    on an equipment item. It displays the equipment item's 
    stats, counts, and grouped equipment items.
*/
export default function ContainerOverlay() {
  const {
    containerVisible,
    setContainerVisible,
    containerItem,
    setContainerItem,
  } = useEquipment();
  const containerOverlayStyles = useContainerStyles();
  const { windowWidth } = useDimensions();

  // equipment is displayed in a 3x3 grid format
  const equipmentChunks = chunkArray(containerItem?.equipment ?? [], 9);
  const equipmentChunks3 = equipmentChunks.map((group) => chunkArray(group, 3));
  // for the pageination dots
  const [currentPage, setCurrentPage] = useState(0);

  const tapGesture = Gesture.Tap()
    .onEnd(() => {
      setContainerVisible(false);
      setContainerItem(null);
    })
    .runOnJS(true);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const pageIndex = Math.round(
      event.nativeEvent.contentOffset.x / windowWidth,
    );
    setCurrentPage(pageIndex);
  };

  return (
    <>
      {containerVisible && (
        <GestureDetector gesture={tapGesture}>
          <Animated.View
            style={[containerOverlayStyles.backDrop]}
            entering={FadeIn}
            exiting={FadeOut}
          >
            <View style={containerOverlayStyles.titleContainer}>
              <Text style={containerOverlayStyles.title}>
                {containerItem?.label}
              </Text>
            </View>
            <Animated.View
              style={[
                containerOverlayStyles.itemContainer,
                { backgroundColor: containerItem?.color },
              ]}
              entering={ZoomIn}
              exiting={ZoomOut}
            >
              <ScrollView
                horizontal={true}
                pagingEnabled={true}
                onScroll={onScroll}
                scrollEventThrottle={16}
                showsHorizontalScrollIndicator={false}
              >
                <View style={{ display: "flex", flexDirection: "row" }}>
                  {equipmentChunks3.map((page, index) => (
                    <View key={index} style={containerOverlayStyles.itemPage}>
                      {page.map((row, index) => (
                        <View
                          key={`r${index}`}
                          style={containerOverlayStyles.equipmentRow}
                        >
                          {row.map((equip) => (
                            <View
                              key={equip.id}
                              style={
                                containerOverlayStyles.equipmentItemContainer
                              }
                            >
                              <EquipmentItem
                                item={equip as EquipmentObj}
                                count={(equip as EquipmentObj).count}
                              />
                            </View>
                          ))}
                        </View>
                      ))}
                    </View>
                  ))}
                </View>
              </ScrollView>
              <PaginationDots
                length={equipmentChunks3.length}
                currIdx={currentPage}
              />
            </Animated.View>
          </Animated.View>
        </GestureDetector>
      )}
    </>
  );
}
