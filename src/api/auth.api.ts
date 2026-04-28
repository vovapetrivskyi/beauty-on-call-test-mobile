import { apiClient } from './client';
import type { RegisterPayload, RegisterResponse } from '../types';

export const authApi = {
  register: async (payload: RegisterPayload): Promise<RegisterResponse> => {
    const { data } = await apiClient.post<RegisterResponse>(
      '/auth/register',
      payload,
    );
    return data;
  },
};