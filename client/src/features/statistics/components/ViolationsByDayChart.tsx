import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import styles from '../StatisticsPage.module.css';

interface ViolationsByDayData {
  day: string;
  count: number;
  percentage: number;
}

interface ViolationsByDayChartProps {
  data: ViolationsByDayData[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658'];

const ViolationsByDayChart: React.FC<ViolationsByDayChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className={styles.chartContainer}>
        <h3>Violations by Day of Week</h3>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <p>No violation data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.chartContainer}>
      <h3>Violations by Day of Week</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ day, percentage }) => `${day}: ${percentage}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="count"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => [value, 'Violations']}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ViolationsByDayChart;
