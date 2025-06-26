import { getListProductParams } from '@shared/types/product.type';
import { http } from '~/libs/axios.http';

export const getListProduct = async (payload: getListProductParams) => {
  const res = await http.get('/product', { params: payload });
  return res.data;
};

export const getProduct = async (id: string) => {
  const res = await http.get(`/product/${id}`);
  return res.data;
};

export const updateProduct = async (payload: any) => {
  const res = await http.put(`/product/${payload.id}`, payload);
  return res.data;
};