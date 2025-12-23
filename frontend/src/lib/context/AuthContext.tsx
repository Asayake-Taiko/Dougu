import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserType } from '../../types/auth';
import { mockLogin, mockRegister, mockSendCode, mockResetPassword } from '../mocks/auth';

interface AuthContextType {
    user: UserType | null;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, name: string, password: string) => Promise<void>;
    logout: () => void;
    resetPassword: (email: string, code: string, new_password: string) => Promise<void>;
    sendCode: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<UserType | null>(null);
    const IS_DEV = process.env.EXPO_PUBLIC_IS_DEV === 'true';

    const login = async (email: string, password: string) => {
        let res;
        if (IS_DEV) {
            res = await mockLogin(email, password);
        } else {
            // Here you would call the real login API
            throw new Error('Real login not implemented');
        }
        setUser(res.user);
    };

    const logout = () => {
        setUser(null);
    };

    const register = async (email: string, name: string, password: string) => {
        let res;
        if (IS_DEV) {
            res = await mockRegister(email, name, password);
        } else {
            // Here you would call the real register API
            throw new Error('Real register not implemented');
        }
        setUser(res.user);
    }

    const sendCode = async (email: string) => {
        if (IS_DEV) {
            // Simulate sending code in dev mode
            await mockSendCode(email);
        } else {
            // Here you would call the real send code API
            throw new Error('Real send code not implemented');
        }
    };

    const resetPassword = async (password: string, confirmPassword: string, code: string) => {
        if (IS_DEV) {
            await mockResetPassword(password, confirmPassword, code);
        } else {
            // Here you would call the real reset password API
            throw new Error('Real reset password not implemented');
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, register, resetPassword, sendCode }}>
            {children}
        </AuthContext.Provider>
    );
};
