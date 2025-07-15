import { applyChartTheme } from '@shared/utils/general.utils';
import ReactECharts from 'echarts-for-react';

interface DashboardChartProps {
  userData: any[];
  revenueData: any[];
  sellingData: any[];
}

function buildSellingOpts(data: any[]) {
  const productMap = new Map<string, { name: string; totalSold: number; price: number }>();

  for (const row of data) {
    const existing = productMap.get(row.name);
    if (existing) {
      existing.totalSold += row.totalSold;
    } else {
      productMap.set(row.name, {
        name: row.name,
        totalSold: row.totalSold,
        price: row.price,
      });
    }
  }

  const pieData = Array.from(productMap.values()).map((item) => ({
    name: item.name,
    value: item.totalSold,
    price: item.price,
  }));

  return applyChartTheme({
    title: {
      text: 'Tỷ lệ sản phẩm bán chạy theo tháng',
      left: 'center',
    },
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const price = params.data.price?.toLocaleString('vi-VN', {
          style: 'currency',
          currency: 'VND',
          maximumFractionDigits: 0,
        });

        return `
          <strong>${params.name}</strong><br/>
          Giá: <span class="text-success">${price}</span><br/>
          Đã bán được: <span class="text-success">${params.value}</span><br/>
          Chiếm: <span class="text-success">${params.percent}%</span>
        `;
      },
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      formatter: function (name: string) {
        const maxLength = 40;
        return name.length > maxLength ? name.slice(0, maxLength) + '…' : name;
      },
    },
    series: [
      {
        name: 'Sản phẩm',
        type: 'pie',
        radius: '60%',
        data: pieData,
        label: { show: false },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  });
}

export default function DashboardCharts({ userData, revenueData, sellingData }: DashboardChartProps) {
  const userOpt = applyChartTheme({
    title: { text: 'Người dùng đăng ký theo tháng' },
    xAxis: { type: 'category', data: userData.map((d) => d.label) },
    yAxis: { type: 'value' },
    series: [{ type: 'line', data: userData.map((d) => d.value) }],
  });

  const revenueOpt = applyChartTheme({
    title: { text: 'Doanh thu theo tháng ($)' },
    xAxis: { type: 'category', data: revenueData.map((d) => d.label) },
    yAxis: { type: 'value' },
    series: [{ type: 'bar', data: revenueData.map((d) => d.value) }],
  });

  const sellingOpt = buildSellingOpts(sellingData);

  return (
    <>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow p-4">
          <ReactECharts option={userOpt} style={{ height: 300 }} />
        </div>
        <div className="card bg-base-100 shadow p-4">
          <ReactECharts option={revenueOpt} style={{ height: 300 }} />
        </div>
      </div>
      <div className="card bg-base-100 shadow p-4">
        <ReactECharts option={sellingOpt} style={{ height: 400 }} />
      </div>
    </>
  );
}
