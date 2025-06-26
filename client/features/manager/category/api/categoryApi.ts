import { baseQueryParams } from '@shared/types/params.type';
import { http } from '~/libs/axios.http';

export const getListCategory = async (payload: baseQueryParams) => {
  const res = await http.get('/category', { params: payload });
  return res.data;
};
