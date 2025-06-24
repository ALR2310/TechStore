import { useCallback, useState } from 'react';
import Pagination, { PaginationProp } from './Pagination';

type SortDirection = 'asc' | 'desc' | null;

type Column = {
  title: string;
  key: string;
  sortable?: boolean;
  visible?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
};

interface Paginate extends PaginationProp {
  size: number[];
}

interface TableDataProps {
  className?: string;
  columns: Column[];
  data?: any[];
  type?: 'default' | 'zebra';
  columnAction?: boolean;
  loading?: boolean;
  onSortChange?: (key: string, direction: SortDirection) => void;
  onRowDelete?: (row: any) => void;
  pagination?: Paginate;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  onRowClick?: (row: any) => void;
}

export default function DataTable({
  className,
  columns,
  data = [],
  type,
  columnAction,
  loading = false,
  onSortChange,
  onRowDelete,
  pagination,
  onPageChange,
  onLimitChange,
  onRowClick,
}: TableDataProps) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [columnsState, setColumnsState] = useState<Column[]>(
    columns.map((col) => ({ ...col, visible: col.visible !== false })),
  );

  const handleSort = useCallback(
    (key: string) => {
      let next: SortDirection;
      if (sortColumn === key) {
        next = sortDirection === 'asc' ? 'desc' : sortDirection === 'desc' ? null : 'asc';
      } else {
        next = 'asc';
      }

      setSortColumn(next ? key : null);
      setSortDirection(next);
      onSortChange?.(key, next);
    },
    [sortColumn, sortDirection, onSortChange],
  );

  const toggleColumnVisibility = (key: string) => {
    setColumnsState((prev) => prev.map((col) => (col.key === key ? { ...col, visible: !col.visible } : col)));
  };

  return (
    <div className={`overflow-x-auto flex flex-col justify-between ${className}`}>
      <table className={`table table-pin-rows ${type === 'zebra' ? 'table-zebra' : ''}`}>
        <thead>
          <tr>
            {columnsState
              .filter((col) => col.visible)
              .map((col, index) => {
                const isSorted = sortColumn === col.key;
                const icon = isSorted
                  ? sortDirection === 'asc'
                    ? 'fa-arrow-up-short-wide'
                    : sortDirection === 'desc'
                    ? 'fa-arrow-down-short-wide'
                    : 'fa-arrow-up-arrow-down'
                  : 'fa-arrow-up-arrow-down';

                return (
                  <th
                    key={index}
                    className={`text-left select-none ${
                      col.sortable ? 'cursor-pointer hover:text-primary/80 group' : ''
                    }`}
                    onClick={() => col.sortable && handleSort(col.key)}
                  >
                    <div className="flex items-center gap-1">
                      {col.title}
                      {col.sortable && (
                        <i
                          className={`fa-regular ${icon} text-sm transition-opacity ${
                            isSorted ? 'opacity-100' : 'opacity-50 group-hover:opacity-100'
                          }`}
                        ></i>
                      )}
                    </div>
                  </th>
                );
              })}
            {columnAction && (
              <th className="text-lg text-center dropdown dropdown-end">
                <i className="fa-regular fa-gear cursor-pointer" tabIndex={0} role="button"></i>
                <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-1 w-auto p-2 shadow">
                  {columnsState.map((col) => (
                    <li key={col.key} onClick={() => toggleColumnVisibility(col.key)}>
                      <a className="justify-between text-nowrap">
                        {col.title}
                        {col.visible && <i className="fa-solid fa-check" aria-hidden="true"></i>}
                      </a>
                    </li>
                  ))}
                </ul>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: 10 }).map((_, index) => (
                <tr key={index} className="hover:bg-base-300">
                  {columnsState
                    .filter((col) => col.visible)
                    .map((_, colIndex) => (
                      <td key={colIndex}>
                        <div className="skeleton h-4"></div>
                      </td>
                    ))}
                  {columnAction && (
                    <td className="">
                      <div className="skeleton h-4"></div>
                    </td>
                  )}
                </tr>
              ))
            : data.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-base-300" onClick={() => onRowClick?.(row)}>
                  {columnsState
                    .filter((col) => col.visible)
                    .map((col, colIndex) => (
                      <td key={colIndex}>{col.render ? col.render(row[col.key], row) : row[col.key]}</td>
                    ))}
                  {columnAction && (
                    <td className="text-lg text-center inline-block text-primary/40">
                      <i
                        className="fa-regular fa-circle-minus cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRowDelete?.(row);
                        }}
                      ></i>
                    </td>
                  )}
                </tr>
              ))}
        </tbody>
      </table>

      {pagination && (
        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center gap-2">
            <select className="select" onChange={(e) => onLimitChange?.(Number(e.target.value))}>
              {pagination.size.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span className="text-nowrap">Tổng: {pagination.total}</span>
          </div>

          <Pagination
            page={pagination.page}
            limit={pagination.limit}
            total={pagination.total}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}
