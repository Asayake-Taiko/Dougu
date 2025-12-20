import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function CreateOrgScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>CreateOrg</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
});
