import { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { useAuth } from '../../lib/context/AuthContext';
import { AuthStyles } from '../../styles/AuthStyles';
import PasswordInput from '../../components/PasswordInput';

export default function LoginScreen({ navigation }: any) {
    const { login } = useAuth();
    const [email, onChangeEmail] = useState("");
    const [password, onChangePassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    async function handleLogin() {
        try {
            await login(email, password);
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
            <Text style={AuthStyles.header}>Login</Text>
            <TextInput
                style={AuthStyles.input}
                onChangeText={onChangeEmail}
                value={email}
                placeholder="email"
                keyboardType="email-address"
            />
            <PasswordInput
                password={password}
                setPassword={onChangePassword}
                placeHolder="password"
            />
            <TouchableOpacity
                style={AuthStyles.button}
                onPress={handleLogin}
            >
                <Text style={AuthStyles.btnText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('CreateAccount')}>
                <Text style={AuthStyles.link}>Create Account</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('SendCode')}>
                <Text style={AuthStyles.link}>Forgot Password?</Text>
            </TouchableOpacity>
            {error && <Text style={AuthStyles.error}>{error}</Text>}
        </View>
    );
}