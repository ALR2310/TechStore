import { getStatisticPayload } from '@shared/types/params.type';
import { createProductPayload, getListProductParams, updateProductPayload } from '@shared/types/product.type';
import { http } from '~/libs/axios.http';

export const getListProduct = async (payload: getListProductParams) => {
  const res = await http.get('/product', { params: payload });
  return res.data;
};

export const getProduct = async (id: string) => {
  const res = await http.get(`/product/${id}`);
  return res.data;
};

export const getProductsBySeries = async (seriesId: string) => {
  const res = await http.get(`/product/series/${seriesId}`);
  return res.data;
};

export const createProduct = async (payload: createProductPayload) => {
  const formData = new FormData();

  if (payload.name) formData.append('name', payload.name);
  if (payload.slug) formData.append('slug', payload.slug);
  if (payload.category) formData.append('category', payload.category);
  if (payload.brand) formData.append('brand', payload.brand);
  if (payload.series) formData.append('series', payload.series);
  if (payload.image) formData.append('image', payload.image);
  if (payload.quantity !== undefined) formData.append('quantity', String(payload.quantity));
  if (payload.price !== undefined) formData.append('price', String(payload.price));
  if (payload.discount !== undefined) formData.append('discount', String(payload.discount));
  if (payload.status) formData.append('status', payload.status);
  if (payload.content) formData.append('content', payload.content);
  if (payload.deviceConfigs) formData.append('deviceConfigs', payload.deviceConfigs);

  const res = await http.post('/product', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return res.data;
};

export const updateProduct = async (payload: updateProductPayload) => {
  const formData = new FormData();

  if (payload.name) formData.append('name', payload.name);
  if (payload.slug) formData.append('slug', payload.slug);
  if (payload.category) formData.append('category', payload.category);
  if (payload.brand) formData.append('brand', payload.brand);
  if (payload.series) formData.append('series', payload.series);
  if (payload.image) formData.append('image', payload.image);
  if (payload.quantity !== undefined) formData.append('quantity', String(payload.quantity));
  if (payload.price !== undefined) formData.append('price', String(payload.price));
  if (payload.discount !== undefined) formData.append('discount', String(payload.discount));
  if (payload.status) formData.append('status', payload.status);
  if (payload.content) formData.append('content', payload.content);
  if (payload.deviceConfigs) formData.append('deviceConfigs', payload.deviceConfigs);

  const res = await http.put(`/product/${payload.id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

export const deleteProduct = async (id: string) => {
  const res = await http.delete(`/product/${id}`);
  return res.data;
};

export const getProductStatistic = async (payload: getStatisticPayload) => {
  const res = await http.get('/product/statistic', { params: payload });
  return res.data;
};
