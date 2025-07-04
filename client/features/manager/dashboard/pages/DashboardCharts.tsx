import ReactECharts from 'echarts-for-react';

interface DashboardChartProps {
  userData: any[];
  revenueData: any[];
  viewedData: any[];
}

export default function DashboardCharts({ userData, revenueData, viewedData }: DashboardChartProps) {
  const userOpt = {
    title: { text: 'Người dùng đăng ký theo tháng' },
    tooltip: {},
    xAxis: { type: 'category', data: userData.map((d) => d.label) },
    yAxis: { type: 'value' },
    series: [{ type: 'line', data: userData.map((d) => d.count) }],
  };

  const revenueOpt = {
    title: { text: 'Doanh thu theo tháng ($)' },
    tooltip: {},
    xAxis: { type: 'category', data: revenueData.map((d) => d.label) },
    yAxis: { type: 'value' },
    series: [{ type: 'bar', data: revenueData.map((d) => d.revenue) }],
  };

  const visitsOpt = {
    title: { text: 'Lượt truy cập theo tuần' },
    tooltip: { trigger: 'item' },
    legend: { bottom: '0%' },
    series: [
      {
        type: 'pie',
        radius: '50%',
        data: viewedData.map((d) => ({ value: d.count, name: d.label })),
      },
    ],
  };

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
        <ReactECharts option={visitsOpt} style={{ height: 400 }} />
      </div>
    </>
  );
}
