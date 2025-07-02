import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import DataTable from '~/components/DataTable';
import Filter from '~/components/Filter';
import { useDebounce } from '~/hooks/useDebounce';
import { getListBrand } from '../api/brandApi';
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

export default function BrandManager() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [sortBy, setSortBy] = useState<string>('updatedAt');
  const [filters, setFilters] = useState<Record<string, any>>();
  const dbFilters = useDebounce(filters, 300);

  const brandsQuery = useQuery({
    queryKey: ['brands', page, limit, sortBy, sortDir, dbFilters],
    queryFn: () => getListBrand({ limit, page, sortBy, sortDir, ...dbFilters }),
  });

  return (
    <div className="flex-1 p-4 flex flex-col">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold mb-4">Quản lý thương hiệu</h1>
        <button className="btn btn-soft btn-accent" onClick={() => {}}>
          Thêm thương hiệu mới
        </button>
      </div>

      <Filter
        className="bg-base-100 rounded-2xl mb-8 border border-base-300"
        grid={3}
        filters={[
          {
            label: 'Từ khoá',
            key: 'keyword',
            type: 'text',
            placeholder: 'Nhập từ khoá tìm kiếm',
            className: 'col-span-2',
          },
          {
            key: 'status',
            label: 'Trạng thái',
            type: 'select',
            options: [
              { label: 'Hoạt động', value: 'Active' },
              { label: 'Vô hiệu', value: 'Inactive' },
            ],
          },
        ]}
        values={filters}
        onChange={(key, value) => {
          setFilters((prev) => {
            const [parentKey, childKey] = key.split('.');
            if (childKey) return { ...prev, [parentKey]: { ...(prev?.[parentKey] || {}), [childKey]: value } };
            return { ...prev, [key]: value };
          });
          setPage(1);
        }}
      />

      <DataTable
        className="flex-1 bg-base-100 p-3 rounded-2xl border border-base-300"
        columnAction={true}
        columns={[
          { title: 'Id', key: 'Id', sortable: true },
          { title: 'Tên thương hiệu', key: 'BrandName', sortable: true },
          {
            title: 'Dòng thương hiệu',
            key: 'Series',
            render: (series) => (
              <div className="flex flex-wrap gap-2">
                {series?.map((item: any, index: any) => (
                  <span key={index} className="badge badge-primary badge-soft">
                    {item.SeriesName}
                  </span>
                ))}
              </div>
            ),
          },
          {
            title: 'Trạng thái',
            key: 'Status',
            sortable: true,
            render: (value) => <p className={`font-semibold ${statusMap.color[value]}`}>{statusMap.text[value]}</p>,
          },
          { title: 'Ngày tạo', key: 'createdAt', sortable: true, render: (value) => dayjs(value).format('DD/MM/YYYY') },
          {
            title: 'Ngày sửa đổi',
            key: 'updatedAt',
            sortable: true,
            render: (value) => dayjs(value).format('DD/MM/YYYY'),
          },
        ]}
        data={brandsQuery?.data?.data ?? []}
        type="zebra"
        loading={useMinimumLoading(brandsQuery.isLoading, 300)}
        pagination={{
          size: [10, 20, 50],
          page: page,
          limit: limit,
          total: brandsQuery.data?.pagination.total ?? 0,
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
