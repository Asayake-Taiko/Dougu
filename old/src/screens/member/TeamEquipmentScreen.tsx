import { FlatList, StyleSheet, Text, View } from "react-native";
import React from "react";

// project imports
import { sortOrgItems } from "../../helper/EquipmentUtils";
import { useEquipment } from "../../helper/context/EquipmentContext";
import ScrollRow from "../../components/member/ScrollRow";

/*
  Screen for viewing all equipment in the organization
  Groups equipment by the orgUserStorage it is assigned to
*/
export default function TeamEquipmentScreen() {
  const { itemData } = useEquipment();
  const orgItems = sortOrgItems(itemData);

  return (
    <View style={{ backgroundColor: "white", minHeight: "100%" }}>
      <FlatList
        data={orgItems}
        keyExtractor={(orgItem, index) => index.toString()}
        renderItem={({ item: orgItem }) => (
          <View style={styles.userContainer}>
            <Text style={styles.scrollText}>{orgItem.assignedTo.name}</Text>
            <ScrollRow listData={orgItem.data} isSwap={false} />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  scrollText: {
    height: 40,
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 20,
  },
  userContainer: {
    minHeight: 200,
    backgroundColor: "white",
  },
});
