import { useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import { AuthStyles } from '../../styles/AuthStyles';
import { useAuth } from '../../lib/context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import type { SendCodeScreenNavigationProp } from '../../types/navigation';
import { PressableOpacity } from '../../components/PressableOpacity';
import { useSpinner } from '../../lib/context/SpinnerContext';
import { useModal } from '../../lib/context/ModalContext';
import { Logger } from '../../lib/utils/Logger';

export default function SendCodeScreen() {
    const [email, onChangeEmail] = useState('');
    const { sendCode } = useAuth();
    const navigation = useNavigation<SendCodeScreenNavigationProp>();
    const { showSpinner, hideSpinner } = useSpinner();
    const { setMessage } = useModal();

    async function handleSendCode() {
        try {
            showSpinner();
            await sendCode(email);
            navigation.navigate('ResetPassword', { email });
        } catch (err: any) {
            Logger.error(err);
            setMessage(err.message || 'An unexpected error occurred');
        } finally {
            hideSpinner();
        }
    }

    return (
        <View style={AuthStyles.container}>
            <Text style={AuthStyles.header}>Change Password</Text>
            <Text style={AuthStyles.subtitle}>
                Enter your email to receive a code
            </Text>
            <TextInput
                style={AuthStyles.input}
                onChangeText={onChangeEmail}
                value={email}
                placeholder="email"
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <PressableOpacity style={AuthStyles.button} onPress={handleSendCode}>
                <Text style={AuthStyles.btnText}>Send Code</Text>
            </PressableOpacity>
        </View>
    );
}
