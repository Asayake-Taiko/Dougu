import { useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import { AuthStyles } from '../../styles/AuthStyles';
import { useAuth } from '../../lib/context/AuthContext';
import PasswordInput from '../../components/PasswordInput';
import { PressableOpacity } from '../../components/PressableOpacity';


export default function CreateAccountScreen() {
    const [email, onChangeEmail] = useState("");
    const [first, onChangeFirst] = useState("");
    const [last, onChangeLast] = useState("");
    const [password, onChangePassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const { register } = useAuth();

    async function handleRegister() {
        try {
            await register(email, first + " " + last, password);
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
            <Text style={AuthStyles.header}>Create Account</Text>
            <View style={AuthStyles.nameContainer}>
                <TextInput
                    style={AuthStyles.name}
                    onChangeText={onChangeFirst}
                    value={first}
                    placeholder="first"
                    keyboardType="default"
                />
                <TextInput
                    style={AuthStyles.name}
                    onChangeText={onChangeLast}
                    value={last}
                    placeholder="last"
                    keyboardType="default"
                />
            </View>
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
            <PressableOpacity style={AuthStyles.button} onPress={handleRegister}>
                <Text style={AuthStyles.btnText}>Create</Text>
            </PressableOpacity>
            {error && <Text style={AuthStyles.error}>{error}</Text>}
        </View>
    );
}
