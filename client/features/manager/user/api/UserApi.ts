import { getListUserPayload } from '@shared/types/user.type';
import { http } from '~/libs/axios.http';

export const getListUser = async (payload: getListUserPayload) => {
  const res = await http.get('/user', { params: payload });
  return res.data;
};
