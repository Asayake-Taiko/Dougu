import React, { createContext, useContext, useState, ReactNode } from 'react';
import { LoginCredentials, RegisterData, UserType } from '../../types/auth';
import { mockLogin, mockRegister } from '../mocks/auth';

interface AuthContextType {
    isLoading: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => void;
    error: string | null;
    user: UserType | null;
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
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState<UserType | null>(null);
    const IS_DEV = process.env.EXPO_PUBLIC_IS_DEV === 'true';

    const login = async (credentials: LoginCredentials) => {
        try {
            setIsLoading(true);
            let res;
            if (IS_DEV) {
                res = await mockLogin(credentials);
            } else {
                // Here you would call the real login API
                throw new Error('Real login not implemented');
            }
            setUser(res.user);
            setIsLoading(false);
        } catch (err) {
            setIsLoading(false);
            setError((err as Error).message);
        }
    };

    const logout = () => {
        setUser(null);
    };

    const register = async (data: RegisterData) => {
        try {
            setIsLoading(true);
            let res;
            if (IS_DEV) {
                res = await mockRegister(data);
            } else {
                // Here you would call the real register API
                throw new Error('Real register not implemented');
            }
            setUser(res.user);
            setIsLoading(false);
        } catch (err) {
            setIsLoading(false);
            setError((err as Error).message);
        }
    }

    return (
        <AuthContext.Provider value={{ isLoading, error, user, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
};
