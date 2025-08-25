import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import styles from '../StatisticsPage.module.css';

interface ViolationsByHourData {
  hour: number;
  count: number;
  percentage: number;
}

interface ViolationsByHourChartProps {
  data: ViolationsByHourData[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    color: string;
  }>;
  label?: string;
}

const ViolationsByHourChart: React.FC<ViolationsByHourChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className={styles.chartContainer}>
        <h3>Hourly Distribution</h3>
        <div
          style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#64748b',
            fontSize: '14px',
          }}
        >
          <p>No violation data available</p>
        </div>
      </div>
    );
  }

  const formatHour = (hour: number) => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      const hourData = data.find((d) => d.hour === Number(label));

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
            }}
          >
            {formatHour(Number(label))}
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
            <span style={{ fontWeight: '600', color: '#1e293b' }}>{payload[0].value}</span>
          </div>
          {hourData && (
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
                {hourData.percentage.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Find peak hour for highlighting
  const peakHour = data.reduce(
    (max, current) => (current.count > max.count ? current : max),
    data[0]
  );

  return (
    <div className={styles.chartContainer}>
      <h3>Hourly Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="hour"
            tickFormatter={formatHour}
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
          />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={50} />
        </BarChart>
      </ResponsiveContainer>
      {peakHour && (
        <div
          style={{
            marginTop: '16px',
            padding: '12px 16px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '500',
            color: '#64748b',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>Peak Hour:</span>
          <span style={{ fontWeight: '600', color: '#1e293b' }}>
            {formatHour(peakHour.hour)} • {peakHour.count} incidents •{' '}
            {peakHour.percentage.toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  );
};

export default ViolationsByHourChart;
