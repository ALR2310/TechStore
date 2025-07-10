import { StatisticData } from '../data/mockData';

interface StatisticTablesProps {
  data: StatisticData;
}

export default function StatisticTables({ data }: StatisticTablesProps) {
  const formatCurrency = (value: number) => {
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B ₫`;
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M ₫`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K ₫`;
    return `${value.toLocaleString('vi-VN')} ₫`;
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Top Products Table */}
      <div className="card bg-base-100 shadow p-4">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <i className="fa-regular fa-trophy text-warning"></i>
          Top sản phẩm bán chạy
        </h3>
        <div className="overflow-x-auto">
          <table className="table table-zebra">
            <thead>
              <tr>
                <th>#</th>
                <th>Sản phẩm</th>
                <th>Đã bán</th>
                <th>Doanh thu</th>
              </tr>
            </thead>
            <tbody>
              {data.topProducts.map((product, index) => (
                <tr key={index}>
                  <td>
                    <div className="flex items-center gap-2">
                      {index + 1}
                      {index === 0 && <i className="fa-solid fa-crown text-warning text-sm"></i>}
                    </div>
                  </td>
                  <td>
                    <div className="font-medium">{product.name}</div>
                  </td>
                  <td>
                    <div className="badge badge-primary">{product.sold.toLocaleString('vi-VN')}</div>
                  </td>
                  <td>
                    <div className="font-medium text-success">
                      {formatCurrency(product.revenue)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Categories Performance Table */}
      <div className="card bg-base-100 shadow p-4">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <i className="fa-regular fa-chart-pie text-info"></i>
          Hiệu suất danh mục
        </h3>
        <div className="overflow-x-auto">
          <table className="table table-zebra">
            <thead>
              <tr>
                <th>Danh mục</th>
                <th>Tỷ lệ</th>
                <th>Hiệu suất</th>
              </tr>
            </thead>
            <tbody>
              {data.categories.map((category, index) => (
                <tr key={index}>
                  <td>
                    <div className="font-medium">{category.name}</div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="badge badge-outline">{category.percentage}%</div>
                      <progress 
                        className="progress progress-primary w-16" 
                        value={category.percentage} 
                        max="100"
                      ></progress>
                    </div>
                  </td>
                  <td>
                    <div className={`badge ${
                      category.percentage >= 40 ? 'badge-success' :
                      category.percentage >= 20 ? 'badge-warning' : 'badge-error'
                    }`}>
                      {category.percentage >= 40 ? 'Xuất sắc' :
                       category.percentage >= 20 ? 'Tốt' : 'Cần cải thiện'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Status Table */}
      <div className="card bg-base-100 shadow p-4">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <i className="fa-regular fa-list-check text-success"></i>
          Trạng thái đơn hàng
        </h3>
        <div className="overflow-x-auto">
          <table className="table table-zebra">
            <thead>
              <tr>
                <th>Trạng thái</th>
                <th>Số lượng</th>
                <th>Tỷ lệ</th>
                <th>Xu hướng</th>
              </tr>
            </thead>
            <tbody>
              {data.orderStatus.map((status, index) => (
                <tr key={index}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: status.color }}
                      ></div>
                      <span className="font-medium">{status.name}</span>
                    </div>
                  </td>
                  <td>
                    <div className="badge badge-outline">{status.value}%</div>
                  </td>
                  <td>
                    <progress 
                      className="progress w-20" 
                      style={{ color: status.color }}
                      value={status.value} 
                      max="100"
                    ></progress>
                  </td>
                  <td>
                    <div className={`badge ${
                      status.name === 'Hoàn thành' ? 'badge-success' :
                      status.name === 'Đang xử lý' ? 'badge-warning' :
                      status.name === 'Đã hủy' ? 'badge-error' : 'badge-info'
                    }`}>
                      {status.name === 'Hoàn thành' ? '↗ Tăng' :
                       status.name === 'Đang xử lý' ? '→ Ổn định' :
                       status.name === 'Đã hủy' ? '↘ Giảm' : '→ Ổn định'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Stats Card */}
      <div className="card bg-base-100 shadow p-4">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <i className="fa-regular fa-bolt text-warning"></i>
          Thống kê nhanh
        </h3>
        <div className="space-y-4">
          <div className="stat">
            <div className="stat-title">Sản phẩm bán chạy nhất</div>
            <div className="stat-value text-lg text-primary">
              {data.topProducts[0]?.name || 'N/A'}
            </div>
            <div className="stat-desc">
              {data.topProducts[0]?.sold.toLocaleString('vi-VN')} sản phẩm đã bán
            </div>
          </div>
          
          <div className="stat">
            <div className="stat-title">Danh mục hàng đầu</div>
            <div className="stat-value text-lg text-success">
              {data.categories[0]?.name || 'N/A'}
            </div>
            <div className="stat-desc">
              {data.categories[0]?.percentage}% tổng doanh số
            </div>
          </div>

          <div className="stat">
            <div className="stat-title">Tỷ lệ hoàn thành đơn hàng</div>
            <div className="stat-value text-lg text-info">
              {data.orderStatus.find(s => s.name === 'Hoàn thành')?.value || 0}%
            </div>
            <div className="stat-desc">
              Tăng 5% so với kỳ trước
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
