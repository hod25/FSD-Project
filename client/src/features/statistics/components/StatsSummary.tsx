interface Props {
  stats: {
    totalEvents: number;
    totalViolations: number;
    avgViolationsPerEvent: number;
  };
}

export default function StatsSummary({ stats }: Props) {
  return (
    <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
      <div>
        📍 Total Events: <strong>{stats.totalEvents}</strong>
      </div>
      <div>
        🚫 Violations: <strong>{stats.totalViolations}</strong>
      </div>
      <div>
        ⚖️ Avg/Event: <strong>{stats.avgViolationsPerEvent.toFixed(2)}</strong>
      </div>
    </div>
  );
}
