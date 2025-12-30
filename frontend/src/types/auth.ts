export type UserType = {
  name: string;
  email: string;
  id: string;
  profile: string;
};

export interface AuthResponse {
  user: UserType;
  token: string;
}