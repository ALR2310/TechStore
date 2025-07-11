import ReactECharts from 'echarts-for-react';
import { StatisticData } from '../data/mockData';
import { TimeRange } from './StatisticManager';

interface StatisticChartsProps {
  data: StatisticData;
  timeRange: TimeRange;
}

export default function StatisticCharts({ data, timeRange }: StatisticChartsProps) {
  // Revenue Chart (Line Chart)
  const revenueOption = {
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
      data: data.revenue.map((item) => item.label),
      axisLabel: { rotate: timeRange === 'day' ? 45 : 0 },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (value: number) => {
          if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
          if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
          if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
          return value.toString();
        },
      },
    },
    series: [
      {
        type: 'line',
        data: data.revenue.map((item) => item.value),
        smooth: true,
        lineStyle: { width: 3 },
        areaStyle: { opacity: 0.3 },
        itemStyle: { color: '#3B82F6' },
      },
    ],
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
  };

  // Categories Pie Chart
  const categoriesOption = {
    title: {
      text: 'Phân bố danh mục sản phẩm',
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 'bold' },
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c}% ({d}%)',
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
        data: data.categories.map((item) => ({
          name: item.name,
          value: item.percentage,
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
        label: {
          formatter: '{b}: {c}%',
        },
      },
    ],
  };

  // Users Chart (Area Chart)
  const usersOption = {
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
      data: data.users.map((item) => item.label),
      axisLabel: { rotate: timeRange === 'day' ? 45 : 0 },
    },
    yAxis: { type: 'value' },
    series: [
      {
        type: 'line',
        data: data.users.map((item) => item.value),
        smooth: true,
        areaStyle: { opacity: 0.5 },
        itemStyle: { color: '#8B5CF6' },
      },
    ],
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
  };

  // Monthly Comparison Chart (chỉ hiển thị khi timeRange = 'month')
  const monthlyComparisonOption = {
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
      data: data.monthlyComparison.map((item) => item.month),
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (value: number) => {
          if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
          if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
          return value.toString();
        },
      },
    },
    series: [
      {
        name: 'Năm nay',
        type: 'bar',
        data: data.monthlyComparison.map((item) => item.thisYear),
        itemStyle: { color: '#3B82F6' },
      },
      {
        name: 'Năm trước',
        type: 'bar',
        data: data.monthlyComparison.map((item) => item.lastYear),
        itemStyle: { color: '#94A3B8' },
      },
    ],
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
  };

  // Hourly Activity Chart (chỉ hiển thị khi timeRange = 'day')
  const hourlyActivityOption = {
    title: {
      text: 'Hoạt động theo giờ trong ngày',
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 'bold' },
    },
    tooltip: { trigger: 'axis' },
    legend: { data: ['Đơn hàng', 'Lượt xem'], top: '10%' },
    xAxis: {
      type: 'category',
      data: data.hourlyActivity.map((item) => item.hour),
    },
    yAxis: [
      {
        type: 'value',
        name: 'Đơn hàng',
        position: 'left',
      },
      {
        type: 'value',
        name: 'Lượt xem',
        position: 'right',
      },
    ],
    series: [
      {
        name: 'Đơn hàng',
        type: 'bar',
        data: data.hourlyActivity.map((item) => item.orders),
        itemStyle: { color: '#10B981' },
      },
      {
        name: 'Lượt xem',
        type: 'line',
        yAxisIndex: 1,
        data: data.hourlyActivity.map((item) => item.views),
        smooth: true,
        itemStyle: { color: '#F59E0B' },
      },
    ],
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
  };

  return (
    <div className="space-y-6">
      {/* Revenue and Orders Row */}
      <div className="grid grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow p-4">
          <ReactECharts option={revenueOption} style={{ height: 350 }} />
        </div>
      </div>

      {/* Users and Order Status Row */}
      <div className="grid grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow p-4">
          <ReactECharts option={usersOption} style={{ height: 350 }} />
        </div>
      </div>

      {/* Categories and Top Products Row */}
      <div className="grid grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow p-4">
          <ReactECharts option={categoriesOption} style={{ height: 350 }} />
        </div>
      </div>

      {/* Conditional Charts based on timeRange */}
      {timeRange === 'month' && data.monthlyComparison.length > 0 && (
        <div className="card bg-base-100 shadow p-4">
          <ReactECharts option={monthlyComparisonOption} style={{ height: 400 }} />
        </div>
      )}

      {timeRange === 'day' && data.hourlyActivity.length > 0 && (
        <div className="card bg-base-100 shadow p-4">
          <ReactECharts option={hourlyActivityOption} style={{ height: 400 }} />
        </div>
      )}
    </div>
  );
}
