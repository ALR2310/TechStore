import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import DataTable from '~/components/DataTable';
import Filter from '~/components/Filter';
import { useDebounce } from '~/hooks/useDebounce';
import { deleteCategory, getListCategory } from '../api/categoryApi';
import { useMinimumLoading } from '~/hooks/useMinimumLoading';
import { confirm } from '~/hooks/useConfirm';
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

export default function CategoryManager() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [sortBy, setSortBy] = useState<string>('updatedAt');
  const [filters, setFilters] = useState<Record<string, any>>();
  const dbFilters = useDebounce(filters, 300);

  const categoriesQuery = useQuery({
    queryKey: ['categories', page, limit, sortBy, sortDir, dbFilters],
    queryFn: () => getListCategory({ page, limit, sortBy, sortDir, ...dbFilters }),
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => deleteCategory(id),
  });

  return (
    <div className="flex-1 p-4 flex flex-col">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold mb-4">Quản lý danh mục</h1>
        <Link to={'create'} className="btn btn-soft btn-accent">
          Thêm danh mục mới
        </Link>
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
        type="zebra"
        columns={[
          { title: 'Id', key: 'Id', sortable: true },
          {
            title: 'Tên danh mục',
            key: 'CateName',
            sortable: true,
            render: (value) => <p className="text-nowrap font-semibold">{value}</p>,
          },
          {
            title: 'Slug',
            key: 'Slugs',
            sortable: true,
            render: (value) => <p className="text-nowrap text-base-content/60">{value}</p>,
          },
          {
            title: 'Trạng thái',
            key: 'Status',
            sortable: true,
            render: (value) => <p className={`font-semibold ${statusMap.color[value]}`}>{statusMap.text[value]}</p>,
          },
          { title: 'Số sản phẩm', key: 'ProdCount', sortable: true },
          { title: 'Ngày tạo', key: 'createdAt', sortable: true, render: (value) => dayjs(value).format('DD/MM/YYYY') },
          {
            title: 'Ngày cập nhật',
            key: 'updatedAt',
            sortable: true,
            render: (value) => dayjs(value).format('DD/MM/YYYY'),
          },
          {
            title: '',
            key: '',
            render: (_, row) => (
              <div className="flex items-center gap-4">
                <button className="btn btn-sm btn-soft btn-info">Sửa</button>
                <button
                  className="btn btn-sm btn-soft btn-error"
                  onClick={async () => {
                    confirm({
                      title: 'Xoá danh mục',
                      content: (
                        <div className="space-y-2 font-semibold">
                          <p>
                            Bạn có chắc chắn muốn xóa danh mục{' '}
                            <span className="font-semibold text-error">{row.CateName}</span> không?
                          </p>
                          <p className="text-sm text-base-content/60">Mọi dữ liệu liên quan sẽ bị xoá</p>
                          <p className="text-sm text-base-content/60">Hành động này không thể hoàn tác</p>
                        </div>
                      ),
                      btnCancel: {
                        text: 'Hủy',
                      },
                      btnOk: {
                        color: 'error',
                        text: 'Xoá',
                        onClick: () => {
                          deleteCategoryMutation.mutate(row.Id);
                        },
                      },
                    });
                  }}
                >
                  Xoá
                </button>
              </div>
            ),
          },
        ]}
        data={categoriesQuery.data?.data ?? []}
        loading={useMinimumLoading(categoriesQuery.isLoading, 300)}
        pagination={{
          size: [10, 20, 50],
          page: page,
          limit: limit,
          total: categoriesQuery.data?.pagination.total ?? 0,
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
