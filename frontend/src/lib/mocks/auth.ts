import { UserType } from '../../types/auth';
import { LoginCredentials, RegisterData, AuthResponse } from '../../types/auth';

interface FakeUser extends UserType {
    password: string;
}

const fakeUsers: Record<string, FakeUser> = {
    'johndoe@example.com': {
        id: '123',
        name: 'John Doe',
        email: 'johndoe@example.com',
        password: 'password123',
    },
    'janesmith@example.com': {
        id: '124',
        name: 'Jane Smith',
        email: 'janesmith@example.com',
        password: 'password456',
    },
}

export const mockLogin = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const fakeUser = fakeUsers[credentials.email.toLowerCase()];
    if (fakeUser && credentials.password === fakeUser.password) {
        const { password, ...user } = fakeUser; // Remove password from response
        return {
            user,
            token: 'fake-jwt-token-' + user.id,
        } as AuthResponse;
    } else {
        throw new Error('Invalid credentials');
    }
};

export const mockRegister = async (data: RegisterData): Promise<AuthResponse> => {
    if (fakeUsers[data.email]) {
        throw new Error('User already exists');
    }
    const newUser: FakeUser = {
        id: (Object.keys(fakeUsers).length + 123).toString(),
        name: data.name,
        email: data.email,
        password: data.password,
    };
    fakeUsers[data.email] = newUser;
    const { password, ...user } = newUser; // Remove password from response
    return {
        user,
        token: 'fake-jwt-token-' + user.id,
    } as AuthResponse;
};