import styles from './FiltersPanel.module.css';
import { StatsFilters } from '../page';

interface Props {
  filters: StatsFilters;
  setFilters: (val: StatsFilters) => void;
  onApply: () => void;
}

export default function FiltersPanel({ filters, setFilters, onApply }: Props) {
  return (
    <div className={styles.container}>
      <div className={styles.group}>
        <label className={styles.label}>Start Date</label>
        <input
          type="date"
          className={styles.input}
          value={filters.startDate}
          onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
        />
      </div>

      <div className={styles.group}>
        <label className={styles.label}>End Date</label>
        <input
          type="date"
          className={styles.input}
          value={filters.endDate}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
        />
      </div>

      <button className={styles.button} onClick={onApply}>
        Apply
      </button>
    </div>
  );
}
