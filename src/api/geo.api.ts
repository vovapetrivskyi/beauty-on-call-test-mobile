import { apiClient } from './client';
import type { City, District } from '../types';

export const geoApi = {
  getCities: async (): Promise<City[]> => {
    const { data } = await apiClient.get<City[]>('/geo/cities');
    return data;
  },

  getDistricts: async (cityId: number): Promise<District[]> => {
    const { data } = await apiClient.get<District[]>(
      `/geo/cities/${cityId}/districts`,
    );
    return data;
  },
};