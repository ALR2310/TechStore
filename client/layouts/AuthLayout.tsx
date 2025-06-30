import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import background from '~/assets/imgs/background.jpg';
import { checkLogin } from '~/features/auth/authApi';

export default function AuthLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const checkLoginQuery = useQuery({
    queryKey: ['checkLogin'],
    queryFn: () => checkLogin(),
    retry: false,
  });

  useEffect(() => {
    if (checkLoginQuery.isError) {
      localStorage.removeItem('user');
    }

    if (location.pathname === '/login' && checkLoginQuery.isSuccess && checkLoginQuery.data?.Role !== 'User') {
      navigate('/admin');
    }
  }, [checkLoginQuery, location.pathname]);

  return (
    <div
      className="relative flex justify-center items-center bg-cover bg-center w-full h-screen"
      style={{ backgroundImage: `url(${background})` }}
    >
      <Outlet />
    </div>
  );
}
