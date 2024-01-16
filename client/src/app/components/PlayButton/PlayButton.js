import styles from './PlayButton.module.css';

const PlayButton = ({ onClick }) => {
  return (
    <div className={styles.PlayButton} onClick={onClick}>
      <div className={styles.triangle} />
    </div>
  );
};

export default PlayButton;
