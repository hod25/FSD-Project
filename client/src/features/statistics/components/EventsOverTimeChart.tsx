'use client';
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import styles from '../StatisticsPage.module.css'; // Assuming shared styles

interface EventsOverTimeChartProps {
  data: {
    date: string; // in "D.M.YYYY" format
    handled: number;
    unhandled: number;
    total: number;
  }[];
}

interface TooltipPayload {
  value: number;
  name: string;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

function formatDotDate(dotDate: string): string {
  const [day, month, year] = dotDate.split('.').map(Number);
  if (!day || !month || !year) return dotDate;
  const date = new Date(year, month - 1, day); // month is 0-based
  return date.toLocaleDateString('he-IL');
}

export default function EventsOverTimeChart({ data }: EventsOverTimeChartProps) {
  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            padding: '12px 16px',
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          <p style={{ margin: '0 0 8px 0', fontWeight: '600', color: '#1e293b' }}>
            {formatDotDate(label || '')}
          </p>
          {payload.map((entry: TooltipPayload, index: number) => (
            <p
              key={index}
              style={{
                margin: '4px 0',
                color: entry.color,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: entry.color,
                  display: 'inline-block',
                }}
              ></span>
              {entry.name}: <strong>{entry.value}</strong>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={styles.chartContainer}>
      <h3>Events Timeline</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDotDate}
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 12 }}
          />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{
              paddingTop: '20px',
              fontSize: '14px',
              fontWeight: '500',
            }}
          />
          <Line
            type="monotone"
            dataKey="unhandled"
            stroke="#ef4444"
            strokeWidth={2}
            name="Unhandled Events"
            dot={{ fill: '#ef4444', strokeWidth: 2, r: 3 }}
            activeDot={{ r: 5, stroke: '#ef4444', strokeWidth: 2, fill: '#fff' }}
          />
          <Line
            type="monotone"
            dataKey="handled"
            stroke="#10b981"
            strokeWidth={2}
            name="Handled Events"
            dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
            activeDot={{ r: 5, stroke: '#10b981', strokeWidth: 2, fill: '#fff' }}
          />
          <Line
            type="monotone"
            dataKey="total"
            stroke="#3b82f6"
            strokeWidth={2}
            name="Total Events"
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
            activeDot={{ r: 5, stroke: '#3b82f6', strokeWidth: 2, fill: '#fff' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
