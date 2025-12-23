import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { AuthStyles } from '../../styles/AuthStyles';
import { useAuth } from '../../lib/context/AuthContext';
import PasswordInput from '../../components/PasswordInput';
import { useRoute } from '@react-navigation/native';
import type { ResetPasswordScreenRouteProp } from '../../types/navigation';

export default function ResetPasswordScreen() {
    const [password, onChangePassword] = useState('');
    const [confirmPassword, onChangeConfirmPassword] = useState('');
    const [code, setCode] = useState('');
    const [error, setError] = useState<string | null>(null);
    const { resetPassword } = useAuth();
    const route = useRoute<ResetPasswordScreenRouteProp>();
    const email = route.params?.email || '';

    async function handleResetPassword() {
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        } else if (password.length < 8) {
            setError("Password must be at least 8 characters long");
            return;
        }
        try {
            await resetPassword(email, code, password);
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
                onChangeText={setCode}
                value={code}
                placeholder="code"
                keyboardType="numeric"
                testID="emailInput"
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
                <TouchableOpacity style={AuthStyles.button} onPress={handleResetPassword}>
                <Text style={AuthStyles.btnText}>Verify Code</Text>
            </TouchableOpacity>
            {error && <Text style={AuthStyles.error}>{error}</Text>}
        </View>
    );
}