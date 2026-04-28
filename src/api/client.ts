import axios from 'axios';

// Android емулятор → 10.0.2.2
// iOS симулятор   → localhost
// Фізичний девайс → IP вашої машини, напр. 192.168.1.10
const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:3000/api/v1';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    const message =
      error.response?.data?.message ?? error.message ?? 'Невідома помилка';
    return Promise.reject(new Error(message));
  },
);