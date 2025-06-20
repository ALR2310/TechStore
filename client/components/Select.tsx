import { useEffect, useRef, useState } from 'react';

interface OptionProps {
  value: string;
  label: string;
  render?: (option: OptionProps, select: (value: string) => void) => React.ReactNode;
}

interface SelectProps {
  options: OptionProps[];
  defaultValue?: string;
  placeholder?: string;
  search?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onChange?: (value: string) => void;
}

export default function Select({
  options,
  defaultValue,
  placeholder,
  search,
  className,
  style,
  onChange,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(defaultValue || '');
  const [searchValue, setSearchValue] = useState('');
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedOption(defaultValue || '');
  }, [defaultValue]);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleSelectOption = (value: string) => {
    setSelectedOption(value);
    setIsOpen(false);
    if (onChange) {
      onChange(value);
    }
  };

  const getSelectedLabel = (value: string) => {
    const selected = options?.find((option) => option?.value === value);
    return selected ? selected.label : placeholder;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchValue('');
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const filteredOptions = search
    ? options.filter((opt) => opt.label.toLowerCase().includes(searchValue.toLowerCase()))
    : options;

  return (
    <div
      className={`select relative cursor-pointer ${className}`}
      onClick={toggleDropdown}
      ref={selectRef}
      tabIndex={0}
      style={style}
    >
      {getSelectedLabel(selectedOption)}
      {isOpen && (
        <ul className="absolute top-full right-0 mt-1 p-2 rounded w-full bg-base-100 shadow z-10 overflow-y-auto max-h-96">
          {search && (
            <li className="py-1">
              <input
                type="text"
                className="input input-sm focus:outline-none focus-within:outline-none"
                placeholder={'Tìm kiếm...'}
                value={searchValue}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </li>
          )}
          {filteredOptions.map((option) => (
            <li
              key={option.value}
              className="px-3 py-1 cursor-pointer hover:bg-base-300"
              onClick={(e) => {
                e.stopPropagation();
                handleSelectOption(option.value);
              }}
            >
              {option.render ? option.render(option, handleSelectOption) : <span>{option.label}</span>}
            </li>
          ))}
          {filteredOptions.length === 0 && (
            <li className="px-3 py-2 text-sm text-base-content/70 italic">{'Không có kết quả nào'}</li>
          )}
        </ul>
      )}
    </div>
  );
}
