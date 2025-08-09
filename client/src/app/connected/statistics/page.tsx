'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { FaFileExcel } from 'react-icons/fa';

import type { RootState } from '@/store/store';
import FiltersPanel from './components/FiltersPanel';
import StatsSummary from './components/StatsSummary';
import EventsOverTimeChart from './components/EventsOverTimeChart';
import BarChartByLocation from './components/BarChartByLocation';
import BarChartByArea from './components/BarChartByArea';
import StatusPieChart from './components/StatusPieChart';
import ViolationProbabilityChart from './components/ViolationProbabilityChart';
import ViolationsByHourChart from './components/ViolationsByHourChart';
import ViolationsByDayChart from './components/ViolationsByDayChart';
import SeverityDistributionChart from './components/SeverityDistributionChart';
import UserSummary from './components/UserSummary';

import styles from './StatisticsPage.module.css';

import { selectAreas } from '@/store/slices/areaSlice';
import { exportToExcel } from './utils/excelExport';
import dynamic from 'next/dynamic';

export type StatsFilters = {
  startDate?: string;
  endDate?: string;
  locationIds?: string[];
  areaIds?: string[];
};

export type StatsResponse = {
  totalEvents: number;
  totalViolations: number;
  avgViolationsPerEvent: number;
  violationTimestamps: string[]; 

  statusCounts: Record<string, number>;

  eventsByDate: { date: string; count: number }[];
  eventsByDateStatus: { date: string; handled: number; unhandled: number; total: number }[];

  eventsByLocation: { locationId: string; count: number }[];
  eventsByLocationStatus: { locationId: string; handled: number; unhandled: number }[];

  eventsByArea: { areaId: string; count: number }[];
  eventsByAreaStatus: { areaId: string; handled: number; unhandled: number }[];
  
  userAnalytics: { admin: number; viewer: number; supervisor: number; total: number };
  
  severityDistribution: Array<{ severity: string; count: number; percentage: number }>;
  
  violationProbability: {
    hourlyData: Array<{ hour: number; count: number; percentage: number }>;
    dailyData: Array<{ day: string; count: number; percentage: number }>;
    peakHour: { hour: number; count: number; percentage: number };
    peakDay: { day: string; count: number; percentage: number };
    totalViolations: number;
  };
};

export default function StatisticsPage() {
  const locationId = useSelector((state: RootState) => state.location.id);
  const locationName = useSelector((state: RootState) => state.location.name);
  const areaId = useSelector((state: RootState) => state.area.currentAreaId);
  const areaList = useSelector(selectAreas);

  const [filters, setFilters] = useState<StatsFilters>({
    startDate: '',
    endDate: '',
  });

  const [stats, setStats] = useState<StatsResponse | null>(null);

  const fetchStats = async () => {
    try {
      const payload: StatsFilters = {
        ...filters,
        locationIds: locationId ? [locationId] : [],
        areaIds: areaId ? [areaId] : [],
      };

      const res = await axios.post<StatsResponse>(
        'http://pro-safe.cs.colman.ac.il:5000/api/stats/no-hardhat',
        payload,
        { withCredentials: true }
      );
      
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch stats', err);
    }
  };

  const areaNameMap = Object.fromEntries(areaList.map((area) => [area.id, area.name]));
  const locationNameMap = locationId && locationName ? { [locationId]: locationName } : {};

  useEffect(() => {
    if (locationId) {
      fetchStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationId, areaId]);

  // Function to handle Excel export
  const handleExport = () => {
    if (stats) {
      exportToExcel(stats, locationName || undefined, areaNameMap, locationNameMap);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>📊 Safety Events Statistics</h1>
        {stats && (
          <button onClick={handleExport} className={styles.exportButton}>
            <FaFileExcel /> Export to Excel
          </button>
        )}
      </div>

      <FiltersPanel filters={filters} setFilters={setFilters} onApply={fetchStats} />

      {stats && (
        <>
          <StatsSummary stats={stats} />
          <div className={styles.chartGrid}>
            <EventsOverTimeChart
              data={stats.eventsByDateStatus.map((item) => ({
                ...item,
                date: new Date(item.date).toLocaleDateString('he-IL'), // dd/mm/yyyy
              }))}
            />
            <StatusPieChart data={stats.statusCounts} />

            <BarChartByLocation
              data={stats.eventsByLocationStatus.map((item) => ({
                ...item,
                name: locationNameMap[item.locationId] || item.locationId,
              }))}
            />
            
            <BarChartByArea
              data={stats.eventsByAreaStatus.map((item) => ({
                ...item,
                name: areaNameMap[item.areaId] || item.areaId,
              }))}
            />
            
            <ViolationsByHourChart data={stats.violationProbability?.hourlyData || []} />
            <ViolationsByDayChart data={stats.violationProbability?.dailyData || []} />
            <SeverityDistributionChart data={stats.severityDistribution || [
              { severity: "1 Person", count: 0, percentage: 0 },
              { severity: "2 People", count: 0, percentage: 0 },
              { severity: "3 People", count: 0, percentage: 0 },
              { severity: "4+ People", count: 0, percentage: 0 }
            ]} />
          </div>
          

          
          <div className={styles.chartGrid}>
            <UserSummary userAnalytics={stats.userAnalytics || { admin: 0, viewer: 0, supervisor: 0, total: 0 }} />
            <ViolationProbabilityChart data={stats.violationProbability || { hourlyData: [], dailyData: [], peakHour: { hour: 0, count: 0, percentage: 0 }, peakDay: { day: '', count: 0, percentage: 0 }, totalViolations: 0 }} />
          </div>
        </>
      )}
    </div>
  );
}
