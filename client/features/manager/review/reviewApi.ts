import { getStatisticPayload } from '@shared/types/params.type';
import { getListReviewPayload } from '@shared/types/review.type';
import { http } from '~/libs/axios.http';

export const getListReview = async (payload: getListReviewPayload) => {
  const res = await http.get('/review', { params: payload });
  return res.data;
};

export const updateStatusReview = async (id: string, status: string) => {
  const res = await http.post(`/review/status`, { id, status });
  return res.data;
};

export const deleteReview = async (id: string) => {
  const res = await http.delete(`/review/${id}`);
  return res.data;
};

export const getReviewStatistic = async (payload: getStatisticPayload) => {
  const res = await http.get('/review/statistic', { params: payload });
  return res.data;
};
