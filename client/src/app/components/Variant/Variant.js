import { useState } from 'react';
import Edit from '../../icons/Edit';
import EditVariantModal from '../EditVariantModal/EditVariantModal';
import styles from './Variant.module.css';

const Variant = ({ id, experimentStatus, variants, n }) => {
  const thisVariant = variants.find((v) => v.id === id);
  const [showEditVariantModal, setShowEditVariantModal] = useState(false);
  return (
    <div
      className={`${styles.Variant} ${
        thisVariant.is_control ? styles.isControl : ''
      }`}
    >
      {/* TODO: add link to "preview variant" that takes you to preview mode of the variant */}
      <div className={styles.header}>
        <div className={styles.colLeft}>
          <div className={styles.title}>#{n}</div>
          {thisVariant.is_control && (
            <div className={styles.original}>original</div>
          )}
        </div>
        <div
          className={styles.edit}
          onClick={() => setShowEditVariantModal(true)}
        >
          <Edit width={15} height={15} />
        </div>
      </div>
      <div className={styles.text}>
        <span className={styles.label}>Text: </span>
        {thisVariant.text}
      </div>
      <div className={styles.traffic}>
        <span className={styles.label}>Traffic: </span>
        {thisVariant.traffic}%
      </div>
      <div className={styles.description}>{thisVariant.description}</div>
      {showEditVariantModal && (
        <EditVariantModal
          onClose={() => setShowEditVariantModal(false)}
          initialValues={{
            text: thisVariant.text,
            ...variants.reduce((acc, v) => {
              acc[`traffic_${v.id}`] = v.traffic;
              return acc;
            }, {}),
          }}
          variants={variants}
          id={thisVariant.id}
          experimentStatus={experimentStatus}
        />
      )}

      {/* TODO-p1 hacer una seccion "stats" donde mostramos como le fue / está yendo a la variant */}
    </div>
  );
};

export default Variant;
