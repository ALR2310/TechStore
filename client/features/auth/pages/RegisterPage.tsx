import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  return (
    <form className="relative z-10 flex flex-col justify-center items-center p-8 mb-20 shadow-xl rounded-box space-y-4 bg-base-200/90 w-[370px] backdrop-blur-sm">
      <div className="flex flex-col items-center gap-2">
        <p className="text-3xl font-bold text-center text-primary">Đăng Ký</p>
      </div>

      <div className="space-y-2 w-full">
        <label className="label">Tên đăng nhập</label>
        <label className="input validator flex items-center gap-2">
          <i className="fa fa-user text-base-content/60" />
          <input
            type="text"
            placeholder="Tên đăng nhập"
            className="grow"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </label>
      </div>

      <div className="space-y-2 w-full">
        <label className="label">Email</label>
        <label className="input validator flex items-center gap-2">
          <i className="fa fa-envelope text-base-content/60" />
          <input
            type="email"
            placeholder="example@gmail.com"
            className="grow"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
      </div>

      <div className="space-y-2 w-full">
        <label className="label">Mật khẩu</label>
        <label className="input validator flex items-center gap-2">
          <i className="fa fa-lock text-base-content/60" />
          <input
            type="password"
            placeholder="************"
            className="grow"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
      </div>

      <div className="space-y-2 w-full">
        <label className="label">Nhập lại mật khẩu</label>
        <label className="input validator flex items-center gap-2">
          <i className="fa fa-lock text-base-content/60" />
          <input
            type="password"
            placeholder="************"
            className="grow"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </label>
      </div>

      <div className="flex w-full gap-3">
        <Link to={'/login'} className="btn btn-soft btn-accent flex-1">
          Đăng nhập
        </Link>
        <button className="btn btn-primary flex-2" type="submit">
          Đăng Ký
        </button>
      </div>
    </form>
  );
}
