import { useState } from 'react';
import DataTable from '~/components/DataTable';

const initialUsers = [
  {
    id: 1,
    avatar: 'https://i.pravatar.cc/40?img=3',
    name: 'Alice Nguyen',
    email: 'alice@example.com',
    role: 'Admin',
    createdAt: '2025-01-10',
  },
  {
    id: 2,
    avatar: 'https://i.pravatar.cc/40?img=5',
    name: 'Bob Tran',
    email: 'bob@example.com',
    role: 'User',
    createdAt: '2025-02-15',
  },
  {
    id: 3,
    avatar: 'https://i.pravatar.cc/40?img=12',
    name: 'Chau Le',
    email: 'chau@example.com',
    role: 'Editor',
    createdAt: '2025-03-05',
  },
  {
    id: 4,
    avatar: 'https://i.pravatar.cc/40?img=8',
    name: 'Duy Pham',
    email: 'duy@example.com',
    role: 'User',
    createdAt: '2025-04-20',
  },
];

export default function UserManager() {
  const [users, _setUsers] = useState(initialUsers);
  const [page, setPage] = useState(1);

  return (
    <div className="flex-1 p-4 flex flex-col">
      <h1 className="text-2xl font-bold mb-4">Quản lý người dùng</h1>

      <DataTable
        className="flex-1 bg-base-100 p-3 rounded-2xl"
        columns={[
          { title: 'ID', key: 'id', sortable: true },
          {
            title: 'Avatar',
            key: 'avatar',
            sortable: true,
            render: (value) => <img src={value} className="w-10 h-10 rounded-full" />,
          },
          { title: 'Name', key: 'name', sortable: true },
          { title: 'Email', key: 'email', sortable: true },
          { title: 'Role', key: 'role', sortable: true },
          { title: 'Created At', key: 'createdAt', sortable: true },
        ]}
        data={users}
        type="zebra"
        onRowDelete={(row) => {
          console.log('Delete user:', row);
        }}
        pagination={{
          size: [10, 20, 50],
          page: page,
          limit: 10,
          total: 100,
        }}
        onPageChange={(newPage) => {
          setPage(newPage);
        }}
      />
    </div>
  );
}
