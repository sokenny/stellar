import styles from './Stats.module.css';

const statKeyToLabel = {
  session_count: 'Total Sessions',
  average_session_time: 'Average Session Time',
};

const Stats = ({ stats }) => {
  console.log('statspaÑ ', stats);
  if (!stats) return null;

  const statsToRender = Object.keys(stats).filter(
    (key) => key !== 'variant_id',
  );

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
