import { UserType } from '../../types/auth';
import { AuthResponse } from '../../types/auth';
import { db } from '../powersync/PowerSync';
import { v4 as uuidv4 } from 'uuid';
import { UserRecord } from '../../types/db';

let HARDCODED_PASSWORD = 'password';
const HARDCODED_CODE = '22222';

export const mockLogin = async (email: string, password: string): Promise<AuthResponse> => {
    email = email.toLowerCase();

    if (password !== HARDCODED_PASSWORD) {
        throw new Error('Invalid credentials');
    }

    const start = new Date().getTime();
    while (new Date().getTime() - start < 1000) {
        // Wait for 1 second to simulate network delay
    }

    const result = await db.getAll('SELECT * FROM users WHERE email = ?', [email]);
    if (result.length > 0) {
        const userRecord = result[0] as UserRecord;
        const user: UserType = {
            id: userRecord.id,
            name: userRecord.full_name,
            email: userRecord.email,
            profile: userRecord.profile,
        };

        return {
            user,
            token: 'fake-jwt-token-' + user.id,
        } as AuthResponse;
    } else {
        throw new Error('User not found');
    }
};

export const mockRegister = async (email: string, name: string, password: string): Promise<AuthResponse> => {
    email = email.toLowerCase();

    const existing = await db.getAll('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
        throw new Error('User already exists');
    }

    const newId = uuidv4();
    const now = new Date().toISOString();

    await db.execute(
        'INSERT INTO users (id, email, full_name, profile, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
        [newId, email, name, 'default', now, now]
    );

    const user: UserType = {
        id: newId,
        name: name,
        email: email,
        profile: 'default',
    };

    return {
        user,
        token: 'fake-jwt-token-' + newId,
    } as AuthResponse;
};

export const mockSendCode = async (email: string): Promise<void> => {
    email = email.toLowerCase();
    const result = await db.getAll('SELECT * FROM users WHERE email = ?', [email]);
    if (result.length === 0) {
        throw new Error('Email not found');
    }
};

export const mockResetPassword = async (email: string, code: string, new_password: string): Promise<void> => {
    email = email.toLowerCase();

    const result = await db.getAll('SELECT * FROM users WHERE email = ?', [email]);
    if (result.length === 0) {
        throw new Error('Email not found');
    }

    if (code !== HARDCODED_CODE) {
        throw new Error('Invalid code');
    }
};

export const mockUpdateProfile = async (email: string, profileKey: string): Promise<void> => {
    email = email.toLowerCase();
    const now = new Date().toISOString();

    // We update by email here since the context passes email, but ideally ID is better
    await db.execute('UPDATE users SET profile = ?, updated_at = ? WHERE email = ?', [profileKey, now, email]);
};

export const mockUpdatePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    if (currentPassword !== HARDCODED_PASSWORD) {
        throw new Error('Current password is incorrect');
    }
    HARDCODED_PASSWORD = newPassword;
};

export const mockUpdateName = async (email: string, name: string): Promise<void> => {
    email = email.toLowerCase();
    const now = new Date().toISOString();
    await db.execute('UPDATE users SET full_name = ?, updated_at = ? WHERE email = ?', [name, now, email]);
};

export const mockUpdateEmail = async (oldEmail: string, newEmail: string, code: string): Promise<void> => {
    oldEmail = oldEmail.toLowerCase();
    newEmail = newEmail.toLowerCase();

    if (code !== HARDCODED_CODE) {
        throw new Error('Invalid code');
    }

    const existing = await db.getAll('SELECT * FROM users WHERE email = ?', [newEmail]);
    if (existing.length > 0) {
        throw new Error('New email already in use');
    }

    const now = new Date().toISOString();
    await db.execute('UPDATE users SET email = ?, updated_at = ? WHERE email = ?', [newEmail, now, oldEmail]);
};

export const mockDeleteAccount = async (email: string): Promise<void> => {
    email = email.toLowerCase();
    await db.execute('DELETE FROM users WHERE email = ?', [email]);
};