import DashboardCharts from './DashboardCharts';
import { useQueries } from '@tanstack/react-query';
import { getOrderStatistic } from '../../order/orderApi';
import { getUserStatistic } from '../../user/api/UserApi';
import { getViewedStatistic } from '../../viewed/viewedApi';
import { getProductStatistic } from '../../product/api/productApi';
import { buildStatisticSummary } from '../../statistic/data/buildStatData';
import StatisticSummary from '../../statistic/pages/StatisticSummary';
import { builDateFilter, generatePastRange } from '@shared/utils/general.utils';
import { useMemo } from 'react';

export default function Dashboard() {
  const now = useMemo(() => new Date(), []);
  const currentTimeRange = useMemo(() => [now, now] as [Date, Date], [now]);
  const pastTimeRange = useMemo(() => generatePastRange('month', currentTimeRange), [currentTimeRange]);

  const [ordersStatsQuery, usersStatsQuery, viewedStatsQuery, productsStatsQuery] = useQueries({
    queries: [
      {
        queryKey: ['orderStats', currentTimeRange],
        queryFn: () => getOrderStatistic({ by: 'month', ...builDateFilter(currentTimeRange, 'month') }),
        enabled: currentTimeRange[0] !== null && currentTimeRange[1] !== null,
      },
      {
        queryKey: ['userStats', currentTimeRange],
        queryFn: () => getUserStatistic({ by: 'month', ...builDateFilter(currentTimeRange, 'month') }),
        enabled: currentTimeRange[0] !== null && currentTimeRange[1] !== null,
      },
      {
        queryKey: ['viewedStats', currentTimeRange],
        queryFn: () => getViewedStatistic({ by: 'month', ...builDateFilter(currentTimeRange, 'month') }),
        enabled: currentTimeRange[0] !== null && currentTimeRange[1] !== null,
      },
      {
        queryKey: ['productStats', currentTimeRange],
        queryFn: () => getProductStatistic({ by: 'month', ...builDateFilter(currentTimeRange, 'month') }),
        enabled: currentTimeRange[0] !== null && currentTimeRange[1] !== null,
      },
    ],
  });

  const [ordersStatsPastQuery, usersStatsPastQuery, viewedStatsPastQuery] = useQueries({
    queries: [
      {
        queryKey: ['orderStatsPast', pastTimeRange],
        queryFn: () => getOrderStatistic({ by: 'month', ...builDateFilter(pastTimeRange, 'month') }),
        enabled: currentTimeRange[0] !== null && currentTimeRange[1] !== null,
      },
      {
        queryKey: ['userStatsPast', pastTimeRange],
        queryFn: () => getUserStatistic({ by: 'month', ...builDateFilter(pastTimeRange, 'month') }),
        enabled: currentTimeRange[0] !== null && currentTimeRange[1] !== null,
      },
      {
        queryKey: ['viewedStatsPast', pastTimeRange],
        queryFn: () => getViewedStatistic({ by: 'month', ...builDateFilter(pastTimeRange, 'month') }),
        enabled: currentTimeRange[0] !== null && currentTimeRange[1] !== null,
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
      <StatisticSummary data={summaryData} />

      <DashboardCharts
        userData={usersStatsQuery.data?.userCount ?? []}
        revenueData={ordersStatsQuery.data?.orderRevenue ?? []}
        sellingData={productsStatsQuery.data?.bestSellingProducts ?? []}
      />
    </div>
  );
}
