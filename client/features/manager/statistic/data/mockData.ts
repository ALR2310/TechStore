import { TimeRange } from '../pages/StatisticManager';

export interface StatisticData {
  revenue: Array<{ label: string; value: number }>;
  orders: Array<{ label: string; value: number }>;
  users: Array<{ label: string; value: number }>;
  products: Array<{ label: string; value: number }>;
  categories: Array<{ name: string; value: number; percentage: number }>;
  topProducts: Array<{ name: string; sold: number; revenue: number }>;
  userGrowth: Array<{ label: string; new: number; total: number }>;
  orderStatus: Array<{ name: string; value: number; color: string }>;
  monthlyComparison: Array<{ month: string; thisYear: number; lastYear: number }>;
  hourlyActivity: Array<{ hour: string; orders: number; views: number }>;
}

// Hàm tạo data ngẫu nhiên
const randomBetween = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// Tạo data cho từng loại thời gian
export function generateMockData(timeRange: TimeRange, year: number, month: number): StatisticData {
  const data: StatisticData = {
    revenue: [],
    orders: [],
    users: [],
    products: [],
    categories: [],
    topProducts: [],
    userGrowth: [],
    orderStatus: [],
    monthlyComparison: [],
    hourlyActivity: [],
  };

  // Tạo data theo ngày (30 ngày gần nhất)
  if (timeRange === 'day') {
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const label = `${date.getDate()}/${date.getMonth() + 1}`;
      
      data.revenue.push({ label, value: randomBetween(5000000, 20000000) });
      data.orders.push({ label, value: randomBetween(10, 50) });
      data.users.push({ label, value: randomBetween(5, 25) });
      data.products.push({ label, value: randomBetween(2, 8) });
    }
  }

  // Tạo data theo tháng (12 tháng)
  if (timeRange === 'month') {
    const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
    months.forEach((month, index) => {
      data.revenue.push({ label: month, value: randomBetween(100000000, 500000000) });
      data.orders.push({ label: month, value: randomBetween(200, 800) });
      data.users.push({ label: month, value: randomBetween(50, 200) });
      data.products.push({ label: month, value: randomBetween(10, 50) });
    });
  }

  // Tạo data theo năm (5 năm gần nhất)
  if (timeRange === 'year') {
    for (let i = 4; i >= 0; i--) {
      const yearLabel = (year - i).toString();
      data.revenue.push({ label: yearLabel, value: randomBetween(1000000000, 5000000000) });
      data.orders.push({ label: yearLabel, value: randomBetween(2000, 10000) });
      data.users.push({ label: yearLabel, value: randomBetween(500, 2000) });
      data.products.push({ label: yearLabel, value: randomBetween(100, 500) });
    }
  }

  // Data cho categories (không phụ thuộc timeRange)
  data.categories = [
    { name: 'Laptop', value: 45, percentage: 45 },
    { name: 'Điện thoại', value: 30, percentage: 30 },
    { name: 'Phụ kiện', value: 15, percentage: 15 },
    { name: 'Tablet', value: 10, percentage: 10 },
  ];

  // Top sản phẩm bán chạy
  data.topProducts = [
    { name: 'iPhone 15 Pro Max', sold: randomBetween(100, 300), revenue: randomBetween(500000000, 1000000000) },
    { name: 'MacBook Air M3', sold: randomBetween(80, 250), revenue: randomBetween(400000000, 800000000) },
    { name: 'Samsung Galaxy S24', sold: randomBetween(70, 200), revenue: randomBetween(300000000, 600000000) },
    { name: 'iPad Pro', sold: randomBetween(60, 180), revenue: randomBetween(250000000, 500000000) },
    { name: 'AirPods Pro', sold: randomBetween(150, 400), revenue: randomBetween(200000000, 400000000) },
  ];

  // User growth
  if (timeRange === 'month') {
    const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
    let totalUsers = 1000;
    months.forEach(month => {
      const newUsers = randomBetween(50, 200);
      totalUsers += newUsers;
      data.userGrowth.push({ label: month, new: newUsers, total: totalUsers });
    });
  }

  // Order status
  data.orderStatus = [
    { name: 'Hoàn thành', value: randomBetween(60, 80), color: '#10B981' },
    { name: 'Đang xử lý', value: randomBetween(10, 20), color: '#F59E0B' },
    { name: 'Đã hủy', value: randomBetween(5, 15), color: '#EF4444' },
    { name: 'Chờ thanh toán', value: randomBetween(5, 10), color: '#6B7280' },
  ];

  // Monthly comparison (so sánh với năm trước)
  if (timeRange === 'month') {
    const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
    months.forEach(month => {
      data.monthlyComparison.push({
        month,
        thisYear: randomBetween(100000000, 500000000),
        lastYear: randomBetween(80000000, 400000000),
      });
    });
  }

  // Hourly activity (chỉ cho timeRange = 'day')
  if (timeRange === 'day') {
    for (let hour = 0; hour < 24; hour++) {
      data.hourlyActivity.push({
        hour: `${hour}:00`,
        orders: randomBetween(1, 20),
        views: randomBetween(50, 500),
      });
    }
  }

  return data;
}
