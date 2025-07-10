interface StatisticSummaryProps {
  data?: Array<{
    title: string;
    value: string;
    growth: { label: string; icon: string; color: string };
    icon: string;
    color: string;
  }>;
}

export default function StatisticSummary({ data }: StatisticSummaryProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {data?.map((stat, index) => (
        <div key={index} className="stats shadow bg-base-100">
          <div className="stat">
            <div className="stat-figure">
              <i className={`fa-regular ${stat.icon} text-2xl ${stat.color}`}></i>
            </div>
            <div className="stat-title">{stat.title}</div>
            <div className="stat-value text-lg">{stat.value}</div>
            <div className="stat-desc flex items-center gap-1">
              <i className={`fa-regular ${stat.growth.icon} text-sm`}></i>
              <span className={stat.growth.color}>{stat.growth.label}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
