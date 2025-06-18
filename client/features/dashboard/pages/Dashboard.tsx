import DashboardCharts from './DashboardCharts';
import DashboardStats from './DashboardStats';

export default function Dashboard() {
  return (
    <div className="p-4 space-y-6">
      <DashboardStats />

      <DashboardCharts />
    </div>
  );
}
