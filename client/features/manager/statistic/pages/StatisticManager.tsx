import { useState } from 'react';
import StatisticSummary from './StatisticSummary';
import { generateMockData } from '../data/mockData';
import StatisticFilters from './StatisticFilters';
import StatisticCharts from './StatisticCharts';
import dayjs from 'dayjs';
import { useQueries } from '@tanstack/react-query';
import { getOrderStatistic } from '../../order/orderApi';
import { getUserStatistic } from '../../user/api/UserApi';
import { getViewedStatistic } from '../../viewed/viewedApi';
import { buildStatisticSummary, buildStatsTableOrderStatus, buildStatsTableSelling } from '../data/buildStatData';
import DataTable from '~/components/DataTable';
import { formatStatValue } from '@shared/utils/general.utils';
import { statusMap } from '~/utils/cssMap';
import { getProductStatistic } from '../../product/api/productApi';

export type TimeRange = 'day' | 'month' | 'year';

const builDateFilter = (range: TimeRange, date: string) => {
  const today = dayjs(date);
  let startDate = '',
    endDate = '';

  switch (range) {
    case 'day':
      startDate = today.startOf('month').format('YYYY-MM-DD HH:mm:ss');
      endDate = today.endOf('month').format('YYYY-MM-DD HH:mm:ss');
      break;
    case 'month':
      startDate = today.startOf('year').format('YYYY-MM-DD HH:mm:ss');
      endDate = today.endOf('year').format('YYYY-MM-DD HH:mm:ss');
      break;
  }

  return { startDate, endDate };
};

export default function StatisticManager() {
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [selectedYear, setSelectedYear] = useState(dayjs().year());
  const [selectedMonth, setSelectedMonth] = useState(dayjs().month() + 1);

  const mockData = generateMockData(timeRange, selectedYear, selectedMonth);

  const [ordersStatsQuery, usersStatsQuery, viewedStatsQuery, productsStatsQuery] = useQueries({
    queries: [
      {
        queryKey: ['orderStats', timeRange, selectedYear, selectedMonth],
        queryFn: () =>
          getOrderStatistic({ by: timeRange, ...builDateFilter(timeRange, `${selectedYear}-${selectedMonth}-01`) }),
      },
      {
        queryKey: ['userStats', timeRange, selectedYear, selectedMonth],
        queryFn: () =>
          getUserStatistic({ by: timeRange, ...builDateFilter(timeRange, `${selectedYear}-${selectedMonth}-01`) }),
      },
      {
        queryKey: ['viewedStats', timeRange, selectedYear, selectedMonth],
        queryFn: () =>
          getViewedStatistic({ by: timeRange, ...builDateFilter(timeRange, `${selectedYear}-${selectedMonth}-01`) }),
      },
      {
        queryKey: ['productStats', timeRange, selectedYear, selectedMonth],
        queryFn: () =>
          getProductStatistic({ by: timeRange, ...builDateFilter(timeRange, `${selectedYear}-${selectedMonth}-01`) }),
      },
    ],
  });

  const summaryData = buildStatisticSummary(
    {
      order: ordersStatsQuery.data,
      user: usersStatsQuery.data,
      viewed: viewedStatsQuery.data,
    },
    timeRange,
  );

  const topProductSelling = buildStatsTableSelling(productsStatsQuery.data?.bestSellingProducts, timeRange);

  const orderStatus = buildStatsTableOrderStatus(ordersStatsQuery.data?.orderByStatus);

  return (
    <div className="space-y-6">
      <StatisticFilters
        timeRange={timeRange}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        onTimeRangeChange={setTimeRange}
        onYearChange={setSelectedYear}
        onMonthChange={setSelectedMonth}
      />

      <StatisticSummary data={summaryData} />

      <StatisticCharts data={mockData} timeRange={timeRange} />

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
    </div>
  );
}
