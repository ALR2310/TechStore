import { useQueries, useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { getProduct } from '../api/productApi';
import CkEditor from '~/components/Ckeditor';
import { useEffect, useState } from 'react';
import { formatToSlug, parseSpecs } from '@shared/utils/general.utils';
import { getListCategory } from '../../category/api/categoryApi';
import { getListBrand } from '../../brand/api/brandApi';

export default function ProductCreateOrUpdate() {
  const { id } = useParams();
  const [prodName, setProductName] = useState('');
  const [prodSlug, setProductSlug] = useState('');
  const [cateId, setCateId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [seriesId, setSeriesId] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [quantity, setQuantity] = useState(0);
  const [price, setPrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [content, setContent] = useState('');
  const [deviceConfigs, setDeviceConfigs] = useState<[string, string][]>([]);

  const productQuery = useQuery({
    queryKey: ['product', id],
    queryFn: async () => getProduct(id!),
    enabled: !!id,
  });

  const [categoriesQuery, brandsQuery] = useQueries({
    queries: [
      {
        queryKey: ['categories'],
        queryFn: () => getListCategory({ limit: 100 }),
      },
      {
        queryKey: ['brands'],
        queryFn: () => getListBrand({ limit: 100 }),
      },
    ],
  });

  useEffect(() => {
    setProductName(productQuery.data?.Name || '');
    setProductSlug(productQuery.data?.Slugs || '');
    setCateId(productQuery.data?.CateId || '');
    setBrandId(productQuery.data?.BrandId || '');
    setSeriesId(productQuery.data?.SeriesId || '');
    setQuantity(productQuery.data?.Quantity || 0);
    setPrice(productQuery.data?.Price || 0);
    setDiscount(productQuery.data?.Discount || 0);
    setStatus(productQuery.data?.Status || 'Active');
    setContent(productQuery.data?.Content || '');
    setDeviceConfigs(parseSpecs(productQuery.data?.DeviceCfg || ''));
  }, [productQuery.data]);

  const selectedBrand = brandsQuery.data?.data.find((b: any) => b.Id === Number(brandId));
  const seriesOptions = selectedBrand?.Series ?? [];

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
          <div className="grid grid-cols-3 gap-4">
            <label className="floating-label col-span-2">
              <span>Tên sản phẩm</span>
              <input
                type="text"
                className="input w-full"
                placeholder="Nhập tên sản phẩm"
                value={prodName}
                onChange={(e) => {
                  setProductName(e.target.value);
                  setProductSlug(formatToSlug(e.target.value));
                }}
              />
            </label>

            <label className="floating-label">
              <span>Số lượng</span>
              <input
                type="text"
                className="input w-full"
                placeholder="Nhập số lượng"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
            </label>

            <label className="floating-label">
              <span>Thương hiệu</span>
              <select className="select" onChange={(e) => setBrandId(e.target.value)} value={brandId}>
                <option value="">Chọn thương hiệu</option>
                {brandsQuery.data?.data.map((brand: any) => (
                  <option key={brand.Id} value={brand.Id}>
                    {brand.BrandName}
                  </option>
                ))}
              </select>
            </label>

            <label className="floating-label">
              <span>Dòng thương hiệu</span>
              <select
                className="select"
                onChange={(e) => setSeriesId(e.target.value)}
                value={seriesId}
                disabled={!brandId}
              >
                <option value="">Chọn dòng thương hiệu</option>
                {seriesOptions.map((series: any) => (
                  <option key={series.Id} value={series.Id}>
                    {series.SeriesName}
                  </option>
                ))}
              </select>
            </label>

            <label className="floating-label">
              <span>Danh mục</span>
              <select className="select" onChange={(e) => setCateId(e.target.value)} value={cateId}>
                <option value="">Chọn danh mục</option>
                {categoriesQuery.data?.data.map((category: any) => (
                  <option key={category.Id} value={category.Id}>
                    {category.CateName}
                  </option>
                ))}
              </select>
            </label>

            <label className="floating-label">
              <span>Giảm giá</span>
              <input
                type="text"
                className="input w-full"
                placeholder="Nhập giảm giá"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
              />
            </label>

            <label className="floating-label">
              <span>Giá</span>
              <input
                type="text"
                className="input w-full"
                placeholder="Nhập giá"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
              />
            </label>

            <label className="floating-label">
              <span>Trạng thái</span>
              <select
                className="select"
                onChange={(e) => setStatus(e.target.value as 'Active' | 'Inactive')}
                value={status}
              >
                <option value="Active">Hoạt động</option>
                <option value="Inactive">Vô hiệu</option>
              </select>
            </label>

            <label className="input col-span-3 w-full">
              <span className="label">https://localhost:4850/san-pham/</span>
              <input type="text" placeholder="URL" value={prodSlug} onChange={(e) => setProductSlug(e.target.value)} />
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
                  {deviceConfigs.map(([key, value], index) => (
                    <tr key={index}>
                      <td>{key}</td>
                      <td>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="flex-[1.5] bg-base-100 p-3 rounded-2xl border border-base-300 space-y-4">
          <p className="font-semibold text-lg">Mô tả sản phẩm:</p>
          <div className="input-editor overflow-auto h-[94%] max-h-[500px]" tabIndex={0}>
            {productQuery.isSuccess && <CkEditor content={productQuery.data?.Content || ''} />}
          </div>
        </div>
      </div>
    </div>
  );
}
