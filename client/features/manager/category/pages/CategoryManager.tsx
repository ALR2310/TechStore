import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import DataTable from '~/components/DataTable';
import Filter from '~/components/Filter';
import { useDebounce } from '~/hooks/useDebounce';
import { createCategory, deleteCategory, getCategory, getListCategory, updateCategory } from '../api/categoryApi';
import { useMinimumLoading } from '~/hooks/useMinimumLoading';
import { confirm } from '~/hooks/useConfirm';
import dayjs from 'dayjs';
import Modal from '~/components/Modal';
import { createCategoryPayload } from '@shared/types/category.type';
import { toast } from '~/hooks/useToast';
import { formatToSlug } from '@shared/utils/general.utils';

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

  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  const modalRef = useRef<HTMLDialogElement>(null);
  const [cateName, setCateName] = useState<string>('');
  const [slug, setSlug] = useState<string>('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');

  const categoriesQuery = useQuery({
    queryKey: ['categories', page, limit, sortBy, sortDir, dbFilters],
    queryFn: () => getListCategory({ page, limit, sortBy, sortDir, ...dbFilters }),
  });

  const categoryQuery = useQuery({
    queryKey: ['category', currentCategory],
    queryFn: () => getCategory(currentCategory!),
    enabled: !!currentCategory,
    refetchOnWindowFocus: false,
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => deleteCategory(id),
  });

  const createOrUpdateCategoryMutation = useMutation({
    mutationFn: (payload: createCategoryPayload) => {
      if (currentCategory) return updateCategory({ id: currentCategory, ...payload });
      return createCategory(payload);
    },
    onSuccess: () => {
      modalRef.current?.close();
      setCurrentCategory(null);
      categoriesQuery.refetch();
      toast({ message: `${categoryQuery ? 'Cập nhật' : 'Thêm'} danh mục thành công`, type: 'success' });
    },
  });

  // Handle slug update when cateName changes
  useEffect(() => {
    setSlug(formatToSlug(cateName));
  }, [cateName]);

  // Reset form when currentCategory changes
  useEffect(() => {
    if (currentCategory) {
      const category = categoryQuery.data;
      if (category) {
        setCateName(category.CateName);
        setSlug(category.Slugs);
        setStatus(category.Status);
      }
    } else {
      setCateName('');
      setSlug('');
      setStatus('Active');
    }
  }, [currentCategory, categoryQuery.data]);

  return (
    <div className="flex-1 p-4 flex flex-col">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold mb-4">Quản lý danh mục</h1>
        <button
          className="btn btn-soft btn-accent"
          onClick={() => {
            setCurrentCategory(null);
            modalRef.current?.showModal();
          }}
        >
          Thêm danh mục mới
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
                <button
                  className="btn btn-sm btn-soft btn-info"
                  onClick={() => {
                    setCurrentCategory(row.Id);
                    modalRef.current?.showModal();
                  }}
                >
                  Sửa
                </button>
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

      <Modal
        ref={modalRef}
        title={`${currentCategory ? 'Cập nhật' : 'Thêm mới'} Danh mục`}
        backdropClose={true}
        btnShow={false}
      >
        <form className="grid grid-cols-2 gap-4" onSubmit={(e) => e.preventDefault()}>
          <label className="floating-label">
            <span>Tên danh mục</span>
            <input
              type="text"
              placeholder="Nhập tên danh mục"
              className="input"
              value={cateName}
              onChange={(e) => setCateName(e.target.value)}
            />
          </label>

          <label className="floating-label">
            <span>Slug</span>
            <input
              type="text"
              placeholder="Nhập Slug"
              className="input"
              value={slug}
              onChange={(e) => setSlug(formatToSlug(e.target.value))}
            />
          </label>

          <label className="floating-label">
            <span>Trạng thái</span>
            <select
              className="select"
              defaultValue={status}
              onChange={(e) => setStatus(e.target.value as 'Active' | 'Inactive')}
            >
              <option value="Active">Hoạt động</option>
              <option value="Inactive">Vô hiệu</option>
            </select>
          </label>

          <div className="flex items-center gap-4">
            <button className="btn btn-soft flex-1" onClick={() => modalRef.current?.close()}>
              Huỷ
            </button>
            <button
              className="btn btn-success flex-1"
              onClick={() => createOrUpdateCategoryMutation.mutate({ name: cateName, slug: slug, status: status })}
            >
              Lưu
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
