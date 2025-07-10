import { useState } from 'react';
import StatisticSummary from './StatisticSummary';
import { generateMockData } from '../data/mockData';
import StatisticFilters from './StatisticFilters';
import StatisticCharts from './StatisticCharts';
import StatisticTables from './StatisticTables';
import dayjs from 'dayjs';

export type TimeRange = 'day' | 'month' | 'year';

export default function StatisticManager() {
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [selectedYear, setSelectedYear] = useState(dayjs().year());
  const [selectedMonth, setSelectedMonth] = useState(dayjs().month() + 1);

  const mockData = generateMockData(timeRange, selectedYear, selectedMonth);

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

      <StatisticSummary data={mockData} timeRange={timeRange} />

      <StatisticCharts data={mockData} timeRange={timeRange} />

      <StatisticTables data={mockData} />
    </div>
  );
}
