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


import { useEquipment } from "../../lib/context/EquipmentContext";
import { Item } from "../../types/models";
import { OrgMembershipRecord } from "../../types/db";
import CurrMembersDropdown from "./CurrMembersDropdown";
import ScrollRow from "./ScrollRow";

import useScroll from "../../lib/helper/useScroll";
import useSwapDragAndDrop from "../../lib/helper/useSwapDragAndDrop";
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

  const {
    panGesture,
    draggingItem,
    dragValues,
    containerPage,
    setContainerPage,
  } = useSwapDragAndDrop({
    listOne,
    listTwo,
    topPage,
    bottomPage,
    swapUser,
    handleScroll,
    clearScroll,
    halfLine,
  });

  // on layout of the top scrollRow, its bottom is the halfline
  const handleLayout = (e: LayoutChangeEvent) => {
    const y = e.nativeEvent.layout.y;
    halfLine.current = y;
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GestureDetector gesture={panGesture}>
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
