import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function VerifyScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Verify</Text>
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
