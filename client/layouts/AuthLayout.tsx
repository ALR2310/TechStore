import { Outlet } from 'react-router-dom';
import background from '~/assets/imgs/background.jpg';

export default function AuthLayout() {
  return (
    <div
      className="relative flex justify-center items-center bg-cover bg-center w-full h-screen"
      style={{ backgroundImage: `url(${background})` }}
    >
      <Outlet />
    </div>
  );
}
