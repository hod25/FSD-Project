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

import styles from './StatisticsPage.module.css';

import { selectAreas } from '@/store/slices/areaSlice';
import { exportToExcel } from './utils/excelExport';
import dynamic from 'next/dynamic';

const TimeOfDayChart = dynamic(() => import('./components/TimeOfDayChart'), {
  ssr: false,
});

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
          <TimeOfDayChart timestamps={stats.violationTimestamps} />
            
            <BarChartByArea
              data={stats.eventsByAreaStatus.map((item) => ({
                ...item,
                name: areaNameMap[item.areaId] || item.areaId,
              }))}
            />
          </div>
        </>
      )}
    </div>
  );
}
