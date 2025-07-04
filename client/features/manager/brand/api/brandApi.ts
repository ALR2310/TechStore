import { createBrandPayload, updateBrandPayload } from '@shared/types/brand.type';
import { baseQueryParams } from '@shared/types/params.type';
import { http } from '~/libs/axios.http';

export const getListBrand = async (payload: baseQueryParams) => {
  const rest = await http.get('/brand', { params: payload });
  return rest.data;
};

export const getBrand = async (id: string) => {
  const rest = await http.get(`/brand/${id}`);
  return rest.data;
};

export const createBrand = async (payload: createBrandPayload) => {
  const rest = await http.post('/brand', payload);
  return rest.data;
};

export const updateBrand = async (payload: updateBrandPayload) => {
  const rest = await http.put(`/brand/${payload.id}`, payload);
  return rest.data;
};

export const deleteBrand = async (id: string) => {
  const rest = await http.delete(`/brand/${id}`);
  return rest.data;
};
