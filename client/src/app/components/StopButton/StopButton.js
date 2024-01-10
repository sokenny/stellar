import styles from './StopButton.module.css';

const StopButton = ({ onClick }) => {
  return (
    <div className={styles.StopButton} onClick={onClick}>
      <div className={styles.square} />
    </div>
  );
};

export default StopButton;
