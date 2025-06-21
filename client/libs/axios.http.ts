import axios from 'axios';

export const http = axios.create({
  baseURL: 'http://localhost:4850/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
