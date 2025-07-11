import { useState } from 'react';
import StatisticSummary from './StatisticSummary';
import { generateMockData } from '../data/mockData';
import StatisticFilters from './StatisticFilters';
import StatisticCharts from './StatisticCharts';
import StatisticTables from './StatisticTables';
import dayjs from 'dayjs';
import { useQueries } from '@tanstack/react-query';
import { getOrderStatistic } from '../../order/orderApi';
import { getUserStatistic } from '../../user/api/UserApi';
import { getViewedStatistic } from '../../viewed/viewedApi';
import { buildStatisticSummary } from '../data/buildStatData';

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

  const [ordersQuery, usersQuery, viewedQuery] = useQueries({
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
    ],
  });

  const summaryData = buildStatisticSummary(
    {
      order: ordersQuery.data,
      user: usersQuery.data,
      viewed: viewedQuery.data,
    },
    timeRange,
  );

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

      <StatisticTables data={mockData} />
    </div>
  );
}
