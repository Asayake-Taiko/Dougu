import { FlatList, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { PressableOpacity } from "./PressableOpacity";
import { chunkArray } from "../lib/utils/EquipmentUtils";

/*
  IconMenu displays a grid of icons that the user can choose from
  to represent their equipment. It is shown in the ItemImageScreen
  component.
*/
export default function IconMenu({
  data,
  handleSet,
}: {
  data: {
    [key: string]: any;
  };
  handleSet: (imageKey: string) => void;
}) {
  // show the icons in a grid of 4 columns
  const chunkedKeys = chunkArray(Object.keys(data), 4);

  return (
    <View style={styles.container}>
      <FlatList
        data={chunkedKeys}
        renderItem={({ item }) => (
          <View style={styles.row}>
            {item.map((key) => (
              <PressableOpacity
                key={key}
                style={styles.iconContainer}
                onPress={() => handleSet(key)}
              >
                <Image
                  source={data[key]}
                  style={styles.icon}
                  contentFit="contain"
                />
              </PressableOpacity>
            ))}
          </View>
        )}
        keyExtractor={(item) => item[0]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
  },
  iconContainer: {
    flexBasis: "25%",
    justifyContent: "center",
    aspectRatio: 1,
  },
  icon: {
    width: "90%",
    height: "90%",
    alignSelf: "center",
  },
});
