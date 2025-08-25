'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import styles from '../StatisticsPage.module.css';

// ✅ Correct type for Location
type LocationData = {
  locationId: string;
  handled: number;
  unhandled: number;
  name: string;
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    color: string;
  }>;
  label?: string;
}

export default function BarChartByLocation({ data }: { data: LocationData[] }) {
  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum, item) => sum + item.value, 0);

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
            {label}
          </p>
          {payload.map((entry, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                margin: '6px 0',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '3px',
                    backgroundColor: entry.color,
                    display: 'inline-block',
                  }}
                ></span>
                <span style={{ fontSize: '13px', color: '#64748b' }}>{entry.name}</span>
              </div>
              <span style={{ fontWeight: '600', color: '#1e293b' }}>{entry.value}</span>
            </div>
          ))}
          <div
            style={{
              borderTop: '1px solid #e2e8f0',
              paddingTop: '8px',
              marginTop: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: '13px', color: '#64748b' }}>Total</span>
            <span style={{ fontWeight: '700', color: '#1e293b' }}>{total}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={styles.chartContainer}>
      <h3>Events by Location</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
            interval={0}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{
              paddingTop: '20px',
              fontSize: '14px',
              fontWeight: '500',
            }}
            iconType="rect"
          />
          <Bar
            dataKey="unhandled"
            fill="#ef4444"
            name="Unhandled Events"
            radius={[0, 0, 4, 4]}
            maxBarSize={60}
          />
          <Bar
            dataKey="handled"
            fill="#10b981"
            name="Handled Events"
            radius={[4, 4, 0, 0]}
            maxBarSize={60}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
