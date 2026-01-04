import { useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import { AuthStyles } from '../../styles/AuthStyles';
import { useAuth } from '../../lib/context/AuthContext';
import PasswordInput from '../../components/PasswordInput';
import { useRoute } from '@react-navigation/native';
import type { ResetPasswordScreenRouteProp } from '../../types/navigation';
import { useModal } from '../../lib/context/ModalContext';
import { useSpinner } from '../../lib/context/SpinnerContext';
import { Logger } from '../../lib/Logger';
import { PressableOpacity } from '../../components/PressableOpacity';

export default function ResetPasswordScreen() {
    const [password, onChangePassword] = useState('');
    const [confirmPassword, onChangeConfirmPassword] = useState('');
    const [code, setCode] = useState('');
    const { resetPassword } = useAuth();
    const route = useRoute<ResetPasswordScreenRouteProp>();
    const email = route.params?.email || '';
    const { setMessage } = useModal();
    const { showSpinner, hideSpinner } = useSpinner();

    async function handleResetPassword() {
        if (password !== confirmPassword) {
            setMessage("Passwords do not match");
            return;
        } else if (password.length < 8) {
            setMessage("Password must be at least 8 characters long");
            return;
        }

        try {
            showSpinner();
            await resetPassword(email, code, password);
            setMessage('Password has been reset successfully');
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
                Enter the code sent to your email
            </Text>
            <TextInput
                style={AuthStyles.input}
                onChangeText={setCode}
                value={code}
                placeholder="code"
                keyboardType="numeric"
                testID="codeInput"
            />
            <PasswordInput
                password={password}
                setPassword={onChangePassword}
                placeHolder="new password"
            />
            <PasswordInput
                password={confirmPassword}
                setPassword={onChangeConfirmPassword}
                placeHolder="confirm password"
            />
            <PressableOpacity style={AuthStyles.button} onPress={handleResetPassword}>
                <Text style={AuthStyles.btnText}>Verify Code</Text>
            </PressableOpacity>
        </View>
    );
}