import { vi } from 'date-fns/locale';
import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

type TimeRange = 'day' | 'month' | 'year';

interface StatisticFiltersProps {
  range: TimeRange;
  onRangeChange?: (range: TimeRange) => void;
  onChange?: (range: { from: Date | null; to: Date | null }) => void;
}

export default function StatisticFilters({ range: timeRange, onRangeChange, onChange }: StatisticFiltersProps) {
  const [range, setRange] = useState<[Date | null, Date | null]>([null, null]);

  useEffect(() => {
    const from = range[0];
    const to = timeRange === 'day' ? range[1] : null;
    onChange?.({ from, to });
  }, [range]);

  return (
    <div className="card bg-base-100 shadow-sm p-4 flex-row gap-8">
      <div className="flex gap-6 items-center">
        <label className="label font-semibold">Chế độ xem:</label>
        <div className="join">
          {(['day', 'month', 'year'] as TimeRange[]).map((type) => (
            <button
              key={type}
              className={`btn join-item ${timeRange === type ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => {
                onRangeChange?.(type);
                setRange([null, null]);
              }}
            >
              <i
                className={`fa-regular ${
                  type === 'day' ? 'fa-calendar-day' : type === 'month' ? 'fa-calendar-week' : 'fa-calendar'
                } mr-1`}
              ></i>
              {type === 'day' ? 'Ngày' : type === 'month' ? 'Tháng' : 'Năm'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-6 items-center">
        <label className="label font-semibold">Lọc theo:</label>
        <label className="floating-label">
          <span>{timeRange === 'day' ? 'Chọn ngày' : timeRange === 'month' ? 'Chọn tháng' : 'Chọn năm'}</span>
          <DatePicker
            locale={vi}
            className="input w-48"
            placeholderText={timeRange === 'day' ? 'Chọn ngày' : timeRange === 'month' ? 'Chọn tháng' : 'Chọn năm'}
            selectsRange={true}
            startDate={range[0]}
            endDate={range[1]}
            onChange={(update) => setRange(update)}
            isClearable
            dateFormat={timeRange === 'day' ? 'dd/MM/yyyy' : timeRange === 'month' ? 'MM/yyyy' : 'yyyy'}
            showMonthYearPicker={timeRange === 'month'}
            showYearPicker={timeRange === 'year'}
          />
        </label>
      </div>
    </div>
  );
}
