import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from '~/hooks/useToast';
import { login } from '../authApi';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const logionMutation = useMutation({
    mutationFn: () => login({}),
  });

  return (
    <form className="relative z-10 flex flex-col justify-center items-center p-8 mb-20 shadow-xl rounded-box space-y-4 bg-base-200/90 w-[370px] backdrop-blur-sm">
      <div className="flex flex-col items-center gap-2">
        <p className="text-3xl font-bold text-center text-primary">Đăng Nhập</p>
      </div>

      <div className="space-y-2 w-full">
        <label className="label">Tên đăng nhập</label>
        <label className="input validator flex items-center gap-2">
          <i className="fa fa-user text-base-content/60" />
          <input
            type="text"
            placeholder="example@gmail.com"
            className="grow"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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

      <div className="w-full flex justify-between items-center">
        <label className="label">
          <input type="checkbox" className="checkbox" />
          Remember me
        </label>

        <Link
          to={''}
          onClick={() => toast({ type: 'info', message: 'Chức năng này đang được phát triển' })}
          className="link link-hover text-sm text-primary/80"
        >
          Quên mật khẩu?
        </Link>
      </div>

      <div className="flex w-full gap-3">
        <Link to={'/register'} className="btn btn-soft btn-accent flex-1">
          Đăng ký
        </Link>
        <button className="btn btn-primary flex-2" disabled={logionMutation.isPending} type="submit">
          {logionMutation.isPending ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              Đang đăng nhập...
            </>
          ) : (
            'Đăng Nhập'
          )}
        </button>
      </div>
    </form>
  );
}
