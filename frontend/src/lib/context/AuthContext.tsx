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
    logout: () => void;
    resetPassword: (email: string, code: string, new_password: string) => Promise<void>;
    sendCode: (email: string) => Promise<void>;
    updateProfile: (profileKey: string) => Promise<void>;
    updateName: (name: string) => Promise<void>;
    updateEmail: (email: string) => Promise<void>;
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
    const IS_DEV = process.env.EXPO_PUBLIC_IS_DEV === 'true';

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
        if (IS_DEV) {
            res = await mockLogin(email, password);
        } else {
            // Here you would call the real login API
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

    const updateProfile = async (profileKey: string) => {
        if (IS_DEV) {
            await mockUpdateProfile(user!.email, profileKey);
            setUser({ ...user!, profile: profileKey });
        } else {
            // Here you would call the real update profile API
            throw new Error('Real update profile not implemented');
        }
    };

    const updateName = async (name: string) => {
        if (IS_DEV) {
            await mockUpdateName(user!.email, name);
            setUser({ ...user!, name });
        } else {
            // Here you would call the real update name API
            throw new Error('Real update name not implemented');
        }
    };

    const updateEmail = async (email: string) => {
        if (IS_DEV) {
            await mockUpdateEmail(user!.email, email);
            setUser({ ...user!, email });
        } else {
            // Here you would call the real update email API
            throw new Error('Real update email not implemented');
        }
    };

    const updatePassword = async (currentPassword: string, newPassword: string) => {
        if (IS_DEV) {
            await mockUpdatePassword(user!.email, currentPassword, newPassword);
        } else {
            // Here you would call the real update password API
            throw new Error('Real update password not implemented');
        }
    };

    const deleteAccount = async () => {
        if (IS_DEV) {
            await mockDeleteAccount(user!.email);
            setUser(null);
        } else {
            // Here you would call the real delete account API
            throw new Error('Real delete account not implemented');
        }
    };

    return (
        <AuthContext.Provider value={{ isLoading, user, login, logout, register, resetPassword, sendCode, updateProfile, updateName, updateEmail, updatePassword, deleteAccount }}>
            {children}
        </AuthContext.Provider>
    );
};
