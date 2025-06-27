import { getListOrderParams } from '@shared/types/order.type';
import { http } from '~/libs/axios.http';

export const getListOrder = async (payload: getListOrderParams) => {
  const res = await http.get('/order', { params: payload });
  return res.data;
};
