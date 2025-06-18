import ReactECharts from 'echarts-for-react';

const fakeData = {
  usersPerMonth: [
    { month: 'Jan', count: 120 },
    { month: 'Feb', count: 200 },
    { month: 'Mar', count: 150 },
    { month: 'Apr', count: 180 },
  ],
  salesPerMonth: [
    { month: 'Jan', total: 5000 },
    { month: 'Feb', total: 8000 },
    { month: 'Mar', total: 6500 },
    { month: 'Apr', total: 9000 },
  ],
  visitsPerWeek: [
    { week: 'Week 1', count: 350 },
    { week: 'Week 2', count: 420 },
    { week: 'Week 3', count: 300 },
    { week: 'Week 4', count: 480 },
  ],
};

export default function DashboardCharts() {
  const userOpt = {
    title: { text: 'Người dùng đăng ký theo tháng' },
    tooltip: {},
    xAxis: { type: 'category', data: fakeData.usersPerMonth.map((d) => d.month) },
    yAxis: { type: 'value' },
    series: [{ type: 'line', data: fakeData.usersPerMonth.map((d) => d.count) }],
  };

  const salesOpt = {
    title: { text: 'Doanh thu theo tháng ($)' },
    tooltip: {},
    xAxis: { type: 'category', data: fakeData.salesPerMonth.map((d) => d.month) },
    yAxis: { type: 'value' },
    series: [{ type: 'bar', data: fakeData.salesPerMonth.map((d) => d.total) }],
  };

  const visitsOpt = {
    title: { text: 'Lượt truy cập theo tuần' },
    tooltip: { trigger: 'item' },
    legend: { bottom: '0%' },
    series: [
      {
        type: 'pie',
        radius: '50%',
        data: fakeData.visitsPerWeek.map((d) => ({ value: d.count, name: d.week })),
      },
    ],
  };

  return (
    <div className="p-4 space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow p-4">
          <ReactECharts option={userOpt} style={{ height: 300 }} />
        </div>
        <div className="card bg-base-100 shadow p-4">
          <ReactECharts option={salesOpt} style={{ height: 300 }} />
        </div>
      </div>
      <div className="card bg-base-100 shadow p-4">
        <ReactECharts option={visitsOpt} style={{ height: 400 }} />
      </div>
    </div>
  );
}
