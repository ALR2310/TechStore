import { UniqueId } from '@shared/utils/general.utils';
import { useRef, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { vi } from 'date-fns/locale';

interface DatePickerProps {
  className?: string;
  placeholder?: string;
  mode?: 'single' | 'multiple' | 'range';
  value?: Date | undefined;
  onChange?: (date: Date | undefined) => void;
}

export default function DatePicker({ className, placeholder, mode, value, onChange }: DatePickerProps) {
  const btnDatePicker = useRef<HTMLButtonElement>(null);
  const pickerId = UniqueId();
  const anchorId = `--rdp-${pickerId}`;
  const [date, setDate] = useState<Date | undefined>(value);

  const handleSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    onChange?.(selectedDate);
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
        {date ? date.toLocaleDateString() : <span className="text-sm text-base-content/60">{placeholder}</span>}
      </button>

      {/* DatePicker Section */}
      <div
        id={pickerId}
        popover="auto"
        className={`dropdown relative`}
        style={{ positionAnchor: anchorId } as React.CSSProperties}
      >
        {mode === 'range' ? (
          <DayPicker locale={vi} mode="range" className="react-day-picker" required={false} />
        ) : mode === 'multiple' ? (
          <DayPicker locale={vi} mode="multiple" className="react-day-picker" required={false} />
        ) : (
          <DayPicker locale={vi} mode="single" selected={date} onSelect={handleSelect} className="react-day-picker" />
        )}
        <button className="btn btn-sm btn-link absolute bottom-0 right-0" onClick={() => handleSelect(undefined)}>
          Xoá
        </button>
      </div>
    </label>
  );
}
