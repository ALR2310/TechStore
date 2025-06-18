export default function DashboardStats() {
  const stats = [
    { title: 'Users', value: '1,234', desc: '↗︎ 15% since last month' },
    { title: 'Sales', value: '$5,678', desc: '↘︎ 5% since last month' },
    { title: 'Visits', value: '12.3K', desc: '↗︎ 8% this week' },
    { title: 'Orders', value: '432', desc: '↗︎ 2% today' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s, i) => (
        <div key={i} className="stats shadow bg-base-100">
          <div className="stat">
            <div className="stat-title">{s.title}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-desc">{s.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
