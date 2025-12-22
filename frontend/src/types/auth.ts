// this context is set whenever the useer logs in
export type UserType = {
  name: string;
  email: string;
  id: string;
};

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: UserType;
  token: string;
}