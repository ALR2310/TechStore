import { createCategoryPayload, updateCategoryPayload } from '@shared/types/category.type';
import { baseQueryParams } from '@shared/types/params.type';
import { http } from '~/libs/axios.http';

export const getListCategory = async (payload: baseQueryParams) => {
  const res = await http.get('/category', { params: payload });
  return res.data;
};

export const getCategory = async (id: string) => {
  const res = await http.get(`/category/${id}`);
  return res.data;
};

export const createCategory = async (payload: createCategoryPayload) => {
  const res = await http.post('/category', payload);
  return res.data;
};

export const updateCategory = async (payload: updateCategoryPayload) => {
  const res = await http.put(`/category/${payload.id}`, payload);
  return res.data;
};

export const deleteCategory = async (id: string) => {
  const res = await http.delete(`/category/${id}`);
  return res.data;
};
