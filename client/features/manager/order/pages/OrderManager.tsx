import { useMutation, useQuery } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import DataTable from '~/components/DataTable';
import Filter from '~/components/Filter';
import { useDebounce } from '~/hooks/useDebounce';
import { approveOrder, getListOrder } from '../orderApi';
import { useMinimumLoading } from '~/hooks/useMinimumLoading';
import dayjs from 'dayjs';
import Modal from '~/components/Modal';
import { toast } from '~/hooks/useToast';
import { approveOrderParams } from '@shared/types/order.type';

const orderStatusMap = {
  class: {
    Processing: 'text-warning',
    Delivering: 'text-info',
    Completed: 'text-success',
    Cancelled: 'text-error',
  },
  text: {
    Processing: 'Đang chờ xử lý',
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
  const modalRef = useRef<HTMLDialogElement>(null);
  const [currentOrderData, setCurrentOrderData] = useState<any>(null);

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

  const approveOrderMutation = useMutation({
    mutationFn: (payload: approveOrderParams) => approveOrder(payload),
    onSuccess: () => {
      ordersQuery.refetch();
    },
    onError: (error) => {
      console.log(error);
      toast({ message: `Lỗi khi duyệt đơn hàng`, type: 'error' });
    },
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
            title: 'Số điện thoại',
            key: 'PhoneNumber',
            sortable: true,
          },
          {
            title: 'SL',
            key: 'Items',
            sortable: true,
            render: (items) => <span className="text-primary font-semibold">{items.length}</span>,
          },
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
            render: (value) => (
              <span className={`font-semibold ${orderStatusMap.class[value]}`}>{orderStatusMap.text[value]}</span>
            ),
          },
          {
            title: 'Ngày tạo',
            key: 'createdAt',
            sortable: true,
            render: (value) => dayjs(value).format('DD/MM/YYYY'),
          },
          {
            title: 'Ngày xử lý',
            key: 'updatedAt',
            sortable: true,
            render: (value) => dayjs(value).format('DD/MM/YYYY'),
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
        onRowClick={(row) => {
          setCurrentOrderData(row);
          modalRef.current?.showModal();
        }}
      />

      <Modal
        ref={modalRef}
        title="Chi tiết đơn hàng"
        width="800px"
        backdropClose={true}
        iconClose={true}
        btnShow={false}
      >
        {currentOrderData && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <p>
                Trạng thái:{' '}
                <span className={`${orderStatusMap.class[currentOrderData.Status]}`}>
                  {orderStatusMap.text[currentOrderData.Status]}
                </span>
              </p>
              <p>Ngày tạo đơn: {dayjs(currentOrderData.createdAt).format('DD/MM/YYYY HH:mm:ss')}</p>
            </div>
            <div className="rounded-lg bg-base-200 p-3 flex gap-4">
              <div className="flex-1 font-semibold">
                <p>
                  Mã đơn: <span className="text-info">{currentOrderData.Code}</span>
                </p>
                <p>
                  Khách hàng: <span className="text-primary">{currentOrderData.FullName}</span>
                </p>
                <p>Số điện thoại: {currentOrderData.PhoneNumber}</p>
              </div>

              <div className="flex-[2] font-semibold">
                <p>Địa chỉ: {currentOrderData.AddressLine}</p>
                <p>Loại địa chỉ: {currentOrderData.AddressType}</p>
              </div>
            </div>
            <p className="font-semibold text-lg">Sản phẩm:</p>
            <DataTable
              className="max-h-[300px]"
              columns={[
                {
                  title: '',
                  key: 'Image',
                  render: (value) => (
                    <img
                      src={`http://localhost:4850/${value}`}
                      alt="Product"
                      className="w-20 h-20 object-cover rounded-md"
                    />
                  ),
                },
                {
                  title: 'Tên sản phẩm',
                  key: 'ProdName',
                  render: (value, row) => (
                    <div className="font-semibold">
                      <p className="text-primary text-lg">{value}</p>
                      <p className="text-base-content/60 text-sm">
                        Danh mục: {row.Category} - Thương hiệu: {row.Brand} {row.Series && `- Dòng: ${row.Series}`}
                      </p>
                    </div>
                  ),
                },
                {
                  title: 'Giá',
                  key: 'Price',
                  render: (value, row) => (
                    <div className="font-semibold text-lg">
                      <p className="text-success text-nowrap">{value.toLocaleString('vi-VN')} đ</p>
                      <p>Số lượng: {row.Quantity}</p>
                    </div>
                  ),
                },
              ]}
              data={currentOrderData.Items ?? []}
            />
            <p className="text-info font-semibold text-lg text-end">
              Tổng đơn: {currentOrderData.TotalPrice.toLocaleString('vi-VN')} đ
            </p>

            <div className="flex justify-end w-full gap-4">
              <button className="btn btn-soft w-36" onClick={() => modalRef.current?.close()}>
                Đóng
              </button>
              {currentOrderData.Status === 'Processing' ? (
                <>
                  <button
                    className="btn btn-error w-36"
                    onClick={() => {
                      approveOrderMutation.mutateAsync({
                        id: currentOrderData.Id,
                        status: 'Cancelled',
                      });
                      modalRef.current?.close();
                      toast({ message: 'Đã huỷ đơn hàng thành công', type: 'success' });
                    }}
                  >
                    Huỷ đơn hàng
                  </button>
                  <button
                    className="btn btn-success w-36"
                    onClick={() => {
                      approveOrderMutation.mutateAsync({
                        id: currentOrderData.Id,
                        status: 'Delivering',
                      });
                      modalRef.current?.close();
                      toast({ message: 'Duyệt đơn hàng thành công', type: 'success' });
                    }}
                  >
                    Duyệt đơn hàng
                  </button>
                </>
              ) : currentOrderData.Status === 'Delivering' ? (
                <button
                  className="btn btn-success w-36"
                  onClick={() => {
                    approveOrderMutation.mutateAsync({
                      id: currentOrderData.Id,
                      status: 'Completed',
                    });
                    modalRef.current?.close();
                    toast({ message: 'Xác nhận đã giao hàng thành công', type: 'success' });
                  }}
                >
                  Xác nhận đã giao
                </button>
              ) : null}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
