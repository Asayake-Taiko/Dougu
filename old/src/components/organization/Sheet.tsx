import React, { memo } from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import Animated, {
  ScrollHandlerProcessed,
  scrollTo,
  SharedValue,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";
import { useFonts } from "expo-font";

import { ScrollView } from "react-native-gesture-handler";
import { csvSheet } from "../../types/ModelTypes";

/*
  Sheet displays all the organization's equipment data and counts
  in a table format, similar to a Google Sheet.
*/

// individual cell in the table
const Cell = memo(function Cell({
  data,
  style,
}: {
  data: string;
  style: StyleProp<ViewStyle>;
}) {
  return (
    <View style={style}>
      <Text style={styles.cellText}>{data}</Text>
    </View>
  );
});

// column in the table
const Col = memo(function Col({
  data,
  isIdentity,
}: {
  data: string[];
  isIdentity: boolean;
}) {
  return (
    <View>
      {data.map((d, index) => (
        <Cell
          data={d}
          key={index}
          style={isIdentity ? styles.identityCell : styles.cell}
        />
      ))}
    </View>
  );
});

// header of the table, equipment labels row is a horizontal scroll view
// that is synced with the body's horizontal scroll view
function HeaderView({
  equipmentLabels,
  offsetX,
}: {
  equipmentLabels: string[];
  offsetX: SharedValue<number>;
}) {
  const scrollRef = useAnimatedRef<Animated.ScrollView>();

  useDerivedValue(() => {
    scrollTo(scrollRef, offsetX.value, 0, true);
  });

  return (
    <View style={styles.row}>
      <Cell data={"Assigned To"} key={-1} style={styles.identityCell} />
      <Animated.ScrollView
        horizontal={true}
        ref={scrollRef}
        showsHorizontalScrollIndicator={false}
      >
        {equipmentLabels.map((label, index) => (
          <Cell data={label} key={index} style={styles.cell} />
        ))}
      </Animated.ScrollView>
    </View>
  );
}

// body of the table, contains the identity column and the equipment data
function BodyView({
  identityCol,
  values,
  scrollHandler,
}: {
  identityCol: string[];
  values: string[][];
  scrollHandler: ScrollHandlerProcessed<Record<string, unknown>>;
}) {
  return (
    <View style={styles.body}>
      <Col data={identityCol} isIdentity={true} />
      <Animated.FlatList
        data={values}
        renderItem={({ item }) => <Col data={item} isIdentity={false} />}
        keyExtractor={(item, index) => index.toString()}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
      />
    </View>
  );
}

export default function Sheet({ data }: { data: csvSheet | null }) {
  const offsetX = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler((event) => {
    offsetX.value = event.contentOffset.x;
  });

  // load the Oswald font
  const [loaded, error] = useFonts({
    Oswald: require("../../assets/Oswald-Font.ttf"),
  });
  if (!loaded && !error) {
    return null;
  }

  return (
    <View style={styles.container}>
      <HeaderView equipmentLabels={data ? data.header : []} offsetX={offsetX} />
      <ScrollView>
        <BodyView
          identityCol={data ? data.identityCol : []}
          values={data ? data.values : []}
          scrollHandler={scrollHandler}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    flexDirection: "row",
  },
  cell: {
    width: 80,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#D3D3D3",
  },
  cellText: {
    fontSize: 10,
    fontFamily: "Oswald",
  },
  container: {
    backgroundColor: "#fff",
    flex: 1,
    flexDirection: "column",
  },
  identityCell: {
    width: 120,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 2,
    borderRightColor: "#696969",
    borderBottomWidth: 1,
    borderBottomColor: "#D3D3D3",
    backgroundColor: "#f4f4f4",
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 2,
    borderColor: "#696969",
  },
});
