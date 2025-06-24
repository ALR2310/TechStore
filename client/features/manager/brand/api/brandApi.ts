import { baseQueryParams } from '@shared/types/params.type';
import { http } from '~/libs/axios.http';

export const getListBrand = async (payload: baseQueryParams) => {
  const rest = await http.get('/brand', { params: payload });
  return rest.data;
};
