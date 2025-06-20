import { gridColsMap } from '~/utils/cssMap';
import Select from './Select';
import DatePicker from './DatePicker';

export interface FilterOption {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'dateRange';
  options?: { label: string; value: any }[];
}

interface FilterProps {
  className?: string;
  grid?: number;
  filters?: FilterOption[];
  values?: Record<string, any>;
  onChange?: (key: string, value: any) => void;
}

export default function Filter({ className, grid = 2, filters, values, onChange }: FilterProps) {
  return (
    <div className={`collapse collapse-arrow ${className}`}>
      <input type="checkbox" />
      <div className="collapse-title">Bộ lọc</div>
      <div className="collapse-content border-t border-base-300">
        {/*  */}
        <div className={`grid ${gridColsMap[grid]} gap-4 mt-4`}>
          {filters?.map((field) => {
            const value = values?.[field.key];

            switch (field.type) {
              case 'text':
                return (
                  <div key={field.key} className="flex justify-between items-center w-full">
                    <span className="basis-[30%] max-w-[250px]">{field.label}</span>
                    <label className="input basis-[70%]">
                      <input
                        type="text"
                        className="grow"
                        value={value ?? ''}
                        placeholder={field.label}
                        onChange={(e) => onChange?.(field.key, e.target.value)}
                      />
                    </label>
                  </div>
                );

              case 'select':
                return (
                  <div key={field.key} className="flex justify-between items-center w-full">
                    <span className="basis-[30%] max-w-[250px]">{field.label}</span>
                    <Select
                      className="basis-[70%]"
                      options={field.options ?? []}
                      value={value}
                      onChange={(v) => onChange?.(field.key, v)}
                      placeholder={field.label}
                    />
                  </div>
                );

              case 'date':
                return (
                  <div key={field.key} className="flex justify-between items-center w-full">
                    <span className="basis-[30%] max-w-[250px]">{field.label}</span>
                    <DatePicker
                      className="basis-[70%]"
                      value={value}
                      placeholder={field.label}
                      onChange={(v) => onChange?.(field.key, v)}
                    />
                  </div>
                );

              case 'dateRange':
                return (
                  <div key={field.key} className="flex justify-between items-center w-full">
                    <span className="basis-[30%] max-w-[250px]">{field.label}</span>
                    <div className="basis-[70%] flex gap-4">
                      <DatePicker
                        className="w-full"
                        placeholder="Ngày bắt đầu"
                        value={value?.start}
                        onChange={(v) => onChange?.(`${field.key}.start`, v)}
                      />
                      <DatePicker
                        className="w-full"
                        placeholder="Ngày kết thúc"
                        value={value?.end}
                        onChange={(v) => onChange?.(`${field.key}.end`, v)}
                      />
                    </div>
                  </div>
                );

              default:
                return null;
            }
          })}
        </div>
        {/*  */}
      </div>
    </div>
  );
}
