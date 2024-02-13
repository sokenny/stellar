'use client';

import Link from 'next/link';
import GoalsForm from '../../GoalsForm/GoalsForm';
import Modal from '../Modal/Modal';
import styles from './GoalSetupModal.module.css';

const GoalSetupModal = ({ experiment, goal, onClose }) => {
  return (
    <Modal onClose={onClose} closeOnOverlayClick={false}>
      <div>
        <div className={styles.header}>
          <h3 className={styles.title}>{goal ? 'Edit' : 'Set'} Goal</h3>
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
        <GoalsForm experiment={experiment} goal={goal} onClose={onClose} />
      </div>
    </Modal>
  );
};

export default GoalSetupModal;
