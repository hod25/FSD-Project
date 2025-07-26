'use client';
import styles from '../StatisticsPage.module.css';


import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';

type Props = {
  timestamps: string[];
};

type ChartData = {
  hour: string;
  count: number;
};

export default function TimeOfDayChart({ timestamps }: Props) {
  const [chartData, setChartData] = useState<ChartData[] | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !timestamps || !Array.isArray(timestamps)) return;

    const hoursMap = new Array(24).fill(0);

    timestamps.forEach((t) => {
      const hour = new Date(t).getHours();
      hoursMap[hour]++;
    });

    const result = hoursMap.map((count, hour) => ({
      hour: `${hour}:00`,
      count,
    }));

    setChartData(result);
  }, [mounted, timestamps]);

  if (!chartData) return null;

  return (
    
<div className={styles.chartContainer} >
        <h3>Violation Distribution by Hour of Day</h3>
        <ResponsiveContainer>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="hour" label={{ value: 'Hour of Day', position: 'insideBottomRight', offset: -5 }} />
          <YAxis label={{ value: 'Violations', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={3} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}