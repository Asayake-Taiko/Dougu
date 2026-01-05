import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { User } from '../../types/models';
import { db } from '../powersync/PowerSync';
import { mockLogin, mockRegister, mockSendCode, mockResetPassword, mockUpdateProfile, mockUpdateEmail, mockUpdateName, mockUpdatePassword, mockDeleteAccount } from '../mocks/auth';
import { MOCK_ENABLED } from '../utils/env';

const USER_STORAGE_KEY = 'user_data';

interface AuthContextType {
    isLoading: boolean;
    user: User | null;
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
    const [user, setUser] = useState<User | null>(null);

    // Load user from secure storage on mount
    useEffect(() => {
        const loadUser = async () => {
            const storedUser = await SecureStore.getItemAsync(USER_STORAGE_KEY);
            if (storedUser) {
                try {
                    const userData = JSON.parse(storedUser);
                    setUser(new User(userData));
                } catch (e) {
                    console.error("Failed to parse stored user", e);
                }
            }
            setIsLoading(false);
        };

        loadUser();
    }, []);

    // everytime user updates profile, update user in secure storage
    useEffect(() => {
        if (user) {
            SecureStore.setItemAsync(USER_STORAGE_KEY, JSON.stringify(user.getRecord()));
        }
    }, [user]);

    const login = async (email: string, password: string) => {
        let res;
        if (MOCK_ENABLED) {
            res = await mockLogin(email, password);
        } else {
            throw new Error('Real login not implemented');
        }

        // Fetch UserRecord from DB to be sure we have the full record
        const result = await db.getAll('SELECT * FROM users WHERE id = ?', [res.user.id]);
        if (result.length > 0) {
            setUser(new User(result[0] as any));
        } else {
            // Fallback if record not found for some reason (shouldn't happen with mockLogin)
            setUser(new User({
                id: res.user.id,
                email: res.user.email,
                full_name: res.user.full_name,
                profile: res.user.profile
            }));
        }
    };

    const logout = async () => {
        setUser(null);
        await SecureStore.deleteItemAsync(USER_STORAGE_KEY);
    };

    const register = async (email: string, name: string, password: string) => {
        let res;
        if (MOCK_ENABLED) {
            res = await mockRegister(email, name, password);
        } else {
            throw new Error('Real register not implemented');
        }

        // Fetch UserRecord from DB
        const result = await db.getAll('SELECT * FROM users WHERE id = ?', [res.user.id]);
        if (result.length > 0) {
            setUser(new User(result[0] as any));
        } else {
            setUser(new User({
                id: res.user.id,
                email: res.user.email,
                full_name: res.user.full_name,
                profile: res.user.profile
            }));
        }
    }

    const sendCode = async (email: string) => {
        if (MOCK_ENABLED) {
            await mockSendCode(email);
        } else {
            throw new Error('Real send code not implemented');
        }
    };

    const resetPassword = async (password: string, confirmPassword: string, code: string) => {
        if (MOCK_ENABLED) {
            await mockResetPassword(password, confirmPassword, code);
        } else {
            throw new Error('Real reset password not implemented');
        }
    };

    const updateProfile = async (profileKey: string) => {
        if (!user) return;
        if (MOCK_ENABLED) {
            await mockUpdateProfile(user, profileKey);
        } else {
            throw new Error('Real update profile not implemented');
        }
        setUser(new User(user.getRecord())); // Trigger re-render with new instance
    };

    const updateName = async (name: string) => {
        if (!user) return;
        if (MOCK_ENABLED) {
            await mockUpdateName(user, name);
        } else {
            throw new Error('Real update name not implemented');
        }
        setUser(new User(user.getRecord()));
    };

    const updateEmail = async (email: string, code: string) => {
        if (!user) return;
        if (MOCK_ENABLED) {
            await mockUpdateEmail(user, email, code);
        } else {
            throw new Error('Real update email not implemented');
        }
        setUser(new User(user.getRecord()));
    };

    const updatePassword = async (currentPassword: string, newPassword: string) => {
        if (!user) return;
        if (MOCK_ENABLED) {
            await mockUpdatePassword(user, currentPassword, newPassword);
        } else {
            throw new Error('Real update password not implemented');
        }
    };

    const deleteAccount = async () => {
        if (!user) return;
        if (MOCK_ENABLED) {
            await mockDeleteAccount(user.email);
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
