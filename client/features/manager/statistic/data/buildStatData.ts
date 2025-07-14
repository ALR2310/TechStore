import { orderStatsResponse } from '@shared/types/order.type';
import { userStatsResponse } from '@shared/types/user.type';
import { viewedStatsResponse } from '@shared/types/viewed.type';
import { formatStatValue } from '@shared/utils/general.utils';
import dayjs from 'dayjs';

type TimeRange = 'day' | 'month' | 'year';

export function buildStatisticSummary(data: {
  current: { order: orderStatsResponse; user: userStatsResponse; viewed: viewedStatsResponse };
  past: { order: orderStatsResponse; user: userStatsResponse; viewed: viewedStatsResponse };
}) {
  if (!data?.current?.order || !data?.past?.order) return [];

  const { order, user, viewed } = data.current;
  const { order: orderPast, user: userPast, viewed: viewedPast } = data.past;

  const sum = (list: any[]) => list?.reduce((acc, item) => acc + item.value, 0) ?? 0;

  // Revenue
  const currentRevenue = sum(order?.orderRevenue);
  const pastRevenue = sum(orderPast?.orderRevenue);

  // Order
  const currentOrders = sum(order?.orderCount.map((item) => ({ value: item.totalOrder })));
  const pastOrders = sum(orderPast?.orderCount.map((item) => ({ value: item.totalOrder })));

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

export function buildRevenueChart(data: [{ label: string; value: number }]) {
  return {
    title: {
      text: 'Doanh thu',
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 'bold' },
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const value = params[0].value.toLocaleString('vi-VN');
        return `${params[0].axisValue}<br/>Doanh thu: ${value} ₫`;
      },
    },
    xAxis: {
      type: 'category',
      data: data?.map((item) => item.label),
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (value: number) => {
          return formatStatValue(value, 'currency');
        },
      },
    },
    series: [
      {
        type: 'line',
        data: data?.map((item) => item.value),
        smooth: true,
        lineStyle: { width: 3 },
        areaStyle: { opacity: 0.3 },
        itemStyle: { color: '#3B82F6' },
      },
    ],
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
  };
}

export function buildOrderCreatedChart(data: [{ datetime: string; totalOrder: number; totalPrice: number }]) {
  const dateTime = data?.map((d) => d.datetime);
  const totalOrder = data?.map((d) => d.totalOrder);
  const totalPrices = data?.map((d) => d.totalPrice);

  return {
    title: {
      text: 'Số đơn và doanh thu theo thời gian',
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 'bold' },
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const order = params.find((p: any) => p.seriesName === 'Số đơn');
        const price = params.find((p: any) => p.seriesName === 'Tổng tiền');
        return `${params[0].axisValue}<br/>
                Số đơn: ${order.value}<br/>
                Tổng tiền: ${Number(price.value).toLocaleString('vi-VN')} ₫`;
      },
    },
    legend: {
      data: ['Số đơn', 'Tổng tiền'],
      top: '10%',
    },
    xAxis: {
      type: 'category',
      data: dateTime,
    },
    yAxis: [
      {
        type: 'value',
        name: 'Số đơn',
        position: 'left',
      },
      {
        type: 'value',
        name: 'Tổng tiền',
        position: 'right',
        axisLabel: {
          formatter: (value: number) => {
            if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
            if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
            return value.toLocaleString('vi-VN');
          },
        },
      },
    ],
    series: [
      {
        name: 'Số đơn',
        type: 'bar',
        data: totalOrder,
        itemStyle: { color: '#3B82F6' },
        yAxisIndex: 0,
      },
      {
        name: 'Tổng tiền',
        type: 'line',
        data: totalPrices,
        yAxisIndex: 1,
        smooth: true,
        itemStyle: { color: '#F59E0B' },
      },
    ],
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
  };
}

export function buildCategoriesChart(data: [{ label: string; value: number }]) {
  const total = data?.reduce((sum, item) => sum + item.value, 0);

  return {
    title: {
      text: 'Phân bố danh mục sản phẩm',
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 'bold' },
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} sản phẩm ({d}%)',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle',
    },
    series: [
      {
        name: 'Danh mục',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['60%', '50%'],
        data: data?.map((item) => ({
          name: item.label,
          value: item.value,
          percent: total > 0 ? ((item.value / total) * 100).toFixed(2) : '0.00',
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
        label: {
          formatter: '{b}: {d}%',
        },
      },
    ],
  };
}

export function buildUsersChart(data: [{ label: string; value: number }]) {
  return {
    title: {
      text: 'Người dùng mới',
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 'bold' },
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => `${params[0].axisValue}<br/>Người dùng: ${params[0].value}`,
    },
    xAxis: {
      type: 'category',
      data: data?.map((item) => item.label),
    },
    yAxis: { type: 'value' },
    series: [
      {
        type: 'line',
        data: data?.map((item) => item.value),
        smooth: true,
        areaStyle: { opacity: 0.5 },
        itemStyle: { color: '#8B5CF6' },
      },
    ],
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
  };
}

export function buildMonthlyComparison(data: {
  thisYear: [{ label: string; value: number }];
  lastYear: [{ label: string; value: number }];
}) {
  const monthlyComparison = Array.from({ length: 12 }, (_, i) => {
    const month = String(i + 1).padStart(2, '0');
    const thisYearData = data?.thisYear?.find((item) => item.label.endsWith(`-${month}`));
    const lastYearData = data?.lastYear?.find((item) => item.label.endsWith(`-${month}`));
    return {
      month: `Tháng ${month}`,
      thisYear: thisYearData?.value ?? 0,
      lastYear: lastYearData?.value ?? 0,
    };
  });

  return {
    title: {
      text: 'So sánh doanh thu với năm trước',
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 'bold' },
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const thisYear = params[0].value.toLocaleString('vi-VN');
        const lastYear = params[1].value.toLocaleString('vi-VN');
        return `${params[0].axisValue}<br/>
                Năm nay: ${thisYear} ₫<br/>
                Năm trước: ${lastYear} ₫`;
      },
    },
    legend: { data: ['Năm nay', 'Năm trước'], top: '10%' },
    xAxis: {
      type: 'category',
      data: monthlyComparison.map((item) => item.month),
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (value: number) => {
          if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
          if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
          return value.toString();
        },
      },
    },
    series: [
      {
        name: 'Năm nay',
        type: 'bar',
        data: monthlyComparison.map((item) => item.thisYear),
        itemStyle: { color: '#3B82F6' },
      },
      {
        name: 'Năm trước',
        type: 'bar',
        data: monthlyComparison.map((item) => item.lastYear),
        itemStyle: { color: '#94A3B8' },
      },
    ],
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
  };
}

export function buildProductViewChart(data: [{ time: string; name: string; count: number }]) {
  const productSet = new Set<string>();
  const timeSet = new Set<string>();
  const map = new Map<string, Map<string, number>>();

  if (!data) return {};

  for (const row of data) {
    productSet.add(row.name);
    timeSet.add(row.time);

    if (!map.has(row.name)) {
      map.set(row.name, new Map());
    }
    map.get(row.name)!.set(row.time, row.count);
  }

  const times = Array.from(timeSet).sort();
  const topProducts = [...productSet]
    .map((name) => {
      const total = Array.from(map.get(name)?.values() ?? []).reduce((a, b) => a + b, 0);
      return { name, total };
    })
    .sort((a, b) => b.total - a.total)
    .slice(0, 5) // get top 5
    .map((p) => p.name);

  const series = topProducts.map((product) => ({
    name: product,
    type: 'line',
    smooth: true,
    data: times.map((t) => map.get(product)?.get(t) ?? 0),
  }));

  return {
    title: {
      text: 'Sản phẩm được xem nhiều trong tháng',
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 'bold' },
    },
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data: series.map((s) => s.name),
      top: '10%',
    },
    xAxis: {
      type: 'category',
      data: times,
    },
    yAxis: {
      type: 'value',
      name: 'Lượt xem',
    },
    series,
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
  };
}

export function buildUserStatusPieChart(data: userStatsResponse['userByStatus']) {
  if (!data) return {};

  console.log(data);

  const entries = Object.entries(data);
  const total = entries.reduce((sum, [, value]) => sum + value, 0);

  const seriesData = entries.map(([status, value]) => ({
    name: status,
    value,
    percent: total > 0 ? ((value / total) * 100).toFixed(2) : '0.00',
  }));

  return {
    title: {
      text: 'Tỉ lệ trạng thái người dùng',
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 'bold' },
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} người ({d}%)',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle',
    },
    series: [
      {
        name: 'Trạng thái',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['60%', '50%'],
        data: seriesData,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
        label: {
          formatter: '{b}: {d}%',
        },
      },
    ],
  };
}
