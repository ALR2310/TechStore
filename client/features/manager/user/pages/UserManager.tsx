import { useMutation, useQuery } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import DataTable from '~/components/DataTable';
import Filter from '~/components/Filter';
import { deleteUser, getListUser, getUser } from '../api/UserApi';
import dayjs from 'dayjs';
import { toast } from '~/hooks/useToast';
import { confirm } from '~/hooks/useConfirm';
import { UserUpdateModal } from './UserUpdateModal';
import { useDebounce } from '~/hooks/useDebounce';
import { useMinimumLoading } from '~/hooks/useMinimumLoading';

export default function UserManager() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [filters, setFilters] = useState<Record<string, any>>();
  const dbFilters = useDebounce(filters, 300);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined);
  const modalRef = useRef<HTMLDialogElement>(null);

  const usersQuery = useQuery({
    queryKey: ['users', page, limit, sortBy, sortDir, dbFilters],
    queryFn: () =>
      getListUser({
        page: page,
        limit: limit,
        sortBy: sortBy,
        sortDir: sortDir,
        keyword: dbFilters?.keyword,
        status: dbFilters?.status,
        role: dbFilters?.role,
      }),
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => deleteUser({ id: userId }),
    onSuccess: () => {
      usersQuery.refetch();
      toast({ type: 'success', message: 'Xoá người dùng thành công!' });
    },
  });

  const userDetailMutation = useMutation({
    mutationFn: async (userId: string) => getUser({ id: userId }),
  });

  return (
    <div className="flex-1 p-4 flex flex-col">
      <h1 className="text-2xl font-bold mb-4">Quản lý người dùng</h1>

      <Filter
        className="bg-base-100 rounded-2xl mb-8 border border-base-300"
        grid={3}
        filters={[
          { key: 'keyword', label: 'Tìm kiếm', type: 'text', placeholder: 'Nhập từ khoá tìm kiếm' },
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
            key: 'role',
            label: 'Vai trò',
            type: 'select',
            options: [
              { label: 'Quản trị viên', value: 'Admin' },
              { label: 'Người dùng', value: 'User' },
            ],
          },
        ]}
        values={filters}
        onChange={(key, value) => {
          setFilters((prev) => ({
            ...prev,
            [key]: value,
          }));
          setPage(1);
        }}
      />

      <DataTable
        className="flex-1 bg-base-100 p-3 rounded-2xl border border-base-300"
        columnAction={true}
        loading={useMinimumLoading(usersQuery.isLoading, 300)}
        type="zebra"
        columns={[
          { title: 'ID', key: 'Id', sortable: true },
          { title: 'Tên người dùng', key: 'FullName', sortable: true },
          {
            title: 'Email',
            key: 'Email',
            render: (value) => <span className="text-primary">{value}</span>,
            sortable: true,
          },
          { title: 'Số điện thoại', key: 'PhoneNumber', sortable: true },
          { title: 'Ngày sinh', key: 'DoB', sortable: true, render: (value) => dayjs(value).format('DD/MM/YYYY') },
          {
            title: 'Vai trò',
            key: 'Role',
            render: (value) => (
              <span className={`font-semibold ${value === 'Admin' ? 'text-secondary' : ''}`}>
                {value === 'Admin' ? 'Quản trị viên' : 'Người dùng'}
              </span>
            ),
            sortable: true,
          },
          {
            title: 'Trạng thái',
            key: 'Status',
            render: (value) => (
              <span className={`font-semibold ${value === 'Active' ? 'text-success' : 'text-error'}`}>
                {value === 'Active' ? 'Hoạt động' : 'Vô hiệu'}
              </span>
            ),
            sortable: true,
          },
          {
            title: 'Cập nhật lần cuối',
            key: 'updatedAt',
            render: (value) => dayjs(value).format('DD/MM/YYYY HH:mm:ss'),
            sortable: true,
          },
        ]}
        data={usersQuery.data?.data ?? []}
        pagination={{
          size: [10, 20, 50],
          page: page,
          limit: limit,
          total: usersQuery.data?.pagination.total ?? 0,
        }}
        onRowDelete={async (row) => {
          const user = await userDetailMutation.mutateAsync(row.Id);

          confirm({
            title: 'Xoá người dùng',
            content: (
              <div className="font-semibold">
                Bạn có chắc muốn xoá người dùng <span className="text-error">{user.FullName}</span> không?
                <br />
                Hành động này sẽ không thể hoàn tác và sẽ xoá tất cả dữ liệu liên quan đến người dùng này, bao gồm:
                <ul className="list-disc ml-5 mt-2">
                  <li>
                    Giỏ hàng: (<span className="text-warning">{user.carts.length}</span>)
                  </li>
                  <li>
                    Đơn hàng: (<span className="text-warning">{user.orders.length}</span>)
                  </li>
                  <li>
                    Đánh giá: (<span className="text-warning">{user.reviews.length}</span>)
                  </li>
                </ul>
              </div>
            ),
            btnCancel: { text: 'Huỷ' },
            btnOk: {
              color: 'error',
              text: 'Xoá',
              onClick: async () => {
                deleteUserMutation.mutate(row.Id);
              },
            },
          });
        }}
        onPageChange={(newPage) => {
          setPage(newPage);
        }}
        onSortChange={(sortBy, sortDir) => {
          setSortBy(sortBy);
          setSortDir(sortDir === 'asc' ? 'asc' : 'desc');
        }}
        onLimitChange={(newLimit) => {
          setLimit(newLimit);
        }}
        onRowClick={async (row) => {
          setCurrentUserId(row.Id);
          modalRef.current?.showModal();
        }}
      />

      {currentUserId && <UserUpdateModal modalRef={modalRef} userId={currentUserId} />}
    </div>
  );
}
