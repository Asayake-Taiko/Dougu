import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

// Project imports
import { useUser } from "../../helper/context/UserContext";
import { useEquipment } from "../../helper/context/EquipmentContext";
import { chunkArray } from "../../helper/EquipmentUtils";
import Item from "../../components/member/Item";
import { useMyEquipmentStyles } from "../../styles/MyEquipmentStyles";
/*
  Screen for viewing all equipment assigned to the current user
*/
export default function EquipmentScreen() {
  const { orgUserStorage } = useUser();
  const { itemData } = useEquipment();
  const styles = useMyEquipmentStyles();

  // Get the equipment assigned to the current user
  const userItems = itemData.get(orgUserStorage!.id);
  const items = userItems?.data || [];
  const chunkedData = chunkArray(items, 3);

  return (
    <View style={styles.background}>
      <ScrollView>
        <View style={styles.container}>
          <Text style={styles.title}>My Equipment</Text>
          {chunkedData.map((group, index) => (
            <View key={index} style={styles.equipmentRow}>
              {group.map((equip) => (
                <View key={equip.id} style={styles.equipmentItemContainer}>
                  <Item data={equip} swapable={false} />
                </View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
