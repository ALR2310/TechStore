import ReactECharts from 'echarts-for-react';
import {
  buildCategoriesChart,
  buildMonthlyComparison,
  buildOrderCreatedChart,
  buildProductViewChart,
  buildRevenueChart,
  buildStatsTableOrderStatus,
  buildStatsTableSelling,
  buildReviewChartHorizontal,
  buildUsersChart,
  buildUserStatusPieChart,
  buildStarRatingPieChart,
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
import { reviewStatsResponse } from '@shared/types/review.type';

interface StatisticChartsProps {
  timeRange: 'day' | 'month' | 'year';
  data: {
    order: orderStatsResponse;
    user: userStatsResponse;
    viewed: viewedStatsResponse;
    product: productStatsResponse;
    review: reviewStatsResponse;
  };
}

export default function StatisticCharts({ data, timeRange }: StatisticChartsProps) {
  const { order, user, viewed, product, review } = data;

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

  // Product Most View
  const productMostViewOption = buildProductViewChart(viewed?.viewByProduct);

  // Top product selling
  const topProductSelling = buildStatsTableSelling(product?.bestSellingProducts, timeRange);

  // Order status
  const orderStatus = buildStatsTableOrderStatus(order?.orderByStatus);

  // Top review
  const reviewOption = buildReviewChartHorizontal(review?.reviewCount);

  // Star rating
  const starRatingOption = buildStarRatingPieChart(review?.starCount);

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

      {/* Percent Category and Low Rating */}
      <div className="grid grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow p-4">
          <ReactECharts option={categoriesOption} style={{ height: 350 }} />
        </div>

        <div className="bg-base-100 rounded-xl p-4">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <i className="fa-regular fa-trophy text-warning"></i>
            Sản phẩm bị đánh giá thấp
          </h3>

          <DataTable
            className="max-h-[300px]"
            type="zebra"
            columns={[
              {
                title: '#',
                key: 'index',
                render: (_, __, index) => index + 1,
              },
              {
                title: 'Tên sản phẩm',
                key: 'productName',
                render: (value) => <p className="font-semibold">{value}</p>,
              },
              {
                title: 'SL đánh giá',
                key: 'ratingCount',
                render: (value) => <div className="badge badge-primary">{value}</div>,
              },
            ]}
            data={review?.lowRatingProduct ?? []}
          />
        </div>
      </div>

      {/* Table Top Reviewer and Product */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-base-100 rounded-xl p-4 col-span-2">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <i className="fa-regular fa-trophy text-warning"></i>
            Sản phẩm được đánh giá nhiều nhất
          </h3>

          <DataTable
            className="max-h-[300px]"
            type="zebra"
            columns={[
              {
                key: '#',
                title: '#',
                render: (_, __, index) => index + 1,
              },
              {
                key: 'productName',
                title: 'Tên sản phẩm',
                render: (value) => <p className="font-semibold">{value}</p>,
              },
              {
                key: 'datetime',
                title: 'Thời gian',
                render: (value) => (
                  <p className="font-semibold">
                    {`Tháng ${dayjs(value).format('MM')} Năm ${dayjs(value).format('YYYY')}`}{' '}
                  </p>
                ),
              },
              {
                key: 'count',
                title: 'Lượt đánh giá',
                render: (value) => <div className="badge badge-primary">{value}</div>,
              },
            ]}
            data={review?.topProductReview ?? []}
          />
        </div>

        <div className="bg-base-100 rounded-xl p-4">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <i className="fa-regular fa-list-check text-success"></i>
            Người dùng đánh giá nhiều nhất
          </h3>

          <DataTable
            className="max-h-[290px]"
            type="zebra"
            columns={[
              {
                key: '#',
                title: '#',
                render: (_, __, index) => index + 1,
              },
              {
                key: 'label',
                title: 'Tên người dùng',
                render: (value) => <p className="font-semibold">{value}</p>,
              },
              {
                key: 'value',
                title: 'Số lượng',
                render: (value) => <div className="badge badge-primary">{value}</div>,
              },
            ]}
            data={review?.topReviewer ?? []}
          />
        </div>
      </div>

      {/* Table Top Rating and Top reviewer */}
      <div className="grid grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow p-4">
          <ReactECharts option={starRatingOption} style={{ height: 350 }} />
        </div>
        <div className="card bg-base-100 shadow p-4">
          <ReactECharts option={reviewOption} style={{ height: 350 }} />
        </div>
      </div>

      {/* Table Top product and order status */}
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

      {/* Top view */}
      <div className="card bg-base-100 shadow p-4">
        <ReactECharts option={productMostViewOption} style={{ height: 400 }} />
      </div>
    </div>
  );
}
