'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Edit from '../../icons/Edit';
import Trash from '../../icons/Trash';
import ExperimentStatusesEnum from '../../helpers/enums/ExperimentStatusesEnum';
import Variant from '../Variant/Variant';
import Goal from './Goal/Goal';
import StopButton from '../StopButton/StopButton';
import PlayButton from '../PlayButton/PlayButton';
import GoalSetupModal from '../GoalSetupModal/GoalSetupModal';
import EditExperimentModal from '../EditExperimentModal/EditExperimentModal';
import StopExperimentModal from '../StopExperimentModal/StopExperimentModal';
import DeleteExperimentModal from '../DeleteExperimentModal/DeleteExperimentModal';
import Button from '../Button/Button';
import styles from './Experiment.module.css';

const Experiment = ({
  experiment,
  journeyId,
  order = '',
  open = true,
  isFirst = false,
  onJourneyReview = false,
}) => {
  const [maxVariantHeight, setMaxVariantHeight] = useState(null);
  const [experimentStats, setExperimentStats] = useState([]);
  const { name, variants, goal, url } = experiment;
  const [isOpen, setIsOpen] = useState(open);
  const [showSetUpGoalModal, setShowSetUpGoalModal] = useState(false);
  const [showStopExperimentModal, setShowStopExperimentModal] = useState(false);
  const [showEditExperimentModal, setShowEditExperimentModal] = useState(false);
  const [showDeleteExperimentModal, setShowDeleteExperimentModal] =
    useState(false);

  useEffect(() => {
    const fetchExperimentStats = async () => {
      const res = await fetch(
        `http://localhost:3001/api/experiment/${experiment.id}/stats`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      const data = await res.json();
      setExperimentStats(data);
    };

    if (
      experiment.status === ExperimentStatusesEnum.RUNNING ||
      experiment.status === ExperimentStatusesEnum.COMPLETED
    ) {
      fetchExperimentStats();
    }
  }, []);

  const nonControlVariants = variants.filter((v) => !v.is_control);

  nonControlVariants.sort((a, b) => {
    if (a.id > b.id) return -1;
    if (a.id < b.id) return 1;
    return 0;
  });

  const sortedVariants = [
    variants.find((v) => v.is_control),
    ...nonControlVariants,
  ];

  sortedVariants.forEach((v, i) => {
    v.num = i + 1;
  });

  const experimentTitle = name + ' - ' + experiment.id;

  const showDeleteButton =
    onJourneyReview || experiment.status === ExperimentStatusesEnum.QUEUED;

  return (
    <div
      className={`${styles.Experiment} ${
        isOpen ? styles.isOpen : styles.isClosed
      }
      ${isFirst ? styles.isFirst : ''}
      ${styles[experiment.status]}
      `}
      onClick={() => (!isOpen ? setIsOpen(true) : null)}
    >
      <div className={styles.header}>
        <div className={styles.colLeft}>
          {onJourneyReview && <div className={styles.order}>{order}</div>}
          <div className={styles.name}>
            {onJourneyReview ? (
              <div>{experimentTitle}</div>
            ) : (
              <Link href={`/experiment/${experiment.id}`}>
                {experimentTitle}
              </Link>
            )}
          </div>
          <div
            className={styles.editExperiment}
            onClick={() => setShowEditExperimentModal(true)}
          >
            <Edit height={18} />
          </div>
        </div>

        <div className={styles.colRight}>
          <div className={styles.status}>
            {/* TODO: For queued ones, add tooltip saying "will start when experiment X finishes" */}
            {experiment.status}
          </div>
          <div className={styles.action}>
            {/* {experiment.status === ExperimentStatusesEnum.QUEUED && (
              <PlayButton />
            )} */}
            {experiment.status === ExperimentStatusesEnum.RUNNING && (
              <StopButton onClick={() => setShowStopExperimentModal(true)} />
            )}
          </div>
          {!isOpen && (
            <div className={styles.viewDetails} onClick={() => setIsOpen(true)}>
              View Details
            </div>
          )}
        </div>
      </div>

      <div className={styles.datesAndJourney}>
        <div className={styles.dates}>
          {experiment.started_at && !experiment.ended_at && (
            <div className={styles.date}>
              <div className={styles.dateLabel}>Start date:</div>
              <div className={styles.dateValue}>
                {new Date(experiment.started_at).toLocaleDateString()}
              </div>
            </div>
          )}
        </div>
        {experiment.journey_id && (
          <div className={styles.journey}>
            <Link href={`/journey/${experiment.journey_id}`}>view journey</Link>
          </div>
        )}
      </div>

      {isOpen && (
        <div>
          <div className={styles.variants}>
            <div className={styles.variantsTitle}>Variants</div>
            <div className={styles.variantsContainer}>
              {sortedVariants.map((variant, i) => (
                <Variant
                  key={variant.id}
                  id={variant.id}
                  variants={variants}
                  experiment={experiment}
                  n={i + 1}
                  stats={experimentStats.find(
                    (s) => s.variantId === variant.id,
                  )}
                  height={maxVariantHeight}
                  setHeight={setMaxVariantHeight}
                />
              ))}
            </div>
          </div>
          <div className={styles.bottomRow}>
            {goal ? (
              <Goal
                goal={goal}
                experimentStatus={experiment.status}
                experimentUrl={url}
                onEdit={() => setShowSetUpGoalModal(true)}
              />
            ) : (
              <div>
                <Button
                  className={styles.setUpGoalBtn}
                  onClick={() => setShowSetUpGoalModal(true)}
                >
                  Set up goal
                </Button>
              </div>
            )}
            {showDeleteButton && (
              <div className={styles.deleteBtn}>
                <Trash onClick={() => setShowDeleteExperimentModal(true)} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* TODO-p1-1 add delete button around here */}

      {showSetUpGoalModal && (
        <GoalSetupModal
          journeyId={journeyId}
          experiment={experiment}
          onClose={() => setShowSetUpGoalModal(false)}
          goal={goal}
        />
      )}
      {showEditExperimentModal && (
        <EditExperimentModal
          onClose={() => setShowEditExperimentModal(false)}
          initialValues={{
            name: experiment.name,
            order,
          }}
          experiment={experiment}
          journeyId={journeyId}
        />
      )}
      {showStopExperimentModal && (
        <StopExperimentModal
          onClose={() => setShowStopExperimentModal(false)}
          experimentId={experiment.id}
        />
      )}
      {showDeleteExperimentModal && (
        <DeleteExperimentModal
          onClose={() => setShowDeleteExperimentModal(false)}
          experimentId={experiment.id}
        />
      )}
    </div>
  );
};

export default Experiment;
