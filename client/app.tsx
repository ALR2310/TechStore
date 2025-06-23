import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './providers/ToastProvider';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './features/manager/dashboard/pages/Dashboard';
import UserManager from './features/manager/user/pages/UserManager';
import ProductManager from './features/manager/product/pages/ProductManager';
import { ConfirmProvider } from './providers/ConfirmProvider';

export default function App() {
  return (
    <ConfirmProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="user" element={<UserManager />} />
              <Route path="product" element={<ProductManager />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </ConfirmProvider>
  );
}
