import React from "react";
import { View, Dimensions, StyleSheet } from "react-native";
import Animated, {
  useAnimatedScrollHandler,
  SharedValue,
  AnimatedRef,
} from "react-native-reanimated";

import { Item } from "../../types/other";
import ItemComponent from "./Item";

const windowWidth = Dimensions.get("window").width;

/*
  Handles an individual user row of equipment.
  Now uses continuous scrolling instead of pagination.
*/
export default function ScrollRow({
  listData,
  scrollOffset,
  flatListRef,
  draggingItem,
}: {
  listData: Item[];
  scrollOffset?: SharedValue<number>;
  flatListRef?: AnimatedRef<Animated.FlatList<Item>>;
  draggingItem?: Item | null;
}) {
  // If we have a shared value, use the animated scroll handler
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      if (scrollOffset) {
        scrollOffset.value = event.contentOffset.x;
      }
    },
  });

  return (
    <Animated.FlatList
      ref={flatListRef}
      horizontal={true}
      showsHorizontalScrollIndicator={false}
      data={listData}
      renderItem={({ item }) => (
        <View style={styles.item}>
          <ItemComponent data={item} draggingItem={draggingItem} />
        </View>
      )}
      keyExtractor={(item) => item.id}
      onScroll={scrollOffset ? scrollHandler : undefined}
      scrollEventThrottle={16}
      contentContainerStyle={styles.contentContainer}
    />
  );
}

const equipmentSpacing = windowWidth / 28;
const styles = StyleSheet.create({
  item: {
    marginLeft: equipmentSpacing,
    marginTop: 10,
  },
  contentContainer: {
    paddingRight: equipmentSpacing,
  },
});
