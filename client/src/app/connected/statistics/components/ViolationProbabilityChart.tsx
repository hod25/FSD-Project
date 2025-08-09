import React from 'react';
import styles from './ViolationProbabilityChart.module.css';

interface ViolationProbabilityData {
  hourlyData: Array<{
    hour: number;
    count: number;
    percentage: number;
  }>;
  dailyData: Array<{
    day: string;
    count: number;
    percentage: number;
  }>;
  peakHour: {
    hour: number;
    count: number;
    percentage: number;
  };
  peakDay: {
    day: string;
    count: number;
    percentage: number;
  };
  totalViolations: number;
}

interface ViolationProbabilityChartProps {
  data: ViolationProbabilityData;
}

const ViolationProbabilityChart: React.FC<ViolationProbabilityChartProps> = ({ data }) => {
  if (!data || data.totalViolations === 0) {
    return (
      <div className={styles.container}>
        <h3 className={styles.title}>🎯 Violation Probability Analysis</h3>
        <div className={styles.emptyState}>
          <p>No violation data available for analysis</p>
        </div>
      </div>
    );
  }

  const formatHour = (hour: number) => {
    return `${hour}:00`;
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>🎯 Violation Probability Analysis</h3>
      
      <div className={styles.summaryCards}>
        <div className={styles.summaryCard}>
          <h4>Peak Hour</h4>
          <div className={styles.summaryValue}>
            {formatHour(data.peakHour.hour)}
          </div>
          <div className={styles.summarySubtext}>
            {data.peakHour.count} violations ({data.peakHour.percentage}%)
          </div>
        </div>
        
        <div className={styles.summaryCard}>
          <h4>Peak Day</h4>
          <div className={styles.summaryValue}>
            {data.peakDay.day}
          </div>
          <div className={styles.summarySubtext}>
            {data.peakDay.count} violations ({data.peakDay.percentage}%)
          </div>
        </div>
        
        <div className={styles.summaryCard}>
          <h4>Total Violations</h4>
          <div className={styles.summaryValue}>
            {data.totalViolations}
          </div>
          <div className={styles.summarySubtext}>
            Analyzed violations
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViolationProbabilityChart; 