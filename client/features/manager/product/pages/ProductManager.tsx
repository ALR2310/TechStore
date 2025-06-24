import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import DataTable from '~/components/DataTable';
import Filter from '~/components/Filter';
import { getListProduct } from '../api/productApi';
import { getListCategory } from '~/features/manager/category/api/categoryApi';
import { getListBrand } from '../../brand/api/brandApi';
import { useDebounce } from '~/hooks/useDebounce';
import { useMinimumLoading } from '~/hooks/useMinimumLoading';

export default function ProductManager() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [sortBy, setSortBy] = useState<string>('updatedAt');
  const [filters, setFilters] = useState<Record<string, any>>();
  const dbFilters = useDebounce(filters, 300);

  const quantityFrom = dbFilters?.quantity?.from;
  const quantityTo = dbFilters?.quantity?.to;
  const priceFrom = dbFilters?.price?.from;
  const priceTo = dbFilters?.price?.to;

  const productsQuery = useQuery({
    queryKey: ['products', page, limit, sortBy, sortDir, dbFilters],
    queryFn: () =>
      getListProduct({ page, limit, sortBy, sortDir, ...dbFilters, quantityFrom, quantityTo, priceFrom, priceTo }),
  });

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: async () => getListCategory({ page: 1, limit: 100 }),
  });

  const brandsQuery = useQuery({
    queryKey: ['brands'],
    queryFn: async () => getListBrand({ page: 1, limit: 100 }),
  });

  return (
    <div className="flex-1 p-4 flex flex-col">
      <h1 className="text-2xl font-bold mb-4">Quản lý sản phẩm</h1>

      <Filter
        className="bg-base-100 rounded-2xl mb-8 border border-base-300"
        grid={3}
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
              { label: 'Hoạt động', value: 'Active' },
              { label: 'Vô hiệu', value: 'Inactive' },
            ],
          },
          {
            label: 'Danh mục',
            key: 'category',
            type: 'select',
            options: categoriesQuery.data?.data.map((c: any) => ({ label: c.CateName, value: c.Id })) ?? [],
          },
          {
            label: 'Thương hiệu',
            key: 'brand',
            type: 'select',
            options: brandsQuery.data?.data.map((b: any) => ({ label: b.BrandName, value: b.Id })) ?? [],
          },
          {
            label: 'Số lượng',
            key: 'quantity',
            type: 'textRange',
            placeholder: '',
          },
          {
            label: 'Giá bán',
            key: 'price',
            type: 'textRange',
            placeholder: '',
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
          {
            title: '',
            key: 'Image',
            render: (value, row) => <img src={`http://localhost:4850/${value}`} alt={row.Name} className="w-40" />,
          },
          {
            title: 'Tên sản phẩm',
            key: 'Name',
            sortable: true,
            render: (value) => <p className="font-semibold">{value}</p>,
          },
          {
            title: 'Danh mục',
            key: 'Category',
            sortable: true,
            render: (value) => <p className="font-semibold text-info">{value}</p>,
          },
          {
            title: 'Thương hiệu',
            key: 'Brand',
            sortable: true,
            render: (value, row) => (
              <div className="text-center font-semibold">
                <p>
                  Thương hiệu: <span className="text-primary">{value}</span>
                </p>
                {row.Series && (
                  <p>
                    Thuộc dòng: <span className="text-secondary">{row.Series}</span>{' '}
                  </p>
                )}
              </div>
            ),
          },
          {
            title: 'Số lượng',
            key: 'Quantity',
            sortable: true,
            render: (value) => <span className="font-semibold">Còn: {value}</span>,
          },
          {
            title: 'Giá gốc',
            key: 'Price',
            sortable: true,
            render: (value) => (
              <span className="text-success font-semibold text-nowrap">{value.toLocaleString('vi-VN')} đ</span>
            ),
          },
          {
            title: 'Giá giảm',
            key: 'Discount',
            sortable: true,
            render: (value, row) => {
              const discountedPrice = value > 0 ? row.Price * (1 - value / 100) : row.Price;
              return (
                <div className="text-center font-semibold">
                  <p className="text-success text-nowrap">{discountedPrice.toLocaleString('vi-VN')} đ</p>
                  <p className="text-primary">Giảm {value} %</p>
                </div>
              );
            },
          },
          {
            title: 'Trạng thái',
            key: 'Status',
            sortable: true,
            render: (value) => (
              <span className={`font-semibold ${value === 'Active' ? 'text-success' : 'text-error'}`}>
                {value === 'Active' ? 'Hoạt động' : 'Vô hiệu'}
              </span>
            ),
          },
          {
            title: '',
            key: '',
            render: () => (
              <div className="space-y-2">
                <button className="btn btn-primary btn-sm">Sửa</button>
                <button className="btn btn-error btn-sm">Xóa</button>
              </div>
            ),
          },
        ]}
        data={productsQuery.data?.data ?? []}
        loading={useMinimumLoading(productsQuery.isLoading, 300)}
        pagination={{
          size: [10, 20, 50],
          page: page,
          limit: limit,
          total: productsQuery.data?.pagination.total ?? 0,
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
