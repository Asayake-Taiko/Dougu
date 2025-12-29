import { useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import { AuthStyles } from '../../styles/AuthStyles';
import { useAuth } from '../../lib/context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import type { SendCodeScreenNavigationProp } from '../../types/navigation';
import { PressableOpacity } from '../../components/PressableOpacity';

export default function SendCodeScreen() {
    const [email, onChangeEmail] = useState('');
    const [error, setError] = useState<string | null>(null);
    const { sendCode } = useAuth();
    const navigation = useNavigation<SendCodeScreenNavigationProp>();

    async function handleSendCode() {
        try {
            await sendCode(email);
            navigation.navigate('ResetPassword', { email });
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unexpected error occurred');
            }
        }
    }

    return (
        <View style={AuthStyles.container}>
            <Text style={AuthStyles.header}>Change Password</Text>
            <Text style={AuthStyles.subtitle}>
                Enter Your Confirmation Code
            </Text>
            <TextInput
                style={AuthStyles.input}
                onChangeText={onChangeEmail}
                value={email}
                placeholder="email"
                keyboardType="email-address"
            />
            <PressableOpacity style={AuthStyles.button} onPress={handleSendCode}>
                <Text style={AuthStyles.btnText}>Send Code</Text>
            </PressableOpacity>
            {error && <Text style={AuthStyles.error}>{error}</Text>}
        </View>
    );
}
