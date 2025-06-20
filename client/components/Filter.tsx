import { gridColsMap } from '~/utils/cssMap';
import Select from './Select';
import DatePicker from './DatePicker';

export interface FilterOption {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date';
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
      <div className="collapse-title">How do I create an account?</div>
      <div className="collapse-content border-t border-base-300">
        {/*  */}

        <div className={`grid ${gridColsMap[grid]} gap-4`}>
          {/* Cho select */}
          <div className="flex justify-between items-center w-full">
            <span className="flex-1">Placeholder</span>
            <Select className="flex-[2]" options={[]} defaultValue="" onChange={(value) => {}} placeholder="" />
          </div>

          {/* Cho Date Input đơn lẽ */}
          <div className="flex justify-between items-center w-full">
            <span className="flex-1">Placeholder</span>
            <DatePicker className="flex-[2]" placeholder="Chọn ngày" value={new Date()} onChange={(value) => {}} />
          </div>

          {/* Cho Date Range input */}
          <div className="flex justify-between items-center w-full">
            <span className="flex-1">Placeholder</span>
            <div className="flex-[2.4] flex justify-between items-center gap-4">
              <DatePicker className="w-full" placeholder="Ngày bắt đầu" value={new Date()} onChange={(value) => {}} />
              <DatePicker className="w-full" placeholder="Ngày kết thúc" value={new Date()} onChange={(value) => {}} />
            </div>
          </div>

          {/* Cho Text Input */}
          <div className="flex justify-between items-center w-full">
            <span className="flex-1">Placeholder</span>
            <label className="input flex-[1.8]">
              <input type="text" className="grow" placeholder="" onChange={(e) => {}} />
            </label>
          </div>
        </div>

        {/*  */}
      </div>
    </div>
  );
}
