import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { ScrollView, GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, { ZoomIn, ZoomOut, FadeIn, FadeOut } from "react-native-reanimated";
import { useEquipment } from "../../lib/context/EquipmentContext";
import { chunkArray } from "../../lib/helper/EquipmentUtils";
import EquipmentItem from "./EquipmentItem";
import { ContainerOverlayStyles } from "../../styles/ContainerOverlay";
import PaginationDots from "./PaginationDots";

const { width: windowWidth } = Dimensions.get("window");

import { Item } from "../../types/models";

export default function ContainerOverlay({
  containerPage,
  setContainerPage,
  draggingItem = null,
}: {
  containerPage: number;
  setContainerPage: (page: number) => void;
  draggingItem?: Item | null;
}) {
  const {
    setSelectedContainer,
    selectedContainer: item,
  } = useEquipment();

  if (!item) return null;

  // equipment is displayed in a 3x3 grid format (9 items per page)
  const equipmentChunks = chunkArray(item.equipment, 9);
  const equipmentChunks3 = equipmentChunks.map((group) => chunkArray(group, 3));

  const onScroll = (event: any) => {
    const pageIndex = Math.round(
      event.nativeEvent.contentOffset.x / (windowWidth * 0.85)
    );
    setContainerPage(pageIndex);
  };

  const tapGesture = Gesture.Tap()
    .onEnd(() => {
      setSelectedContainer(null);
    })
    .runOnJS(true);

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Backdrop Layer - Handles closing when tapping outside */}
      <GestureDetector gesture={tapGesture}>
        <Animated.View
          style={[ContainerOverlayStyles.backDrop]}
          entering={FadeIn}
          exiting={FadeOut}
        />
      </GestureDetector>

      {/* Content Layer - Overlays the backdrop */}
      <View pointerEvents="box-none" style={styles.contentWrapper}>
        <View style={ContainerOverlayStyles.titleContainer}>
          <Text style={ContainerOverlayStyles.title}>
            {item?.name}
          </Text>
        </View>

        <Animated.View
          style={[
            ContainerOverlayStyles.itemContainer,
            { backgroundColor: item.color },
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
            style={{ flex: 1 }}
          >
            <View style={{ display: "flex", flexDirection: "row", height: "100%" }}>
              {equipmentChunks3.map((page, index) => (
                <View key={index} style={ContainerOverlayStyles.itemPage}>
                  {page.map((row, index) => (
                    <View
                      key={`r${index}`}
                      style={ContainerOverlayStyles.equipmentRow}
                    >
                      {row.map((equip) => (
                        <View
                          key={equip.id}
                          style={
                            ContainerOverlayStyles.equipmentItemContainer
                          }
                        >
                          <EquipmentItem
                            item={equip}
                            draggingItem={draggingItem}
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
            currIdx={containerPage}
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contentWrapper: {
    alignItems: 'center',
    zIndex: 10,
  }
});