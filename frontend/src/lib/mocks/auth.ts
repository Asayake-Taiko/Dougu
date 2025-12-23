import { UserType } from '../../types/auth';
import { AuthResponse } from '../../types/auth';

interface FakeUser extends UserType {
    password: string;           // we don't store passwords like this in real apps!
    code: string;               // confirmation code for resetting password
}

const fakeUsers: Record<string, FakeUser> = {
    'johndoe@example.com': {
        id: '123',
        name: 'John Doe',
        email: 'johndoe@example.com',
        password: 'password123',
        code: '000000',
    },
    'janesmith@example.com': {
        id: '124',
        name: 'Jane Smith',
        email: 'janesmith@example.com',
        password: 'password456',
        code: '111111',
    },
    'e@gmail.com': {
        id: '125',
        name: 'Test User',
        email: 'e@gmail.com',
        password: 'password',
        code: '222222',
    },
}

export const mockLogin = async (email: string, password: string): Promise<AuthResponse> => {
    email = email.toLowerCase();
    const fakeUser = fakeUsers[email.toLowerCase()];
    if (fakeUser && password === fakeUser.password) {
        const { password, ...user } = fakeUser; // Remove password from response
        return {
            user,
            token: 'fake-jwt-token-' + user.id,
        } as AuthResponse;
    } else {
        throw new Error('Invalid credentials');
    }
};

export const mockRegister = async (email: string, name: string, password: string): Promise<AuthResponse> => {
    email = email.toLowerCase();
    if (fakeUsers[email]) {
        throw new Error('User already exists');
    }
    const newUser: FakeUser = {
        id: (Object.keys(fakeUsers).length + 123).toString(),
        name: name,
        email: email,
        password: password,
        code: '333333',
    };
    fakeUsers[email] = newUser;
    const { password: _password, ...user } = newUser; // Remove password from response
    return {
        user,
        token: 'fake-jwt-token-' + user.id,
    } as AuthResponse;
};

export const mockSendCode = async (email: string): Promise<void> => {
    email = email.toLowerCase();
    if (!fakeUsers[email]) {
        throw new Error('Email not found');
    }
    return;
};

export const mockResetPassword = async (email: string, code: string, new_password: string): Promise<void> => {
    const user = fakeUsers[email];
    if (!user) {
        throw new Error('Email not found');
    }
    user.password = new_password;
    return;
};