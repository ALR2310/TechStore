type StatItem = {
  title: string;
  value: string | number;
  text: string;
  type: 'up' | 'down' | 'neutral';
};

const classMap = {
  up: 'text-success',
  down: 'text-error',
  neutral: '',
};

export default function DashboardStats({ stats }: { stats: StatItem[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s, i) => (
        <div key={i} className="stats shadow bg-base-100">
          <div className="stat">
            <div className="stat-title">{s.title}</div>
            <div className="stat-value">{s.value}</div>
            <div className={`stat-desc ${classMap[s.type]}`}>{s.text}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
