import { Outlet } from 'react-router-dom';

export default function AdminLayout() {
  return (
    <div>
      {/* Header */}
      <div>
        <h1>Admin Dashboard</h1>
      </div>

      {/* Main Content */}
      <Outlet />

      {/* Footer */}
      <div>
        <p>© 2023 TechStore. All rights reserved.</p>
      </div>
    </div>
  );
}
