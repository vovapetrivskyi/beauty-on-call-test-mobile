import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import type { RegisterPayload } from '../types';

export const useRegister = () =>
  useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
  });