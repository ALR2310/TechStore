import { http } from '~/libs/axios.http';

export const login = async (payload: any) => {
  const res = await http.post('/auth/login', payload);
  return res.data;
};

export const register = async (payload: any) => {
  const res = await http.post('/auth/register', payload);
  return res.data;
};
