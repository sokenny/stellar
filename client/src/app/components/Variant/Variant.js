import styles from './Variant.module.css';

const Variant = ({ variant, n }) => {
  return (
    <div
      className={`${styles.Variant} ${
        variant.is_control ? styles.isControl : ''
      }`}
    >
      {/* TODO: add link to "preview variant" that takes you to preview mode of the variant */}
      <div className={styles.header}>
        <div className={styles.title}>#{n}</div>
        {!variant.is_control && <div className={styles.edit}>edit</div>}
      </div>
      <div className={styles.text}>
        <span className={styles.label}>Text: </span>
        {variant.text}
      </div>
      <div className={styles.traffic}>
        <span className={styles.label}>Traffic: </span>33%
      </div>
      <div className={styles.description}>{variant.description}</div>
    </div>
  );
};

export default Variant;
