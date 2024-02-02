import styles from './FullPageLoader.module.css';

const FullPageLoader = ({ onClick }) => {
  return (
    <div className={styles.FullPageLoader} onClick={onClick}>
      <div className={styles.loader} />
    </div>
  );
};

export default FullPageLoader;
