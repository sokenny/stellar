'use client';

import moment from 'moment';
import { useState } from 'react';
import Variant from '../Variant/Variant';
import styles from './Experiment.module.css';

const Experiment = ({ name, variants, startDate, endDate, open = true }) => {
  const [isOpen, setIsOpen] = useState(open);
  return (
    <div
      className={`${styles.Experiment} ${
        isOpen ? styles.isOpen : styles.isClosed
      }`}
    >
      <div className={styles.header}>
        <div className={styles.name}>{name}</div>

        {isOpen ? (
          <div className={styles.button}>edit</div>
        ) : (
          <div className={styles.button} onClick={() => setIsOpen(true)}>
            View More
          </div>
        )}
      </div>

      {isOpen && (
        <div>
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
      )}
    </div>
  );
};

export default Experiment;
