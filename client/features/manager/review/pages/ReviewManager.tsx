import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import DataTable from '~/components/DataTable';
import Filter from '~/components/Filter';
import { useDebounce } from '~/hooks/useDebounce';
import { getListReview } from '../reviewApi';
import { useMinimumLoading } from '~/hooks/useMinimumLoading';
import dayjs from 'dayjs';

const statusMap = {
  text: {
    Active: 'Hoạt động',
    Inactive: 'Vô hiệu',
  },
  color: {
    Active: 'text-success',
    Inactive: 'text-error',
  },
};

export default function ReviewManager() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [sortBy, setSortBy] = useState<string>('updatedAt');
  const [filters, setFilters] = useState<Record<string, any>>();
  const dbFilters = useDebounce(filters, 300);

  const ratingFrom = dbFilters?.rating?.from;
  const ratingTo = dbFilters?.rating?.to;
  const status = dbFilters?.status;
  const keyword = dbFilters?.keyword;
  const product = dbFilters?.product;
  const user = dbFilters?.user;

  const reviewQuery = useQuery({
    queryKey: ['reviews', page, limit, sortBy, sortDir, dbFilters],
    queryFn: () =>
      getListReview({ page, limit, sortBy, sortDir, status, keyword, ratingFrom, ratingTo, product, user }),
  });

  return (
    <div className="flex-1 p-4 flex flex-col">
      <h1 className="text-2xl font-bold mb-4">Quản lý đánh giá</h1>

      <Filter
        className="bg-base-100 rounded-2xl mb-8 border border-base-300"
        grid={3}
        filters={[
          {
            key: 'keyword',
            label: 'Tìm kiếm',
            type: 'text',
            placeholder: 'Nhập từ khoá tìm kiếm',
            className: 'col-span-2',
          },
          {
            key: 'status',
            label: 'Trạng thái',
            type: 'select',
            options: [
              { label: 'Đã duyệt', value: 'Approved' },
              { label: 'Chưa duyệt', value: 'Pending' },
              { label: 'Bị từ chối', value: 'Rejected' },
            ],
          },
          {
            key: 'rating',
            label: 'Đánh giá',
            type: 'selectRange',
            placeholder: '',
            options: [
              { label: '1 sao', value: 1 },
              { label: '2 sao', value: 2 },
              { label: '3 sao', value: 3 },
              { label: '4 sao', value: 4 },
              { label: '5 sao', value: 5 },
            ],
          },
          {
            key: 'product',
            label: 'Sản phẩm',
            type: 'text',
            placeholder: 'Nhập tên sản phẩm',
          },
          {
            key: 'user',
            label: 'Người dùng',
            type: 'text',
            placeholder: 'Nhập tên người dùng',
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
        columnAction={true}
        columns={[
          {
            title: '',
            key: 'ProductImage',
            group: true,
            render: (value) => (
              <img src={`http://localhost:4850/${value}`} alt="Product" className="w-20 h-20 object-cover" />
            ),
          },
          {
            title: 'Sản phẩm',
            key: 'ProductName',
            sortable: true,
            group: true,
            render: (value, row) => (
              <a
                href={`/product/${row.ProductSlugs}`}
                className="text-primary hover:underline font-semibold text-lg"
                target="_blank"
                rel="noopener noreferrer"
              >
                {value}
              </a>
            ),
          },
          { title: 'Tên đánh giá', key: 'UserName', sortable: true },
          { title: 'Đánh giá', key: 'Rating', sortable: true },
          {
            title: 'Bình luận',
            key: 'Comment',
            render: (value) => <p className="text-sm text-base-content/60">{value}</p>,
          },
          {
            title: 'Trạng thái',
            key: 'Status',
            sortable: true,
            render: (value) => {
              return <span className={`font-semibold ${statusMap.color[value]}`}>{statusMap.text[value]}</span>;
            },
          },
          {
            title: 'Ngày tạo',
            key: 'createdAt',
            sortable: true,
            render: (value) => dayjs(value).format('DD/MM/YYYY'),
          },
        ]}
        data={reviewQuery.data?.data ?? []}
        loading={useMinimumLoading(reviewQuery.isLoading, 300)}
        pagination={{
          size: [10, 20, 50],
          page: page,
          limit: limit,
          total: reviewQuery.data?.pagination.total ?? 0,
        }}
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
