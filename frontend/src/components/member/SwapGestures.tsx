import React, { useRef } from "react";
import { View, Text, StyleSheet, LayoutChangeEvent, Dimensions } from "react-native";
import {
  GestureDetector,
  GestureHandlerRootView,
  Gesture,
  PanGestureHandlerEventPayload,
  GestureStateChangeEvent,
} from "react-native-gesture-handler";
import { scheduleOnRN } from "react-native-worklets";
import { useSharedValue } from "react-native-reanimated";


import { useEquipment } from "../../lib/context/EquipmentContext";
import { Item, Equipment, Container } from "../../types/models";
import { OrgMembershipRecord } from "../../types/db";
import CurrMembersDropdown from "./CurrMembersDropdown";
import ScrollRow from "./ScrollRow";

import useAnimateOverlay from "../../lib/helper/useAnimateOverlay";
import useScroll from "../../lib/helper/useScroll";
import useSet from "../../lib/helper/useSet";
import useHover from "../../lib/helper/useHover";
import { db } from "../../lib/powersync/PowerSync";

import { useHeaderHeight } from '@react-navigation/elements';
import ContainerOverlay from "./ContainerOverlay";
import EquipmentOverlay from "./EquipmentOverlay";
import FloatingDraggingItem from "./FloatingDraggingItem";

export default function SwapGestures({
  listOne,
  listTwo,
  handleSet,
  swapUser,
}: {
  listOne: Item[];
  listTwo: Item[];
  handleSet: (membership: OrgMembershipRecord | null) => void;
  swapUser: React.RefObject<OrgMembershipRecord | null>;
}) {
  // state
  const halfLine = useRef<number>(0);
  const { currentMember, containerOverlayVisible: swapContainerVisible, equipmentOverlayVisible, refresh, draggingItem, setDraggingItem } = useEquipment();
  const headerHeight = useHeaderHeight();

  // Local drag state
  const [containerPage, setContainerPage] = React.useState(0);
  const dragX = useSharedValue(0);
  const dragY = useSharedValue(0);
  const dragScale = useSharedValue(1);
  const dragValues = { x: dragX, y: dragY, scale: dragScale };

  // handle scrollRow scrolling
  const {
    topPage,
    setTopPage,
    nextTopPage,
    bottomPage,
    setBottomPage,
    nextBottomPage,
    clearScroll,
    handleScroll,
  } = useScroll();

  // handle setting the dragging item
  const {
    containerSetItem,
    handleSetItem,
  } = useSet({
    halfLine,
    topPage,
    bottomPage,
    listOne,
    listTwo,
    setDraggingItem,
    headerHeight,
    containerPage,
  });

  // handle the overlay animation
  const { size, movingStyles, animateStart, animateMove, animateFinalize } =
    useAnimateOverlay({ setDraggingItem, dragValues });

  // handle item hovering
  const { handleHover, clearTimeouts, containerHover, hoverContainer } =
    useHover({
      halfLine,
      draggingItem,
      topPage,
      bottomPage,
      listOne,
      listTwo,
      handleScroll,
      clearScroll,
      headerHeight,
      dragValues,
    });

  // on layout of the top scrollRow, its bottom is the halfline
  const handleLayout = (e: LayoutChangeEvent) => {
    const y = e.nativeEvent.layout.y;
    halfLine.current = y;
  };

  // decide where to reassign the equipment
  const handleReassign = async (
    gestureEvent: GestureStateChangeEvent<PanGestureHandlerEventPayload>,
  ) => {
    if (!draggingItem) return;

    if (swapContainerVisible) return;

    if (!currentMember) return;

    const targetMember = gestureEvent.y < halfLine.current ? currentMember : swapUser.current;
    if (!targetMember) return;

    try {
      if (draggingItem.type === "equipment") {
        const equip = draggingItem as Equipment;
        const targetContainerId = hoverContainer.current?.id || null;
        await equip.reassign(db, targetMember.id, targetContainerId);
      } else {
        const container = draggingItem as Container;
        await container.reassign(db, targetMember.id);
      }
      // Refresh context to reflect changes
      await refresh();
    } catch (error) {
      console.error("Error reassigning item:", error);
    }
  };

  const panPressGesture = Gesture.Pan()
    .maxPointers(1)
    .onStart((e) => {
      "worklet";
      if (equipmentOverlayVisible) return;
      animateStart(e);

      if (swapContainerVisible) scheduleOnRN(containerSetItem, e);
      else scheduleOnRN(handleSetItem, e);
    })
    .onChange((e) => {
      "worklet";
      animateMove(e);
      if (swapContainerVisible) scheduleOnRN(containerHover, e);
      else scheduleOnRN(handleHover, e);
    })
    .onFinalize((e) => {
      "worklet";
      animateFinalize();
      scheduleOnRN(handleReassign, e);
      scheduleOnRN(clearTimeouts);
      scheduleOnRN(clearScroll);
    })
    .activateAfterLongPress(500);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GestureDetector gesture={panPressGesture}>
        <View style={styles.container}>
          <View style={styles.infoContainer}>
            <Text style={styles.infoTxt}>
              Swap equipment by holding then dragging your equipment to a
              member!
            </Text>
          </View>
          <View style={styles.halfContainer}>
            <Text style={styles.userText}>My Equipment</Text>
            <ScrollRow
              listData={listOne}
              isSwap={true}
              setPage={setTopPage}
              nextPage={nextTopPage}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.halfContainer} onLayout={handleLayout}>
            <View style={styles.spacer}>
              <CurrMembersDropdown setUser={handleSet} isCreate={false} />
            </View>
            <ScrollRow
              listData={listTwo}
              isSwap={true}
              setPage={setBottomPage}
              nextPage={nextBottomPage}
            />
          </View>
          <ContainerOverlay containerPage={containerPage} setContainerPage={setContainerPage} />
          <EquipmentOverlay />
          <FloatingDraggingItem draggingItem={draggingItem} dragValues={dragValues} />
        </View>
      </GestureDetector>

    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  halfContainer: {
    flex: 1,
  },
  infoContainer: {
    height: 80,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    borderBottomColor: "#ccc",
    borderBottomWidth: 0.5,
  },
  infoTxt: {
    fontSize: 16,
    fontWeight: "bold",
    marginHorizontal: 20,
    textAlign: 'center',
  },
  spacer: {
    marginTop: 20,
  },
  userText: {
    height: 40,
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 20,
    marginTop: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#ccc',
    marginHorizontal: 20,
  }
});
