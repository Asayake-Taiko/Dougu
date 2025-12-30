import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MemberTabScreenProps } from '../../types/navigation';

export default function SwapScreen({ route }: MemberTabScreenProps<'Swap'>) {
    const { organizationId } = route.params;

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Swap Screen</Text>
            <Text style={styles.subText}>Org ID: {organizationId}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    subText: {
        fontSize: 14,
        color: '#666',
        marginTop: 8,
    },
});
