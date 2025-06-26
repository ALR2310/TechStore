import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { getProduct } from '../api/productApi';
import CkEditor from '~/components/Ckeditor';

export default function ProductCreateOrUpdate() {
  const { id } = useParams();

  const productQuery = useQuery({
    queryKey: ['product', id],
    queryFn: async () => getProduct(id!),
    enabled: !!id,
  });

  return (
    <div className="flex-1 p-4 flex flex-col">
      <div className="flex justify-between h-full">
        <h1 className="text-2xl font-bold mb-4">{id ? 'Cập nhật' : 'Thêm mới'} sản phẩm</h1>

        <div className="flex gap-4">
          <Link to={'/admin/product'} className="btn btn-soft btn-accent">
            Quay lại
          </Link>
          <button className="btn btn-success">Lưu lại</button>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <img
            src={`http://localhost:4850/${productQuery.data?.Image}`}
            alt={productQuery.data?.Name}
            className="rounded-2xl"
          />
        </div>

        <div className="flex-[4]">
          <div className=" grid grid-cols-3 gap-4">
            <label className="floating-label col-span-2">
              <span>Tên sản phẩm</span>
              <input type="text" className="input w-full" />
            </label>

            <label className="floating-label">
              <span>Số lượng</span>
              <input type="text" className="input w-full" />
            </label>

            <label className="floating-label">
              <span>Thương hiệu</span>
              <select className="select">
                <option value="">Chọn thương hiệu</option>
              </select>
            </label>

            <label className="floating-label">
              <span>Dòng thương hiệu</span>
              <select className="select">
                <option value="">Chọn dòng thương hiệu</option>
              </select>
            </label>

            <label className="floating-label">
              <span>Danh mục</span>
              <select className="select">
                <option value="">Chọn danh mục</option>
              </select>
            </label>

            <label className="floating-label">
              <span>Giảm giá</span>
              <input type="text" className="input w-full" />
            </label>

            <label className="floating-label">
              <span>Giá</span>
              <input type="text" className="input w-full" />
            </label>

            <label className="floating-label">
              <span>Trạng thái</span>
              <select className="select">
                <option value="Active">Hoạt động</option>
                <option value="Inactive">Vô hiệu</option>
              </select>
            </label>
          </div>
        </div>
      </div>

      <div className="flex gap-4 mt-4">
        <div className="flex-1 h-f">
          <div className="bg-base-100 p-3 rounded-2xl border border-base-300 space-y-4">
            <p className="font-semibold text-lg">Bảng cấu hình:</p>
            <div className="max-h-[500px] overflow-auto">
              <table className="table table-pin-rows table-zebra">
                <tbody>
                  {Array.from({ length: 20 }).map((_, index) => (
                    <tr key={index}>
                      <td>Thông tin {index + 1}</td>
                      <td>Giá trị {index + 1}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="flex-[2] bg-base-100 p-3 rounded-2xl border border-base-300 space-y-4">
          <p className="font-semibold text-lg">Mô tả sản phẩm:</p>
          <div className="input-editor overflow-auto h-[94%] max-h-[500px]" tabIndex={0}>
            {productQuery.isSuccess && <CkEditor content={productQuery.data?.Content || 'hello world'} />}
          </div>
        </div>
      </div>
    </div>
  );
}
