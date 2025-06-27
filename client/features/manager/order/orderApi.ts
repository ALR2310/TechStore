import { approveOrderParams, getListOrderParams } from '@shared/types/order.type';
import { http } from '~/libs/axios.http';

export const getListOrder = async (payload: getListOrderParams) => {
  const res = await http.get('/order', { params: payload });
  return res.data;
};

export const approveOrder = async (payload: approveOrderParams) => {
  const res = await http.put(`/order/${payload.id}`, payload);
  return res.data;
};
