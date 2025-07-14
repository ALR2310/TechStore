import { useEffect, useState } from 'react';
import StatisticSummary from './StatisticSummary';
import StatisticFilters from './StatisticFilters';
import StatisticCharts from './StatisticCharts';
import { useQueries } from '@tanstack/react-query';
import { getOrderStatistic } from '../../order/orderApi';
import { getUserStatistic } from '../../user/api/UserApi';
import { getViewedStatistic } from '../../viewed/viewedApi';
import { buildStatisticSummary } from '../data/buildStatData';
import { builDateFilter, generatePastRange } from '@shared/utils/general.utils';
import { getProductStatistic } from '../../product/api/productApi';
import { getReviewStatistic } from '../../review/reviewApi';

const ensureTimeRangeValue = (value: [Date | null, Date | null]): [Date, Date] => {
  const now = new Date();
  const from = value[0] ?? now;
  const to = value[1] ?? from;
  return [from, to];
};

export default function StatisticManager() {
  const [timeRange, setTimeRange] = useState<'day' | 'month' | 'year'>('month');
  const [timeRangeValue, setTimeRangeValue] = useState<[Date | null, Date | null]>([null, null]);
  const [timeRangePastValue, setTimeRangePastValue] = useState<[Date | null, Date | null]>([null, null]);

  useEffect(() => {
    setTimeRangePastValue(generatePastRange(timeRange, timeRangeValue));
  }, [timeRange, timeRangeValue]);

  const [ordersStatsQuery, usersStatsQuery, viewedStatsQuery, productsStatsQuery, reviewStatsQuery] = useQueries({
    queries: [
      {
        queryKey: ['orderStats', timeRange, timeRangeValue],
        queryFn: () => getOrderStatistic({ by: timeRange, ...builDateFilter(timeRangeValue, timeRange) }),
        enabled: timeRangeValue[0] !== null && timeRangeValue[1] !== null,
      },
      {
        queryKey: ['userStats', timeRange, timeRangeValue],
        queryFn: () => getUserStatistic({ by: timeRange, ...builDateFilter(timeRangeValue, timeRange) }),
        enabled: timeRangeValue[0] !== null && timeRangeValue[1] !== null,
      },
      {
        queryKey: ['viewedStats', timeRange, timeRangeValue],
        queryFn: () => getViewedStatistic({ by: timeRange, ...builDateFilter(timeRangeValue, timeRange) }),
        enabled: timeRangeValue[0] !== null && timeRangeValue[1] !== null,
      },
      {
        queryKey: ['productStats', timeRange, timeRangeValue],
        queryFn: () => getProductStatistic({ by: timeRange, ...builDateFilter(timeRangeValue, timeRange) }),
        enabled: timeRangeValue[0] !== null && timeRangeValue[1] !== null,
      },
      {
        queryKey: ['reviewStats', timeRange, timeRangeValue],
        queryFn: () => getReviewStatistic({ by: timeRange, ...builDateFilter(timeRangeValue, timeRange) }),
        enabled: timeRangeValue[0] !== null && timeRangeValue[1] !== null,
      },
    ],
  });

  const [ordersStatsPastQuery, usersStatsPastQuery, viewedStatsPastQuery] = useQueries({
    queries: [
      {
        queryKey: ['orderStatsPast', timeRange, timeRangePastValue],
        queryFn: () => getOrderStatistic({ by: timeRange, ...builDateFilter(timeRangePastValue, timeRange) }),
        enabled: timeRangeValue[0] !== null && timeRangeValue[1] !== null,
      },
      {
        queryKey: ['userStatsPast', timeRange, timeRangePastValue],
        queryFn: () => getUserStatistic({ by: timeRange, ...builDateFilter(timeRangePastValue, timeRange) }),
        enabled: timeRangeValue[0] !== null && timeRangeValue[1] !== null,
      },
      {
        queryKey: ['viewedStatsPast', timeRange, timeRangePastValue],
        queryFn: () => getViewedStatistic({ by: timeRange, ...builDateFilter(timeRangePastValue, timeRange) }),
        enabled: timeRangeValue[0] !== null && timeRangeValue[1] !== null,
      },
    ],
  });

  const summaryData = buildStatisticSummary({
    current: {
      order: ordersStatsQuery.data,
      user: usersStatsQuery.data,
      viewed: viewedStatsQuery.data,
    },
    past: {
      order: ordersStatsPastQuery.data,
      user: usersStatsPastQuery.data,
      viewed: viewedStatsPastQuery.data,
    },
  });

  return (
    <div className="space-y-6">
      <StatisticFilters
        range={timeRange}
        onRangeChange={setTimeRange}
        onChange={({ from, to }) => setTimeRangeValue(ensureTimeRangeValue([from, to]))}
      />

      <StatisticSummary data={summaryData} />

      <StatisticCharts
        timeRange={timeRange}
        data={{
          order: ordersStatsQuery.data,
          user: usersStatsQuery.data,
          viewed: viewedStatsQuery.data,
          product: productsStatsQuery.data,
          review: reviewStatsQuery.data,
        }}
      />
    </div>
  );
}
