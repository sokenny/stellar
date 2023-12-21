import moment from 'moment';
import Variant from '../Variant/Variant';
import styles from './Experiment.module.css';

const Experiment = ({ name, variants, startDate, endDate }) => {
  return (
    <div className={styles.Experiment}>
      {/* <div></div> */}
      <div className={styles.header}>
        <div className={styles.name}>{name}</div>
        <div className={styles.edit}>edit</div>
      </div>

      <div className={styles.dates}>
        <div>
          Start Date:{' '}
          <span className={styles.value}>
            {moment(startDate).format('DD MMM, YYYY')}
          </span>
        </div>
        <div>
          End Date:{' '}
          <span className={styles.value}>
            {moment(endDate).format('DD MMM, YYYY')}
          </span>
        </div>
      </div>
      <div className={styles.variants}>
        <div className={styles.variantsTitle}>Variants</div>
        <div className={styles.variantsContainer}>
          {variants.map((variant, i) => (
            <Variant key={variant.id} variant={variant} n={i + 1} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Experiment;
