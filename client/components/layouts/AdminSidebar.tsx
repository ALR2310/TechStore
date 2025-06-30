import { useMutation } from '@tanstack/react-query';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { logout } from '~/features/auth/authApi';

export default function AdminSidebar({ children }) {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const rootPath = pathSegments[0] || '';
  const lastPath = pathSegments[1] || '';
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const menuItems = [
    {
      name: 'Tổng quan',
      path: '/admin',
      icon: <i className="fa-regular fa-chart-line-up-down"></i>,
      isActive: rootPath === 'admin' && lastPath === '',
    },
    {
      name: 'Thống kê',
      path: '/admin/statistic',
      icon: <i className="fa-regular fa-chart-bar"></i>,
      isActive: rootPath === 'admin' && lastPath === 'statistic',
    },
    {
      name: 'Người dùng',
      path: '/admin/user',
      icon: <i className="fa-regular fa-users-gear"></i>,
      isActive: rootPath === 'admin' && lastPath === 'user',
    },
    {
      name: 'Sản phẩm',
      path: '/admin/product',
      icon: <i className="fa-regular fa-box"></i>,
      isActive: rootPath === 'admin' && lastPath === 'product',
    },
    {
      name: 'Đơn hàng',
      path: '/admin/order',
      icon: <i className="fa-regular fa-receipt"></i>,
      isActive: rootPath === 'admin' && lastPath === 'order',
    },
    {
      name: 'Đánh giá',
      path: '/admin/review',
      icon: <i className="fa-regular fa-star"></i>,
      isActive: rootPath === 'admin' && lastPath === 'review',
    },
    {
      name: 'Cài đặt',
      path: '/admin/settings',
      icon: <i className="fa-regular fa-gear"></i>,
      isActive: rootPath === 'admin' && lastPath === 'settings',
    },
    {
      name: 'Đăng xuất',
      path: '/logout',
      icon: <i className="fa-regular fa-right-from-bracket"></i>,
      isActive: rootPath === 'admin' && lastPath === 'logout',
      onClick: () => logoutMutation.mutate(),
    },
  ];

  const logoutMutation = useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      navigate('/login');
    },
    onError: () => {
      navigate('/login');
    },
  });

  return (
    <div className="drawer lg:drawer-open">
      <input id="sidebar-toggle" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col">
        {/* Navbar */}
        <div className="navbar bg-base-300 flex items-center px-4">
          <div className="lg:hidden">
            <label htmlFor="sidebar-toggle" className="btn btn-square btn-ghost">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="inline-block h-6 w-6 stroke-current"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </label>
          </div>

          <div className="flex-1">
            <label className="input">
              <i className="fa-regular fa-magnifying-glass"></i>
              <input type="search" className="grow" placeholder="Search..." />
            </label>
          </div>
          <div className="flex gap-2">
            <div className="dropdown dropdown-end">
              <div tabIndex={0} className="font-semibold">
                Xin chào, {user.fullName ? user.fullName : user.username}
              </div>
              <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
                <li>
                  <a onClick={() => logoutMutation.mutate()}>Đăng xuất</a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Nội dung chính */}
        <div className="p-4">{children}</div>
      </div>
      <div className="drawer-side">
        <label htmlFor="sidebar-toggle" className="drawer-overlay"></label>

        <div className="flex flex-col bg-base-100 h-full">
          <p className="text-2xl bg-base-100 font-semibold pt-4 px-4">TechStore</p>

          <div className="flex flex-col justify-between h-full">
            <ul className="menu text-base-content w-52 p-4 space-y-2">
              {menuItems.slice(0, -2).map((item: (typeof menuItems)[0]) => (
                <li key={item.path} className={`font-bold`}>
                  <Link to={item.path} className={`p-3 rounded-xl${item.isActive ? ' menu-focus' : ''}`}>
                    {item.icon}
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>

            <ul className="menu text-base-content w-52 p-4 space-y-2 border-t border-base-content/20">
              {menuItems.slice(-2).map((item: (typeof menuItems)[0]) => (
                <li key={item.path} className={`font-bold`}>
                  <a onClick={item.onClick} className={`p-3 rounded-xl${item.isActive ? ' menu-focus' : ''}`}>
                    {item.icon}
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
