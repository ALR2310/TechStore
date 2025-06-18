import DashboardCharts from './DashboardCharts';
import DashboardStats from './DashboardStats';

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <DashboardStats />

      <DashboardCharts />
    </div>
  );
}
