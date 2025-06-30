import { getListReviewPayload } from '@shared/types/review.type';
import { http } from '~/libs/axios.http';

export const getListReview = async (payload: getListReviewPayload) => {
  const res = await http.get('/review', { params: payload });
  return res.data;
};
