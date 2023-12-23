'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import getDomainFromUrl from '../../helpers/getDomainFromUrl';
import GoalsForm from '../GoalsForm/GoalsForm';
import Modal from '../Modal/Modal';
import styles from './GoalSetupModal.module.css';

const GoalSetupModal = ({ experiment, goal, journeyId, onClose }) => {
  const router = useRouter();
  return (
    <Modal onClose={onClose} closeOnOverlayClick={false}>
      <div>
        <div className={styles.header}>
          <h3 className={styles.title}>Set Goal</h3>
          <div className={styles.subTitle}>
            What valuable action should we track to measure success in your{' '}
            <Link
              href={`/experiment/${experiment.id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {experiment.name}
            </Link>{' '}
            experiment?
          </div>
        </div>
        <GoalsForm
          domain={getDomainFromUrl(experiment.url)}
          experimentId={experiment.id}
          onSuccess={() => {
            router.refresh();
            onClose();
          }}
          goal={goal}
          journeyId={journeyId}
        />
      </div>
    </Modal>
  );
};

export default GoalSetupModal;
