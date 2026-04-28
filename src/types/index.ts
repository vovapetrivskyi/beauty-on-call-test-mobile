export type Role = 'master' | 'client';

export interface City {
  id: number;
  name: string;
}

export interface District {
  id: number;
  name: string;
}

export interface RegisterPayload {
  name: string;
  phone: string;
  cityId: number;
  districtId: number;
  role: Role;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  userId?: string;
}

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  RoleSelect: undefined;
  Register: { role: Role };
};