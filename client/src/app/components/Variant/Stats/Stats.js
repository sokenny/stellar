import styles from './Stats.module.css';

const statKeyToLabel = {
  sessions: 'Total Sessions',
  averageSessionTime: 'Average Session Time',
  conversions: 'Conversions',
};

const Stats = ({ stats }) => {
  if (!stats)
    return (
      <div className={styles.Stats} style={{ height: 57 }}>
        Loading...
      </div>
    );

  const statsToRender = Object.keys(stats).filter((key) => key !== 'variantId');

  return (
    <div className={styles.Stats}>
      {statsToRender &&
        statsToRender.map((key) => {
          return (
            <div className={styles.stat} key={key}>
              <div className={styles.label}>{statKeyToLabel[key]}</div>
              <div className={styles.value}>{stats[key]}</div>
            </div>
          );
        })}
    </div>
  );
};

export default Stats;
