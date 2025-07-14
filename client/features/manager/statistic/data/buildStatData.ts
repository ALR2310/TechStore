import { formatStatValue } from '@shared/utils/general.utils';
import dayjs from 'dayjs';

type TimeRange = 'day' | 'month' | 'year';

export function buildStatisticSummary(data: {
  current: { order: any; user: any; viewed: any };
  past: { order: any; user: any; viewed: any };
}) {
  if (!data?.current?.order || !data?.past?.order) return [];

  const { order, user, viewed } = data.current;
  const { order: orderPast, user: userPast, viewed: viewedPast } = data.past;

  const sum = (list: any[]) => list?.reduce((acc, item) => acc + item.value, 0) ?? 0;

  // Revenue
  const currentRevenue = sum(order?.orderRevenue);
  const pastRevenue = sum(orderPast?.orderRevenue);

  // Order
  const currentOrders = sum(order?.orderCount);
  const pastOrders = sum(orderPast?.orderCount);

  // User
  const currentUsers = sum(user?.userCount);
  const pastUsers = sum(userPast?.userCount);

  // Viewed
  const currentViews = sum(viewed?.viewCount);
  const pastViews = sum(viewedPast?.viewCount);

  function calculateGrowth(current: number, previous: number): { label: string; icon: string; color: string } {
    if (previous === 0 && current === 0)
      return { label: 'Không thay đổi', icon: 'fa-minus text-base-content', color: '' };

    if (previous === 0)
      return {
        label: `+100% so với kỳ trước`,
        icon: 'fa-arrow-trend-up text-success',
        color: 'text-success',
      };

    const diff = current - previous;
    const percent = (diff / previous) * 100;

    if (percent === 0) return { label: 'Không thay đổi', icon: 'fa-minus text-base-content', color: '' };

    const type = percent > 0 ? 'Tăng' : 'Giảm';
    const icon = percent > 0 ? 'fa-arrow-trend-up text-success' : 'fa-arrow-trend-down text-error';
    const color = percent > 0 ? 'text-success' : 'text-error';

    return {
      label: `${type} ${Math.abs(Math.round(percent))}% so với kỳ trước`,
      icon,
      color,
    };
  }

  return [
    {
      title: 'Tổng doanh thu',
      value: formatStatValue(currentRevenue, 'currency'),
      growth: calculateGrowth(currentRevenue, pastRevenue),
      icon: 'fa-chart-line-up',
      color: 'text-primary',
    },
    {
      title: 'Tổng đơn hàng',
      value: formatStatValue(currentOrders, 'number'),
      growth: calculateGrowth(currentOrders, pastOrders),
      icon: 'fa-shopping-cart',
      color: 'text-success',
    },
    {
      title: 'Người dùng mới',
      value: formatStatValue(currentUsers, 'number'),
      growth: calculateGrowth(currentUsers, pastUsers),
      icon: 'fa-users',
      color: 'text-info',
    },
    {
      title: 'Lượt truy cập',
      value: formatStatValue(currentViews, 'number'),
      growth: calculateGrowth(currentViews, pastViews),
      icon: 'fa-glasses',
      color: 'text-warning',
    },
  ];
}

export function buildStatsTableSelling(data: any[], timeRange: TimeRange) {
  const now = dayjs();
  const currentLabel =
    timeRange === 'day' ? now.format('YYYY-MM-DD') : timeRange === 'month' ? now.format('YYYY-MM') : now.format('YYYY');

  return data?.filter((i) => i.datetime === currentLabel) ?? [];
}

export function buildStatsTableOrderStatus(data: any) {
  const entries = Object.entries(data ?? {}) as [string, number][];
  const total = entries.reduce((sum, [, value]) => sum + value, 0);

  const result = entries
    .map(([name, value]) => ({
      name,
      value,
      percent: total > 0 ? Math.round((value / total) * 100) : 0,
    }))
    .sort((a, b) => b.value - a.value);

  return result;
}
