import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { UserType } from '../../types/auth';
import { mockLogin, mockRegister, mockSendCode, mockResetPassword, mockUpdateProfile, mockUpdateEmail, mockUpdateName, mockUpdatePassword, mockDeleteAccount } from '../mocks/auth';

const USER_STORAGE_KEY = 'user_data';

interface AuthContextType {
    isLoading: boolean;
    user: UserType | null;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, name: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    resetPassword: (email: string, code: string, new_password: string) => Promise<void>;
    sendCode: (email: string) => Promise<void>;
    updateProfile: (profileKey: string) => Promise<void>;
    updateName: (name: string) => Promise<void>;
    updateEmail: (email: string, code: string) => Promise<void>;
    updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
    deleteAccount: () => Promise<void>;
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
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<UserType | null>(null);

    // Load user from secure storage on mount
    useEffect(() => {
        const loadUser = async () => {
            const storedUser = await SecureStore.getItemAsync(USER_STORAGE_KEY);
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
            setIsLoading(false);
        };

        loadUser();
    }, []);

    // everytime user updates profile, update user in secure storage
    useEffect(() => {
        if (user) {
            SecureStore.setItemAsync(USER_STORAGE_KEY, JSON.stringify(user));
        }
    }, [user]);

    const login = async (email: string, password: string) => {
        let res;
        if (__DEV__) {
            res = await mockLogin(email, password);
        } else {
            throw new Error('Real login not implemented');
        }
        setUser(res.user);
    };

    const logout = async () => {
        setUser(null);
        await SecureStore.deleteItemAsync(USER_STORAGE_KEY);
    };

    const register = async (email: string, name: string, password: string) => {
        let res;
        if (__DEV__) {
            res = await mockRegister(email, name, password);
        } else {
            throw new Error('Real register not implemented');
        }
        setUser(res.user);
    }

    const sendCode = async (email: string) => {
        if (__DEV__) {
            await mockSendCode(email);
        } else {
            throw new Error('Real send code not implemented');
        }
    };

    const resetPassword = async (password: string, confirmPassword: string, code: string) => {
        if (__DEV__) {
            await mockResetPassword(password, confirmPassword, code);
        } else {
            throw new Error('Real reset password not implemented');
        }
    };

    const updateProfile = async (profileKey: string) => {
        if (__DEV__) {
            await mockUpdateProfile(user!.email, profileKey);
        } else {
            throw new Error('Real update profile not implemented');
        }
        setUser({ ...user!, profile: profileKey });
    };

    const updateName = async (name: string) => {
        if (__DEV__) {
            await mockUpdateName(user!.email, name);
        } else {
            throw new Error('Real update name not implemented');
        }
        setUser({ ...user!, name });
    };

    const updateEmail = async (email: string, code: string) => {
        if (__DEV__) {
            await mockUpdateEmail(user!.email, email, code);
        } else {
            throw new Error('Real update email not implemented');
        }
        setUser({ ...user!, email });
    };

    const updatePassword = async (currentPassword: string, newPassword: string) => {
        if (__DEV__) {
            await mockUpdatePassword(currentPassword, newPassword);
        } else {
            throw new Error('Real update password not implemented');
        }
    };

    const deleteAccount = async () => {
        if (__DEV__) {
            await mockDeleteAccount(user!.email);
        } else {
            throw new Error('Real delete account not implemented');
        }
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ isLoading, user, login, logout, register, resetPassword, sendCode, updateProfile, updateName, updateEmail, updatePassword, deleteAccount }}>
            {children}
        </AuthContext.Provider>
    );
};
