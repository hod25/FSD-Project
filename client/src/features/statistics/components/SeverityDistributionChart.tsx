import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import styles from '../StatisticsPage.module.css';

interface SeverityData {
  severity: string;
  count: number;
  percentage: number;
}

interface SeverityDistributionChartProps {
  data: SeverityData[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    payload: SeverityData;
  }>;
  label?: string;
}

const SEVERITY_COLORS = {
  '1 Person': '#10b981', // Green - Low severity
  '2 People': '#f59e0b', // Yellow - Medium severity
  '3 People': '#ef4444', // Red - High severity
  '4+ People': '#7c2d12', // Dark red - Critical severity
};

const SEVERITY_ICONS = {
  '1 Person': '👤',
  '2 People': '👥',
  '3 People': '👨‍👩‍👦',
  '4+ People': '👨‍👩‍👧‍👦',
};

const SeverityDistributionChart: React.FC<SeverityDistributionChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className={styles.chartContainer}>
        <h3>Severity Analysis</h3>
        <div
          style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#64748b',
            fontSize: '14px',
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '16px', color: '#64748b' }}>�</div>
          <p>No violation data available</p>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;

      return (
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            padding: '16px',
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            minWidth: '160px',
          }}
        >
          <p
            style={{
              margin: '0 0 12px 0',
              fontWeight: '700',
              color: '#1e293b',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {data.severity}
          </p>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              margin: '6px 0',
              gap: '12px',
            }}
          >
            <span style={{ fontSize: '13px', color: '#64748b' }}>Violations</span>
            <span style={{ fontWeight: '600', color: '#1e293b' }}>{data.count}</span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              margin: '6px 0',
              gap: '12px',
            }}
          >
            <span style={{ fontSize: '13px', color: '#64748b' }}>Percentage</span>
            <span style={{ fontWeight: '600', color: '#667eea' }}>
              {data.percentage.toFixed(1)}%
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={styles.chartContainer}>
      <h3>Severity Analysis</h3>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
          <defs>
            {Object.entries(SEVERITY_COLORS).map(([severity, color]) => (
              <linearGradient
                key={severity}
                id={`gradient-${severity.replace(/\s+/g, '')}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor={color} stopOpacity={0.9} />
                <stop offset="95%" stopColor={color} stopOpacity={0.7} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="severity"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
            angle={-45}
            textAnchor="end"
            height={80}
            interval={0}
          />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={80} fill="#667eea" />
        </BarChart>
      </ResponsiveContainer>

      {/* Severity Legend */}
      <div
        style={{
          marginTop: '16px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          justifyContent: 'center',
        }}
      >
        {Object.entries(SEVERITY_COLORS).map(([severity, color]) => (
          <div
            key={severity}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              borderRadius: '16px',
              fontSize: '12px',
              fontWeight: '500',
              border: `2px solid ${color}`,
              color: '#1e293b',
            }}
          >
            <span>{SEVERITY_ICONS[severity as keyof typeof SEVERITY_ICONS]}</span>
            <span>{severity}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SeverityDistributionChart;
