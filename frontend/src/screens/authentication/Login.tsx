import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { useAuth } from '../../lib/context/AuthContext';
import { AuthStyles } from '../../styles/AuthStyles';
import PasswordInput from '../../components/PasswordInput';

export default function LoginScreen({ navigation }: any) {
    const { login, error } = useAuth();
    const [username, onChangeUsername] = React.useState("");
    const [password, onChangePassword] = React.useState("");

    return (
        <View style={AuthStyles.container}>
            <Text style={AuthStyles.header}>Login</Text>
            <TextInput
                style={AuthStyles.input}
                onChangeText={onChangeUsername}
                value={username}
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
                onPress={() => login({ email: username, password })}
            >
                <Text style={AuthStyles.btnText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('CreateAccount')}>
                <Text style={AuthStyles.link}>Create Account</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('ResetPassword')}>
                <Text style={AuthStyles.link}>Forgot Password?</Text>
            </TouchableOpacity>
            {error && <Text style={AuthStyles.error}>{error}</Text>}
        </View>
    );
}