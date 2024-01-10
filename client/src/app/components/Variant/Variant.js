import { useState, useRef, useEffect } from 'react';
import ExperimentStatusesEnum from '../../helpers/enums/ExperimentStatusesEnum';
import Edit from '../../icons/Edit';
import EditVariantModal from '../EditVariantModal/EditVariantModal';
import Stats from './Stats/Stats';
import styles from './Variant.module.css';

const Variant = ({
  id,
  experimentStatus,
  variants,
  stats,
  height,
  setHeight,
  n,
}) => {
  const variantRef = useRef(null);
  const thisVariant = variants.find((v) => v.id === id);
  const [showEditVariantModal, setShowEditVariantModal] = useState(false);
  const showStats =
    experimentStatus === ExperimentStatusesEnum.RUNNING ||
    experimentStatus === ExperimentStatusesEnum.COMPLETED;

  useEffect(() => {
    if (variantRef.current) {
      const h = variantRef.current.offsetHeight;
      if (h > height) {
        setHeight(h);
      }
    }
  }, [variantRef, height, setHeight]);

  return (
    <div
      className={`${styles.Variant} 
      ${thisVariant.is_control ? styles.isControl : ''}
      ${showStats ? styles.showStats : ''}
      `}
    >
      <div
        className={styles.mainInfo}
        ref={variantRef}
        style={{
          minHeight: height,
        }}
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
          {/* TODO-p1: make text clickable which takes you to the website with variantToPreview in url params */}
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
      </div>
      {showStats && <Stats stats={stats} />}
    </div>
  );
};

export default Variant;
