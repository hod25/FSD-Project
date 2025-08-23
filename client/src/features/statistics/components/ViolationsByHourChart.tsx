import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import styles from '../StatisticsPage.module.css';

interface ViolationsByHourData {
  hour: number;
  count: number;
  percentage: number;
}

interface ViolationsByHourChartProps {
  data: ViolationsByHourData[];
}

const ViolationsByHourChart: React.FC<ViolationsByHourChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className={styles.chartContainer}>
        <h3>Violations by Hour of Day</h3>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <p>No violation data available</p>
        </div>
      </div>
    );
  }

  const formatHour = (hour: number) => {
    return `${hour}:00`;
  };

  return (
    <div className={styles.chartContainer}>
      <h3>Violations by Hour of Day</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="hour" 
            tickFormatter={formatHour}
            tick={{ fontSize: 12 }}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip 
            formatter={(value: number) => [value, 'Violations']}
            labelFormatter={(label) => `Hour: ${formatHour(Number(label))}`}
          />
          <Bar 
            dataKey="count" 
            fill="#3182ce" 
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

<<<<<<< HEAD:client/src/features/statistics/components/ViolationsByHourChart.tsx
export default ViolationsByHourChart;
=======
export default ViolationsByHourChart;
>>>>>>> f60cc7d (stablize system):client/src/app/connected/statistics/components/ViolationsByHourChart.tsx
