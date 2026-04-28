import { useQuery } from '@tanstack/react-query';
import { geoApi } from '../api/geo.api';

export const useCities = () =>
  useQuery({
    queryKey: ['cities'],
    queryFn: geoApi.getCities,
    staleTime: 1000 * 60 * 10, // 10 хв кеш
  });

export const useDistricts = (cityId: number | null) =>
  useQuery({
    queryKey: ['districts', cityId],
    queryFn: () => geoApi.getDistricts(cityId!),
    enabled: !!cityId,
    staleTime: 1000 * 60 * 10,
  });