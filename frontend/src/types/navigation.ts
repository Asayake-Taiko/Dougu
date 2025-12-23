import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';

// Auth Stack Parameter List
export type AuthStackParamList = {
    Login: undefined;
    CreateAccount: undefined;
    SendCode: undefined;
    ResetPassword: { email: string };
};

// Screen-specific navigation props
export type SendCodeScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'SendCode'>;
export type ResetPasswordScreenRouteProp = RouteProp<AuthStackParamList, 'ResetPassword'>;
