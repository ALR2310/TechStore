import { useEffect, useState } from 'react';
import StatisticSummary from './StatisticSummary';
import StatisticFilters from './StatisticFilters';
import StatisticCharts from './StatisticCharts';
import { useQueries } from '@tanstack/react-query';
import { getOrderStatistic } from '../../order/orderApi';
import { getUserStatistic } from '../../user/api/UserApi';
import { getViewedStatistic } from '../../viewed/viewedApi';
import { buildStatisticSummary, buildStatsTableOrderStatus, buildStatsTableSelling } from '../data/buildStatData';
import DataTable from '~/components/DataTable';
import { builDateFilter, formatStatValue, generatePastRange } from '@shared/utils/general.utils';
import { statusMap } from '~/utils/cssMap';
import { getProductStatistic } from '../../product/api/productApi';

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

  const [ordersStatsQuery, usersStatsQuery, viewedStatsQuery, productsStatsQuery] = useQueries({
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

  const topProductSelling = buildStatsTableSelling(productsStatsQuery.data?.bestSellingProducts, timeRange);

  const orderStatus = buildStatsTableOrderStatus(ordersStatsQuery.data?.orderByStatus);

  return (
    <div className="space-y-6">
      <StatisticFilters
        range={timeRange}
        onRangeChange={setTimeRange}
        onChange={({ from, to }) => setTimeRangeValue(ensureTimeRangeValue([from, to]))}
      />

      <StatisticSummary data={summaryData} />

      <StatisticCharts
        data={{
          order: ordersStatsQuery.data,
          user: usersStatsQuery.data,
          viewed: viewedStatsQuery.data,
          product: productsStatsQuery.data,
        }}
      />

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
