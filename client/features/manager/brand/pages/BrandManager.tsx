import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import DataTable from '~/components/DataTable';
import Filter from '~/components/Filter';
import { useDebounce } from '~/hooks/useDebounce';
import { createBrand, deleteBrand, getBrand, getListBrand, updateBrand } from '../api/brandApi';
import { useMinimumLoading } from '~/hooks/useMinimumLoading';
import dayjs from 'dayjs';
import Modal from '~/components/Modal';
import { toast } from '~/hooks/useToast';
import { getProductsBySeries } from '../../product/api/productApi';
import { createBrandPayload, updateBrandPayload } from '@shared/types/brand.type';
import { confirm } from '~/hooks/useConfirm';

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

  const modalRef = useRef<HTMLDialogElement>(null);
  const [currentBrand, setCurrentBrand] = useState<any>(null);
  const [brandName, setBrandName] = useState<string>('');
  const [brandStatus, setBrandStatus] = useState<'Active' | 'Inactive'>('Active');
  const [seriesData, setSeriesData] = useState<{ SeriesName: string; Status: string; Id: string }[]>([]);
  const [listSeriesDelete, setListSeriesDelete] = useState<string[]>([]);

  const brandsQuery = useQuery({
    queryKey: ['brands', page, limit, sortBy, sortDir, dbFilters],
    queryFn: () => getListBrand({ limit, page, sortBy, sortDir, ...dbFilters }),
  });

  const brandQuery = useQuery({
    queryKey: ['brand', currentBrand],
    queryFn: () => getBrand(currentBrand),
    enabled: !!currentBrand,
  });

  const getProductsBySeriesMutation = useMutation({
    mutationFn: (seriesId: string) => getProductsBySeries(seriesId),
  });

  const createOrUpdateBrandMutation = useMutation({
    mutationFn: async () => {
      if (!brandName) {
        return toast({ type: 'error', message: 'Vui lòng nhập tên thương hiệu!' });
      }

      const createPayload: createBrandPayload = {
        name: brandName,
        status: brandStatus,
        series: seriesData.map((item) => ({
          id: item.Id || undefined,
          name: item.SeriesName,
          status: item.Status as 'Active' | 'Inactive',
        })),
      };

      if (currentBrand) {
        const updatePayload: updateBrandPayload = {
          ...createPayload,
          id: currentBrand,
          idsDelete: listSeriesDelete,
        };
        return updateBrand(updatePayload);
      } else {
        return createBrand(createPayload);
      }
    },
    onSuccess: () => {
      toast({ type: 'success', message: `${currentBrand ? 'Cập nhật' : 'Thêm'} thương hiệu thành công!` });
      brandsQuery.refetch();
      modalRef.current?.close();
    },
  });

  const deleteBrandMutation = useMutation({
    mutationFn: (brandId: string) => deleteBrand(brandId),
    onSuccess: () => {
      toast({ type: 'success', message: 'Xoá thương hiệu thành công!' });
      brandsQuery.refetch();
    },
  });

  useEffect(() => {
    if (!brandQuery.data || brandQuery.isLoading) return;

    setBrandName(brandQuery.data.BrandName);
    setBrandStatus(brandQuery.data.Status);

    if (brandQuery.data.Series.length === 0) {
      setSeriesData([{ SeriesName: '', Status: '', Id: '' }]);
    } else setSeriesData(brandQuery.data.Series);
  }, [brandQuery.data]);

  const handleUpdateCell = (index: number, key: string, value: any) => {
    setSeriesData((prev) => {
      const newData = [...prev];
      newData[index][key] = value;
      return newData;
    });
  };

  return (
    <div className="flex-1 p-4 flex flex-col">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold mb-4">Quản lý thương hiệu</h1>
        <button
          className="btn btn-soft btn-accent"
          onClick={() => {
            setCurrentBrand(null);
            setSeriesData([]);
            setListSeriesDelete([]);
            setBrandName('');
            setBrandStatus('Active');
            modalRef.current?.showModal();
          }}
        >
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
        onRowClick={(row) => {
          setCurrentBrand(row.Id);
          setListSeriesDelete([]);
          modalRef.current?.showModal();
        }}
        onRowDelete={(row) => {
          confirm({
            title: 'Xác nhận xoá thương hiệu',
            backdropClose: true,
            content: (
              <div className="space-y-2 font-semibold">
                <p>
                  Bạn có chắc chắn muốn xóa thương hiệu{' '}
                  <span className="font-semibold text-error">{row.BrandName}</span> không?
                </p>
                <p className="text-sm text-base-content/60">Mọi dữ liệu liên quan sẽ bị xoá</p>
                <p className="text-sm text-base-content/60">Hành động này không thể hoàn tác</p>
              </div>
            ),
            btnCancel: { text: 'Hủy' },
            btnOk: {
              color: 'error',
              text: 'Xoá',
              onClick: () => {
                deleteBrandMutation.mutate(row.Id);
              },
            },
          });
        }}
      />

      <Modal
        ref={modalRef}
        title="Thêm thương hiệu mới"
        backdropClose={true}
        btnOk={{ text: 'Lưu', color: 'success', onClick: () => createOrUpdateBrandMutation.mutate() }}
        btnCancel={{ text: 'Đóng', onClick: () => modalRef.current?.close() }}
        allowBtnCloseModal={false}
      >
        <div className="grid grid-cols-2 gap-4">
          <label className="floating-label">
            <span>Tên thương hiệu</span>
            <input
              type="text"
              placeholder="Nhập tên thương hiệu"
              className="input"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
            />
          </label>

          <label className="floating-label">
            <span>Trạng thái</span>
            <select
              className="select"
              value={brandStatus}
              onChange={(e) => setBrandStatus(e.target.value as 'Active' | 'Inactive')}
            >
              <option value="Active">Hoạt động</option>
              <option value="Inactive">Vô hiệu</option>
            </select>
          </label>

          <div className="col-span-2">
            <button
              className="btn btn-soft"
              onClick={() => {
                setSeriesData((prev) => [...prev, { SeriesName: '', Status: 'Active', Id: '' }]);
              }}
            >
              Thêm series mới
            </button>
            <DataTable
              className="max-h-[250px]"
              columnAction={true}
              columns={[
                {
                  title: 'Tên series',
                  key: 'SeriesName',
                  render: (value, _, index) => (
                    <input
                      type="text"
                      placeholder="Nhập tên series"
                      className="input w-full"
                      value={value}
                      onChange={(e) => handleUpdateCell(index, 'SeriesName', e.target.value)}
                    />
                  ),
                },
                {
                  title: 'Trạng thái',
                  key: 'Status',
                  render: (value, _, index) => (
                    <select
                      className="select"
                      value={value}
                      onChange={(e) => handleUpdateCell(index, 'Status', e.target.value)}
                    >
                      <option value="Active">Hoạt động</option>
                      <option value="Inactive">Vô hiệu</option>
                    </select>
                  ),
                },
              ]}
              data={seriesData}
              onRowDelete={async (_, index) => {
                if (seriesData[index].Id) {
                  const data = await getProductsBySeriesMutation.mutateAsync(seriesData[index].Id);
                  if (data.length > 0) {
                    toast({
                      type: 'error',
                      message: 'Không thể xoá series này vì có sản phẩm liên kết!',
                    });
                    return;
                  } else {
                    setListSeriesDelete((prev) => [...prev, seriesData[index].Id]);
                  }
                }

                setSeriesData((prev) => {
                  const newData = [...prev];
                  newData.splice(index, 1);
                  return newData;
                });
              }}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
