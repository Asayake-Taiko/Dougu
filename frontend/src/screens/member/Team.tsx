import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useEquipment } from '../../lib/context/EquipmentContext';
import ScrollRow from '../../components/member/ScrollRow';

export default function TeamScreen() {
    const { ownerships } = useEquipment();

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
                            <ScrollRow listData={items} isSwap={false} />
                        </View>
                    );
                }}
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
