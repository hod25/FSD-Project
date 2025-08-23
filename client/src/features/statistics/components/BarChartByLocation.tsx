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

export default function BarChartByLocation({ data }: { data: LocationData[] }) {
  return (
    <div className={styles.chartContainer}>
      <h3>Events by Location</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid stroke="#ccc" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="unhandled" fill="rgb(255, 77, 79)" name="Unhandled" />
          <Bar dataKey="handled" fill="rgb(76, 175, 80)" name="Handled" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
