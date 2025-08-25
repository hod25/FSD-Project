import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import styles from '../StatisticsPage.module.css';

interface ViolationsByDayData {
  day: string;
  count: number;
  percentage: number;
  displayDay?: string;
}

interface ViolationsByDayChartProps {
  data: ViolationsByDayData[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    payload: ViolationsByDayData;
  }>;
}

const COLORS = [
  '#667eea', // Monday - Professional blue
  '#764ba2', // Tuesday - Purple
  '#f093fb', // Wednesday - Pink
  '#f5576c', // Thursday - Red
  '#4facfe', // Friday - Light blue
  '#43e97b', // Saturday - Green
  '#38f9d7', // Sunday - Teal
];

const DAY_NAMES: Record<string, string> = {
  '0': 'Sunday', // JavaScript Date.getDay() returns 0 for Sunday
  '1': 'Monday',
  '2': 'Tuesday',
  '3': 'Wednesday',
  '4': 'Thursday',
  '5': 'Friday',
  '6': 'Saturday',
  Monday: 'Monday',
  Tuesday: 'Tuesday',
  Wednesday: 'Wednesday',
  Thursday: 'Thursday',
  Friday: 'Friday',
  Saturday: 'Saturday',
  Sunday: 'Sunday',
};

const ViolationsByDayChart: React.FC<ViolationsByDayChartProps> = ({ data }) => {
  // Transform data to ensure day names are displayed correctly
  const transformedData = data.map((item) => ({
    ...item,
    displayDay: DAY_NAMES[item.day] || item.day,
  }));

  if (!transformedData || transformedData.length === 0) {
    return (
      <div className={styles.chartContainer}>
        <h3>Weekly Distribution</h3>
        <div
          style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#64748b',
            fontSize: '14px',
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '16px', color: '#64748b' }}>�</div>
          <p>No violation data available</p>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;

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
            {DAY_NAMES[data.day] || data.displayDay || data.day}
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
            <span style={{ fontWeight: '600', color: '#1e293b' }}>{data.count}</span>
          </div>
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
              {data.percentage.toFixed(1)}%
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    percent: number;
  }) => {
    if (percent < 0.05) return null; // Don't show labels for slices smaller than 5%

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize="12"
        fontWeight="600"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Find peak day
  const peakDay = transformedData.reduce(
    (max, current) => (current.count > max.count ? current : max),
    transformedData[0]
  );

  return (
    <div className={styles.chartContainer}>
      <h3>Weekly Distribution</h3>
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={transformedData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={CustomLabel}
            outerRadius={120}
            innerRadius={40}
            paddingAngle={1}
            dataKey="count"
          >
            {transformedData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                stroke="rgba(255, 255, 255, 0.2)"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            wrapperStyle={{
              fontSize: '12px',
              fontWeight: '500',
              paddingTop: '20px',
            }}
            formatter={(value) => DAY_NAMES[value] || value}
          />
        </PieChart>
      </ResponsiveContainer>
      {peakDay && (
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
          <span>Peak Day:</span>
          <span style={{ fontWeight: '600', color: '#1e293b' }}>
            {peakDay.displayDay || DAY_NAMES[peakDay.day] || peakDay.day} • {peakDay.count}{' '}
            incidents • {peakDay.percentage.toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  );
};

export default ViolationsByDayChart;
