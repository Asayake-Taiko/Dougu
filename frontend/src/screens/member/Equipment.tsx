import React from "react";
import { Text, View, FlatList } from "react-native";

// Project imports
import { useEquipment } from "../../lib/context/EquipmentContext";
import { useMembership } from "../../lib/context/MembershipContext";
import { EquipmentStyles } from "../../styles/EquipmentStyles";
import Item from "../../components/member/Item";
import EquipmentOverlay from "../../components/member/EquipmentOverlay";
import ContainerOverlay from "../../components/member/ContainerOverlay";

/*
  Screen for viewing all equipment assigned to the current user
*/
export default function EquipmentScreen() {
  const { ownerships } = useEquipment();
  const { membership } = useMembership();
  const [containerPage, setContainerPage] = React.useState(0);
  if (!membership) {
    return null;
  }

  // Get the items assigned to the current user
  const userItems = ownerships.get(membership.id);
  const items = userItems?.items || [];
  return (
    <View style={EquipmentStyles.background}>
      <FlatList
        data={items}
        numColumns={3}
        ListHeaderComponent={
          <Text style={EquipmentStyles.title}>My Equipment</Text>
        }
        contentContainerStyle={EquipmentStyles.container}
        columnWrapperStyle={EquipmentStyles.equipmentRow}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={EquipmentStyles.equipmentItemContainer}>
            <Item data={item} />
          </View>
        )}
      />
      <EquipmentOverlay />
      <ContainerOverlay
        containerPage={containerPage}
        setContainerPage={setContainerPage}
      />
    </View>
  );
}
