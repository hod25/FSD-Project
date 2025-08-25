import styles from './FiltersPanel.module.css';
import { StatsFilters } from '../page';
import { FaFileExcel } from 'react-icons/fa';

interface Props {
  filters: StatsFilters;
  setFilters: (val: StatsFilters) => void;
  onApply: () => void;
  handleExport?: () => void;
}

export default function FiltersPanel({ filters, setFilters, onApply, handleExport }: Props) {
  return (
    <div className={styles.container}>
      <div className={styles.group}>
        <label className={styles.label}>Start Date</label>
        <input
          type="date"
          className={styles.input}
          value={filters.startDate}
          onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
          placeholder="dd/mm/yyyy"
        />
      </div>

      <div className={styles.group}>
        <label className={styles.label}>End Date</label>
        <input
          type="date"
          className={styles.input}
          value={filters.endDate}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          placeholder="dd/mm/yyyy"
        />
      </div>

      <div className={styles.buttonsContainer}>
        <button className={styles.button} onClick={onApply}>
          Apply
        </button>

        {handleExport && (
          <button className={styles.exportButton} onClick={handleExport}>
            <FaFileExcel /> Export to Excel
          </button>
        )}
      </div>
    </div>
  );
}
