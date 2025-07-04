import DashboardCharts from './DashboardCharts';
import DashboardStats from './DashboardStats';
import { useQueries } from '@tanstack/react-query';
import { getOrderStatistic } from '../../order/orderApi';
import { getUserStatistic } from '../../user/api/UserApi';
import { getViewedStatistic } from '../../viewed/viewedApi';
import { useMemo } from 'react';
import dayjs from 'dayjs';

export default function Dashboard() {
  const [userStatsQuery, orderStatsQuery, viewedStatsQuery] = useQueries({
    queries: [
      {
        queryKey: ['userStats'],
        queryFn: () => getUserStatistic({ by: 'month' }),
      },
      {
        queryKey: ['orderStats'],
        queryFn: () => getOrderStatistic({ by: 'month' }),
      },
      {
        queryKey: ['viewedStats'],
        queryFn: () => getViewedStatistic({ by: 'month' }),
      },
    ],
  });

  const stats = useMemo(() => {
    const userStats = userStatsQuery.data;
    const orderStats = orderStatsQuery.data;
    const viewedStats = viewedStatsQuery.data;

    const now = dayjs();
    const currentLabel = now.format('YYYY-MM');
    const previousLabel = now.subtract(1, 'month').format('YYYY-MM');
    const getCountFrom = (list: any[], label: string) => list?.find((i) => i.label === label)?.count ?? 0;
    const getRevenueFrom = (list: any[], label: string) => list?.find((i) => i.label === label)?.revenue ?? 0;

    // User
    const currentUsers = getCountFrom(userStats?.userCreated, currentLabel);
    const prevUsers = getCountFrom(userStats?.userCreated, previousLabel);

    // Revenue
    const currentRevenue = getRevenueFrom(orderStats?.orderRevenue, currentLabel);
    const prevRevenue = getRevenueFrom(orderStats?.orderRevenue, previousLabel);

    // Views
    const currentViews = getCountFrom(viewedStats?.viewCount, currentLabel);
    const prevViews = getCountFrom(viewedStats?.viewCount, previousLabel);

    // Orders
    const currentOrders = getCountFrom(orderStats?.orderCount, currentLabel);
    const prevOrders = getCountFrom(orderStats?.orderCount, previousLabel);

    function calcPercentChange(current: number, previous: number): { text: string; type: 'up' | 'down' | 'neutral' } {
      if (previous === 0 && current === 0) return { text: '↔︎ Không thay đổi', type: 'neutral' };
      if (previous === 0) return { text: '↗︎ +100% so với tháng trước', type: 'up' };

      const diff = current - previous;
      const percent = (diff / previous) * 100;

      if (percent === 0) return { text: '↔︎ Không đổi', type: 'neutral' };

      const sign = percent > 0 ? '↗︎' : '↘︎';
      const type = percent > 0 ? 'up' : 'down';

      return {
        text: `${sign} ${Math.abs(Math.round(percent))}% so với tháng trước`,
        type,
      };
    }

    return [
      {
        title: 'Người dùng',
        value: currentUsers,
        ...calcPercentChange(currentUsers, prevUsers),
      },
      {
        title: 'Doanh thu',
        value: `${currentRevenue.toLocaleString()} ₫`,
        ...calcPercentChange(currentRevenue, prevRevenue),
      },
      {
        title: 'Lượt xem',
        value: currentViews,
        ...calcPercentChange(currentViews, prevViews),
      },
      {
        title: 'Orders',
        value: currentOrders,
        ...calcPercentChange(currentOrders, prevOrders),
      },
    ];
  }, [userStatsQuery.data, orderStatsQuery.data, viewedStatsQuery.data]);

  return (
    <div className="space-y-6">
      <DashboardStats stats={stats} />

      <DashboardCharts
        userData={userStatsQuery.data?.userCount ?? []}
        revenueData={orderStatsQuery.data?.orderRevenue ?? []}
        viewedData={viewedStatsQuery.data?.viewCount ?? []}
      />
    </div>
  );
}
