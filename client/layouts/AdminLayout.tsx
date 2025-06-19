import { Outlet } from 'react-router-dom';
import AdminSidebar from '~/components/layouts/AdminSidebar';

export default function AdminLayout() {
  return (
    <div>
      <AdminSidebar>
        {/* Content */}
        <main className={`min-h-[calc(100vh-100px)] flex flex-col`}>
          <Outlet />
        </main>
      </AdminSidebar>
    </div>
  );
}
