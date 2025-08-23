import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import styles from '../StatisticsPage.module.css';

type StatusPieChartProps = {
  data: Record<string, number>;
};

const COLORS_MAP: Record<string, string> = {
  Handled: 'rgb(76, 175, 80)', // Green
  'Not Handled': 'rgb(255, 77, 79)', // Red
};

export default function StatusPieChart({ data }: StatusPieChartProps) {
  const chartData = Object.entries(data).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className={styles.chartContainer}>
      <h3>Status Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie data={chartData} dataKey="value" nameKey="name" outerRadius={100} label>
            {chartData.map((entry, idx) => (
              <Cell key={`cell-${idx}`} fill={COLORS_MAP[entry.name] || '#cccccc'} />
            ))}
          </Pie>
          <Tooltip />
          <Legend iconType="rect" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
