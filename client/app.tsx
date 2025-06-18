import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './providers/ToastProvider';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './features/manager/dashboard/pages/Dashboard';
import UserManager from './features/manager/user/pages/UserManager';

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="user" element={<UserManager />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}
