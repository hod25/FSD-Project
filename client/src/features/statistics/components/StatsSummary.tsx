interface Props {
  stats: {
    totalEvents: number;
    totalViolations: number;
    avgViolationsPerEvent: number;
  };
}

export default function StatsSummary({ stats }: Props) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem',
      }}
    >
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '1.5rem',
          textAlign: 'center',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        }}
      >
        <div
          style={{ fontSize: '2rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem' }}
        >
          {stats.totalEvents.toLocaleString()}
        </div>
        <div style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: '500' }}>
          Total Events
        </div>
      </div>

      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '1.5rem',
          textAlign: 'center',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        }}
      >
        <div
          style={{ fontSize: '2rem', fontWeight: '700', color: '#dc2626', marginBottom: '0.5rem' }}
        >
          {stats.totalViolations.toLocaleString()}
        </div>
        <div style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: '500' }}>
          Safety Violations
        </div>
      </div>

      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '1.5rem',
          textAlign: 'center',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        }}
      >
        <div
          style={{ fontSize: '2rem', fontWeight: '700', color: '#3b82f6', marginBottom: '0.5rem' }}
        >
          {stats.avgViolationsPerEvent.toFixed(2)}
        </div>
        <div style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: '500' }}>
          Average per Event
        </div>
      </div>
    </div>
  );
}
