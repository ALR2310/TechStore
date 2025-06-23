import { getListProductParams } from '@shared/types/product.type';
import { http } from '~/libs/axios.http';

export const getListProduct = async (payload: getListProductParams) => {
  const res = await http.get('/product', { params: payload });
  return res.data;
};
