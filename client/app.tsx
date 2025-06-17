import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './providers/ToastProvider';
import AdminLayout from './layouts/AdminLayout';

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<div>Admin Dashboard</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}
