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
                    <div className="font-medium text-success">{formatCurrency(product.revenue)}</div>
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
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: status.color }}></div>
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
                    <div
                      className={`badge ${
                        status.name === 'Hoàn thành'
                          ? 'badge-success'
                          : status.name === 'Đang xử lý'
                          ? 'badge-warning'
                          : status.name === 'Đã hủy'
                          ? 'badge-error'
                          : 'badge-info'
                      }`}
                    >
                      {status.name === 'Hoàn thành'
                        ? '↗ Tăng'
                        : status.name === 'Đang xử lý'
                        ? '→ Ổn định'
                        : status.name === 'Đã hủy'
                        ? '↘ Giảm'
                        : '→ Ổn định'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
