import {
  View,
  NativeSyntheticEvent,
  NativeScrollEvent,
  FlatList,
  Dimensions,
  StyleSheet,
} from "react-native";
import React, { useEffect, useRef } from "react";

import { Item } from "../../types/models";
import { chunkArray } from "../../lib/helper/EquipmentUtils";
import ItemComponent from "./Item";

const windowWidth = Dimensions.get("window").width;
/*
  Handles an individual user row of equipment, tracking page and displaying.
  In swapEquipment, it also allows for scrolling to a specific page.
*/
export default function ScrollRow({
  listData,
  isSwap,
  setPage,
  nextPage,
}: {
  listData: Item[];
  isSwap: boolean;
  setPage?: React.Dispatch<React.SetStateAction<number>>;
  nextPage?: number;
}) {
  // data is displayed as pages of 4 items
  const chunkedData = chunkArray(listData, 4);
  const flatListRef = useRef<FlatList<Item[]> | null>(null);

  // keep track of the current page
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const newPage = Math.round(event.nativeEvent.contentOffset.x / windowWidth);
    if (setPage) setPage(newPage);
  };

  // scroll to a page if a dragging item hovers over an edge
  useEffect(() => {
    if (nextPage == null) return;
    if (nextPage < 0 || nextPage > chunkedData.length - 1) return;
    const scrollValue = nextPage * windowWidth;
    flatListRef.current?.scrollToOffset({ offset: scrollValue });
  }, [chunkedData.length, flatListRef, nextPage, windowWidth]);

  return (
    <FlatList
      horizontal={true}
      pagingEnabled={true}
      showsHorizontalScrollIndicator={true}
      data={chunkedData}
      renderItem={({ item }) => (
        <View style={styles.scrollRow}>
          {item.map((equip) => (
            <View key={equip.id} style={styles.item}>
              <ItemComponent data={equip} swapable={isSwap} />
            </View>
          ))}
        </View>
      )}
      keyExtractor={(item, index) => index.toString()}
      onScroll={handleScroll}
      scrollEventThrottle={8}
      ref={flatListRef}
    />
  );
}

const equipmentSpacing = windowWidth / 25;
const styles = StyleSheet.create({
  item: {
    marginLeft: equipmentSpacing,
  },
  scrollRow: {
    flex: 1,
    flexDirection: "row",
    minWidth: windowWidth,
  },
});
