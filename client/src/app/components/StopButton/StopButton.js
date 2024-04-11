import styles from './StopButton.module.css';

const StopButton = ({ onClick, className }) => {
  return (
    <div className={`${styles.StopButton} ${className}`} onClick={onClick}>
      <div className={styles.square} />
    </div>
  );
};

export default StopButton;
