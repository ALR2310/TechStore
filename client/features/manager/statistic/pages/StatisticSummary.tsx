import { StatisticData } from '../data/mockData';
import { TimeRange } from './StatisticManager';

interface StatisticSummaryProps {
  data: StatisticData;
  timeRange: TimeRange;
}

export default function StatisticSummary({ data, timeRange }: StatisticSummaryProps) {
  // Tính toán các chỉ số tổng quan
  const totalRevenue = data.revenue.reduce((sum, item) => sum + item.value, 0);
  const totalOrders = data.orders.reduce((sum, item) => sum + item.value, 0);
  const totalUsers = data.users.reduce((sum, item) => sum + item.value, 0);
  const totalProducts = data.products.reduce((sum, item) => sum + item.value, 0);

  // Tính toán tăng trưởng (so sánh với kỳ trước)
  const calculateGrowth = (dataArray: Array<{ value: number }>) => {
    if (dataArray.length < 2) return { value: 0, type: 'neutral' as const };
    
    const current = dataArray[dataArray.length - 1].value;
    const previous = dataArray[dataArray.length - 2].value;
    
    if (previous === 0) return { value: 0, type: 'neutral' as const };
    
    const growth = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(growth),
      type: growth > 0 ? 'up' as const : growth < 0 ? 'down' as const : 'neutral' as const
    };
  };

  const revenueGrowth = calculateGrowth(data.revenue);
  const ordersGrowth = calculateGrowth(data.orders);
  const usersGrowth = calculateGrowth(data.users);
  const productsGrowth = calculateGrowth(data.products);

  const formatValue = (value: number, type: 'currency' | 'number') => {
    if (type === 'currency') {
      if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B ₫`;
      if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M ₋`;
      if (value >= 1000) return `${(value / 1000).toFixed(1)}K ₫`;
      return `${value.toLocaleString('vi-VN')} ₫`;
    }
    return value.toLocaleString('vi-VN');
  };

  const getGrowthText = (growth: { value: number; type: 'up' | 'down' | 'neutral' }, timeRange: TimeRange) => {
    const period = timeRange === 'day' ? 'ngày trước' : timeRange === 'month' ? 'tháng trước' : 'năm trước';
    if (growth.type === 'neutral') return `Không đổi so với ${period}`;
    const direction = growth.type === 'up' ? 'tăng' : 'giảm';
    return `${direction} ${growth.value.toFixed(1)}% so với ${period}`;
  };

  const getGrowthIcon = (type: 'up' | 'down' | 'neutral') => {
    switch (type) {
      case 'up': return 'fa-arrow-trend-up text-success';
      case 'down': return 'fa-arrow-trend-down text-error';
      default: return 'fa-minus text-base-content';
    }
  };

  const stats = [
    {
      title: 'Tổng doanh thu',
      value: formatValue(totalRevenue, 'currency'),
      growth: revenueGrowth,
      icon: 'fa-chart-line-up',
      color: 'text-primary'
    },
    {
      title: 'Tổng đơn hàng',
      value: formatValue(totalOrders, 'number'),
      growth: ordersGrowth,
      icon: 'fa-shopping-cart',
      color: 'text-success'
    },
    {
      title: 'Người dùng mới',
      value: formatValue(totalUsers, 'number'),
      growth: usersGrowth,
      icon: 'fa-users',
      color: 'text-info'
    },
    {
      title: 'Sản phẩm mới',
      value: formatValue(totalProducts, 'number'),
      growth: productsGrowth,
      icon: 'fa-box',
      color: 'text-warning'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <div key={index} className="stats shadow bg-base-100">
          <div className="stat">
            <div className="stat-figure">
              <i className={`fa-regular ${stat.icon} text-2xl ${stat.color}`}></i>
            </div>
            <div className="stat-title">{stat.title}</div>
            <div className="stat-value text-lg">{stat.value}</div>
            <div className="stat-desc flex items-center gap-1">
              <i className={`fa-regular ${getGrowthIcon(stat.growth.type)} text-sm`}></i>
              <span className={stat.growth.type === 'up' ? 'text-success' : stat.growth.type === 'down' ? 'text-error' : ''}>
                {getGrowthText(stat.growth, timeRange)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
