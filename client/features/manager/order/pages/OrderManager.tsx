import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import DataTable from '~/components/DataTable';
import Filter from '~/components/Filter';
import { useDebounce } from '~/hooks/useDebounce';
import { getListOrder } from '../orderApi';
import { useMinimumLoading } from '~/hooks/useMinimumLoading';
import dayjs from 'dayjs';

const orderStatusMap = {
  class: {
    Processing: 'text-warning',
    Delivering: 'text-info',
    Completed: 'text-success',
    Cancelled: 'text-error',
  },
  text: {
    Processing: 'Đang xử lý',
    Delivering: 'Đang giao hàng',
    Completed: 'Giao thành công',
    Cancelled: 'Dã hủy',
  },
};

export default function OrderManager() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [sortBy, setSortBy] = useState<string>('updatedAt');
  const [filters, setFilters] = useState<Record<string, any>>();
  const dbFilters = useDebounce(filters, 300);

  const ordersQuery = useQuery({
    queryKey: ['orders', page, limit, sortBy, sortDir, dbFilters],
    queryFn: () =>
      getListOrder({
        page,
        limit,
        sortBy,
        sortDir,
        status: dbFilters?.status,
        keyword: dbFilters?.keyword,
        dateFrom: dbFilters?.time?.start,
        dateTo: dbFilters?.time?.end,
        priceFrom: dbFilters?.price?.from,
        priceTo: dbFilters?.price?.to,
      }),
  });

  return (
    <div className="flex-1 p-4 flex flex-col">
      <h1 className="text-2xl font-bold mb-4">Quản lý đơn hàng</h1>

      <Filter
        className="bg-base-100 rounded-2xl mb-8 border border-base-300"
        filters={[
          {
            label: 'Từ khoá',
            key: 'keyword',
            type: 'text',
            placeholder: 'Nhập từ khoá tìm kiếm',
          },
          {
            key: 'status',
            label: 'Trạng thái',
            type: 'select',
            options: [
              { label: orderStatusMap.text.Processing, value: 'Processing' },
              { label: orderStatusMap.text.Delivering, value: 'Delivering' },
              { label: orderStatusMap.text.Completed, value: 'Completed' },
              { label: orderStatusMap.text.Cancelled, value: 'Cancelled' },
            ],
          },
          {
            label: 'Số tiền',
            key: 'price',
            type: 'textRange',
            placeholder: '',
          },
          {
            label: 'Thời gian',
            key: 'time',
            type: 'dateRange',
          },
        ]}
        values={filters}
        onChange={(key, value) => {
          setFilters((prev) => {
            const [parentKey, childKey] = key.split('.');
            if (childKey) {
              return {
                ...prev,
                [parentKey]: {
                  ...(prev?.[parentKey] || {}),
                  [childKey]: value,
                },
              };
            }

            return {
              ...prev,
              [key]: value,
            };
          });

          setPage(1);
        }}
      />

      <DataTable
        className="flex-1 bg-base-100 p-3 rounded-2xl border border-base-300"
        type="zebra"
        columns={[
          { title: 'Id', key: 'Id', sortable: true },
          { title: 'Mã đơn hàng', key: 'Code', sortable: true },
          { title: 'Khách hàng', key: 'FullName', sortable: true },
          {
            title: 'Tổng đơn',
            key: 'TotalPrice',
            sortable: true,
            render: (value) => (
              <span className="text-success font-semibold text-nowrap">{value.toLocaleString('vi-VN')} đ</span>
            ),
          },
          {
            title: 'Trạng thái',
            key: 'Status',
            sortable: true,
            render: (value) => <span className={`${orderStatusMap.class[value]}`}>{orderStatusMap.text[value]}</span>,
          },
          {
            title: 'Ngày xử lý',
            key: 'updatedAt',
            sortable: true,
            render: (value) => dayjs(value).format('DD/MM/YYYY HH:mm:ss'),
          },
        ]}
        loading={useMinimumLoading(ordersQuery.isLoading, 300)}
        data={ordersQuery.data?.data || []}
        onLimitChange={(limit) => {
          setLimit(limit);
        }}
        onSortChange={(sortBy, sortDir) => {
          setSortBy(sortBy);
          setSortDir(sortDir === 'asc' ? 'asc' : 'desc');
        }}
        onPageChange={(newPage) => {
          setPage(newPage);
        }}
      />
    </div>
  );
}
