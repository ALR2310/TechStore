import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AdminSidebar from '~/components/layouts/AdminSidebar';
import { checkLogin } from '~/features/auth/authApi';
import { toast } from '~/hooks/useToast';

export default function AdminLayout() {
  const navigate = useNavigate();

  const checkLoginQuery = useQuery({
    queryKey: ['checkLogin'],
    queryFn: () => checkLogin(),
    retry: false,
  });

  useEffect(() => {
    if (checkLoginQuery.isError) {
      toast({
        type: 'error',
        message: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại',
      });
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

  console.log(checkLoginQuery.data);

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
