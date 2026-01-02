import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useEquipment } from '../../lib/context/EquipmentContext';
import ScrollRow from '../../components/member/ScrollRow';
import EquipmentOverlay from '../../components/member/EquipmentOverlay';
import ContainerOverlay from '../../components/member/ContainerOverlay';

export default function TeamScreen() {
    const { ownerships } = useEquipment();
    const [containerPage, setContainerPage] = React.useState(0);

    return (
        <View style={{ backgroundColor: "white", minHeight: "100%" }}>
            <FlatList
                data={Array.from(ownerships.values())}
                keyExtractor={(ownership) => ownership.membership.id}
                renderItem={({ item: ownership }) => {
                    const { membership, items } = ownership;
                    const displayName = membership.type === 'USER'
                        ? ((membership as any).full_name || 'Unknown User')
                        : (membership.storage_name || 'Storage');

                    return (
                        <View style={styles.userContainer}>
                            <Text style={styles.scrollText}>{displayName}</Text>
                            <ScrollRow listData={items} />
                        </View>
                    );
                }}
            />
            <EquipmentOverlay />
            <ContainerOverlay containerPage={containerPage} setContainerPage={setContainerPage} />
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
