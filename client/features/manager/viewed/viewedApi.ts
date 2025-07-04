import { getStatisticPayload } from '@shared/types/params.type';
import { http } from '~/libs/axios.http';

export const getViewedStatistic = async (payload: getStatisticPayload) => {
  const res = await http.get('/viewed/statistic', { params: payload });
  return res.data;
};
