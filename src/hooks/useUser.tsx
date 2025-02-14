import { queryOptions, useQuery } from '@tanstack/react-query';

import { authApi } from '@/api/authApi';

export const userQueryOptions = () =>
  queryOptions({
    queryKey: ['user'],
    queryFn: authApi.getMe,
    staleTime: Number.POSITIVE_INFINITY,
    retry: false,
  });

function useUser() {
  const { data: user } = useQuery(userQueryOptions());
  return { user };
}
export default useUser;
