import ReactECharts from 'echarts-for-react';
import {
  buildCategoriesChart,
  buildMonthlyComparison,
  buildOrderCreatedChart,
  buildProductViewChart,
  buildRevenueChart,
  buildUsersChart,
} from '../data/buildStatData';
import { useMemo } from 'react';
import dayjs from 'dayjs';
import { useQueries } from '@tanstack/react-query';
import { getOrderStatistic } from '../../order/orderApi';
import { orderStatsResponse } from '@shared/types/order.type';
import { productStatsResponse } from '@shared/types/product.type';
import { viewedStatsResponse } from '@shared/types/viewed.type';
import { userStatsResponse } from '@shared/types/user.type';

interface StatisticChartsProps {
  data: {
    order: orderStatsResponse;
    user: userStatsResponse;
    viewed: viewedStatsResponse;
    product: productStatsResponse;
  };
}

export default function StatisticCharts({ data }: StatisticChartsProps) {
  const { order, user, viewed, product } = data;

  const currentYearQuery = useMemo(() => {
    const now = dayjs();
    return {
      startDate: now.startOf('year').format('YYYY-MM-DD HH:mm:ss'),
      endDate: now.endOf('year').format('YYYY-MM-DD HH:mm:ss'),
    };
  }, []);

  const lastYearQuery = useMemo(() => {
    const now = dayjs();
    return {
      startDate: now.subtract(1, 'year').startOf('year').format('YYYY-MM-DD HH:mm:ss'),
      endDate: now.subtract(1, 'year').endOf('year').format('YYYY-MM-DD HH:mm:ss'),
    };
  }, []);

  const [orderStatsCurrent, orderStatsPast] = useQueries({
    queries: [
      {
        queryKey: ['orderStatsCurrent', currentYearQuery],
        queryFn: () => getOrderStatistic({ by: 'month', ...currentYearQuery }),
      },
      {
        queryKey: ['orderStatsPast', lastYearQuery],
        queryFn: () => getOrderStatistic({ by: 'month', ...lastYearQuery }),
      },
    ],
  });

  // Revenue Chart (Line Chart)
  const revenueOption = buildRevenueChart(order?.orderRevenue);

  // Order created (Bar chart)
  const orderCreatedOption = buildOrderCreatedChart(order?.orderCount);

  // Categories Pie Chart
  const categoriesOption = buildCategoriesChart(product?.countByCategory);

  // Users Chart (Area Chart)
  const usersOption = buildUsersChart(user?.userCount);

  // Monthly Comparison Chart
  const monthlyComparisonOption = buildMonthlyComparison({
    thisYear: orderStatsCurrent.data?.orderRevenue,
    lastYear: orderStatsPast.data?.orderRevenue,
  });

  // Hourly Activity Chart
  const hourlyActivityOption = buildProductViewChart(viewed?.viewByProduct);

  return (
    <div className="space-y-6">
      {/* Revenue and Orders Row */}
      <div className="grid grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow p-4">
          <ReactECharts option={revenueOption} style={{ height: 350 }} />
        </div>
        <div className="card bg-base-100 shadow p-4">
          <ReactECharts option={orderCreatedOption} style={{ height: 350 }} />
        </div>
      </div>

      {/* Monthly Comparison */}
      <div className="card bg-base-100 shadow p-4">
        <ReactECharts option={monthlyComparisonOption} style={{ height: 400 }} />
      </div>

      {/* Users and Order Status Row */}
      <div className="grid grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow p-4">
          <ReactECharts option={usersOption} style={{ height: 350 }} />
        </div>
      </div>

      {/* Categories and Top Products Row */}
      <div className="grid grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow p-4">
          <ReactECharts option={categoriesOption} style={{ height: 350 }} />
        </div>
      </div>

      <div className="card bg-base-100 shadow p-4">
        <ReactECharts option={hourlyActivityOption} style={{ height: 400 }} />
      </div>
    </div>
  );
}
