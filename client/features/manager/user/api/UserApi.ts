import { getListUserPayload, updateUserPayload } from '@shared/types/user.type';
import { http } from '~/libs/axios.http';

export const getListUser = async (payload: getListUserPayload) => {
  const res = await http.get('/user', { params: payload });
  return res.data;
};

export const getUser = async (payload: { id: string }) => {
  const res = await http.get(`/user/${payload.id}`);
  return res.data;
};

export const updateUser = async (payload: updateUserPayload) => {
  const res = await http.put(`/user/${payload.id}`, payload);
  return res.data;
};

export const deleteUser = async (payload: { id: string }) => {
  const res = await http.delete(`/user/${payload.id}`);
  return res.data;
};
