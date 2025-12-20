import React from "react";
import { View, StyleSheet } from "react-native";

/*
  Dots to display the current page in a horizontal scroll view
  Only used in ContainerOverlay
*/
export default function PaginationDots({
  length,
  currIdx,
}: {
  length: number;
  currIdx: number;
}) {
  return (
    <View style={styles.pagination}>
      {Array.from({ length }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.paginationDot,
            index === currIdx
              ? styles.paginationDotActive
              : styles.paginationDotInactive,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  pagination: {
    flexDirection: "row",
    height: 30,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 2,
  },
  paginationDotInactive: {
    backgroundColor: "gray",
  },
  paginationDotActive: {
    backgroundColor: "black",
  },
});
