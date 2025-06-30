import { gridColsMap } from '~/utils/cssMap';
import DatePicker from './DatePicker';

export interface FilterOption {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'dateRange' | 'textRange' | 'selectRange';
  options?: { label: string; value: any }[];
  className?: string;
  placeholder?: string;
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
                  <div key={field.key} className={`flex justify-between items-center gap-4 w-full ${field.className}`}>
                    <span className="w-[110px]">{field.label}</span>
                    <input
                      type="text"
                      className="input flex-1"
                      value={value ?? ''}
                      placeholder={field.placeholder ?? field.label}
                      onChange={(e) => onChange?.(field.key, e.target.value)}
                    />
                  </div>
                );

              case 'select':
                return (
                  <div key={field.key} className={`flex justify-between items-center gap-4 w-full ${field.className}`}>
                    <span className="w-[110px]">{field.label}</span>

                    <select
                      className="select flex-1"
                      value={value}
                      onChange={(e) => onChange?.(field.key, e.target.value)}
                    >
                      <option value="">{field.placeholder ?? field.label}</option>
                      {field?.options?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                );

              case 'date':
                return (
                  <div key={field.key} className={`flex justify-between items-center gap-4 w-full ${field.className}`}>
                    <span className="w-[110px]">{field.label}</span>
                    <DatePicker
                      className="flex-1"
                      value={value}
                      placeholder={field.placeholder ?? field.label}
                      onChange={(v) => onChange?.(field.key, v)}
                    />
                  </div>
                );

              case 'dateRange':
                return (
                  <div key={field.key} className={`flex justify-between items-center gap-4 w-full ${field.className}`}>
                    <span className="w-[110px]">{field.label}</span>
                    <div className="flex-1 flex gap-4">
                      <DatePicker
                        className="w-full"
                        placeholder={`${field.placeholder ?? 'Ngày bắt đầu'}`}
                        value={value?.start}
                        onChange={(v) => onChange?.(`${field.key}.start`, v)}
                      />
                      <DatePicker
                        className="w-full"
                        placeholder={`${field.placeholder ?? 'Ngày kết thúc'}`}
                        value={value?.end}
                        onChange={(v) => onChange?.(`${field.key}.end`, v)}
                      />
                    </div>
                  </div>
                );

              case 'textRange':
                return (
                  <div key={field.key} className={`flex justify-between items-center gap-4 w-full ${field.className}`}>
                    <span className="w-[110px]">{field.label}</span>

                    <div className="flex-1 flex gap-4">
                      <input
                        type="text"
                        className="input w-full"
                        value={value?.from ?? ''}
                        placeholder={`Từ ${field.placeholder ?? field.label}`}
                        onChange={(e) => onChange?.(`${field.key}.from`, e.target.value)}
                      />
                      <input
                        type="text"
                        className="input w-full"
                        value={value?.to ?? ''}
                        placeholder={`Đến ${field.placeholder ?? field.label}`}
                        onChange={(e) => onChange?.(`${field.key}.to`, e.target.value)}
                      />
                    </div>
                  </div>
                );

              case 'selectRange':
                return (
                  <div key={field.key} className={`flex justify-between items-center gap-4 w-full ${field.className}`}>
                    <span className="w-[110px]">{field.label}</span>

                    <div className="flex-1 flex gap-4">
                      <select
                        className="select w-full"
                        value={value?.from ?? ''}
                        onChange={(e) => onChange?.(`${field.key}.from`, e.target.value)}
                      >
                        <option value="">{`Từ ${field.placeholder ?? field.label}`}</option>
                        {field?.options?.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <select
                        className="select w-full"
                        value={value?.to ?? ''}
                        onChange={(e) => onChange?.(`${field.key}.to`, e.target.value)}
                      >
                        <option value="">{`Đến ${field.placeholder ?? field.label}`}</option>
                        {field?.options?.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
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
