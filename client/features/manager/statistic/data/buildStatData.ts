import { formatStatValue } from '@shared/utils/general.utils';
import dayjs from 'dayjs';

type TimeRange = 'day' | 'month' | 'year';

const getValueFrom = (list: any[], label: string) => list?.find((i) => i.label === label)?.value ?? 0;

export function buildStatisticSummary(data: { order: any; user: any; viewed: any }, timeRange: TimeRange) {
  const { order, user, viewed } = data;

  const now = dayjs();
  const currentLabel =
    timeRange === 'day' ? now.format('YYYY-MM-DD') : timeRange === 'month' ? now.format('YYYY-MM') : now.format('YYYY');
  const previousLabel =
    timeRange === 'day'
      ? now.subtract(1, 'day').format('YYYY-MM-DD')
      : timeRange === 'month'
      ? now.subtract(1, 'month').format('YYYY-MM')
      : now.subtract(1, 'year').format('YYYY');

  const periodCurrent = timeRange === 'day' ? 'hôm nay' : timeRange === 'month' ? 'tháng này' : 'năm này';

  // Orders
  const currentOrders = getValueFrom(order?.orderCount, currentLabel);
  const prevOrders = getValueFrom(order?.orderCount, previousLabel);

  // User
  const currentUsers = getValueFrom(user?.userCount, currentLabel);
  const prevUsers = getValueFrom(user?.userCount, previousLabel);

  // Revenue
  const currentRevenue = getValueFrom(order?.orderRevenue, currentLabel);
  const prevRevenue = getValueFrom(order?.orderRevenue, previousLabel);

  // Views
  const currentViews = getValueFrom(viewed?.viewCount, currentLabel);
  const prevViews = getValueFrom(viewed?.viewCount, previousLabel);

  function calculateGrowth(current: number, previous: number): { label: string; icon: string; color: string } {
    const periodPast = timeRange === 'day' ? 'ngày trước' : timeRange === 'month' ? 'tháng trước' : 'năm trước';

    if (previous === 0 && current === 0)
      return { label: 'Không thay đổi', icon: 'fa-minus text-base-content', color: '' };
    if (previous === 0)
      return {
        label: `+100% so với ${periodPast}`,
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
      label: `${type} ${Math.abs(Math.round(percent))}% so với ${periodPast}`,
      icon,
      color,
    };
  }

  return [
    {
      title: 'Tổng doanh thu ' + periodCurrent,
      value: formatStatValue(currentRevenue, 'currency'),
      growth: calculateGrowth(currentRevenue, prevRevenue),
      icon: 'fa-chart-line-up',
      color: 'text-primary',
    },
    {
      title: 'Tổng đơn hàng ' + periodCurrent,
      value: formatStatValue(order?.totalOrder ?? 0, 'number'),
      growth: calculateGrowth(currentOrders, prevOrders),
      icon: 'fa-shopping-cart',
      color: 'text-success',
    },
    {
      title: 'Người dùng mới ' + periodCurrent,
      value: formatStatValue(currentUsers, 'number'),
      growth: calculateGrowth(currentUsers, prevUsers),
      icon: 'fa-users',
      color: 'text-info',
    },
    {
      title: 'Lượt truy cập ' + periodCurrent,
      value: formatStatValue(currentViews, 'number'),
      growth: calculateGrowth(currentViews, prevViews),
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
