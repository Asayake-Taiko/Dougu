import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MemberTabScreenProps } from '../../types/navigation';
import { PressableOpacity } from '../../components/PressableOpacity';
import { Colors } from '../../styles/global/colors';

export default function OrgInfoScreen({ navigation, route }: MemberTabScreenProps<'OrgInfo'>) {
    const { organizationId } = route.params;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Organization Information</Text>
            <Text style={styles.text}>ID: {organizationId}</Text>

            <PressableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('EditOrg', { organizationId })}
            >
                <Text style={styles.buttonText}>Edit Organization</Text>
            </PressableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: Colors.text,
    },
    text: {
        fontSize: 16,
        marginBottom: 30,
        color: 'gray',
    },
    button: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
