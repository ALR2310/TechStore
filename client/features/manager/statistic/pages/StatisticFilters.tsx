import DatePicker from '~/components/DatePicker';
import { TimeRange } from './StatisticManager';
import dayjs from 'dayjs';

interface StatisticFiltersProps {
  timeRange: TimeRange;
  selectedYear: number;
  selectedMonth: number;
  onTimeRangeChange: (range: TimeRange) => void;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
}

export default function StatisticFilters({
  timeRange,
  selectedYear,
  selectedMonth,
  onTimeRangeChange,
  onYearChange,
  onMonthChange,
}: StatisticFiltersProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = [
    { value: 1, label: 'Tháng 1' },
    { value: 2, label: 'Tháng 2' },
    { value: 3, label: 'Tháng 3' },
    { value: 4, label: 'Tháng 4' },
    { value: 5, label: 'Tháng 5' },
    { value: 6, label: 'Tháng 6' },
    { value: 7, label: 'Tháng 7' },
    { value: 8, label: 'Tháng 8' },
    { value: 9, label: 'Tháng 9' },
    { value: 10, label: 'Tháng 10' },
    { value: 11, label: 'Tháng 11' },
    { value: 12, label: 'Tháng 12' },
  ];

  return (
    <div className="card bg-base-100 shadow-sm p-4">
      <div className="flex flex-wrap gap-4 items-center">
        {/* Time Range Selector */}
        <div className="space-x-4">
          <label className="label">
            <span className="font-semibold">Xem theo:</span>
          </label>
          <div className="join">
            <button
              className={`btn join-item ${timeRange === 'day' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => onTimeRangeChange('day')}
            >
              <i className="fa-regular fa-calendar-day mr-1"></i>
              Ngày
            </button>
            <button
              className={`btn join-item ${timeRange === 'month' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => onTimeRangeChange('month')}
            >
              <i className="fa-regular fa-calendar-week mr-1"></i>
              Tháng
            </button>
            <button
              className={`btn join-item ${timeRange === 'year' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => onTimeRangeChange('year')}
            >
              <i className="fa-regular fa-calendar mr-1"></i>
              Năm
            </button>
          </div>
        </div>

        {/* Month Selector */}
        {timeRange === 'day' && (
          <div className="space-x-4">
            <label className="label">
              <span className="font-semibold">Tháng:</span>
            </label>
            <select
              className="select w-36"
              value={selectedMonth}
              onChange={(e) => onMonthChange(Number(e.target.value))}
            >
              {months.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Year Selector */}
        {(timeRange === 'month' || timeRange === 'day') && (
          <div className="space-x-4">
            <label className="label">
              <span className="font-semibold">Năm:</span>
            </label>
            <select className="select w-32" value={selectedYear} onChange={(e) => onYearChange(Number(e.target.value))}>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Info Display */}
        <div className="space-x-4">
          <label className="label">
            <span className="font-semibold">Hiển thị:</span>
          </label>
          <div className="badge badge-outline badge-lg">
            {timeRange === 'day' && `${selectedMonth}/${selectedYear} (30 ngày gần nhất)`}
            {timeRange === 'month' && `${selectedYear} (12 tháng)`}
            {timeRange === 'year' && '5 năm gần nhất'}
          </div>
        </div>

        <div>
          <DatePicker
            mode="range"
            value={{
              from: new Date(),
              to: dayjs().add(1, 'month').toDate(),
            }}
          />
        </div>
      </div>
    </div>
  );
}
