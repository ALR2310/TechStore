import { http } from '~/libs/axios.http';

export const getListCategory = async (payload: any) => {
  const res = await http.get('/category', { params: payload });
  return res.data;
};
