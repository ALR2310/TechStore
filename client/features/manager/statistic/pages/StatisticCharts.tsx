import ReactECharts from 'echarts-for-react';
import {
  buildCategoriesChart,
  buildMonthlyComparison,
  buildOrderCreatedChart,
  buildProductViewChart,
  buildRevenueChart,
  buildStatsTableOrderStatus,
  buildStatsTableSelling,
  buildUsersChart,
  buildUserStatusPieChart,
} from '../data/buildStatData';
import { useMemo } from 'react';
import dayjs from 'dayjs';
import { useQueries } from '@tanstack/react-query';
import { getOrderStatistic } from '../../order/orderApi';
import { orderStatsResponse } from '@shared/types/order.type';
import { productStatsResponse } from '@shared/types/product.type';
import { viewedStatsResponse } from '@shared/types/viewed.type';
import { userStatsResponse } from '@shared/types/user.type';
import { formatStatValue } from '@shared/utils/general.utils';
import DataTable from '~/components/DataTable';
import { statusMap } from '~/utils/cssMap';

interface StatisticChartsProps {
  timeRange;
  data: {
    order: orderStatsResponse;
    user: userStatsResponse;
    viewed: viewedStatsResponse;
    product: productStatsResponse;
  };
}

export default function StatisticCharts({ data, timeRange }: StatisticChartsProps) {
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

  // Monthly Comparison Chart
  const monthlyComparisonOption = buildMonthlyComparison({
    thisYear: orderStatsCurrent.data?.orderRevenue,
    lastYear: orderStatsPast.data?.orderRevenue,
  });

  // Users Chart (Area Chart)
  const usersOption = buildUsersChart(user?.userCount);

  // User status (Pie chart)
  const userStatusOption = buildUserStatusPieChart(user?.userByStatus);

  // Categories Pie Chart
  const categoriesOption = buildCategoriesChart(product?.countByCategory);

  // Hourly Activity Chart
  const hourlyActivityOption = buildProductViewChart(viewed?.viewByProduct);

  const topProductSelling = buildStatsTableSelling(product?.bestSellingProducts, timeRange);
  const orderStatus = buildStatsTableOrderStatus(order?.orderByStatus);

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

      {/* Users and Status Row */}
      <div className="grid grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow p-4">
          <ReactECharts option={usersOption} style={{ height: 350 }} />
        </div>
        <div className="card bg-base-100 shadow p-4">
          <ReactECharts option={userStatusOption} style={{ height: 350 }} />
        </div>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow p-4">
          <ReactECharts option={categoriesOption} style={{ height: 350 }} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-base-100 rounded-xl p-4 col-span-2">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <i className="fa-regular fa-trophy text-warning"></i>
            Top sản phẩm bán chạy
          </h3>

          <DataTable
            className="max-h-[290px]"
            type="zebra"
            columns={[
              {
                title: '#',
                key: 'index',
                render: (_, __, index) => index + 1,
              },
              {
                title: 'Tên sản phẩm',
                key: 'name',
                render: (value) => <p className="font-semibold">{value}</p>,
              },
              {
                title: 'Đã bán',
                key: 'totalSold',
                render: (value) => <div className="badge badge-primary">{value}</div>,
              },
              {
                title: 'Doanh thu',
                key: 'price',
                render: (value, row) => (
                  <div className="font-semibold text-success text-nowrap">
                    {formatStatValue(value * row.totalSold, 'currency')}
                  </div>
                ),
              },
            ]}
            data={topProductSelling}
          />
        </div>

        <div className="bg-base-100 rounded-xl p-4">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <i className="fa-regular fa-list-check text-success"></i>
            Trạng thái đơn hàng
          </h3>

          <DataTable
            className="max-h-[290px]"
            type="zebra"
            columns={[
              {
                title: 'Trạng thái',
                key: 'name',
                render: (value) => (
                  <div className={`flex items-center gap-2 ${statusMap.color[value]}`}>
                    <div className="w-3 h-3 rounded-full"></div>
                    <span className="font-medium">{statusMap.text[value]}</span>
                  </div>
                ),
              },
              {
                title: 'Số lượng',
                key: 'value',
                render: (value) => <div className="badge badge-outline">{value}</div>,
              },
              {
                title: 'Tỉ lệ',
                key: 'percent',
                render: (value, row) => {
                  return (
                    <progress className={`progress ${statusMap.color[row.name]}`} value={value} max="100"></progress>
                  );
                },
              },
            ]}
            data={orderStatus}
          />
        </div>
      </div>

      <div className="card bg-base-100 shadow p-4">
        <ReactECharts option={hourlyActivityOption} style={{ height: 400 }} />
      </div>
    </div>
  );
}
