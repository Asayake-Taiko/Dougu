import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { AuthStyles } from '../../styles/AuthStyles';
import { useAuth } from '../../lib/context/AuthContext';
import PasswordInput from '../../components/PasswordInput';


export default function CreateAccountScreen() {
    const [email, onChangeEmail] = React.useState("");
    const [first, onChangeFirst] = React.useState("");
    const [last, onChangeLast] = React.useState("");
    const [password, onChangePassword] = React.useState("");
    const { register, error } = useAuth();

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
            <TouchableOpacity style={AuthStyles.button} onPress={() => register({ email, name: first + " " + last, password })}>
                <Text style={AuthStyles.btnText}>Create</Text>
            </TouchableOpacity>
            {error && <Text style={AuthStyles.error}>{error}</Text>}
        </View>
    );
}
