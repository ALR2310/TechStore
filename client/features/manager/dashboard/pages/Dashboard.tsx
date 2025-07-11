import DashboardCharts from './DashboardCharts';
import { useQueries } from '@tanstack/react-query';
import { getOrderStatistic } from '../../order/orderApi';
import { getUserStatistic } from '../../user/api/UserApi';
import { getViewedStatistic } from '../../viewed/viewedApi';
import { getProductStatistic } from '../../product/api/productApi';
import { buildStatisticSummary } from '../../statistic/data/buildStatData';
import StatisticSummary from '../../statistic/pages/StatisticSummary';

export default function Dashboard() {
  const [ordersStatsQuery, usersStatsQuery, viewedStatsQuery, productsStatsQuery] = useQueries({
    queries: [
      {
        queryKey: ['orderStats'],
        queryFn: () => getOrderStatistic({ by: 'month' }),
      },
      {
        queryKey: ['userStats'],
        queryFn: () => getUserStatistic({ by: 'month' }),
      },
      {
        queryKey: ['viewedStats'],
        queryFn: () => getViewedStatistic({ by: 'month' }),
      },
      {
        queryKey: ['productStats'],
        queryFn: () => getProductStatistic({ by: 'month' }),
      },
    ],
  });

  const summaryData = buildStatisticSummary(
    {
      order: ordersStatsQuery.data,
      user: usersStatsQuery.data,
      viewed: viewedStatsQuery.data,
    },
    'month',
  );

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
