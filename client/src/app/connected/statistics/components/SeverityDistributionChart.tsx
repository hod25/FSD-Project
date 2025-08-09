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

interface SeverityData {
  severity: string;
  count: number;
  percentage: number;
}

interface SeverityDistributionChartProps {
  data: SeverityData[];
}

const COLORS = ['#00C49F', '#FFBB28', '#FF8042', '#FF0000'];

const SeverityDistributionChart: React.FC<SeverityDistributionChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className={styles.chartContainer}>
        <h3>🚨 Violation Severity Distribution</h3>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <p>No violation data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.chartContainer}>
      <h3>🚨 Violation Severity Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="severity" 
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip 
            formatter={(value: number) => [value, 'Violations']}
            labelFormatter={(label) => `Severity: ${label}`}
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

export default SeverityDistributionChart;
