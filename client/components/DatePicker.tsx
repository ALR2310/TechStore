import { UniqueId } from '@shared/utils/general.utils';
import { useRef, useState } from 'react';
import { DateRange, DayPicker } from 'react-day-picker';
import { vi } from 'date-fns/locale';

type DatePickerValue = Date | Date[] | DateRange | undefined;

interface DatePickerProps {
  className?: string;
  placeholder?: string;
  mode?: 'single' | 'multiple' | 'range';
  value?: DatePickerValue;
  onChange?: (date: DatePickerValue) => void;
}

export default function DatePicker({ className, placeholder, mode, value, onChange }: DatePickerProps) {
  const btnDatePicker = useRef<HTMLButtonElement>(null);
  const pickerId = UniqueId();
  const anchorId = `--rdp-${pickerId}`;
  const [date, setDate] = useState<DatePickerValue>(value);

  const handleSelect = (selected: DatePickerValue) => {
    setDate(selected);
    onChange?.(selected);
  };
  return (
    <label className={`${className}`}>
      <button
        ref={btnDatePicker}
        popoverTarget={pickerId}
        className="input w-full"
        style={{ anchorName: anchorId } as React.CSSProperties}
      >
        <i className="fa-regular fa-calendar-range"></i>
        {mode === 'range' && date && typeof date === 'object' && 'from' in date && date.from ? (
          `${date.from.toLocaleDateString()} - ${date.to?.toLocaleDateString() ?? ''}`
        ) : mode === 'multiple' && Array.isArray(date) ? (
          `${date.length} ngày`
        ) : date instanceof Date ? (
          date.toLocaleDateString()
        ) : (
          <span className="text-sm text-base-content/60">{placeholder}</span>
        )}
      </button>

      {/* DatePicker Section */}
      <div
        id={pickerId}
        popover="auto"
        className={`dropdown relative`}
        style={{ positionAnchor: anchorId } as React.CSSProperties}
      >
        {mode === 'range' ? (
          <DayPicker
            locale={vi}
            mode="range"
            selected={date as DateRange}
            onSelect={(range) => handleSelect(range)}
            className="react-day-picker"
          />
        ) : mode === 'multiple' ? (
          <DayPicker
            locale={vi}
            mode="multiple"
            selected={date as Date[]}
            onSelect={(dates) => handleSelect(dates)}
            className="react-day-picker"
          />
        ) : (
          <DayPicker
            locale={vi}
            mode="single"
            selected={date as Date}
            onSelect={(date) => handleSelect(date)}
            className="react-day-picker"
          />
        )}
        <button className="btn btn-sm btn-link absolute bottom-0 right-0" onClick={() => handleSelect(undefined)}>
          Xoá
        </button>
      </div>
    </label>
  );
}
