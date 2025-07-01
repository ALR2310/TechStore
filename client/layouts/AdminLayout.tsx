import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AdminSidebar from '~/components/layouts/AdminSidebar';
import { checkLogin } from '~/features/auth/authApi';
import { toast } from '~/hooks/useToast';

export default function AdminLayout() {
  const navigate = useNavigate();

  const checkLoginQuery = useQuery({
    queryKey: ['checkLogin1'],
    queryFn: () => checkLogin(),
    retry: false,
  });

  useEffect(() => {
    if (checkLoginQuery.isError) {
      navigate('/login');
    }

    if (checkLoginQuery.data?.Role === 'User') {
      toast({
        type: 'error',
        message: 'Bạn không có quyền truy cập vào trang này',
      });
      navigate('/login');
    }
  }, [checkLoginQuery]);

  return (
    checkLoginQuery.isSuccess && (
      <div>
        <AdminSidebar>
          <main className={`min-h-[calc(100vh-100px)] flex flex-col`}>
            <Outlet />
          </main>
        </AdminSidebar>
      </div>
    )
  );
}
