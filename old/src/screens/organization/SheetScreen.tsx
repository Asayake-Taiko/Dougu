import React, { useEffect, useLayoutEffect, useState } from "react";
import { CheckBox } from "@rneui/themed";
import { StyleSheet, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useEquipment } from "../../helper/context/EquipmentContext";
import { getCsvData } from "../../helper/EquipmentUtils";
import { csvSheet } from "../../types/ModelTypes";
import Sheet from "../../components/organization/Sheet";

// sheetScreen. it obtains the csvData and composes the header and body
export default function SheetScreen() {
  const { itemData } = useEquipment();
  const [data, setData] = React.useState<csvSheet | null>(null);
  const [showEmpty, setShowEmpty] = useState(true);
  const [showContainerEquip, setShowContainerEquip] = useState(true);

  // on layout, get the user's preferences
  useLayoutEffect(() => {
    const getData = async () => {
      const config = await AsyncStorage.getItem("config");
      if (config) {
        const { showEmpty, showContainerEquip } = JSON.parse(config);
        setShowEmpty(showEmpty);
        setShowContainerEquip(showContainerEquip);
      }
    };

    getData();
  }, []);

  // keep the data up to date
  useEffect(() => {
    setData(getCsvData(itemData, showEmpty, showContainerEquip));
  }, [itemData, showContainerEquip, showEmpty]);

  // store the user's preferences and keep them up to date
  useEffect(() => {
    const storeData = async () => {
      await AsyncStorage.setItem(
        "config",
        JSON.stringify({
          showEmpty: showEmpty,
          showContainerEquip: showContainerEquip,
        }),
      );
    };

    storeData();
  }, [showEmpty, showContainerEquip]);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <CheckBox
          center
          title="Empty Rows"
          checked={showEmpty}
          onPress={() => setShowEmpty(!showEmpty)}
          textStyle={styles.text}
        />
        <CheckBox
          center
          title="Container Equipment"
          checked={showContainerEquip}
          onPress={() => setShowContainerEquip(!showContainerEquip)}
          textStyle={styles.text}
        />
      </View>
      <Sheet data={data} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  text: {
    fontSize: 10,
  },
});
