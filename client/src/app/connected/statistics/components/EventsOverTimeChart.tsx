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

function formatDotDate(dotDate: string): string {
  const [day, month, year] = dotDate.split('.').map(Number);
  if (!day || !month || !year) return dotDate;
  const date = new Date(year, month - 1, day); // month is 0-based
  return date.toLocaleDateString('he-IL');
}

export default function EventsOverTimeChart({ data }: EventsOverTimeChartProps) {
  return (
    <div className={styles.chartContainer}>
      <h3>Events Over Time</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid stroke="#eee" />
          <XAxis dataKey="date" tickFormatter={formatDotDate} />
          <YAxis />
          <Tooltip labelFormatter={formatDotDate} />
          <Legend />
          <Line type="monotone" dataKey="unhandled" stroke="rgb(255, 77, 79)" name="Unhandled" />
          <Line type="monotone" dataKey="handled" stroke="rgb(76, 175, 80)" name="Handled" />
          <Line type="monotone" dataKey="total" stroke="#8884d8" name="Total" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
