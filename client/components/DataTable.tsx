import React, { useCallback, useState } from 'react';
import Pagination, { PaginationProp } from './Pagination';
import { motion, AnimatePresence } from 'motion/react';

type SortDirection = 'asc' | 'desc' | null;

type Column = {
  title: React.ReactNode;
  key: string;
  sortable?: boolean;
  visible?: boolean;
  group?: boolean;
  render?: (value: any, rowData: any, index: number) => React.ReactNode;
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
  onRowDelete?: (rowData: any, index: number) => void;
  pagination?: Paginate;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  onRowClick?: (row: any) => void;
}

function processGroupedData(data: any[], groupKeys: string[]): any[] {
  const result: any[] = [];
  let lastGroupValues: Record<string, any> = {};
  let spanCounters: Record<string, number> = {};

  data.forEach((row) => {
    const rowCopy = { ...row, _rowSpan: {}, _skip: {} };

    groupKeys.forEach((key) => {
      const currentValue = row[key];
      const lastValue = lastGroupValues[key];

      if (currentValue !== lastValue) {
        spanCounters[key] = 1;
        rowCopy._rowSpan[key] = 1;
        rowCopy._skip[key] = false;
        lastGroupValues[key] = currentValue;
      } else {
        const previousRow = result[result.length - spanCounters[key]];
        if (previousRow) {
          previousRow._rowSpan[key]++;
        }
        rowCopy._skip[key] = true;
        rowCopy._rowSpan[key] = 0;
        spanCounters[key]++;
      }
    });

    result.push(rowCopy);
  });

  return result;
}

function renderHeader(
  columnsState: Column[],
  sortColumn: string | null,
  sortDirection: SortDirection,
  handleSort: (key: string) => void,
  columnAction: boolean,
  toggleColumnVisibility: (key: string) => void,
) {
  return (
    <thead>
      <tr>
        {columnsState
          .filter((col) => col.visible)
          .map((col, index) => {
            const isSorted = sortColumn === col.key;
            const icon = isSorted
              ? sortDirection === 'asc'
                ? 'fa-arrow-up-short-wide'
                : 'fa-arrow-down-short-wide'
              : 'fa-arrow-up-arrow-down';

            return (
              <th
                key={index}
                className={`text-left select-none ${col.sortable ? 'cursor-pointer hover:text-primary/80 group' : ''}`}
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
              {columnsState
                .filter((col) => col.title)
                .map((col) => (
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
  );
}

function renderBody(
  data: any[],
  columnsState: Column[],
  columnAction: boolean,
  onRowClick?: (row: any) => void,
  onRowDelete?: (rowData: any, index: number) => void,
) {
  return data.map((row, rowIndex) => (
    <tr
      key={`row-${rowIndex}`}
      className={`hover:bg-base-300 ${onRowClick ? 'cursor-pointer' : ''}`}
      onClick={() => onRowClick?.(row)}
    >
      {columnsState
        .filter((col) => col.visible)
        .map((col, colIndex) => {
          const isGrouped = col.group;
          const skip = isGrouped && row._skip?.[col.key];
          const rowSpan = isGrouped ? row._rowSpan?.[col.key] : undefined;

          if (skip) return null;

          return (
            <td key={colIndex} rowSpan={rowSpan > 1 ? rowSpan : undefined} className={isGrouped ? 'align-top' : ''}>
              {col.render ? col.render(row[col.key], row, rowIndex) : row[col.key]}
            </td>
          );
        })}

      {columnAction && (
        <td className="text-lg text-center inline-block text-primary/40">
          <i
            className="fa-regular fa-circle-minus cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onRowDelete?.(row, rowIndex);
            }}
          ></i>
        </td>
      )}
    </tr>
  ));
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
      let next: SortDirection = sortColumn === key ? (sortDirection === 'asc' ? 'desc' : 'asc') : 'asc';
      setSortColumn(key);
      setSortDirection(next);
      onSortChange?.(key, next);
    },
    [sortColumn, sortDirection, onSortChange],
  );

  const toggleColumnVisibility = (key: string) => {
    setColumnsState((prev) => prev.map((col) => (col.key === key ? { ...col, visible: !col.visible } : col)));
  };

  const groupKeys = columnsState.filter((col) => col.group).map((col) => col.key);
  const groupedData = processGroupedData(data, groupKeys);

  return (
    <div className={`overflow-x-auto flex flex-col justify-between ${className}`}>
      <table className={`table table-pin-rows ${type === 'zebra' ? 'table-zebra' : ''}`}>
        {renderHeader(
          columnsState,
          sortColumn,
          sortDirection,
          handleSort,
          columnAction ?? false,
          toggleColumnVisibility,
        )}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.tbody
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {Array.from({ length: 10 }).map((_, index) => (
                <tr key={`skeleton-${index}`} className="hover:bg-base-300">
                  {columnsState
                    .filter((col) => col.visible)
                    .map((_, colIndex) => (
                      <td key={colIndex}>
                        <div className="skeleton h-4"></div>
                      </td>
                    ))}
                  {columnAction && (
                    <td>
                      <div className="skeleton h-4"></div>
                    </td>
                  )}
                </tr>
              ))}
            </motion.tbody>
          ) : (
            <motion.tbody
              key="data"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {renderBody(groupedData, columnsState, columnAction ?? false, onRowClick, onRowDelete)}
            </motion.tbody>
          )}
        </AnimatePresence>
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
