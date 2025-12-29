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
        profile: 'default',
        password: 'password123',
        code: '000000',
    },
    'janesmith@example.com': {
        id: '124',
        name: 'Jane Smith',
        email: 'janesmith@example.com',
        profile: 'default',
        password: 'password456',
        code: '111111',
    },
    'e@gmail.com': {
        id: '125',
        name: 'Test User',
        email: 'e@gmail.com',
        profile: 'default',
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
        profile: 'default',
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
    email = email.toLowerCase();
    const user = fakeUsers[email];
    if (!user) {
        throw new Error('Email not found');
    }
    user.password = new_password;
    return;
};

export const mockUpdateProfile = async (email: string, profileKey: string): Promise<void> => {
    email = email.toLowerCase();
    const user = fakeUsers[email];
    if (!user) {
        throw new Error('Email not found');
    }
    user.profile = profileKey;
    return;
};

export const mockUpdatePassword = async (email: string, currentPassword: string, newPassword: string): Promise<void> => {
    email = email.toLowerCase();
    const user = fakeUsers[email];
    if (!user) {
        throw new Error('Email not found');
    }
    if (user.password !== currentPassword) {
        throw new Error('Current password is incorrect');
    }
    user.password = newPassword;
    return;
};

export const mockUpdateName = async (email: string, name: string): Promise<void> => {
    email = email.toLowerCase();
    const user = fakeUsers[email];
    if (!user) {
        throw new Error('Email not found');
    }
    user.name = name;
    return;
};

export const mockUpdateEmail = async (oldEmail: string, newEmail: string, code: string): Promise<void> => {
    oldEmail = oldEmail.toLowerCase();
    newEmail = newEmail.toLowerCase();
    const user = fakeUsers[oldEmail];
    if (!user) {
        throw new Error('Old email not found');
    }
    if (fakeUsers[newEmail]) {
        throw new Error('New email already in use');
    }
    if (user.code !== code) {
        throw new Error('Invalid code');
    }
    delete fakeUsers[oldEmail];
    user.email = newEmail;
    fakeUsers[newEmail] = user;
    return;
};

export const mockDeleteAccount = async (email: string): Promise<void> => {
    email = email.toLowerCase();
    const user = fakeUsers[email];
    if (!user) {
        throw new Error('Email not found');
    }
    delete fakeUsers[email];
    return;
};