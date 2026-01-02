import { useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import { useAuth } from '../../lib/context/AuthContext';
import { AuthStyles } from '../../styles/AuthStyles';
import PasswordInput from '../../components/PasswordInput';
import { PressableOpacity } from '../../components/PressableOpacity';
import { useSpinner } from '../../lib/context/SpinnerContext';
import { useModal } from '../../lib/context/ModalContext';
import { Logger } from '../../lib/Logger';
import { LoginScreenNavigationProp } from '../../types/navigation';

export default function LoginScreen({ navigation }: { navigation: LoginScreenNavigationProp }) {
    const { login } = useAuth();
    const [email, onChangeEmail] = useState("");
    const [password, onChangePassword] = useState("");
    const { showSpinner, hideSpinner } = useSpinner();
    const { setMessage } = useModal();

    async function handleLogin() {
        try {
            showSpinner();
            await login(email, password);
        } catch (err: any) {
            Logger.error(err);
            setMessage(err.message || 'An unexpected error occurred');
        } finally {
            hideSpinner();
        }
    }

    return (
        <View style={AuthStyles.container}>
            <Text style={AuthStyles.header}>Login</Text>
            <TextInput
                style={AuthStyles.input}
                onChangeText={onChangeEmail}
                value={email}
                placeholder="email"
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <PasswordInput
                password={password}
                setPassword={onChangePassword}
                placeHolder="password"
            />
            <PressableOpacity
                style={AuthStyles.button}
                onPress={handleLogin}
            >
                <Text style={AuthStyles.btnText}>Login</Text>
            </PressableOpacity>
            <PressableOpacity onPress={() => navigation.navigate('CreateAccount')}>
                <Text style={AuthStyles.link}>Create Account</Text>
            </PressableOpacity>
            <PressableOpacity onPress={() => navigation.navigate('SendCode')}>
                <Text style={AuthStyles.link}>Forgot Password?</Text>
            </PressableOpacity>
        </View>
    );
}