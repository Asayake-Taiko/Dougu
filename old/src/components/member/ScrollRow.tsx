import {
  View,
  NativeSyntheticEvent,
  NativeScrollEvent,
  FlatList,
} from "react-native";
import React, { useEffect, useRef } from "react";

import { ItemObj } from "../../types/ModelTypes";
import { chunkArray } from "../../helper/EquipmentUtils";
import Item from "./Item";
import { useDimensions } from "../../helper/context/DimensionsContext";
import { useScrollRowStyles } from "../../styles/ScrollRowStyles";

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
  listData: ItemObj[];
  isSwap: boolean;
  setPage?: React.Dispatch<React.SetStateAction<number>>;
  nextPage?: number;
}) {
  // data is displayed as pages of 4 items
  const chunkedData = chunkArray(listData, 4);
  const flatListRef = useRef<FlatList<ItemObj[]> | null>(null);
  const { windowWidth } = useDimensions();
  const styles = useScrollRowStyles();

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
      showsHorizontalScrollIndicator={false}
      data={chunkedData}
      renderItem={({ item }) => (
        <View style={styles.scrollRow}>
          {item.map((equip) => (
            <View key={equip.id} style={styles.item}>
              <Item data={equip} swapable={isSwap} />
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
