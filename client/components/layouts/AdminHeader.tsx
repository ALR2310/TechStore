export default function AdminHeader() {
  return (
    <div className="navbar bg-base-100 shadow-sm">
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
  );
}
