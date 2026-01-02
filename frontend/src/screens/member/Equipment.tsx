import React from "react";
import { Text, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

// Project imports
import { useEquipment } from "../../lib/context/EquipmentContext";
import { useMembership } from "../../lib/context/MembershipContext";
import { chunkArray } from "../../lib/helper/EquipmentUtils";
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
    const chunkedData = chunkArray(items, 3);

    return (
        <View style={EquipmentStyles.background}>
            <ScrollView>
                <View style={EquipmentStyles.container}>
                    <Text style={EquipmentStyles.title}>My Equipment</Text>
                    {chunkedData.map((group, index) => (
                        <View key={index} style={EquipmentStyles.equipmentRow}>
                            {group.map((item) => (
                                <View key={item.id} style={EquipmentStyles.equipmentItemContainer}>
                                    <Item data={item} />
                                </View>
                            ))}
                        </View>
                    ))}
                </View>
            </ScrollView>
            <EquipmentOverlay />
            <ContainerOverlay containerPage={containerPage} setContainerPage={setContainerPage} />
        </View>
    );
}
