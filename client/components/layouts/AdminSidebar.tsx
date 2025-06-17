export default function AdminSidebar({ children }) {
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
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                <div className="w-10 rounded-full">
                  <img
                    loading="lazy"
                    alt="Tailwind CSS Navbar component"
                    src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                  />
                </div>
              </div>
              <ul tabIndex={0} className="menu dropdown-content bg-base-100 rounded-box w-40 z-1 mt-3 p-2 shadow">
                <li>
                  <a>Hồ sơ</a>
                </li>
                <li>
                  <a>Cài đặt</a>
                </li>
                <li>
                  <a>Đăng xuất</a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Nội dung chính */}
        <div className="p-4">{children}</div>
      </div>
      <div className="drawer-side">
        {/* Overlay khi bật Drawer */}
        <label htmlFor="sidebar-toggle" className="drawer-overlay"></label>
        <ul className="menu bg-base-100 text-base-content w-64 p-4 space-y-2 h-full">
          <li>
            <a href="#dashboard">Dashboard</a>
          </li>
          <li>
            <a href="#reports">Reports</a>
          </li>
          <li>
            <a href="#settings">Settings</a>
          </li>
          <li>
            <a href="#logout">Logout</a>
          </li>
        </ul>
      </div>
    </div>
  );
}
