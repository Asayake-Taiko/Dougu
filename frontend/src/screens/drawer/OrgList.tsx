import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function OrgListScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>OrgList</Text>
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
