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
import PauseButton from '../PauseButton/PauseButton';
import GoalSetupModal from '../Modals/GoalSetupModal/GoalSetupModal';
import EditExperimentModal from '../Modals/EditExperimentModal/EditExperimentModal';
import PauseExperimentModal from '../Modals/PauseExperimentModal/PauseExperimentModal';
import ResumeExperimentModal from '../Modals/ResumeExperimentModal/ResumeExperimentModal';
import StopExperimentModal from '../Modals/StopExperimentModal/StopExperimentModal';
import DeleteExperimentModal from '../Modals/DeleteExperimentModal/DeleteExperimentModal';
import Button from '../Button/Button';
import styles from './Experiment.module.css';

const Experiment = ({
  experiment,
  journeyId,
  order = '',
  open = true,
  isFirst = false,
  onJourneyReview = false,
  cardLike = false,
}) => {
  const [maxVariantHeight, setMaxVariantHeight] = useState(null);
  const [experimentStats, setExperimentStats] = useState([]);
  const { name, variants, goal, url } = experiment;
  const [isOpen, setIsOpen] = useState(open);
  const [showSetUpGoalModal, setShowSetUpGoalModal] = useState(false);
  const [showStopExperimentModal, setShowStopExperimentModal] = useState(false);
  const [showPauseExperimentModal, setShowPauseExperimentModal] =
    useState(false);
  const [showResumeExperimentModal, setShowResumeExperimentModal] =
    useState(false);
  const [showEditExperimentModal, setShowEditExperimentModal] = useState(false);
  const [showDeleteExperimentModal, setShowDeleteExperimentModal] =
    useState(false);

  useEffect(() => {
    const fetchExperimentStats = async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_STELLAR_API}/experiment/${experiment.id}/stats`,
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

    if (experiment.started_at) {
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

  const experimentTitle = name + ' - #' + experiment.id;

  const showDeleteButton =
    onJourneyReview || experiment.status === ExperimentStatusesEnum.QUEUED;

  const showStopPlayPauseButtons =
    experiment.status === ExperimentStatusesEnum.RUNNING ||
    experiment.status === ExperimentStatusesEnum.PAUSED;

  return (
    <div
      className={`${styles.Experiment} ${
        isOpen ? styles.isOpen : styles.isClosed
      }
      ${isFirst ? styles.isFirst : ''}
      ${styles[experiment.status]}
      ${cardLike ? styles.cardLike : ''}
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
          {experiment.journey_id && !onJourneyReview && (
            <div className={styles.journey}>
              <Link href={`/journey/${experiment.journey_id}`}>
                view journey
              </Link>
            </div>
          )}
          <div className={styles.status}>
            {/* TODO: For queued ones, add tooltip saying "will start when experiment X finishes" */}
            {experiment.status}
          </div>
          <div className={styles.action}>
            {showStopPlayPauseButtons && (
              <div className={styles.stopPlayPauseButtons}>
                <StopButton onClick={() => setShowStopExperimentModal(true)} />
                {experiment.status === ExperimentStatusesEnum.RUNNING ? (
                  <PauseButton
                    onClick={() => setShowPauseExperimentModal(true)}
                  />
                ) : (
                  <PlayButton
                    onClick={() => setShowResumeExperimentModal(true)}
                  />
                )}
              </div>
            )}
          </div>
          {!isOpen && (
            <div className={styles.viewDetails} onClick={() => setIsOpen(true)}>
              View Details
            </div>
          )}
        </div>
      </div>
      {isOpen && (
        <>
          {experiment.started_at && !experiment.ended_at && (
            <div className={styles.dates}>
              <div className={styles.date}>
                <div className={styles.dateLabel}>Start date:</div>
                <div className={styles.dateValue}>
                  {new Date(experiment.started_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          )}

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
        </>
      )}

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
      {showPauseExperimentModal && (
        <PauseExperimentModal
          onClose={() => setShowPauseExperimentModal(false)}
          experimentId={experiment.id}
        />
      )}
      {showResumeExperimentModal && (
        <ResumeExperimentModal
          onClose={() => setShowResumeExperimentModal(false)}
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
