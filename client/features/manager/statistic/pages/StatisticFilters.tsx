import { vi } from 'date-fns/locale';
import dayjs from 'dayjs';
import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

type TimeRange = 'day' | 'month' | 'year';

interface StatisticFiltersProps {
  range: TimeRange;
  onRangeChange?: (range: TimeRange) => void;
  onChange?: (range: { from: Date | null; to: Date | null }) => void;
}

export default function StatisticFilters({ range, onRangeChange, onChange }: StatisticFiltersProps) {
  const [rangeValue, setRangeValue] = useState<[Date | null, Date | null]>([null, null]);

  useEffect(() => {
    const from = rangeValue[0];
    const to = rangeValue[1];
    onChange?.({ from, to });
  }, [rangeValue]);

  useEffect(() => {
    if (range === 'day') {
      setRangeValue([dayjs().startOf('month').toDate(), dayjs().endOf('month').toDate()]);
    } else if (range === 'month') {
      setRangeValue([dayjs().startOf('year').toDate(), dayjs().endOf('year').toDate()]);
    } else {
      setRangeValue([dayjs().toDate(), dayjs().toDate()]);
    }
  }, [range]);

  return (
    <div className="card bg-base-100 shadow-sm p-4 flex-row gap-8">
      <div className="flex gap-6 items-center">
        <label className="label font-semibold">Chế độ xem:</label>
        <div className="join">
          {(['day', 'month', 'year'] as TimeRange[]).map((type) => (
            <button
              key={type}
              className={`btn join-item ${range === type ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => {
                onRangeChange?.(type);
                setRangeValue([null, null]);
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
          <span>{range === 'day' ? 'Chọn ngày' : range === 'month' ? 'Chọn tháng' : 'Chọn năm'}</span>
          <DatePicker
            locale={vi}
            className="input w-48"
            placeholderText={range === 'day' ? 'Chọn ngày' : range === 'month' ? 'Chọn tháng' : 'Chọn năm'}
            selectsRange={true}
            startDate={rangeValue[0]}
            endDate={rangeValue[1]}
            onChange={(update) => setRangeValue(update)}
            isClearable
            dateFormat={range === 'day' ? 'dd/MM/yyyy' : range === 'month' ? 'MM/yyyy' : 'yyyy'}
            showMonthYearPicker={range === 'month'}
            showYearPicker={range === 'year'}
          />
        </label>
      </div>
    </div>
  );
}
