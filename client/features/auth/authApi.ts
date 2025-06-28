import { http } from '~/libs/axios.http';

const baseConfig = {
  baseURL: 'http://localhost:4850',
  withCredentials: true,
};

export const login = async (payload: { username: string; password: string }) => {
  const res = await http.post('/auth/login', payload, baseConfig);
  return res.data;
};

export const logout = async () => {
  const res = await http.get('/auth/logout', baseConfig);
  return res.data;
};

export const checkLogin = async () => {
  const res = await http.get('/auth/check', {
    withCredentials: true,
  });
  return res.data;
};
