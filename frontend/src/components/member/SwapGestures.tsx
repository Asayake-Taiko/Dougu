import React, { useRef } from "react";
import { View, Text, StyleSheet, LayoutChangeEvent } from "react-native";
import {
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedRef,
  useSharedValue,
} from "react-native-reanimated";

import { Item } from "../../types/other";
import { OrgMembershipRecord } from "../../types/db";
import CurrMembersDropdown from "./CurrMembersDropdown";
import ScrollRow from "./ScrollRow";
import useScroll from "../../lib/hooks/useScroll";
import useSwapDragAndDrop from "../../lib/hooks/useSwapDragAndDrop";
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

  // Scroll Refs and Shared Values
  // We use "any" for the generic because the Animated.FlatList type can be tricky with specific Item types
  // and we just need scrollToOffset.
  const topListRef = useAnimatedRef<Animated.FlatList<Item>>();
  const bottomListRef = useAnimatedRef<Animated.FlatList<Item>>();
  const topScrollOffset = useSharedValue(0);
  const bottomScrollOffset = useSharedValue(0);

  // handle scrollRow scrolling
  const { startScrolling, stopScrolling } = useScroll(
    topListRef,
    bottomListRef,
    topScrollOffset,
    bottomScrollOffset,
  );

  const {
    panGesture,
    draggingItem,
    dragValues,
    containerPage,
    setContainerPage,
  } = useSwapDragAndDrop({
    listOne,
    listTwo,
    topScrollOffset,
    bottomScrollOffset,
    swapUser,
    startScrolling,
    stopScrolling,
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
              scrollOffset={topScrollOffset}
              flatListRef={topListRef}
              draggingItem={draggingItem}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.halfContainer} onLayout={handleLayout}>
            <View style={styles.spacer}>
              <CurrMembersDropdown setUser={handleSet} isCreate={false} />
            </View>
            <ScrollRow
              listData={listTwo}
              scrollOffset={bottomScrollOffset}
              flatListRef={bottomListRef}
              draggingItem={draggingItem}
            />
          </View>
          <ContainerOverlay
            containerPage={containerPage}
            setContainerPage={setContainerPage}
            draggingItem={draggingItem}
          />
          <EquipmentOverlay />
          <FloatingDraggingItem
            draggingItem={draggingItem}
            dragValues={dragValues}
          />
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
    textAlign: "center",
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
    backgroundColor: "#ccc",
    marginHorizontal: 20,
  },
});
